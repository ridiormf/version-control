#!/usr/bin/env node

/**
 * Version Control System - Main CLI
 * @version 1.1.4
 *
 * Intelligent version control system that analyzes Git commits
 * and automates semantic versioning (SemVer).
 */

import { colors } from "./colors";
import { git } from "./git";
import { getCurrentVersion, bumpVersion } from "./version";
import { analyzeChanges } from "./analyzer";
import { updatePackageJson, updateIndexFile, updateChangelog } from "./updater";
import { createInterface, askChoice, closeInterface } from "./readline";
import { executeGitCommands } from "./gitCommands";
import { VersionType } from "./types";
import { checkForUpdates } from "./updateChecker";
import {
  t,
  currentLanguage,
  isLanguageConfigured,
  getYesOptions,
  getNoOptions,
} from "./i18n";
import { setLanguage, clearLanguage } from "./config";

/**
 * Show language info
 */
function showLanguageInfo(): void {
  const source = isLanguageConfigured
    ? t("configuredManually")
    : t("detectedFromSystem");
  console.log(
    `${colors.cyan}ℹ${colors.reset} ${t("currentLanguageIs")} ${
      colors.bold
    }${currentLanguage.toUpperCase()}${colors.reset} (${source})`
  );
  console.log(
    `  ${t("toChangeLanguage")} ${
      colors.cyan
    }version-control config --lang <code>${colors.reset}`
  );
  console.log("");
}

/**
 * Handle config commands
 */
function handleConfigCommand(args: string[]): void {
  // version-control config --lang <code>
  if (args[0] === "--lang" && args[1]) {
    const lang = args[1].toLowerCase();
    if (lang === "en" || lang === "pt" || lang === "es" || lang === "fr") {
      setLanguage(lang);
      console.log("");
      console.log(
        `${colors.green}✓${colors.reset} ${t("languageSet")} ${
          colors.bold
        }${lang.toUpperCase()}${colors.reset}`
      );
      console.log("");
      console.log(`${t("availableLanguages")}`);
      console.log("");
      process.exit(0);
    } else {
      console.log("");
      console.log(`${colors.red}✗${colors.reset} ${t("invalidLanguage")}`);
      console.log("");
      process.exit(1);
    }
  }

  // version-control config --clear
  if (args[0] === "--clear") {
    clearLanguage();
    console.log("");
    console.log(`${colors.green}✓${colors.reset} ${t("languageCleared")}`);
    console.log("");
    process.exit(0);
  }

  // Show current config
  console.log("");
  console.log(`${colors.bold}${colors.cyan}Configuration${colors.reset}`);
  console.log("");
  showLanguageInfo();
  console.log(`${colors.bold}Commands:${colors.reset}`);
  console.log(
    `  ${colors.cyan}version-control config --lang <code>${colors.reset} - Set language (en, pt, es, fr)`
  );
  console.log(
    `  ${colors.cyan}version-control config --clear${colors.reset}      - Clear language config`
  );
  console.log("");
  process.exit(0);
}

/**
 * Main function
 */
async function main(): Promise<void> {
  // Check for config command
  const args = process.argv.slice(2);
  if (args[0] === "config") {
    handleConfigCommand(args.slice(1));
    return;
  }

  // Check for updates to clear stdin buffer
  await checkForUpdates().catch(() => {});

  // Destroy HTTP agents immediately after
  const http = require("http");
  const https = require("https");
  if (http.globalAgent) http.globalAgent.destroy();
  if (https.globalAgent) https.globalAgent.destroy();

  console.log("");
  console.log(
    `${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(
    `${colors.bold}${colors.cyan}          ${t("versionControl")}${
      colors.reset
    }`
  );
  console.log(
    `${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`
  );
  console.log("");

  // Show language info
  showLanguageInfo();

  // Check if there's a commit
  const hasCommit = git("rev-parse HEAD 2>/dev/null");
  if (!hasCommit) {
    console.log(`${colors.yellow}⚠${colors.reset} ${t("noCommitFound")}`);
    process.exit(0);
  }

  // Current version
  const currentVersion = getCurrentVersion();
  console.log(
    `${colors.bold}${t("currentVersion")}${colors.reset} ${
      colors.cyan
    }${currentVersion}${colors.reset}`
  );
  console.log("");

  // Analyze changes
  console.log(`${colors.bold}${t("analyzingCommit")}${colors.reset}`);
  const analysis = analyzeChanges();

  console.log("");
  console.log(`${colors.bold}${t("commitMessage")}${colors.reset}`);
  console.log(`  "${analysis.commitMsg}"`);
  console.log("");
  console.log(
    `${colors.bold}${t("filesModified")}${colors.reset} ${
      analysis.filesChanged.length
    }`
  );
  analysis.filesChanged.slice(0, 5).forEach((file) => {
    console.log(`  - ${file}`);
  });
  if (analysis.filesChanged.length > 5) {
    console.log(
      `  ... ${t("andMore")} ${analysis.filesChanged.length - 5} arquivo(s)`
    );
  }
  console.log("");

  // Show analysis
  console.log(`${colors.bold}${t("changeAnalysis")}${colors.reset}`);
  analysis.reason.forEach((reason) => console.log(`  ${reason}`));
  console.log("");

  // Suggest version
  const suggestedVersion = bumpVersion(currentVersion, analysis.type);
  const typeColors: Record<VersionType, string> = {
    major: colors.red,
    minor: colors.yellow,
    patch: colors.green,
  };
  const typeEmojis: Record<VersionType, string> = {
    major: "🔴",
    minor: "🟡",
    patch: "🟢",
  };

  console.log(
    `${colors.bold}${t("suggestedType")}${colors.reset} ${
      typeEmojis[analysis.type]
    } ${typeColors[analysis.type]}${analysis.type.toUpperCase()}${colors.reset}`
  );
  console.log(
    `${colors.bold}${t("newVersion")}${colors.reset} ${
      colors.cyan
    }${currentVersion}${colors.reset} → ${colors.green}${
      colors.bold
    }${suggestedVersion}${colors.reset}`
  );
  console.log("");

  // Ask user with validation
  const rl = createInterface();

  let shouldUpdate = "";
  while (true) {
    shouldUpdate = await askChoice(
      rl,
      `${colors.bold}${t("updateVersion")}${colors.reset} `
    );

    const answer = shouldUpdate.toLowerCase();

    if (!shouldUpdate) {
      console.log(`${colors.red}${t("pleaseEnterYesNo")}${colors.reset}`);
      continue;
    }

    const yesOptions = getYesOptions();
    const noOptions = getNoOptions();

    if (yesOptions.includes(answer) || noOptions.includes(answer)) {
      break;
    }

    console.log(`${colors.red}${t("invalidResponse")}${colors.reset}`);
  }

  if (!getYesOptions().includes(shouldUpdate.toLowerCase())) {
    console.log("");
    console.log(`${colors.yellow}${t("versionNotChanged")}${colors.reset}`);

    // Close everything properly
    await closeInterface(rl);

    // Destroy TTY streams manually
    if ((rl as any)._ttyInput) (rl as any)._ttyInput.destroy();
    if ((rl as any)._ttyOutput) (rl as any)._ttyOutput.destroy();
    if ((rl as any)._ttyFd !== undefined) {
      try {
        require("fs").closeSync((rl as any)._ttyFd);
      } catch (e) {}
    }

    // Force terminate with SIGTERM
    process.kill(process.pid, "SIGTERM");
  }

  // Allow choosing a different type
  console.log("");
  console.log(`${colors.bold}${t("confirmVersionType")}${colors.reset}`);
  console.log(
    `  ${colors.red}1${colors.reset} - MAJOR (${bumpVersion(
      currentVersion,
      "major"
    )}) - ${t("majorDesc")}`
  );
  console.log(
    `  ${colors.yellow}2${colors.reset} - MINOR (${bumpVersion(
      currentVersion,
      "minor"
    )}) - ${t("minorDesc")}`
  );
  console.log(
    `  ${colors.green}3${colors.reset} - PATCH (${bumpVersion(
      currentVersion,
      "patch"
    )}) - ${t("patchDesc")}`
  );
  console.log("");

  const defaultChoice =
    analysis.type === "major" ? "1" : analysis.type === "minor" ? "2" : "3";
  let typeChoice = "";

  while (true) {
    typeChoice = await askChoice(
      rl,
      `${colors.bold}${t("choose")} (1/2/3) [${t(
        "defaultLabel"
      )}: ${defaultChoice}]:${colors.reset} `
    );

    // If empty, use default
    if (!typeChoice) {
      typeChoice = defaultChoice;
      break;
    }

    // Validate if it's 1, 2 or 3
    if (typeChoice === "1" || typeChoice === "2" || typeChoice === "3") {
      break;
    }

    console.log(`${colors.red}${t("invalidOption")}${colors.reset}`);
  }

  let finalType: VersionType = analysis.type;
  if (typeChoice === "1") finalType = "major";
  else if (typeChoice === "2") finalType = "minor";
  else if (typeChoice === "3") finalType = "patch";

  const finalVersion = bumpVersion(currentVersion, finalType);

  // Close readline interface BEFORE updating files
  await closeInterface(rl);

  // Destroy TTY streams manually
  if ((rl as any)._ttyInput) (rl as any)._ttyInput.destroy();
  if ((rl as any)._ttyOutput) (rl as any)._ttyOutput.destroy();
  if ((rl as any)._ttyFd !== undefined) {
    try {
      require("fs").closeSync((rl as any)._ttyFd);
    } catch (e) {}
  }

  // Update files
  console.log("");
  console.log(`${colors.bold}${t("updatingFiles")}${colors.reset}`);
  console.log("");

  updatePackageJson(finalVersion);
  updateIndexFile(finalVersion);
  updateChangelog(finalVersion, finalType, analysis);

  console.log("");
  console.log(
    `${colors.green}${colors.bold}✓ ${t("versionUpdatedTo")} ${finalVersion}!${
      colors.reset
    }`
  );
  console.log("");

  // Execute git commands automatically
  executeGitCommands(finalVersion);

  // Kill HTTP agents
  if (http.globalAgent) http.globalAgent.destroy();
  if (https.globalAgent) https.globalAgent.destroy();

  // Force terminate with SIGTERM
  process.kill(process.pid, "SIGTERM");
}

// Export for programmatic use
export { main, analyzeChanges, bumpVersion, getCurrentVersion };

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error(`${colors.red}${t("error")}${colors.reset}`, error.message);
    process.exit(1);
  });
}

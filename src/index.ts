#!/usr/bin/env node

/**
 * Version Control System - Main CLI
 * @version 3.0.1
 *
 * Intelligent version control system that analyzes Git commits
 * and automates semantic versioning (SemVer).
 */

import { colors } from "./colors";
import { git } from "./git";
import { getCurrentVersion, bumpVersion } from "./version";
import { analyzeChanges } from "./analyzer";
import {
  updatePackageJson,
  updateIndexFile,
  updateChangelog,
  updateChangelogUnreleased,
} from "./updater";
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
import { loadConfig } from "./configLoader";
import {
  bumpPrerelease,
  graduatePrerelease,
  isPrerelease,
  validatePrereleaseId,
} from "./prerelease";
import {
  previewPackageJsonChanges,
  previewChangelogChanges,
  showDryRunSummary,
} from "./dryRun";
import {
  createGithubRelease,
  getGithubInfo,
  extractChangelogForVersion,
} from "./githubRelease";

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
    }${currentLanguage.toUpperCase()}${colors.reset} (${source})`,
  );
  console.log(
    `  ${t("toChangeLanguage")} ${
      colors.cyan
    }version-control config --lang <code>${colors.reset}`,
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
        }${lang.toUpperCase()}${colors.reset}`,
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
    `  ${colors.cyan}version-control config --lang <code>${colors.reset} - Set language (en, pt, es, fr)`,
  );
  console.log(
    `  ${colors.cyan}version-control config --clear${colors.reset}      - Clear language config`,
  );
  console.log("");
  process.exit(0);
}

/**
 * Main function
 */
async function main(): Promise<void> {
  // Parse CLI arguments
  const args = process.argv.slice(2);

  // CLI flags
  const flags = {
    ci: args.includes("--ci") || args.includes("--yes"),
    test: args.includes("--test"),
    dryRun: args.includes("--dry-run"),
    skipVerify: args.includes("--skip-verify"),
    release: args.includes("--release"),
    prerelease: args
      .find((arg) => arg.startsWith("--prerelease="))
      ?.split("=")[1],
    graduate: args.includes("--graduate"),
  };

  // Handle config command
  if (args[0] === "config") {
    handleConfigCommand(args.slice(1));
    return;
  }

  // Load configuration
  const config = loadConfig();

  // Check for updates to clear stdin buffer (only if not CI mode)
  if (!flags.ci) {
    await checkForUpdates().catch(() => {});
  }

  // Destroy HTTP agents immediately after
  const http = require("http");
  const https = require("https");
  if (http.globalAgent) http.globalAgent.destroy();
  if (https.globalAgent) https.globalAgent.destroy();

  console.log("");
  console.log(
    `${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`,
  );
  console.log(
    `${colors.bold}${colors.cyan}          ${t("versionControl")}${
      flags.dryRun ? " (DRY-RUN)" : flags.ci ? " (CI MODE)" : ""
    }${colors.reset}`,
  );
  console.log(
    `${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`,
  );
  console.log("");

  // Show language info (only in interactive mode)
  if (!flags.ci) {
    showLanguageInfo();
  }

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
    }${currentVersion}${colors.reset}`,
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
    }`,
  );
  analysis.filesChanged.slice(0, 5).forEach((file) => {
    console.log(`  - ${file}`);
  });
  if (analysis.filesChanged.length > 5) {
    console.log(
      `  ... ${t("andMore")} ${analysis.filesChanged.length - 5} arquivo(s)`,
    );
  }
  console.log("");

  // Show analysis
  console.log(`${colors.bold}${t("changeAnalysis")}${colors.reset}`);
  analysis.reason.forEach((reason) => console.log(`  ${reason}`));
  console.log("");

  // Calculate final version based on flags
  let finalVersion: string;
  let finalType: VersionType = analysis.type;

  if (flags.graduate && isPrerelease(currentVersion)) {
    // Graduate from pre-release
    finalVersion = graduatePrerelease(currentVersion);
    console.log(
      `${colors.cyan}ℹ${colors.reset} Graduating from pre-release to stable`,
    );
  } else if (flags.prerelease) {
    // Pre-release version
    if (!validatePrereleaseId(flags.prerelease)) {
      console.error(
        `${colors.red}✗${colors.reset} Invalid pre-release identifier. Use: alpha, beta, or rc`,
      );
      process.exit(1);
    }
    finalVersion = bumpPrerelease(
      currentVersion,
      analysis.type,
      flags.prerelease,
    );
    console.log(
      `${colors.cyan}ℹ${colors.reset} Creating pre-release version: ${flags.prerelease}`,
    );
  } else {
    // Normal version bump
    const suggestedVersion = bumpVersion(currentVersion, analysis.type);

    // In CI mode or with --yes, use suggested version
    if (flags.ci) {
      finalVersion = suggestedVersion;
    } else {
      // Interactive mode - ask user
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
        } ${typeColors[analysis.type]}${analysis.type.toUpperCase()}${
          colors.reset
        }`,
      );
      console.log(
        `${colors.bold}${t("newVersion")}${colors.reset} ${
          colors.cyan
        }${currentVersion}${colors.reset} → ${colors.green}${
          colors.bold
        }${suggestedVersion}${colors.reset}`,
      );
      console.log("");

      // Ask user with validation
      const rl = createInterface();

      let shouldUpdate = "";
      while (true) {
        shouldUpdate = await askChoice(
          rl,
          `${colors.bold}${t("updateVersion")}${colors.reset} `,
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
        console.log("");
        updateChangelogUnreleased(analysis);
        await closeInterface(rl);
        if ((rl as any)._ttyInput) (rl as any)._ttyInput.destroy();
        if ((rl as any)._ttyOutput) (rl as any)._ttyOutput.destroy();
        if ((rl as any)._ttyFd !== undefined) {
          try {
            require("fs").closeSync((rl as any)._ttyFd);
          } catch (e) {}
        }
        process.exit(0);
      }

      // Allow choosing a different type
      console.log("");
      console.log(`${colors.bold}${t("confirmVersionType")}${colors.reset}`);
      console.log(
        `  ${colors.red}1${colors.reset} - MAJOR (${bumpVersion(
          currentVersion,
          "major",
        )}) - ${t("majorDesc")}`,
      );
      console.log(
        `  ${colors.yellow}2${colors.reset} - MINOR (${bumpVersion(
          currentVersion,
          "minor",
        )}) - ${t("minorDesc")}`,
      );
      console.log(
        `  ${colors.green}3${colors.reset} - PATCH (${bumpVersion(
          currentVersion,
          "patch",
        )}) - ${t("patchDesc")}`,
      );
      console.log("");

      const defaultChoice =
        analysis.type === "major" ? "1" : analysis.type === "minor" ? "2" : "3";
      let typeChoice = "";

      while (true) {
        typeChoice = await askChoice(
          rl,
          `${colors.bold}${t("choose")} (1/2/3) [${t(
            "defaultLabel",
          )}: ${defaultChoice}]:${colors.reset} `,
        );

        if (!typeChoice) {
          typeChoice = defaultChoice;
          break;
        }

        if (typeChoice === "1" || typeChoice === "2" || typeChoice === "3") {
          break;
        }

        console.log(`${colors.red}${t("invalidOption")}${colors.reset}`);
      }

      if (typeChoice === "1") finalType = "major";
      else if (typeChoice === "2") finalType = "minor";
      else if (typeChoice === "3") finalType = "patch";

      finalVersion = bumpVersion(currentVersion, finalType);

      // Close readline interface BEFORE updating files
      await closeInterface(rl);
      if ((rl as any)._ttyInput) (rl as any)._ttyInput.destroy();
      if ((rl as any)._ttyOutput) (rl as any)._ttyOutput.destroy();
      if ((rl as any)._ttyFd !== undefined) {
        try {
          require("fs").closeSync((rl as any)._ttyFd);
        } catch (e) {}
      }
    }
  }

  // DRY-RUN mode: show preview and exit
  if (flags.dryRun) {
    previewPackageJsonChanges(currentVersion, finalVersion);

    // Generate changelog preview
    const changelogContent = require("./updater").generateChangelogContent(
      finalVersion,
      finalType,
      analysis,
    );
    previewChangelogChanges(changelogContent);

    showDryRunSummary(currentVersion, finalVersion, {
      files: 2 + analysis.filesChanged.length,
      additions: 10,
      deletions: 2,
    });

    process.exit(0);
  }

  // TEST mode: skip git operations
  if (flags.test) {
    console.log("");
    console.log(
      `${colors.yellow}⚠ TEST MODE${colors.reset} - Files will be updated but no git operations`,
    );
    console.log("");
  }

  // Update files
  console.log("");
  console.log(`${colors.bold}${t("updatingFiles")}${colors.reset}`);
  console.log("");

  if (!config.skip?.changelog) {
    updateChangelog(finalVersion, finalType, analysis);
  }

  if (config.bumpFiles?.includes("package.json")) {
    updatePackageJson(finalVersion);
  }

  updateIndexFile(finalVersion);

  console.log("");
  console.log(
    `${colors.green}${colors.bold}✓ ${t("versionUpdatedTo")} ${finalVersion}!${
      colors.reset
    }`,
  );
  console.log("");

  // Execute git commands (skip in test mode)
  if (!flags.test && !config.skip?.commit) {
    executeGitCommands(finalVersion);
  }

  // Create GitHub release if requested
  if (flags.release && config.createGithubRelease) {
    const githubInfo = getGithubInfo();
    if (githubInfo && config.githubToken) {
      console.log("");
      console.log(`${colors.cyan}📦 Creating GitHub release...${colors.reset}`);

      const releaseBody = extractChangelogForVersion(finalVersion);
      const success = await createGithubRelease({
        owner: githubInfo.owner,
        repo: githubInfo.repo,
        tag: `v${finalVersion}`,
        name: `Release v${finalVersion}`,
        body: releaseBody,
        token: config.githubToken,
        prerelease: isPrerelease(finalVersion),
      });

      if (success) {
        console.log(`${colors.green}✓ GitHub release created!${colors.reset}`);
      }
    } else if (!githubInfo) {
      console.warn(
        `${colors.yellow}⚠ No GitHub repository found in package.json${colors.reset}`,
      );
    } else if (!config.githubToken) {
      console.warn(
        `${colors.yellow}⚠ No GitHub token configured. Set githubToken in .versionrc.js${colors.reset}`,
      );
    }
  }

  // Destroy HTTP agents to release any open handles
  if (http.globalAgent) http.globalAgent.destroy();
  if (https.globalAgent) https.globalAgent.destroy();

  process.exit(0);
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

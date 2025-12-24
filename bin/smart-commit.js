#!/usr/bin/env node

/**
 * Smart Commit - Automatic commit message generator
 */

const { execSync } = require("child_process");
const { colors } = require("../dist/colors.js");
const {
  getStagedChanges,
  generateCommitMessage,
} = require("../dist/commitGenerator.js");
const {
  createInterface,
  question,
  closeInterface,
} = require("../dist/readline.js");
const { checkForUpdates } = require("../dist/updateChecker.js");
const { t, currentLanguage, isLanguageConfigured } = require("../dist/i18n.js");

/**
 * Show language info
 */
function showLanguageInfo() {
  const source = isLanguageConfigured
    ? t.configuredManually
    : t.detectedFromSystem;
  console.log(
    `${colors.cyan}ℹ${colors.reset} ${t.currentLanguageIs} ${
      colors.bold
    }${currentLanguage.toUpperCase()}${colors.reset} (${source})`
  );
  console.log(
    `  ${t.toChangeLanguage} ${colors.cyan}version-control config --lang <code>${colors.reset}`
  );
  console.log("");
}

async function main() {
  // Check for updates (non-blocking)
  checkForUpdates().catch(() => {
    // Silently ignore errors
  });

  console.log("");
  console.log(
    `${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(
    `${colors.bold}${colors.cyan}              ${t.smartCommit}${colors.reset}`
  );
  console.log(
    `${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`
  );
  console.log("");

  // Show language info
  showLanguageInfo();

  // Check for staged changes
  const stagedFiles = execSync("git diff --cached --name-only", {
    encoding: "utf8",
  }).trim();

  if (!stagedFiles) {
    console.log(`${colors.yellow}ℹ${colors.reset} ${t.noStagedFiles}`);
    console.log("");
    console.log(`${colors.bold}${t.howToUse}${colors.reset}`);
    console.log(`  1. ${t.makeChanges}`);
    console.log(
      `  2. ${t.stageFiles} ${colors.cyan}git add <files>${colors.reset}`
    );
    console.log(
      `  3. ${t.runCommand} ${colors.cyan}yarn commit${colors.reset}`
    );
    console.log("");
    process.exit(0);
  }

  // Get staged changes
  const changes = getStagedChanges();

  console.log(
    `${colors.bold}${t.stagedFiles}${colors.reset} ${changes.length}`
  );
  changes.slice(0, 10).forEach((change) => {
    const icon =
      change.status === "added"
        ? "✨"
        : change.status === "deleted"
        ? "🗑️"
        : "📝";
    const stats = `(+${change.additions}/-${change.deletions})`;
    console.log(
      `  ${icon} ${change.path} ${colors.cyan}${stats}${colors.reset}`
    );
  });

  if (changes.length > 10) {
    console.log(`  ... ${t.andMore} ${changes.length - 10} ${t.andMoreFiles}`);
  }
  console.log("");

  // Generate commit message
  console.log(`${colors.bold}${t.analyzingChanges}${colors.reset}`);
  const suggestion = generateCommitMessage(changes);

  console.log("");
  console.log(`${colors.bold}${t.generatedMessage}${colors.reset}`);
  console.log(`${colors.green}${suggestion.fullMessage}${colors.reset}`);
  console.log("");

  // Show breakdown
  console.log(`${colors.bold}${t.details}${colors.reset}`);
  console.log(`  ${t.type} ${colors.cyan}${suggestion.type}${colors.reset}`);
  if (suggestion.scope) {
    console.log(
      `  ${t.scope} ${colors.cyan}${suggestion.scope}${colors.reset}`
    );
  }
  console.log(
    `  ${t.description} ${colors.cyan}${suggestion.description}${colors.reset}`
  );
  console.log("");

  // Ask user
  const rl = createInterface();

  let choice = "";
  while (true) {
    choice = await question(
      rl,
      `${colors.bold}${t.options} [1] ${t.optionCommit} [2] ${t.optionEdit} [3] ${t.optionCancel} (${t.defaultLabel}: 1)\n${t.choice}${colors.reset} `
    );

    // Default to option 1 if empty
    if (!choice || choice.trim() === "") {
      choice = "1";
    }

    if (choice === "1" || choice === "2" || choice === "3") {
      break;
    }

    console.log(`${colors.red}${t.invalidEnter}${colors.reset}`);
  }

  let finalMessage = suggestion.fullMessage;

  if (choice === "2") {
    console.log("");
    finalMessage = await question(
      rl,
      `${colors.bold}${t.enterCommitMessage}${colors.reset} `
    );

    if (!finalMessage.trim()) {
      console.log("");
      console.log(`${colors.red}${t.emptyMessage}${colors.reset}`);
      await closeInterface(rl);
      process.exit(1);
    }
  } else if (choice === "3") {
    console.log("");
    console.log(`${colors.yellow}${t.commitCancelled}${colors.reset}`);
    await closeInterface(rl);
    process.exit(0);
  }

  await closeInterface(rl);

  // Execute commit
  console.log("");
  console.log(`${colors.bold}${t.committing}${colors.reset}`);

  try {
    execSync(`git commit -m "${finalMessage.replace(/"/g, '\\"')}"`, {
      stdio: "inherit",
      encoding: "utf8",
    });

    console.log("");
    console.log(
      `${colors.green}${colors.bold}✓ ${t.commitSuccess}${colors.reset}`
    );
    console.log("");

    // Force clean exit
    process.exit(0);
  } catch (error) {
    console.log("");
    console.log(`${colors.red}✗ ${t.commitFailed}${colors.reset}`);
    console.log("");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`${colors.red}Error:${colors.reset}`, error.message);
  process.exit(1);
});

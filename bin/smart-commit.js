#!/usr/bin/env node

/**
 * Smart Commit - Automatic commit message generator
 */

const { execSync } = require('child_process');
const { colors } = require('../dist/colors.js');
const { getStagedChanges, generateCommitMessage } = require('../dist/commitGenerator.js');
const { createInterface, question, closeInterface } = require('../dist/readline.js');

async function main() {
  console.log('');
  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}              Smart Commit - Auto Message${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log('');

  // Check for staged changes
  const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
  
  if (!stagedFiles) {
    console.log(`${colors.yellow}⚠${colors.reset} No staged files found.`);
    console.log('');
    console.log('Run: git add <files> before using smart commit');
    console.log('');
    process.exit(1);
  }

  // Get staged changes
  const changes = getStagedChanges();
  
  console.log(`${colors.bold}Staged files:${colors.reset} ${changes.length}`);
  changes.slice(0, 10).forEach(change => {
    const icon = change.status === 'added' ? '✨' : change.status === 'deleted' ? '🗑️' : '📝';
    const stats = `(+${change.additions}/-${change.deletions})`;
    console.log(`  ${icon} ${change.path} ${colors.cyan}${stats}${colors.reset}`);
  });
  
  if (changes.length > 10) {
    console.log(`  ... and ${changes.length - 10} more file(s)`);
  }
  console.log('');

  // Generate commit message
  console.log(`${colors.bold}Analyzing changes...${colors.reset}`);
  const suggestion = generateCommitMessage(changes);
  
  console.log('');
  console.log(`${colors.bold}Generated commit message:${colors.reset}`);
  console.log(`${colors.green}${suggestion.fullMessage}${colors.reset}`);
  console.log('');

  // Show breakdown
  console.log(`${colors.bold}Details:${colors.reset}`);
  console.log(`  Type: ${colors.cyan}${suggestion.type}${colors.reset}`);
  if (suggestion.scope) {
    console.log(`  Scope: ${colors.cyan}${suggestion.scope}${colors.reset}`);
  }
  console.log(`  Description: ${colors.cyan}${suggestion.description}${colors.reset}`);
  console.log('');

  // Ask user
  const rl = createInterface();
  
  let choice = '';
  while (true) {
    choice = await question(
      rl,
      `${colors.bold}Choose an option:\n  1 - Commit with this message\n  2 - Edit message\n  3 - Cancel\n\nYour choice (1/2/3):${colors.reset} `
    );

    if (choice === '1' || choice === '2' || choice === '3') {
      break;
    }

    console.log(`${colors.red}Invalid option. Please enter 1, 2, or 3${colors.reset}`);
  }

  let finalMessage = suggestion.fullMessage;

  if (choice === '2') {
    console.log('');
    finalMessage = await question(rl, `${colors.bold}Enter your commit message:${colors.reset} `);
    
    if (!finalMessage.trim()) {
      console.log('');
      console.log(`${colors.red}Empty message. Commit cancelled.${colors.reset}`);
      await closeInterface(rl);
      process.exit(1);
    }
  } else if (choice === '3') {
    console.log('');
    console.log(`${colors.yellow}Commit cancelled.${colors.reset}`);
    await closeInterface(rl);
    process.exit(0);
  }

  await closeInterface(rl);

  // Execute commit
  console.log('');
  console.log(`${colors.bold}Committing...${colors.reset}`);
  
  try {
    execSync(`git commit -m "${finalMessage.replace(/"/g, '\\"')}"`, { 
      stdio: 'inherit',
      encoding: 'utf8' 
    });
    
    console.log('');
    console.log(`${colors.green}${colors.bold}✓ Commit created successfully!${colors.reset}`);
    console.log('');
  } catch (error) {
    console.log('');
    console.log(`${colors.red}✗ Failed to create commit${colors.reset}`);
    console.log('');
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error.message);
  process.exit(1);
});

import * as fs from "fs";
import * as path from "path";
import { colors } from "./colors";

/**
 * Show diff for a file
 */
export function showFileDiff(
  filePath: string,
  oldContent: string,
  newContent: string
): void {
  console.log("");
  console.log(
    `${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );
  console.log(`${colors.bold}📄 ${filePath}${colors.reset}`);
  console.log(
    `${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );

  const oldLines = oldContent.split("\n");
  const newLines = newContent.split("\n");

  // Simple line-by-line diff
  const maxLines = Math.max(oldLines.length, newLines.length);
  let diffCount = 0;

  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i] || "";
    const newLine = newLines[i] || "";

    if (oldLine !== newLine) {
      diffCount++;
      if (diffCount > 20) {
        console.log(
          `${colors.dim}... (${maxLines - i} more lines)${colors.reset}`
        );
        break;
      }

      if (oldLine && !newLine) {
        console.log(`${colors.red}- ${oldLine}${colors.reset}`);
      } else if (!oldLine && newLine) {
        console.log(`${colors.green}+ ${newLine}${colors.reset}`);
      } else {
        console.log(`${colors.red}- ${oldLine}${colors.reset}`);
        console.log(`${colors.green}+ ${newLine}${colors.reset}`);
      }
    }
  }

  console.log("");
}

/**
 * Preview package.json changes
 */
export function previewPackageJsonChanges(
  currentVersion: string,
  newVersion: string
): void {
  const packagePath = path.join(process.cwd(), "package.json");
  const content = fs.readFileSync(packagePath, "utf-8");
  const newContent = content.replace(
    `"version": "${currentVersion}"`,
    `"version": "${newVersion}"`
  );

  showFileDiff("package.json", content, newContent);
}

/**
 * Preview CHANGELOG.md changes
 */
export function previewChangelogChanges(newChangelogContent: string): void {
  const changelogPath = path.join(process.cwd(), "CHANGELOG.md");
  let oldContent = "";

  try {
    oldContent = fs.readFileSync(changelogPath, "utf-8");
  } catch {
    oldContent = "";
  }

  showFileDiff("CHANGELOG.md", oldContent, newChangelogContent);
}

/**
 * Show dry-run summary
 */
export function showDryRunSummary(
  currentVersion: string,
  newVersion: string,
  changes: { files: number; additions: number; deletions: number }
): void {
  console.log("");
  console.log(
    `${colors.cyan}╔════════════════════════════════════════════════╗${colors.reset}`
  );
  console.log(
    `${colors.cyan}║${colors.reset}  ${colors.bold}DRY-RUN SUMMARY${colors.reset}                           ${colors.cyan}║${colors.reset}`
  );
  console.log(
    `${colors.cyan}╚════════════════════════════════════════════════╝${colors.reset}`
  );
  console.log("");
  console.log(
    `  ${colors.bold}Version:${colors.reset} ${currentVersion} → ${colors.green}${newVersion}${colors.reset}`
  );
  console.log(`  ${colors.bold}Files changed:${colors.reset} ${changes.files}`);
  console.log(
    `  ${colors.bold}Additions:${colors.reset} ${colors.green}+${changes.additions}${colors.reset}`
  );
  console.log(
    `  ${colors.bold}Deletions:${colors.reset} ${colors.red}-${changes.deletions}${colors.reset}`
  );
  console.log("");
  console.log(
    `  ${colors.dim}Run without --dry-run to apply changes${colors.reset}`
  );
  console.log("");
}

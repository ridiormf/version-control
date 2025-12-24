import * as fs from "fs";
import * as path from "path";
import { ChangeAnalysis, VersionType } from "./types";
import { colors } from "./colors";
import {
  getCommitsSinceLastTag,
  groupCommitsByType,
  removeDuplicates,
} from "./changelog";

/**
 * Update version in package.json
 * @param newVersion - New version string
 * @param projectRoot - Root directory of the project
 */
export function updatePackageJson(
  newVersion: string,
  projectRoot: string = process.cwd()
): void {
  const packagePath = path.join(projectRoot, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + "\n");
  console.log(`${colors.green}✓${colors.reset} package.json atualizado`);
}

/**
 * Update version in index file (if exists and has @version tag)
 * @param newVersion - New version string
 * @param projectRoot - Root directory of the project
 */
export function updateIndexFile(
  newVersion: string,
  projectRoot: string = process.cwd()
): void {
  const possibleIndexFiles = [
    path.join(projectRoot, "index.js"),
    path.join(projectRoot, "index.ts"),
    path.join(projectRoot, "src/index.js"),
    path.join(projectRoot, "src/index.ts"),
  ];

  for (const indexPath of possibleIndexFiles) {
    if (fs.existsSync(indexPath)) {
      let content = fs.readFileSync(indexPath, "utf8");
      if (content.includes("@version")) {
        content = content.replace(
          /@version \d+\.\d+\.\d+/,
          `@version ${newVersion}`
        );
        fs.writeFileSync(indexPath, content);
        console.log(
          `${colors.green}✓${colors.reset} ${path.basename(
            indexPath
          )} atualizado`
        );
        return;
      }
    }
  }
}

/**
 * Add entry to CHANGELOG.md
 * @param version - New version string
 * @param _type - Version bump type (not used, kept for API compatibility)
 * @param _analysis - Change analysis data (not used, kept for API compatibility)
 * @param projectRoot - Root directory of the project
 */
export function updateChangelog(
  version: string,
  _type: VersionType,
  _analysis: ChangeAnalysis,
  projectRoot: string = process.cwd()
): void {
  const changelogPath = path.join(projectRoot, "CHANGELOG.md");

  if (!fs.existsSync(changelogPath)) {
    console.log(`${colors.yellow}⚠${colors.reset} CHANGELOG.md não encontrado`);
    return;
  }

  const content = fs.readFileSync(changelogPath, "utf8");
  const date = new Date().toISOString().split("T")[0];

  // Get all commits since last tag
  const commits = getCommitsSinceLastTag();

  if (commits.length === 0) {
    console.log(
      `${colors.yellow}⚠${colors.reset} Nenhum commit novo encontrado`
    );
    return;
  }

  // Group commits by type
  const sections = groupCommitsByType(commits);

  // Build changelog entry
  let newEntry = `\n## [${version}] - ${date}\n`;

  // Add sections in order of importance
  if (sections.breaking.length > 0) {
    newEntry += `\n### ⚠️ Breaking Changes\n\n`;
    removeDuplicates(sections.breaking).forEach((item) => {
      newEntry += `- ${item}\n`;
    });
  }

  if (sections.added.length > 0) {
    newEntry += `\n### ✨ Added\n\n`;
    removeDuplicates(sections.added).forEach((item) => {
      newEntry += `- ${item}\n`;
    });
  }

  if (sections.changed.length > 0) {
    newEntry += `\n### 🔄 Changed\n\n`;
    removeDuplicates(sections.changed).forEach((item) => {
      newEntry += `- ${item}\n`;
    });
  }

  if (sections.deprecated.length > 0) {
    newEntry += `\n### ⚠️ Deprecated\n\n`;
    removeDuplicates(sections.deprecated).forEach((item) => {
      newEntry += `- ${item}\n`;
    });
  }

  if (sections.removed.length > 0) {
    newEntry += `\n### 🗑️ Removed\n\n`;
    removeDuplicates(sections.removed).forEach((item) => {
      newEntry += `- ${item}\n`;
    });
  }

  if (sections.fixed.length > 0) {
    newEntry += `\n### 🐛 Fixed\n\n`;
    removeDuplicates(sections.fixed).forEach((item) => {
      newEntry += `- ${item}\n`;
    });
  }

  if (sections.security.length > 0) {
    newEntry += `\n### 🔒 Security\n\n`;
    removeDuplicates(sections.security).forEach((item) => {
      newEntry += `- ${item}\n`;
    });
  }

  if (sections.other.length > 0) {
    newEntry += `\n### 📝 Other\n\n`;
    removeDuplicates(sections.other).forEach((item) => {
      newEntry += `- ${item}\n`;
    });
  }

  newEntry += "\n";

  // Insert after the header, before the first version
  const lines = content.split("\n");
  const insertIndex = lines.findIndex((line) => line.startsWith("## ["));

  if (insertIndex !== -1) {
    lines.splice(insertIndex, 0, newEntry);
    fs.writeFileSync(changelogPath, lines.join("\n"));
    console.log(
      `${colors.green}✓${colors.reset} CHANGELOG.md atualizado com ${commits.length} commit(s)`
    );
  }
}

import * as fs from "fs";
import * as path from "path";
import { ChangeAnalysis, VersionType } from "./types";
import { colors } from "./colors";
import {
  CommitInfo,
  getCommitsSinceLastTag,
  groupCommitsByType,
  removeDuplicates,
} from "./changelog";
import { t } from "./i18n";

/**
 * Update version in package.json
 * @param newVersion - New version string
 * @param projectRoot - Root directory of the project
 */
export function updatePackageJson(
  newVersion: string,
  projectRoot: string = process.cwd(),
): void {
  const packagePath = path.join(projectRoot, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + "\n");
  console.log(`${colors.green}✓${colors.reset} ${t("packageJsonUpdated")}`);
}

/**
 * Update version in index file (if exists and has @version tag)
 * @param newVersion - New version string
 * @param projectRoot - Root directory of the project
 */
export function updateIndexFile(
  newVersion: string,
  projectRoot: string = process.cwd(),
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
          `@version ${newVersion}`,
        );
        fs.writeFileSync(indexPath, content);
        console.log(
          `${colors.green}✓${colors.reset} ${path.basename(indexPath)} ${t(
            "updated",
          )}`,
        );
        return;
      }
    }
  }
}

/**
 * Remove [Unreleased] section from changelog content.
 * Strips everything from the `## [Unreleased]` heading up to (but not including)
 * the next `## [` heading, so the block is cleanly replaced on every run.
 */
function removeUnreleasedSection(content: string): string {
  const lines = content.split("\n");
  const startIndex = lines.findIndex((line) =>
    /^## \[Unreleased\]/i.test(line),
  );

  if (startIndex === -1) return content;

  // Find the next versioned ## [ heading after [Unreleased]
  const endIndex = lines.findIndex(
    (line, i) => i > startIndex && /^## \[\d/.test(line),
  );

  if (endIndex === -1) {
    // [Unreleased] is the last (or only) section — remove to end
    lines.splice(startIndex, lines.length - startIndex);
  } else {
    lines.splice(startIndex, endIndex - startIndex);
  }

  return lines.join("\n");
}

/**
 * Build an `## [Unreleased]` markdown block from the given commit list.
 */
function buildUnreleasedEntry(commits: CommitInfo[]): string {
  const sections = groupCommitsByType(commits);
  let entry = `## [Unreleased]\n`;

  if (sections.breaking.length > 0) {
    entry += `\n### ⚠️ Breaking Changes\n\n`;
    removeDuplicates(sections.breaking).forEach((item) => {
      entry += `- ${item}\n`;
    });
  }

  if (sections.added.length > 0) {
    entry += `\n### ✨ Added\n\n`;
    removeDuplicates(sections.added).forEach((item) => {
      entry += `- ${item}\n`;
    });
  }

  if (sections.changed.length > 0) {
    entry += `\n### 🔄 Changed\n\n`;
    removeDuplicates(sections.changed).forEach((item) => {
      entry += `- ${item}\n`;
    });
  }

  if (sections.deprecated.length > 0) {
    entry += `\n### ⚠️ Deprecated\n\n`;
    removeDuplicates(sections.deprecated).forEach((item) => {
      entry += `- ${item}\n`;
    });
  }

  if (sections.removed.length > 0) {
    entry += `\n### 🗑️ Removed\n\n`;
    removeDuplicates(sections.removed).forEach((item) => {
      entry += `- ${item}\n`;
    });
  }

  if (sections.fixed.length > 0) {
    entry += `\n### 🐛 Fixed\n\n`;
    removeDuplicates(sections.fixed).forEach((item) => {
      entry += `- ${item}\n`;
    });
  }

  if (sections.security.length > 0) {
    entry += `\n### 🔒 Security\n\n`;
    removeDuplicates(sections.security).forEach((item) => {
      entry += `- ${item}\n`;
    });
  }

  if (sections.other.length > 0) {
    entry += `\n### 📝 Other\n\n`;
    removeDuplicates(sections.other).forEach((item) => {
      entry += `- ${item}\n`;
    });
  }

  return entry + "\n";
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
  projectRoot: string = process.cwd(),
): void {
  const changelogPath = path.join(projectRoot, "CHANGELOG.md");

  if (!fs.existsSync(changelogPath)) {
    console.log(`${colors.yellow}⚠${colors.reset} ${t("changelogNotFound")}`);
    return;
  }

  // Remove any [Unreleased] section — its content is now promoted to this versioned entry
  let content = removeUnreleasedSection(fs.readFileSync(changelogPath, "utf8"));
  const date = new Date().toISOString().split("T")[0];

  // Get all commits since last tag
  const commits = getCommitsSinceLastTag();

  if (commits.length === 0) {
    console.log(`${colors.yellow}⚠${colors.reset} ${t("noNewCommits")}`);
    return;
  }

  // Group commits by type
  const sections = groupCommitsByType(commits);

  // Build changelog entry
  let newEntry = `\n## [${version}] - ${date}\n`;

  // Check if this is the first release (1.0.0)
  const isFirstRelease = version === "1.0.0";

  if (isFirstRelease) {
    newEntry += `\n### 🎉 ${t("initialRelease")}\n\n`;
    newEntry += `${t("firstPublicVersion")}\n\n`;
  }

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
      `${colors.green}✓${colors.reset} ${t("changelogUpdated")} ${
        commits.length
      } ${t("commits")}`,
    );
  }
}

/**
 * Generate changelog content without writing to file
 * @param version - New version string
 * @param _type - Version bump type
 * @param _analysis - Change analysis data
 * @returns Generated changelog content
 */
export function generateChangelogContent(
  version: string,
  _type: VersionType,
  _analysis: ChangeAnalysis,
): string {
  const date = new Date().toISOString().split("T")[0];
  const commits = getCommitsSinceLastTag();

  if (commits.length === 0) {
    return "";
  }

  const sections = groupCommitsByType(commits);
  let newEntry = `\n## [${version}] - ${date}\n`;

  const isFirstRelease = version === "1.0.0";

  if (isFirstRelease) {
    newEntry += `\n### 🎉 ${t("initialRelease")}\n\n`;
    newEntry += `${t("firstPublicVersion")}\n\n`;
  }

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

  return newEntry + "\n";
}

/**
 * Update CHANGELOG.md with an `## [Unreleased]` section when the user
 * declines the version bump.
 *
 * Behaviour across multiple runs:
 * - First NO  → creates `[Unreleased]` with all commits since the last tag.
 * - Subsequent NOs → replaces the existing `[Unreleased]` block with the
 *   refreshed set of commits (getCommitsSinceLastTag always returns the full
 *   accumulated list, so no duplicates arise).
 * - When the user finally answers YES → updateChangelog() strips `[Unreleased]`
 *   and replaces it with the proper versioned entry.
 *
 * @param _analysis - Change analysis data (kept for API compatibility)
 * @param projectRoot - Root directory of the project
 */
export function updateChangelogUnreleased(
  _analysis: ChangeAnalysis,
  projectRoot: string = process.cwd(),
): void {
  const changelogPath = path.join(projectRoot, "CHANGELOG.md");

  if (!fs.existsSync(changelogPath)) {
    console.log(`${colors.yellow}⚠${colors.reset} ${t("changelogNotFound")}`);
    return;
  }

  const commits = getCommitsSinceLastTag();

  if (commits.length === 0) {
    console.log(`${colors.yellow}⚠${colors.reset} ${t("noNewCommits")}`);
    return;
  }

  // Replace (or create) the [Unreleased] section with the current commit set
  let content = removeUnreleasedSection(fs.readFileSync(changelogPath, "utf8"));

  const newEntry = buildUnreleasedEntry(commits);

  const lines = content.split("\n");
  // Insert before the first versioned ## [ entry
  const insertIndex = lines.findIndex((line) => /^## \[\d/.test(line));

  if (insertIndex !== -1) {
    lines.splice(insertIndex, 0, newEntry);
  } else {
    lines.push(newEntry);
  }

  fs.writeFileSync(changelogPath, lines.join("\n"));
  console.log(
    `${colors.green}✓${colors.reset} ${t("changelogUnreleasedUpdated")} (${commits.length} ${t("commits")})`,
  );
}

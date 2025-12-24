import * as fs from "fs";
import * as path from "path";
import { ChangeAnalysis, VersionType } from "./types";
import { colors } from "./colors";

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
 * @param type - Version bump type
 * @param analysis - Change analysis data
 * @param projectRoot - Root directory of the project
 */
export function updateChangelog(
  version: string,
  type: VersionType,
  analysis: ChangeAnalysis,
  projectRoot: string = process.cwd()
): void {
  const changelogPath = path.join(projectRoot, "CHANGELOG.md");

  if (!fs.existsSync(changelogPath)) {
    console.log(`${colors.yellow}⚠${colors.reset} CHANGELOG.md não encontrado`);
    return;
  }

  const content = fs.readFileSync(changelogPath, "utf8");
  const date = new Date().toISOString().split("T")[0];

  // Prepare entry based on type
  let changeType = "Changed";
  if (type === "major") changeType = "Changed";
  if (type === "minor") changeType = "Added";
  if (type === "patch") changeType = "Fixed";

  const newEntry = `
## [${version}] - ${date}

### ${changeType}
- ${analysis.commitMsg}

`;

  // Insert after the header, before the first version
  const lines = content.split("\n");
  const insertIndex = lines.findIndex((line) => line.startsWith("## ["));

  if (insertIndex !== -1) {
    lines.splice(insertIndex, 0, newEntry);
    fs.writeFileSync(changelogPath, lines.join("\n"));
    console.log(`${colors.green}✓${colors.reset} CHANGELOG.md atualizado`);
  }
}

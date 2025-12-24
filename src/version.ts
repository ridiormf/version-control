import * as fs from "fs";
import * as path from "path";

/**
 * Read the current version from package.json
 * @param projectRoot - Root directory of the project (default: current directory)
 * @returns Current version string
 */
export function getCurrentVersion(projectRoot: string = process.cwd()): string {
  const packagePath = path.join(projectRoot, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  return packageJson.version;
}

/**
 * Increment version based on type
 * @param currentVersion - Current version string (e.g., "1.2.3")
 * @param type - Version bump type (major, minor, or patch)
 * @returns New version string
 */
export function bumpVersion(
  currentVersion: string,
  type: "major" | "minor" | "patch"
): string {
  const [major, minor, patch] = currentVersion.split(".").map(Number);

  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    default:
      return currentVersion;
  }
}

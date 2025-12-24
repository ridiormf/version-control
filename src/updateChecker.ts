import * as https from "https";
import * as fs from "fs";
import * as path from "path";
import { colors } from "./colors";

/**
 * Check if a new version is available on npm
 */
export async function checkForUpdates(): Promise<void> {
  try {
    // Get current version
    const packagePath = path.join(__dirname, "../package.json");
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    const currentVersion = packageJson.version;
    const packageName = packageJson.name;

    // Fetch latest version from npm
    const latestVersion = await getLatestVersion(packageName);

    if (!latestVersion) {
      return; // Silently fail if can't fetch
    }

    // Compare versions
    if (isNewerVersion(latestVersion, currentVersion)) {
      console.log("");
      console.log(`${colors.yellow}╭${"─".repeat(57)}╮${colors.reset}`);
      console.log(
        `${colors.yellow}│${colors.reset}  ${colors.bold}Update available:${
          colors.reset
        } ${colors.cyan}${currentVersion}${colors.reset} → ${colors.green}${
          colors.bold
        }${latestVersion}${colors.reset}${" ".repeat(
          57 - 35 - currentVersion.length - latestVersion.length
        )}${colors.yellow}│${colors.reset}`
      );
      console.log(
        `${colors.yellow}│${colors.reset}  Run: ${
          colors.cyan
        }yarn global add ${packageName}${colors.reset}${" ".repeat(
          57 - 13 - packageName.length
        )}${colors.yellow}│${colors.reset}`
      );
      console.log(`${colors.yellow}╰${"─".repeat(57)}╯${colors.reset}`);
      console.log("");
    }
  } catch (error) {
    // Silently fail - don't interrupt user's workflow
    return;
  }
}

/**
 * Fetch latest version from npm registry
 */
function getLatestVersion(packageName: string): Promise<string | null> {
  return new Promise((resolve) => {
    const url = `https://registry.npmjs.org/${packageName}/latest`;

    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve(json.version || null);
          } catch {
            resolve(null);
          }
        });
      })
      .on("error", () => {
        resolve(null);
      });
  });
}

/**
 * Compare two semantic versions
 * @returns true if newVersion is greater than currentVersion
 */
function isNewerVersion(newVersion: string, currentVersion: string): boolean {
  const newParts = newVersion.split(".").map(Number);
  const currentParts = currentVersion.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    const newPart = newParts[i] || 0;
    const currentPart = currentParts[i] || 0;

    if (newPart > currentPart) {
      return true;
    } else if (newPart < currentPart) {
      return false;
    }
  }

  return false;
}

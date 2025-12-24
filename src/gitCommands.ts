import { execSync } from "child_process";
import { colors } from "./colors";
import { t } from "./i18n";

/**
 * Execute git commands to commit, tag, and push version
 * @param version - Version string to commit and tag
 */
export function executeGitCommands(version: string): void {
  console.log(`${colors.bold}${t("executingGitCommands")}${colors.reset}`);
  console.log("");

  try {
    // git add -A
    console.log(`${colors.cyan}→${colors.reset} git add -A`);
    execSync("git add -A", { stdio: "inherit" });
    console.log(`${colors.green}✓${colors.reset} ${t("filesAdded")}`);

    // git commit
    console.log(
      `${colors.cyan}→${colors.reset} git commit -m "chore: bump version to ${version}"`
    );
    execSync(`git commit -m "chore: bump version to ${version}"`, {
      stdio: "inherit",
    });
    console.log(`${colors.green}✓${colors.reset} ${t("commitCreated")}`);

    // git tag
    console.log(`${colors.cyan}→${colors.reset} git tag v${version}`);
    execSync(`git tag v${version}`, { stdio: "inherit" });
    console.log(`${colors.green}✓${colors.reset} ${t("tagCreated")}`);

    // git push
    console.log(`${colors.cyan}→${colors.reset} git push`);
    execSync("git push", { stdio: "inherit" });
    console.log(`${colors.green}✓${colors.reset} ${t("pushCompleted")}`);

    // git push --tags
    console.log(`${colors.cyan}→${colors.reset} git push --tags`);
    execSync("git push --tags", { stdio: "inherit" });
    console.log(`${colors.green}✓${colors.reset} ${t("tagsPushed")}`);

    console.log("");
    console.log(
      `${colors.green}${colors.bold}✓ ${t("versionPublished")}${colors.reset}`
    );
    console.log("");
  } catch (error) {
    const err = error as Error;
    console.log("");
    console.log(
      `${colors.red}✗ ${t("errorExecutingGit")}${colors.reset}`,
      err.message
    );
    console.log("");
    console.log(`${colors.bold}${t("executeManually")}${colors.reset}`);
    console.log(`  1. git add -A`);
    console.log(`  2. git commit -m "chore: bump version to ${version}"`);
    console.log(`  3. git tag v${version}`);
    console.log(`  4. git push && git push --tags`);
    console.log("");
    process.exit(1);
  }
}

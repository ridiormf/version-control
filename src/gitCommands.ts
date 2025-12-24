import { execSync } from "child_process";
import { colors } from "./colors";

/**
 * Execute git commands to commit, tag, and push version
 * @param version - Version string to commit and tag
 */
export function executeGitCommands(version: string): void {
  console.log(`${colors.bold}Executando comandos git...${colors.reset}`);
  console.log("");

  try {
    // git add -A
    console.log(`${colors.cyan}→${colors.reset} git add -A`);
    execSync("git add -A", { stdio: "inherit" });
    console.log(`${colors.green}✓${colors.reset} Arquivos adicionados`);

    // git commit
    console.log(
      `${colors.cyan}→${colors.reset} git commit -m "chore: bump version to ${version}"`
    );
    execSync(`git commit -m "chore: bump version to ${version}"`, {
      stdio: "inherit",
    });
    console.log(`${colors.green}✓${colors.reset} Commit criado`);

    // git tag
    console.log(`${colors.cyan}→${colors.reset} git tag v${version}`);
    execSync(`git tag v${version}`, { stdio: "inherit" });
    console.log(`${colors.green}✓${colors.reset} Tag criada`);

    // git push
    console.log(`${colors.cyan}→${colors.reset} git push`);
    execSync("git push", { stdio: "inherit" });
    console.log(`${colors.green}✓${colors.reset} Push realizado`);

    // git push --tags
    console.log(`${colors.cyan}→${colors.reset} git push --tags`);
    execSync("git push --tags", { stdio: "inherit" });
    console.log(`${colors.green}✓${colors.reset} Tags enviadas`);

    console.log("");
    console.log(
      `${colors.green}${colors.bold}✓ Versão ${version} publicada com sucesso!${colors.reset}`
    );
    console.log("");
  } catch (error) {
    const err = error as Error;
    console.log("");
    console.log(
      `${colors.red}✗ Erro ao executar comandos git:${colors.reset}`,
      err.message
    );
    console.log("");
    console.log(`${colors.bold}Execute manualmente:${colors.reset}`);
    console.log(`  1. git add -A`);
    console.log(`  2. git commit -m "chore: bump version to ${version}"`);
    console.log(`  3. git tag v${version}`);
    console.log(`  4. git push && git push --tags`);
    console.log("");
    process.exit(1);
  }
}

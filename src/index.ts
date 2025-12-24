#!/usr/bin/env node

/**
 * Version Control System - Main CLI
 * @version 1.0.0
 *
 * Sistema inteligente de controle de versão que analisa commits do Git
 * e automatiza o versionamento semântico (SemVer).
 */

import { colors } from "./colors";
import { git } from "./git";
import { getCurrentVersion, bumpVersion } from "./version";
import { analyzeChanges } from "./analyzer";
import { updatePackageJson, updateIndexFile, updateChangelog } from "./updater";
import { createInterface, question, closeInterface } from "./readline";
import { executeGitCommands } from "./gitCommands";
import { VersionType } from "./types";

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log("");
  console.log(
    `${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(
    `${colors.bold}${colors.cyan}          Sistema de Controle de Versão${colors.reset}`
  );
  console.log(
    `${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`
  );
  console.log("");

  // Check if there's a commit
  const hasCommit = git("rev-parse HEAD 2>/dev/null");
  if (!hasCommit) {
    console.log(
      `${colors.yellow}⚠${colors.reset} Nenhum commit encontrado. Faça um commit primeiro.`
    );
    process.exit(0);
  }

  // Current version
  const currentVersion = getCurrentVersion();
  console.log(
    `${colors.bold}Versão atual:${colors.reset} ${colors.cyan}${currentVersion}${colors.reset}`
  );
  console.log("");

  // Analyze changes
  console.log(`${colors.bold}Analisando último commit...${colors.reset}`);
  const analysis = analyzeChanges();

  console.log("");
  console.log(`${colors.bold}Mensagem do commit:${colors.reset}`);
  console.log(`  "${analysis.commitMsg}"`);
  console.log("");
  console.log(
    `${colors.bold}Arquivos modificados:${colors.reset} ${analysis.filesChanged.length}`
  );
  analysis.filesChanged.slice(0, 5).forEach((file) => {
    console.log(`  - ${file}`);
  });
  if (analysis.filesChanged.length > 5) {
    console.log(`  ... e mais ${analysis.filesChanged.length - 5} arquivo(s)`);
  }
  console.log("");

  // Show analysis
  console.log(`${colors.bold}Análise da mudança:${colors.reset}`);
  analysis.reason.forEach((reason) => console.log(`  ${reason}`));
  console.log("");

  // Suggest version
  const suggestedVersion = bumpVersion(currentVersion, analysis.type);
  const typeColors: Record<VersionType, string> = {
    major: colors.red,
    minor: colors.yellow,
    patch: colors.green,
  };
  const typeEmojis: Record<VersionType, string> = {
    major: "🔴",
    minor: "🟡",
    patch: "🟢",
  };

  console.log(
    `${colors.bold}Tipo sugerido:${colors.reset} ${typeEmojis[analysis.type]} ${
      typeColors[analysis.type]
    }${analysis.type.toUpperCase()}${colors.reset}`
  );
  console.log(
    `${colors.bold}Nova versão:${colors.reset} ${colors.cyan}${currentVersion}${colors.reset} → ${colors.green}${colors.bold}${suggestedVersion}${colors.reset}`
  );
  console.log("");

  // Ask user with validation
  const rl = createInterface();

  let shouldUpdate = "";
  while (true) {
    shouldUpdate = await question(
      rl,
      `${colors.bold}Deseja atualizar a versão? (s/n):${colors.reset} `
    );

    const answer = shouldUpdate.toLowerCase();

    if (!shouldUpdate) {
      console.log(`${colors.red}Por favor, digite 's' ou 'n'${colors.reset}`);
      continue;
    }

    if (
      answer === "s" ||
      answer === "sim" ||
      answer === "n" ||
      answer === "não" ||
      answer === "nao"
    ) {
      break;
    }

    console.log(
      `${colors.red}Resposta inválida. Digite 's' para sim ou 'n' para não${colors.reset}`
    );
  }

  if (
    shouldUpdate.toLowerCase() !== "s" &&
    shouldUpdate.toLowerCase() !== "sim"
  ) {
    console.log("");
    console.log(`${colors.yellow}Versão não alterada.${colors.reset}`);
    await closeInterface(rl);
    process.exit(0);
  }

  // Allow choosing a different type
  console.log("");
  console.log(`${colors.bold}Confirme o tipo de versão:${colors.reset}`);
  console.log(
    `  ${colors.red}1${colors.reset} - MAJOR (${bumpVersion(
      currentVersion,
      "major"
    )}) - Breaking changes`
  );
  console.log(
    `  ${colors.yellow}2${colors.reset} - MINOR (${bumpVersion(
      currentVersion,
      "minor"
    )}) - Nova funcionalidade`
  );
  console.log(
    `  ${colors.green}3${colors.reset} - PATCH (${bumpVersion(
      currentVersion,
      "patch"
    )}) - Correção de bug`
  );
  console.log("");

  const defaultChoice =
    analysis.type === "major" ? "1" : analysis.type === "minor" ? "2" : "3";
  let typeChoice = "";

  while (true) {
    typeChoice = await question(
      rl,
      `${colors.bold}Escolha (1/2/3) [padrão: ${defaultChoice}]:${colors.reset} `
    );

    // If empty, use default
    if (!typeChoice) {
      typeChoice = defaultChoice;
      break;
    }

    // Validate if it's 1, 2 or 3
    if (typeChoice === "1" || typeChoice === "2" || typeChoice === "3") {
      break;
    }

    console.log(`${colors.red}Opção inválida. Digite 1, 2 ou 3${colors.reset}`);
  }

  let finalType: VersionType = analysis.type;
  if (typeChoice === "1") finalType = "major";
  else if (typeChoice === "2") finalType = "minor";
  else if (typeChoice === "3") finalType = "patch";

  const finalVersion = bumpVersion(currentVersion, finalType);

  // Update files
  console.log("");
  console.log(`${colors.bold}Atualizando arquivos...${colors.reset}`);
  console.log("");

  updatePackageJson(finalVersion);
  updateIndexFile(finalVersion);
  updateChangelog(finalVersion, finalType, analysis);

  console.log("");
  console.log(
    `${colors.green}${colors.bold}✓ Versão atualizada para ${finalVersion}!${colors.reset}`
  );
  console.log("");

  // Close readline interface
  await closeInterface(rl);

  // Execute git commands automatically
  executeGitCommands(finalVersion);

  // Force immediate exit
  process.exit(0);
}

// Export for programmatic use
export { main, analyzeChanges, bumpVersion, getCurrentVersion };

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error(`${colors.red}Erro:${colors.reset}`, error.message);
    process.exit(1);
  });
}

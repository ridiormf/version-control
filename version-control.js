#!/usr/bin/env node

/**
 * Sistema de Controle de Versão e Changelog
 *
 * Analisa mudanças do último commit e sugere tipo de versão (major/minor/patch)
 * Atualiza package.json, CHANGELOG.md e outros arquivos com versão
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

// Cores para output
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

/**
 * Executa comando git e retorna output
 */
function git(command) {
  try {
    return execSync(`git ${command}`, { encoding: "utf8" }).trim();
  } catch (error) {
    return "";
  }
}

/**
 * Lê versão atual do package.json
 */
function getCurrentVersion() {
  const packagePath = path.join(__dirname, "../../package.json");
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  return packageJson.version;
}

/**
 * Analisa mudanças do último commit
 */
function analyzeChanges() {
  const lastCommitMsg = git("log -1 --pretty=%B");
  const filesChanged = git("diff-tree --no-commit-id --name-only -r HEAD")
    .split("\n")
    .filter(Boolean);

  const analysis = {
    type: "patch", // default
    reason: [],
    filesChanged,
    commitMsg: lastCommitMsg,
  };

  // Palavras-chave que indicam MAJOR (breaking changes)
  const majorKeywords = [
    "breaking",
    "break",
    "incompatível",
    "incompatible",
    "remove",
    "remov",
    "delete",
    "delet",
    "refactor completo",
    "reescrita",
    "rewrite",
  ];

  // Palavras-chave que indicam MINOR (novas features)
  const minorKeywords = [
    "add",
    "adicion",
    "nova",
    "novo",
    "new",
    "feature",
    "implement",
    "criar",
    "create",
    "funcionalidade",
  ];

  // Palavras-chave que indicam PATCH (fixes)
  const patchKeywords = [
    "fix",
    "corrig",
    "bug",
    "erro",
    "error",
    "ajust",
    "ajeit",
    "pequen",
    "minor change",
  ];

  const msgLower = lastCommitMsg.toLowerCase();

  // Verifica MAJOR
  if (majorKeywords.some((kw) => msgLower.includes(kw))) {
    analysis.type = "major";
    analysis.reason.push(
      "🔴 Commit indica mudança BREAKING ou remoção de funcionalidade"
    );
  }

  // Verifica arquivos críticos modificados (config structure, main entry points)
  const criticalFiles = [
    "index.js",
    "package.json",
    "projects.config.js",
    "tasks.config.js",
  ];
  const hasCriticalChanges = filesChanged.some((file) =>
    criticalFiles.some((critical) => file.includes(critical))
  );

  if (hasCriticalChanges && analysis.type !== "major") {
    const configChanges = filesChanged.filter((f) => f.includes("config.js"));
    if (configChanges.length > 0) {
      analysis.type = "minor";
      analysis.reason.push("🟡 Arquivos de configuração modificados");
    }
  }

  // Verifica MINOR
  if (
    minorKeywords.some((kw) => msgLower.includes(kw)) &&
    analysis.type === "patch"
  ) {
    analysis.type = "minor";
    analysis.reason.push("🟡 Commit indica nova funcionalidade");
  }

  // Verifica novos arquivos
  const newFiles = git(
    "diff-tree --no-commit-id --diff-filter=A --name-only -r HEAD"
  )
    .split("\n")
    .filter(Boolean);
  if (newFiles.length > 0 && analysis.type === "patch") {
    analysis.type = "minor";
    analysis.reason.push(
      `🟡 ${newFiles.length} arquivo(s) novo(s) adicionado(s)`
    );
  }

  // Verifica PATCH
  if (
    patchKeywords.some((kw) => msgLower.includes(kw)) &&
    analysis.type === "patch"
  ) {
    analysis.reason.push("🟢 Commit indica correção de bug");
  }

  // Se ainda não tem razão específica
  if (analysis.reason.length === 0) {
    if (analysis.type === "patch") {
      analysis.reason.push("🟢 Pequena mudança/ajuste");
    }
  }

  return analysis;
}

/**
 * Incrementa versão baseado no tipo
 */
function bumpVersion(currentVersion, type) {
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

/**
 * Atualiza versão no package.json
 */
function updatePackageJson(newVersion) {
  const packagePath = path.join(__dirname, "../../package.json");
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + "\n");
  console.log(`${colors.green}✓${colors.reset} package.json atualizado`);
}

/**
 * Atualiza versão no index.js
 */
function updateIndexJs(newVersion) {
  const indexPath = path.join(__dirname, "index.js");
  if (!fs.existsSync(indexPath)) return;

  let content = fs.readFileSync(indexPath, "utf8");
  content = content.replace(/@version \d+\.\d+\.\d+/, `@version ${newVersion}`);
  fs.writeFileSync(indexPath, content);
  console.log(`${colors.green}✓${colors.reset} index.js atualizado`);
}

/**
 * Adiciona entrada no CHANGELOG.md
 */
function updateChangelog(version, type, analysis) {
  const changelogPath = path.join(__dirname, "../../CHANGELOG.md");
  if (!fs.existsSync(changelogPath)) {
    console.log(`${colors.yellow}⚠${colors.reset} CHANGELOG.md não encontrado`);
    return;
  }

  const content = fs.readFileSync(changelogPath, "utf8");
  const date = new Date().toISOString().split("T")[0];

  // Prepara entrada baseada no tipo
  let changeType = "Changed";
  if (type === "major") changeType = "Changed";
  if (type === "minor") changeType = "Added";
  if (type === "patch") changeType = "Fixed";

  const newEntry = `
## [${version}] - ${date}

### ${changeType}
- ${analysis.commitMsg}

`;

  // Insere após o header, antes da primeira versão
  const lines = content.split("\n");
  const insertIndex = lines.findIndex((line) => line.startsWith("## ["));

  if (insertIndex !== -1) {
    lines.splice(insertIndex, 0, newEntry);
    fs.writeFileSync(changelogPath, lines.join("\n"));
    console.log(`${colors.green}✓${colors.reset} CHANGELOG.md atualizado`);
  }
}

/**
 * Cria interface readline que funciona em git hooks
 */
function createInterface() {
  // Tenta usar /dev/tty se disponível (necessário para git hooks)
  let input = process.stdin;
  let output = process.stdout;
  let ttyFd = null;

  try {
    ttyFd = require("fs").openSync("/dev/tty", "r+");
    // autoClose: false para controlar manualmente o fechamento do FD
    input = require("fs").createReadStream(null, {
      fd: ttyFd,
      autoClose: false,
    });
    output = require("fs").createWriteStream(null, {
      fd: ttyFd,
      autoClose: false,
    });
  } catch (e) {
    // Se falhar, usa stdin/stdout padrão
  }

  const rl = readline.createInterface({
    input,
    output,
    terminal: true,
  });

  // Armazena FD e streams para fechar depois
  rl._ttyFd = ttyFd;
  rl._ttyInput = input !== process.stdin ? input : null;
  rl._ttyOutput = output !== process.stdout ? output : null;

  return rl;
}

/**
 * Faz pergunta ao usuário
 */
function question(rl, query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Função principal
 */
async function main() {
  console.log("");
  console.log(
    `${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(
    `${colors.bold}${colors.cyan}        Sistema de Controle de Versão - Capgemini${colors.reset}`
  );
  console.log(
    `${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`
  );
  console.log("");

  // Verifica se há commit
  const hasCommit = git("rev-parse HEAD 2>/dev/null");
  if (!hasCommit) {
    console.log(
      `${colors.yellow}⚠${colors.reset} Nenhum commit encontrado. Faça um commit primeiro.`
    );
    process.exit(0);
  }

  // Versão atual
  const currentVersion = getCurrentVersion();
  console.log(
    `${colors.bold}Versão atual:${colors.reset} ${colors.cyan}${currentVersion}${colors.reset}`
  );
  console.log("");

  // Analisa mudanças
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

  // Mostra análise
  console.log(`${colors.bold}Análise da mudança:${colors.reset}`);
  analysis.reason.forEach((reason) => console.log(`  ${reason}`));
  console.log("");

  // Sugere versão
  const suggestedVersion = bumpVersion(currentVersion, analysis.type);
  const typeColors = {
    major: colors.red,
    minor: colors.yellow,
    patch: colors.green,
  };
  const typeEmojis = {
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

  // Pergunta ao usuário com validação
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
    rl.close();
    process.exit(0);
  }

  // Permite escolher tipo diferente
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

    // Se vazio, usa o padrão
    if (!typeChoice) {
      typeChoice = defaultChoice;
      break;
    }

    // Valida se é 1, 2 ou 3
    if (typeChoice === "1" || typeChoice === "2" || typeChoice === "3") {
      break;
    }

    console.log(`${colors.red}Opção inválida. Digite 1, 2 ou 3${colors.reset}`);
  }

  let finalType = analysis.type;
  if (typeChoice === "1") finalType = "major";
  else if (typeChoice === "2") finalType = "minor";
  else if (typeChoice === "3") finalType = "patch";

  const finalVersion = bumpVersion(currentVersion, finalType);

  // Atualiza arquivos
  console.log("");
  console.log(`${colors.bold}Atualizando arquivos...${colors.reset}`);
  console.log("");

  updatePackageJson(finalVersion);
  updateIndexJs(finalVersion);
  updateChangelog(finalVersion, finalType, analysis);

  console.log("");
  console.log(
    `${colors.green}${colors.bold}✓ Versão atualizada para ${finalVersion}!${colors.reset}`
  );
  console.log("");

  // Fecha recursos TTY na ordem correta
  const ttyFd = rl._ttyFd;
  const ttyInput = rl._ttyInput;
  const ttyOutput = rl._ttyOutput;

  // 1. Fecha interface readline
  rl.removeAllListeners();
  rl.close();

  // 2. Aguarda readline processar fechamento
  await new Promise((resolve) => setTimeout(resolve, 50));

  // 3. Fecha streams (não fecham o FD por causa do autoClose: false)
  if (ttyInput) {
    try {
      ttyInput.destroy();
    } catch (e) {}
  }
  if (ttyOutput) {
    try {
      ttyOutput.destroy();
    } catch (e) {}
  }

  // 4. Fecha file descriptor manualmente
  if (ttyFd !== null) {
    try {
      require("fs").closeSync(ttyFd);
    } catch (e) {}
  }

  // Executa comandos git automaticamente
  console.log(`${colors.bold}Executando comandos git...${colors.reset}`);
  console.log("");

  try {
    // git add -A
    console.log(`${colors.cyan}→${colors.reset} git add -A`);
    execSync("git add -A", { stdio: "inherit" });
    console.log(`${colors.green}✓${colors.reset} Arquivos adicionados`);

    // git commit
    console.log(
      `${colors.cyan}→${colors.reset} git commit -m "chore: bump version to ${finalVersion}"`
    );
    execSync(`git commit -m "chore: bump version to ${finalVersion}"`, {
      stdio: "inherit",
    });
    console.log(`${colors.green}✓${colors.reset} Commit criado`);

    // git tag
    console.log(`${colors.cyan}→${colors.reset} git tag v${finalVersion}`);
    execSync(`git tag v${finalVersion}`, { stdio: "inherit" });
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
      `${colors.green}${colors.bold}✓ Versão ${finalVersion} publicada com sucesso!${colors.reset}`
    );
    console.log("");

    // Força saída IMEDIATA sem setTimeout
    process.exit(0);
  } catch (error) {
    console.log("");
    console.log(
      `${colors.red}✗ Erro ao executar comandos git:${colors.reset}`,
      error.message
    );
    console.log("");
    console.log(`${colors.bold}Execute manualmente:${colors.reset}`);
    console.log(`  1. git add -A`);
    console.log(`  2. git commit -m "chore: bump version to ${finalVersion}"`);
    console.log(`  3. git tag v${finalVersion}`);
    console.log(`  4. git push && git push --tags`);
    console.log("");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`${colors.red}Erro:${colors.reset}`, error.message);
  process.exit(1);
});

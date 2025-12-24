# Version Control

[![en](https://img.shields.io/badge/lang-en-blue.svg)](README.md)
[![pt](https://img.shields.io/badge/lang-pt-green.svg)](README.pt.md)
[![es](https://img.shields.io/badge/lang-es-yellow.svg)](README.es.md)
[![fr](https://img.shields.io/badge/lang-fr-purple.svg)](README.fr.md)

> Sistema inteligente de controle de versão que analisa commits do Git e automatiza o versionamento semântico (SemVer).

[![npm version](https://img.shields.io/npm/v/@ridio/version-control.svg)](https://www.npmjs.com/package/@ridio/version-control)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Índice

- [Sobre](#sobre)
- [Instalação](#instalação)
- [Uso](#uso)
- [Como Funciona](#como-funciona)
- [Exemplos](#exemplos)
- [API](#api)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## 🎯 Sobre

O **Version Control** automatiza o versionamento semântico do seu projeto, eliminando a necessidade de decidir manualmente entre MAJOR, MINOR ou PATCH.

**Por que foi criado?**

Versionamento manual é propenso a erros e inconsistente entre equipes. Esta ferramenta resolve:

- ❌ Esquecimento de atualizar `package.json`, `CHANGELOG.md` ou tags
- ❌ Dúvidas sobre qual versão usar (MAJOR/MINOR/PATCH)
- ❌ CHANGELOGs incompletos ou desorganizados
- ❌ Mensagens de commit inconsistentes

**Solução:**

- ✅ Analisa commits automaticamente e sugere a versão correta
- ✅ Atualiza todos os arquivos de uma vez
- ✅ Gera CHANGELOGs organizados e completos
- ✅ Cria tags e faz push automaticamente

### ✨ Funcionalidades

- 🔍 **Análise Inteligente**: Analisa mensagens de commit e arquivos modificados
- 🎯 **Sugestão Automática**: Sugere MAJOR, MINOR ou PATCH baseado nas mudanças
- 📝 **Atualização Automática**: Atualiza `package.json`, `CHANGELOG.md` e arquivos de código
- 🏷️ **Git Tags**: Cria tags automaticamente e faz push para o repositório
- 🤖 **Smart Commit**: Gera mensagens de commit seguindo Conventional Commits
- 📋 **CHANGELOG Inteligente**: Agrupa commits por tipo e remove duplicatas
- 🧪 **Modo de Teste**: Permite rollback automático
- 🌍 **Internacionalização**: Suporte para EN, PT, ES, FR

## 📦 Instalação

### Global (Recomendado)

```bash
yarn global add @ridiormf/version-control
# ou
npm install -g @ridiormf/version-control
```

### Como dependência de desenvolvimento

```bash
yarn add -D @ridiormf/version-control
# ou
npm install -D @ridiormf/version-control
```

### Uso com npx (sem instalação)

```bash
npx @ridiormf/version-control
# ou
yarn dlx @ridiormf/version-control
```

## 🚀 Uso

### CLI - Version Control

Após fazer suas alterações e commitar:

```bash
version-control
```

Ou com npx (sem instalar):

```bash
npx @ridiormf/version-control
```

### CLI - Smart Commit

Commit inteligente com mensagem automática:

```bash
git add .
smart-commit
```

**Exemplo:**

```bash
Staged files: 2
  ✨ src/newFeature.ts (+45/-0)
  📝 src/index.ts (+5/-2)

Generated commit message:
feat(src): add newFeature

Options: [1] Commit [2] Edit [3] Cancel
Choice: 1

✓ Commit created successfully!
```

### Adicionando ao package.json

Adicione um script no seu `package.json`:

```json
{
  "scripts": {
    "version": "version-control",
    "version:test": "version-control --test",
    "commit": "smart-commit"
  }
}
```

E execute:

```bash
# Commit inteligente
yarn commit

# Versionamento normal
yarn version

# Versionamento com teste (permite desfazer)
yarn version:test
```

### Uso Programático

Use a biblioteca em seus scripts personalizados:

```typescript
import {
  analyzeChanges,
  bumpVersion,
  getCurrentVersion,
  updatePackageJson,
  updateChangelog,
  executeGitCommands,
} from "@ridiormf/version-control";

// 1. Obter versão atual
const currentVersion = getCurrentVersion();
// Retorna: "1.2.3"

// 2. Analisar mudanças do último commit
const analysis = analyzeChanges();
// Retorna: { type: 'minor', reason: ['New feature added'], filesChanged: [...], commitMsg: '...' }

// 3. Calcular nova versão
const newVersion = bumpVersion(currentVersion, analysis.type);
// Retorna: "1.3.0"

// 4. Atualizar arquivos
updatePackageJson(newVersion);
updateChangelog(newVersion, analysis.type, analysis);

// 5. Commitar e criar tag
executeGitCommands(newVersion);
```

## 🔧 Como Funciona

O sistema analisa as mudanças do último commit do Git e sugere a versão apropriada baseado em:

### � Conventional Commits

A ferramenta suporta o formato [Conventional Commits](https://www.conventionalcommits.org/), que estrutura as mensagens de commit de forma padronizada:

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé(s) opcional(is)]
```

**Exemplos:**

- `feat(auth): add login functionality`
- `fix: resolve memory leak in cache`
- `feat!: remove support for Node 12` (breaking change)

### 📋 CHANGELOG Inteligente

Todos os commits desde a última versão são **automaticamente incluídos** no CHANGELOG, agrupados por tipo:

- **✨ Added** - Novas funcionalidades (`feat:`, `add`, `new`)
- **🐛 Fixed** - Correções de bugs (`fix:`, `bug`)
- **🔄 Changed** - Mudanças em funcionalidades (`refactor:`, `perf:`)
- **⚠️ Breaking Changes** - Mudanças incompatíveis (`BREAKING CHANGE`, `!`)
- **🗑️ Removed** - Remoções (`remove`, `delete`)
- **🔒 Security** - Correções de segurança (`security`)
- **⚠️ Deprecated** - Funcionalidades obsoletas (`deprecat`)

A ferramenta **remove automaticamente** duplicatas e commits similares, mantendo apenas as entradas mais relevantes.

### 🤖 Smart Commit - Mensagens Automáticas

O **Smart Commit** analisa os arquivos staged e gera mensagens de commit automaticamente em inglês, seguindo o padrão Conventional Commits:

#### Como funciona:

1. **Analisa os arquivos**: Detecta arquivos adicionados, modificados ou deletados
2. **Identifica o tipo**: feat, fix, docs, test, refactor, style, chore
3. **Detecta o escopo**: Identifica automaticamente (src, api, ui, etc.)
4. **Gera a descrição**: Baseado nos nomes dos arquivos e padrões de mudança

#### Tipos detectados automaticamente:

- **feat**: Novos arquivos ou funcionalidades
- **fix**: Mais deleções que adições (correções)
- **docs**: Apenas arquivos de documentação (.md, .txt)
- **test**: Apenas arquivos de teste
- **style**: Mudanças pequenas em CSS/SCSS
- **refactor**: Modificações em código existente
- **chore**: Configurações e arquivos auxiliares

#### Exemplo:

```bash
# Adicionar novo arquivo
git add src/authentication.ts
yarn commit
# Gera: feat(src): add authentication

# Corrigir bug
git add src/bugFix.ts
yarn commit
# Gera: fix(src): resolve issue in bugFix

# Atualizar documentação
git add README.md
yarn commit
# Gera: docs: update README
```

#### 🎉 Versão Inicial (1.0.0)

Quando a ferramenta detecta que está gerando a versão **1.0.0** (primeira release), ela adiciona uma mensagem especial no CHANGELOG:

```markdown
## [1.0.0] - 2025-12-24

### 🎉 Initial Release

Primeira versão pública do projeto.
```

Esta é uma regra automática aplicada a **qualquer projeto** que usar a ferramenta pela primeira vez.

### �🔴 MAJOR (X.0.0) - Breaking Changes

Detectado quando a mensagem de commit contém palavras-chave como:

- `breaking`, `break`
- `incompatível`, `incompatible`
- `remove`, `delete`
- `refactor completo`, `rewrite`

**Exemplo:**

```bash
git commit -m "breaking: remove deprecated API methods"
# Sugere: 1.5.3 → 2.0.0
```

### 🟡 MINOR (x.Y.0) - Novas Funcionalidades

Detectado quando:

- Mensagem contém: `add`, `new`, `feature`, `implement`, `create`
- Novos arquivos são adicionados ao projeto
- Arquivos de configuração são modificados

**Exemplo:**

```bash
git commit -m "feat: add user authentication module"
# Sugere: 1.5.3 → 1.6.0
```

### 🟢 PATCH (x.y.Z) - Correções

Detectado quando a mensagem contém:

- `fix`, `bug`, `error`
- `correção`, `ajuste`
- Pequenas mudanças sem novos arquivos

**Exemplo:**

```bash
git commit -m "fix: resolve memory leak in cache"
# Sugere: 1.5.3 → 1.5.4
```

### 📊 Semantic Versioning

```
Quebra código existente?
├─ SIM → 🔴 MAJOR (X.0.0)
└─ NÃO → Adiciona funcionalidade?
         ├─ SIM → 🟡 MINOR (x.Y.0)
         └─ NÃO → 🟢 PATCH (x.y.Z)
```

Veja mais em [semver.org](https://semver.org/)

## 📖 Exemplos

### Fluxo Típico

```bash
git commit -m "feat: add new export functionality"
version-control

# Versão atual: 1.2.3
# Tipo sugerido: MINOR
# Nova versão: 1.3.0
#
# Deseja atualizar? (s/n): s
#
# ✓ package.json atualizado
# ✓ CHANGELOG.md atualizado
# ✓ Tag v1.3.0 criada
# ✓ Versão 1.3.0 publicada!
```

## 📚 API

### Métodos Disponíveis

#### Análise e Versionamento

- `analyzeChanges()` - Analisa último commit e sugere tipo de versão
- `getCurrentVersion(projectRoot?)` - Retorna versão atual do package.json
- `bumpVersion(currentVersion, type)` - Calcula nova versão

#### Atualização de Arquivos

- `updatePackageJson(newVersion, projectRoot?)` - Atualiza package.json
- `updateIndexFile(newVersion, projectRoot?)` - Atualiza @version em arquivos de código
- `updateChangelog(version, type, analysis, projectRoot?)` - Atualiza CHANGELOG.md

#### Commit e Git

- `executeGitCommands(version)` - Cria commit, tag e faz push
- `getStagedChanges()` - Lista arquivos no stage
- `generateCommitMessage(changes)` - Gera mensagem de commit automática

#### Configuração

- `getConfiguredLanguage()` - Retorna idioma configurado
- `setLanguage(lang)` - Define idioma manualmente
- `clearConfig()` - Remove configuração

---

### Detalhamento

### `analyzeChanges(): ChangeAnalysis`

Analisa o último commit e retorna uma análise das mudanças.

**Retorno:**

```typescript
interface ChangeAnalysis {
  type: "major" | "minor" | "patch";
  reason: string[];
  filesChanged: string[];
  commitMsg: string;
}
```

### `getCurrentVersion(projectRoot?: string): string`

Retorna a versão atual do `package.json`.

**Parâmetros:**

- `projectRoot` (opcional): Caminho raiz do projeto (padrão: `process.cwd()`)

### `bumpVersion(currentVersion: string, type: VersionType): string`

Calcula a nova versão baseado no tipo de bump.

**Parâmetros:**

- `currentVersion`: Versão atual (ex: "1.2.3")
- `type`: Tipo de bump (`'major'`, `'minor'`, ou `'patch'`)

**Exemplo:**

```typescript
bumpVersion("1.2.3", "major"); // "2.0.0"
bumpVersion("1.2.3", "minor"); // "1.3.0"
bumpVersion("1.2.3", "patch"); // "1.2.4"
```

## � Internacionalização

A ferramenta detecta automaticamente o idioma do sistema e ajusta todas as mensagens de acordo.

### Idiomas Suportados

- 🇬🇧 **Inglês (EN)** - Default
- 🇧🇷 **Português (PT)** - pt_BR, pt_PT
- 🇪🇸 **Espanhol (ES)** - es_ES, es_MX, etc.
- 🇫🇷 **Francês (FR)** - fr_FR, fr_CA, etc.

### Configurar Idioma Manualmente

```bash
# Configurar para português
version-control config --lang pt

# Configurar para inglês
version-control config --lang en

# Configurar para espanhol
version-control config --lang es

# Configurar para francês
version-control config --lang fr

# Limpar configuração (volta a usar detecção automática)
version-control config --clear

# Ver configuração atual
version-control config
```

A configuração é salva globalmente em `~/.version-control-config.json` e será usada em todos os projetos.

### Como Funciona

1. **Configuração Manual**: Se você configurou um idioma com `version-control config --lang`, ele será usado
2. **Detecção Automática**: Se não houver configuração, detecta do sistema via `LANG`, `LANGUAGE`, `LC_ALL`
3. **Fallback**: Se o idioma não for suportado, usa inglês automaticamente

**Indicador de Idioma:**

Toda vez que você executar `version-control` ou `smart-commit`, verá uma linha informando:

```bash
ℹ Current language: PT (manually configured)
  To change language: version-control config --lang <code>
```

ou

```bash
ℹ Idioma atual: PT (detectado do sistema)
  Para mudar o idioma: version-control config --lang <code>
```

## 🎯 Palavras-chave

- **MAJOR**: `breaking`, `remove`, `delete`, `rewrite`
- **MINOR**: `add`, `new`, `feature`, `implement`
- **PATCH**: `fix`, `bug`, `error`

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

**Ridio Ricardo**

- GitHub: [@ridioricardo](https://github.com/ridioricardo)

---

Baseado nas especificações do [Semantic Versioning 2.0.0](https://semver.org/)

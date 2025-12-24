# Version Control

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

O **Version Control** é uma ferramenta CLI que automatiza o processo de versionamento semântico do seu projeto. Ele analisa as mensagens de commit do Git, identifica os tipos de mudanças (breaking changes, novas funcionalidades, correções de bugs) e sugere automaticamente a versão apropriada segundo as especificações do [Semantic Versioning](https://semver.org/).

### ✨ Funcionalidades

- 🔍 **Análise Inteligente de Commits**: Analisa mensagens de commit e arquivos modificados
- 🎯 **Sugestão Automática de Versão**: Sugere MAJOR, MINOR ou PATCH baseado nas mudanças
- 📝 **Atualização Automática**: Atualiza `package.json`, `CHANGELOG.md` e arquivos de código
- 🏷️ **Git Tags**: Cria tags automaticamente e faz push para o repositório
- 🎨 **Interface Colorida**: Output colorido e intuitivo no terminal
- 🔄 **Interativo**: Permite confirmar ou modificar a versão sugerida

## 📦 Instalação

### Global (Recomendado)

```bash
yarn global add @ridio/version-control
```

### Como dependência de desenvolvimento

```bash
yarn add -D @ridio/version-control
```

### Uso com npx (sem instalação)

```bash
yarn dlx @ridio/version-control
```

## 🚀 Uso

### CLI

Após fazer suas alterações e commitar:

```bash
version-control
```

Ou com yarn dlx:

```bash
yarn dlx @ridio/version-control
```

### Adicionando ao package.json

Adicione um script no seu `package.json`:

```json
{
  "scripts": {
    "version": "version-control"
  }
}
```

E execute:

```bash
yarn version
```

### Uso Programático

Você também pode usar a biblioteca programaticamente:

```typescript
import {
  analyzeChanges,
  bumpVersion,
  getCurrentVersion,
} from "@ridio/version-control";

// Obter versão atual
const currentVersion = getCurrentVersion();
console.log("Versão atual:", currentVersion);

// Analisar mudanças do último commit
const analysis = analyzeChanges();
console.log("Tipo sugerido:", analysis.type);
console.log("Razões:", analysis.reason);

// Calcular nova versão
const newVersion = bumpVersion(currentVersion, analysis.type);
console.log("Nova versão:", newVersion);
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

## 📖 Exemplos

### Fluxo Típico

```bash
# 1. Faça suas alterações
vim src/index.ts

# 2. Commit suas mudanças
git commit -m "feat: add new export functionality"

# 3. Execute o version control
version-control

# Output:
# ═══════════════════════════════════════════════════════════
#           Sistema de Controle de Versão
# ═══════════════════════════════════════════════════════════
#
# Versão atual: 1.2.3
#
# Analisando último commit...
#
# Mensagem do commit:
#   "feat: add new export functionality"
#
# Arquivos modificados: 2
#   - src/index.ts
#   - src/exporter.ts
#
# Análise da mudança:
#   🟡 Commit indica nova funcionalidade
#
# Tipo sugerido: 🟡 MINOR
# Nova versão: 1.2.3 → 1.3.0
#
# Deseja atualizar a versão? (s/n): s
#
# Confirme o tipo de versão:
#   1 - MAJOR (2.0.0) - Breaking changes
#   2 - MINOR (1.3.0) - Nova funcionalidade
#   3 - PATCH (1.2.4) - Correção de bug
#
# Escolha (1/2/3) [padrão: 2]:
#
# Atualizando arquivos...
# ✓ package.json atualizado
# ✓ CHANGELOG.md atualizado
#
# ✓ Versão atualizada para 1.3.0!
#
# Executando comandos git...
# → git add -A
# ✓ Arquivos adicionados
# → git commit -m "chore: bump version to 1.3.0"
# ✓ Commit criado
# → git tag v1.3.0
# ✓ Tag criada
# → git push
# ✓ Push realizado
# → git push --tags
# ✓ Tags enviadas
#
# ✓ Versão 1.3.0 publicada com sucesso!
```

### Personalizando a Escolha

Você pode escolher um tipo diferente do sugerido:

```bash
version-control

# O sistema sugere PATCH, mas você quer MINOR
# Escolha (1/2/3) [padrão: 3]: 2
```

## 📚 API

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

## 🎨 Palavras-chave Reconhecidas

### Breaking Changes (MAJOR)

- `breaking`, `break`
- `incompatível`, `incompatible`
- `remove`, `remov`, `delete`, `delet`
- `refactor completo`, `reescrita`, `rewrite`

### Novas Funcionalidades (MINOR)

- `add`, `adicion`
- `nova`, `novo`, `new`
- `feature`, `implement`
- `criar`, `create`, `funcionalidade`

### Correções (PATCH)

- `fix`, `corrig`
- `bug`, `erro`, `error`
- `ajust`, `ajeit`, `pequen`
- `minor change`

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

## 🙏 Agradecimentos

- Inspirado nas melhores práticas de versionamento semântico
- Construído com TypeScript para melhor experiência de desenvolvimento
- Baseado nas especificações do [Semantic Versioning 2.0.0](https://semver.org/)

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no GitHub!

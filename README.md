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
- 🤖 **Smart Commit**: Gera mensagens de commit automaticamente em inglês (Conventional Commits)
- 📋 **CHANGELOG Inteligente**: Agrupa commits por tipo e remove duplicatas
- 🧪 **Modo de Teste**: Teste mudanças com rollback automático
- 🌍 **Internacionalização**: Suporte automático para 4 idiomas (EN, PT, ES, FR)

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

Commit inteligente com mensagem automática em inglês:

```bash
# 1. Faça suas alterações
vim src/index.ts

# 2. Adicione os arquivos
git add .

# 3. Execute o smart commit
smart-commit
# ou
yarn commit

# 4. Pressione Enter para aceitar a mensagem gerada
```

**Exemplo de saída:**

```bash
═══════════════════════════════════════════════════════════
              Smart Commit - Auto Message
═══════════════════════════════════════════════════════════

Staged files: 2
  ✨ src/newFeature.ts (+45/-0)
  📝 src/index.ts (+5/-2)

Analyzing changes...

Generated commit message:
feat(src): add newFeature

Details:
  Type: feat
  Scope: src
  Description: add newFeature

Options: [1] Commit [2] Edit [3] Cancel (default: 1)
Choice:

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

### 📊 Entendendo o Impacto de Cada Tipo de Versão

Seguindo o [Semantic Versioning (SemVer)](https://semver.org/), cada tipo de versão tem um significado específico e impacta diferentes aspectos do seu projeto:

#### 🔴 MAJOR (X.0.0) - Quando usar?

**Use MAJOR quando você fizer mudanças incompatíveis na API/interface pública.**

**Impactos:**

- ⚠️ **Quebra compatibilidade**: Usuários precisarão atualizar o código deles
- 🔧 **Requer migração**: Pode necessitar guia de migração
- 📢 **Comunicação crítica**: Deve ser amplamente comunicado
- 🚨 **Risco alto**: Pode causar falhas em projetos dependentes

**Exemplos de mudanças MAJOR:**

```javascript
// ❌ Remover funções/métodos públicos
- export function oldMethod() { }  // Removido

// ❌ Mudar assinatura de funções
- function process(data: string): void
+ function process(data: object, options: Options): Promise<void>

// ❌ Alterar comportamento esperado
- return { success: true }  // Antes retornava objeto
+ return true                // Agora retorna boolean

// ❌ Remover ou renomear propriedades públicas
- interface User { username: string }
+ interface User { name: string }  // Quebra código existente
```

**Quando evitar:** Se possível, adicione a nova funcionalidade sem remover a antiga (deprecated) e só remova na próxima MAJOR.

#### 🟡 MINOR (x.Y.0) - Quando usar?

**Use MINOR quando você adicionar funcionalidades novas, mantendo compatibilidade com versões anteriores.**

**Impactos:**

- ✅ **Mantém compatibilidade**: Código existente continua funcionando
- 🎁 **Adiciona valor**: Novas features disponíveis
- 📈 **Evolução natural**: Crescimento do projeto
- 🔄 **Upgrade seguro**: Usuários podem atualizar sem medo

**Exemplos de mudanças MINOR:**

```javascript
// ✅ Adicionar novas funções/métodos
+ export function newFeature() { }  // Nova função

// ✅ Adicionar novos parâmetros opcionais
- function process(data: string): void
+ function process(data: string, options?: Options): void

// ✅ Adicionar novas propriedades opcionais
interface User {
  username: string;
+ email?: string;  // Novo campo opcional
}

// ✅ Adicionar novas classes/módulos
+ export class NewService { }  // Nova funcionalidade
```

**Quando usar:** Sempre que adicionar algo novo que não quebra código existente.

#### 🟢 PATCH (x.y.Z) - Quando usar?

**Use PATCH quando você corrigir bugs, sem adicionar funcionalidades ou quebrar compatibilidade.**

**Impactos:**

- 🐛 **Corrige problemas**: Bugs são resolvidos
- 🔒 **Totalmente seguro**: Zero risco de quebrar código
- ⚡ **Deve ser automático**: Usuários devem poder atualizar sem pensar
- 🎯 **Foco em estabilidade**: Melhora qualidade sem mudanças

**Exemplos de mudanças PATCH:**

```javascript
// ✅ Corrigir bugs
- if (value > 10)  // Bug: deveria ser >=
+ if (value >= 10)

// ✅ Corrigir tipos/documentação
- * @param value - Must be string  // Documentação errada
+ * @param value - Must be number

// ✅ Melhorar performance sem mudar comportamento
- return items.map(x => x).filter(x => x > 0)  // Ineficiente
+ return items.filter(x => x > 0)              // Otimizado

// ✅ Corrigir edge cases
- if (array.length) return array[0]  // Falha se length = 0
+ if (array.length > 0) return array[0]
```

**Quando usar:** Sempre que consertar algo que não estava funcionando corretamente.

#### 🎯 Decisão Rápida: Qual versão usar?

```
Quebra código existente?
├─ SIM → 🔴 MAJOR (X.0.0)
└─ NÃO → Adiciona nova funcionalidade?
         ├─ SIM → 🟡 MINOR (x.Y.0)
         └─ NÃO → 🟢 PATCH (x.y.Z)
```

#### 💡 Dicas Práticas

1. **Na dúvida entre MINOR e PATCH:**

   - Se adiciona qualquer coisa nova (função, parâmetro, propriedade) → MINOR
   - Se apenas corrige comportamento → PATCH

2. **Evite MAJOR sempre que possível:**

   - Use `@deprecated` para marcar código antigo
   - Mantenha compatibilidade por 1-2 versões MINOR antes de remover

3. **Pre-releases (0.x.x):**

   - Versões 0.x.x podem fazer breaking changes em MINOR
   - Use antes do 1.0.0 para desenvolvimento inicial

4. **Versão 1.0.0:**
   - Representa a primeira versão estável
   - A partir dela, siga SemVer rigorosamente

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

### Detecção Automática do Sistema

A detecção é automática baseada nas variáveis de ambiente do sistema:

- `LANG`
- `LANGUAGE`
- `LC_ALL`

**Exemplo:**

```bash
# Sistema em português
LANG=pt_BR.UTF-8 version-control
# Output: "Versão atual: 1.0.0"
# Output: "Deseja atualizar a versão? (s/n):"

# Sistema em inglês
LANG=en_US.UTF-8 version-control
# Output: "Current version: 1.0.0"
# Output: "Update version? (y/n):"

# Sistema em espanhol
LANG=es_ES.UTF-8 version-control
# Output: "Versión actual: 1.0.0"
# Output: "¿Actualizar versión? (s/n):"

# Sistema em francês
LANG=fr_FR.UTF-8 version-control
# Output: "Version actuelle: 1.0.0"
# Output: "Mettre à jour la version? (o/n):"
```

### Idiomas Não Suportados

Se o idioma do sistema não for um dos 4 suportados, a ferramenta **automaticamente usa inglês** como fallback.

```bash
# Sistema em alemão (não suportado)
LANG=de_DE.UTF-8 version-control
# Output em inglês: "Current version: 1.0.0"
```

## �🎨 Palavras-chave Reconhecidas

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

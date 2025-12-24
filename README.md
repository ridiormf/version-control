# Version Control

[![en](https://img.shields.io/badge/lang-en-blue.svg)](README.md)
[![pt](https://img.shields.io/badge/lang-pt-green.svg)](README.pt.md)
[![es](https://img.shields.io/badge/lang-es-yellow.svg)](README.es.md)
[![fr](https://img.shields.io/badge/lang-fr-purple.svg)](README.fr.md)

> Intelligent version control system that analyzes Git commits and automates semantic versioning (SemVer).

[![npm version](https://img.shields.io/npm/v/@ridio/version-control.svg)](https://www.npmjs.com/package/@ridio/version-control)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Table of Contents

- [About](#about)
- [Installation](#installation)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [Examples](#examples)
- [API](#api)
- [Contributing](#contributing)
- [License](#license)

## 🎯 About

**Version Control** automates semantic versioning of your project, eliminating the need to manually decide between MAJOR, MINOR, or PATCH.

**Why was it created?**

Manual versioning is error-prone and inconsistent across teams. This tool solves:

- ❌ Forgetting to update \`package.json\`, \`CHANGELOG.md\`, or tags
- ❌ Confusion about which version to use (MAJOR/MINOR/PATCH)
- ❌ Incomplete or disorganized CHANGELOGs
- ❌ Inconsistent commit messages

**Solution:**

- ✅ Automatically analyzes commits and suggests the correct version
- ✅ Updates all files at once
- ✅ Generates organized and complete CHANGELOGs
- ✅ Creates tags and pushes automatically

### ✨ Features

- 🔍 **Intelligent Analysis**: Analyzes commit messages and modified files
- 🎯 **Automatic Suggestion**: Suggests MAJOR, MINOR, or PATCH based on changes
- 📝 **Automatic Update**: Updates \`package.json\`, \`CHANGELOG.md\`, and code files
- 🏷️ **Git Tags**: Creates tags automatically and pushes to repository
- 🤖 **Smart Commit**: Generates commit messages following Conventional Commits
- 📋 **Intelligent CHANGELOG**: Groups commits by type and removes duplicates
- 🧪 **Test Mode**: Allows automatic rollback
- 🌍 **Internationalization**: Support for EN, PT, ES, FR

## 📦 Installation

### Global (Recommended)

\`\`\`bash
yarn global add @ridiormf/version-control
# or
npm install -g @ridiormf/version-control
\`\`\`

### As a development dependency

\`\`\`bash
yarn add -D @ridiormf/version-control
# or
npm install -D @ridiormf/version-control
\`\`\`

### Using npx (no installation)

\`\`\`bash
npx @ridiormf/version-control
# or
yarn dlx @ridiormf/version-control
\`\`\`

## 🚀 Usage

### CLI - Version Control

After making your changes and committing:

\`\`\`bash
version-control
\`\`\`

Or with npx (without installing):

\`\`\`bash
npx @ridiormf/version-control
\`\`\`

### CLI - Smart Commit

Intelligent commit with automatic message:

\`\`\`bash
git add .
smart-commit
\`\`\`

**Example:**

\`\`\`bash
Staged files: 2
  ✨ src/newFeature.ts (+45/-0)
  📝 src/index.ts (+5/-2)

Generated commit message:
feat(src): add newFeature

Options: [1] Commit [2] Edit [3] Cancel
Choice: 1

✓ Commit created successfully!
\`\`\`

### Adding to package.json

Add a script to your \`package.json\`:

\`\`\`json
{
  "scripts": {
    "version": "version-control",
    "version:test": "version-control --test",
    "commit": "smart-commit"
  }
}
\`\`\`

And run:

\`\`\`bash
# Smart commit
yarn commit

# Normal versioning
yarn version

# Test versioning (allows rollback)
yarn version:test
\`\`\`

### Programmatic Usage

Use the library in your custom scripts:

\`\`\`typescript
import {
  analyzeChanges,
  bumpVersion,
  getCurrentVersion,
  updatePackageJson,
  updateChangelog,
  executeGitCommands,
} from "@ridiormf/version-control";

// 1. Get current version
const currentVersion = getCurrentVersion();
// Returns: "1.2.3"

// 2. Analyze changes from last commit
const analysis = analyzeChanges();
// Returns: { type: 'minor', reason: ['New feature added'], filesChanged: [...], commitMsg: '...' }

// 3. Calculate new version
const newVersion = bumpVersion(currentVersion, analysis.type);
// Returns: "1.3.0"

// 4. Update files
updatePackageJson(newVersion);
updateChangelog(newVersion, analysis.type, analysis);

// 5. Commit and create tag
executeGitCommands(newVersion);
\`\`\`

## 🔧 How It Works

The system analyzes changes from the last Git commit and suggests the appropriate version based on Conventional Commits format and file changes.

### 🔴 MAJOR (X.0.0) - Breaking Changes

Detected when the commit message contains keywords like:

- \`breaking\`, \`break\`, \`incompatible\`, \`remove\`, \`delete\`, \`rewrite\`

**Example:**

\`\`\`bash
git commit -m "breaking: remove deprecated API methods"
# Suggests: 1.5.3 → 2.0.0
\`\`\`

### 🟡 MINOR (x.Y.0) - New Features

Detected when:

- Message contains: \`add\`, \`new\`, \`feature\`, \`implement\`, \`create\`
- New files are added to the project
- Configuration files are modified

**Example:**

\`\`\`bash
git commit -m "feat: add user authentication module"
# Suggests: 1.5.3 → 1.6.0
\`\`\`

### 🟢 PATCH (x.y.Z) - Fixes

Detected when the message contains:

- \`fix\`, \`bug\`, \`error\`
- Small changes without new files

**Example:**

\`\`\`bash
git commit -m "fix: resolve memory leak in cache"
# Suggests: 1.5.3 → 1.5.4
\`\`\`

### 📊 Semantic Versioning

\`\`\`
Breaks existing code?
├─ YES → 🔴 MAJOR (X.0.0)
└─ NO → Adds functionality?
         ├─ YES → 🟡 MINOR (x.Y.0)
         └─ NO → 🟢 PATCH (x.y.Z)
\`\`\`

See more at [semver.org](https://semver.org/)

## 📖 Examples

### Typical Flow

\`\`\`bash
git commit -m "feat: add new export functionality"
version-control

# Current version: 1.2.3
# Suggested type: MINOR
# New version: 1.3.0
#
# Update version? (y/n): y
#
# ✓ package.json updated
# ✓ CHANGELOG.md updated
# ✓ Tag v1.3.0 created
# ✓ Version 1.3.0 published!
\`\`\`

## 📚 API

### Available Methods

#### Analysis and Versioning

- \`analyzeChanges()\` - Analyzes last commit and suggests version type
- \`getCurrentVersion(projectRoot?)\` - Returns current version from package.json
- \`bumpVersion(currentVersion, type)\` - Calculates new version

#### File Updates

- \`updatePackageJson(newVersion, projectRoot?)\` - Updates package.json
- \`updateIndexFile(newVersion, projectRoot?)\` - Updates @version in code files
- \`updateChangelog(version, type, analysis, projectRoot?)\` - Updates CHANGELOG.md

#### Commit and Git

- \`executeGitCommands(version)\` - Creates commit, tag, and pushes
- \`getStagedChanges()\` - Lists staged files
- \`generateCommitMessage(changes)\` - Generates automatic commit message

#### Configuration

- \`getConfiguredLanguage()\` - Returns configured language
- \`setLanguage(lang)\` - Sets language manually
- \`clearConfig()\` - Removes configuration

---

### Details

#### \`analyzeChanges(): ChangeAnalysis\`

Analyzes the last commit and returns an analysis of the changes.

**Returns:**

\`\`\`typescript
interface ChangeAnalysis {
  type: "major" | "minor" | "patch";
  reason: string[];
  filesChanged: string[];
  commitMsg: string;
}
\`\`\`

#### \`getCurrentVersion(projectRoot?: string): string\`

Returns the current version from \`package.json\`.

**Parameters:**

- \`projectRoot\` (optional): Project root path (default: \`process.cwd()\`)

#### \`bumpVersion(currentVersion: string, type: VersionType): string\`

Calculates the new version based on the bump type.

**Parameters:**

- \`currentVersion\`: Current version (e.g., "1.2.3")
- \`type\`: Bump type (\`'major'\`, \`'minor'\`, or \`'patch'\`)

**Example:**

\`\`\`typescript
bumpVersion("1.2.3", "major"); // "2.0.0"
bumpVersion("1.2.3", "minor"); // "1.3.0"
bumpVersion("1.2.3", "patch"); // "1.2.4"
\`\`\`

## 🌍 Internationalization

The tool automatically detects the system language and adjusts all messages accordingly.

### Supported Languages

- 🇬🇧 **English (EN)** - Default
- 🇧🇷 **Portuguese (PT)** - pt_BR, pt_PT
- 🇪🇸 **Spanish (ES)** - es_ES, es_MX, etc.
- 🇫🇷 **French (FR)** - fr_FR, fr_CA, etc.

### Manual Language Configuration

\`\`\`bash
# Configure to Portuguese
version-control config --lang pt

# Configure to English
version-control config --lang en

# Configure to Spanish
version-control config --lang es

# Configure to French
version-control config --lang fr

# Clear configuration (returns to automatic detection)
version-control config --clear

# View current configuration
version-control config
\`\`\`

The configuration is saved globally in \`~/.version-control-config.json\` and will be used in all projects.

## 🎯 Keywords

- **MAJOR**: \`breaking\`, \`remove\`, \`delete\`, \`rewrite\`
- **MINOR**: \`add\`, \`new\`, \`feature\`, \`implement\`
- **PATCH**: \`fix\`, \`bug\`, \`error\`

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the project
2. Create a branch for your feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'feat: add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📄 License

This project is under the MIT license. See the [LICENSE](LICENSE) file for more details.

## 👤 Author

**Ridio Ricardo**

- GitHub: [@ridioricardo](https://github.com/ridioricardo)

---

Based on [Semantic Versioning 2.0.0](https://semver.org/) specifications

# 🆕 New Features Guide

## CI/CD Mode

Run version-control in non-interactive mode, perfect for CI/CD pipelines:

```bash
# Automatically apply suggested version without prompts
version-control --ci

# Alternative syntax
version-control --yes
```

**GitHub Actions Example:**

```yaml
- name: Bump version
  run: npx @ridiormf/version-control --ci
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Dry-Run Mode

Preview changes before applying them:

```bash
version-control --dry-run
```

**Output:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 package.json
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- "version": "1.1.4"
+ "version": "1.2.0"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 CHANGELOG.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
+ ## [1.2.0] - 2025-12-26
+ ### ✨ Added
+ - new feature X

╔════════════════════════════════════════════════╗
║  DRY-RUN SUMMARY                               ║
╚════════════════════════════════════════════════╝

  Version: 1.1.4 → 1.2.0
  Files changed: 5
  Additions: +10
  Deletions: -2
```

---

## Pre-release Versions

Create alpha, beta, or rc versions:

```bash
# Create alpha version: 1.2.0-alpha.1
version-control --prerelease=alpha

# Create beta version: 1.2.0-beta.1
version-control --prerelease=beta

# Create release candidate: 1.2.0-rc.1
version-control --prerelease=rc

# Graduate pre-release to stable
version-control --graduate
```

**Pre-release workflow:**

```bash
# Start with 1.1.4
version-control --prerelease=alpha  # → 1.2.0-alpha.1
version-control --prerelease=alpha  # → 1.2.0-alpha.2
version-control --prerelease=beta   # → 1.2.0-beta.1
version-control --prerelease=rc     # → 1.2.0-rc.1
version-control --graduate          # → 1.2.0
```

---

## Configuration File

Customize behavior with `.versionrc.js`:

```javascript
module.exports = {
  // Commit types in CHANGELOG
  types: [
    { type: "feat", section: "✨ Added" },
    { type: "fix", section: "🐛 Fixed" },
    { type: "chore", section: "🔨 Chore", hidden: true },
  ],

  // Skip operations
  skip: {
    changelog: false,
    tag: false,
    commit: false,
    push: false,
  },

  // Files to update
  bumpFiles: ["package.json", "manifest.json"],

  // Release commit format
  releaseCommitMessageFormat: "chore(release): {{currentTag}}",

  // Tag prefix
  tagPrefix: "v",

  // GitHub releases
  createGithubRelease: true,
  githubToken: process.env.GITHUB_TOKEN,
};
```

**Copy template:**

```bash
cp node_modules/@ridiormf/version-control/templates/.versionrc.js .
```

---

## GitHub Releases

Automatically create GitHub releases:

```bash
version-control --release
```

**Requirements:**

1. Set `createGithubRelease: true` in `.versionrc.js`
2. Provide GitHub token via `GITHUB_TOKEN` environment variable
3. Have `repository.url` in package.json pointing to GitHub

**Example .versionrc.js:**

```javascript
module.exports = {
  createGithubRelease: true,
  githubToken: process.env.GITHUB_TOKEN,
};
```

**CI/CD:**

```yaml
- name: Bump version and create release
  run: npx @ridiormf/version-control --ci --release
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Commitlint Integration

Enforce commit message conventions:

**Install:**

```bash
yarn add -D @commitlint/cli @commitlint/config-conventional
cp node_modules/@ridiormf/version-control/templates/commitlint.config.js .
```

**Setup husky hook:**

```bash
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
chmod +x .husky/commit-msg
```

**Valid commit formats:**

```
feat: add new feature
fix: resolve bug in parser
docs: update README
style: format code
refactor: restructure module
perf: improve performance
test: add unit tests
build: update dependencies
ci: configure GitHub Actions
chore: update tooling
```

---

## GitHub Actions Template

Complete CI/CD workflow:

**Copy template:**

```bash
mkdir -p .github/workflows
cp node_modules/@ridiormf/version-control/templates/github-actions.yml .github/workflows/release.yml
```

**What it does:**

1. ✅ Runs tests
2. 🏗️ Builds project
3. 📦 Bumps version automatically
4. 📝 Updates CHANGELOG
5. 🏷️ Creates git tags
6. 📤 Publishes to npm
7. 🚀 Creates GitHub release
8. ⬆️ Pushes changes back

**Required secrets:**

- `NPM_TOKEN` - npm authentication token
- `GITHUB_TOKEN` - automatically provided by GitHub Actions

---

## All Flags

```bash
version-control [options]

Options:
  --ci, --yes           CI/CD mode (non-interactive)
  --dry-run            Preview changes without applying
  --test               Update files but skip git operations
  --prerelease=<id>    Create pre-release (alpha|beta|rc)
  --graduate           Graduate from pre-release to stable
  --release            Create GitHub release
  --skip-verify        Skip verification prompts

Config:
  version-control config --lang <code>  Set language
  version-control config --clear        Clear language config
```

---

## Migration Guide

### From interactive to CI/CD:

**Before:**

```bash
version-control  # Interactive prompts
```

**After:**

```bash
version-control --ci  # Automatic
```

### From standard-version:

**Before:**

```json
{
  "scripts": {
    "release": "standard-version"
  }
}
```

**After:**

```json
{
  "scripts": {
    "release": "version-control --ci"
  }
}
```

### From semantic-release:

**Before (.releaserc):**

```json
{
  "branches": ["main"],
  "plugins": ["@semantic-release/commit-analyzer", ...]
}
```

**After (.versionrc.js):**

```javascript
module.exports = {
  types: [...],
  createGithubRelease: true,
};
```

---

## Comparison with Similar Tools

| Feature         | version-control | semantic-release | standard-version |
| --------------- | --------------- | ---------------- | ---------------- |
| Interactive UI  | ✅              | ❌               | ⚠️ Limited       |
| CI/CD Mode      | ✅              | ✅               | ✅               |
| Config File     | ✅              | ✅               | ✅               |
| GitHub Releases | ✅              | ✅               | ❌               |
| Pre-releases    | ✅              | ✅               | ✅               |
| Smart Commit    | ✅ **Unique**   | ❌               | ❌               |
| Multi-language  | ✅ **Unique**   | ❌               | ❌               |
| Hybrid Analysis | ✅ **Unique**   | ❌               | ❌               |
| Dry-run         | ✅              | ❌               | ⚠️ Limited       |

---

## Examples

### Basic CI/CD Pipeline

```yaml
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: yarn install
      - run: yarn test
      - run: npx @ridiormf/version-control --ci
      - run: npm publish
```

### Pre-release Pipeline

```yaml
name: Pre-release
on:
  push:
    branches: [develop]

jobs:
  pre-release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: yarn install
      - run: npx @ridiormf/version-control --ci --prerelease=beta
      - run: npm publish --tag beta
```

### Local Development

```bash
# Make changes
git add .
yarn commit  # Uses smart-commit

# Preview version bump
version-control --dry-run

# Apply changes
version-control

# Or directly in CI mode
version-control --ci
```

---

## Troubleshooting

### "No GitHub repository found"

**Solution:** Add `repository.url` to package.json:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/user/repo.git"
  }
}
```

### "No GitHub token configured"

**Solution:** Set environment variable or config:

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

Or in `.versionrc.js`:

```javascript
githubToken: process.env.GITHUB_TOKEN;
```

### Commitlint not working

**Solution:** Ensure hook is executable:

```bash
chmod +x .husky/commit-msg
```

### CI/CD mode not working

**Solution:** Check git is configured:

```bash
git config user.name "Bot"
git config user.email "bot@example.com"
```

---

## Support

- 📖 [Full Documentation](https://github.com/ridiormf/version-control)
- 🐛 [Report Issues](https://github.com/ridiormf/version-control/issues)
- 💬 [Discussions](https://github.com/ridiormf/version-control/discussions)
- 📦 [npm Package](https://www.npmjs.com/package/@ridiormf/version-control)

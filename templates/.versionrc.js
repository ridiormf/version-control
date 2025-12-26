/**
 * Version Control Configuration
 *
 * This file customizes the behavior of @ridiormf/version-control
 *
 * @see https://github.com/ridiormf/version-control
 */

module.exports = {
  /**
   * Commit types configuration
   * Define how commit types are displayed in the CHANGELOG
   */
  types: [
    { type: "feat", section: "✨ Added" },
    { type: "fix", section: "🐛 Fixed" },
    { type: "perf", section: "⚡ Performance" },
    { type: "refactor", section: "♻️ Refactor" },
    { type: "docs", section: "📝 Documentation" },
    { type: "style", section: "💄 Style" },
    { type: "test", section: "✅ Tests" },
    { type: "build", section: "🔧 Build" },
    { type: "ci", section: "👷 CI" },
    { type: "chore", section: "🔨 Chore", hidden: true },
  ],

  /**
   * Skip certain operations
   * Set to true to skip specific steps
   */
  skip: {
    changelog: false, // Skip CHANGELOG.md update
    tag: false, // Skip git tag creation
    commit: false, // Skip git commit
    push: false, // Skip git push
  },

  /**
   * Files to bump version in
   * List of files where version should be updated
   */
  bumpFiles: [
    "package.json",
    // 'manifest.json',
    // 'package-lock.json',
  ],

  /**
   * Package files to read version from
   */
  packageFiles: ["package.json"],

  /**
   * Release commit message format
   * Available placeholders: {{currentTag}}, {{version}}
   */
  releaseCommitMessageFormat: "chore(release): {{currentTag}}",

  /**
   * Tag prefix
   * Default: 'v' (creates tags like v1.0.0)
   */
  tagPrefix: "v",

  /**
   * GitHub Release configuration
   * Set to true to create GitHub releases automatically
   */
  createGithubRelease: false,

  /**
   * GitHub token for creating releases
   * Use environment variable: process.env.GITHUB_TOKEN
   */
  githubToken: process.env.GITHUB_TOKEN,
};

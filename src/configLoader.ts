import * as fs from "fs";
import * as path from "path";

/**
 * Configuration file options
 */
export interface VersionControlConfig {
  /** Commit types configuration */
  types?: Array<{
    type: string;
    section: string;
    hidden?: boolean;
  }>;
  /** Skip certain operations */
  skip?: {
    changelog?: boolean;
    tag?: boolean;
    commit?: boolean;
    push?: boolean;
  };
  /** Files to bump version in */
  bumpFiles?: string[];
  /** Package files to read version from */
  packageFiles?: string[];
  /** Release commit message format */
  releaseCommitMessageFormat?: string;
  /** Tag prefix */
  tagPrefix?: string;
  /** Pre-release identifier */
  prerelease?: string;
  /** GitHub token for releases */
  githubToken?: string;
  /** Create GitHub release */
  createGithubRelease?: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: VersionControlConfig = {
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
  skip: {
    changelog: false,
    tag: false,
    commit: false,
    push: false,
  },
  bumpFiles: ["package.json"],
  packageFiles: ["package.json"],
  releaseCommitMessageFormat: "chore(release): {{currentTag}}",
  tagPrefix: "v",
  createGithubRelease: false,
};

/**
 * Load configuration from file or return defaults
 */
export function loadConfig(cwd: string = process.cwd()): VersionControlConfig {
  const configFiles = [
    ".versionrc.js",
    ".versionrc.json",
    "version-control.config.js",
  ];

  for (const configFile of configFiles) {
    const configPath = path.join(cwd, configFile);
    if (fs.existsSync(configPath)) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const userConfig = require(configPath);
        return {
          ...DEFAULT_CONFIG,
          ...userConfig,
          types: userConfig.types || DEFAULT_CONFIG.types,
          skip: { ...DEFAULT_CONFIG.skip, ...userConfig.skip },
        };
      } catch (error) {
        console.warn(`Warning: Failed to load config from ${configFile}`);
      }
    }
  }

  return DEFAULT_CONFIG;
}

/**
 * Get commit type section from config
 */
export function getTypeSection(
  type: string,
  config: VersionControlConfig
): string {
  const typeConfig = config.types?.find((t) => t.type === type);
  return typeConfig?.section || "🔄 Changed";
}

/**
 * Check if commit type should be hidden
 */
export function isTypeHidden(
  type: string,
  config: VersionControlConfig
): boolean {
  const typeConfig = config.types?.find((t) => t.type === type);
  return typeConfig?.hidden || false;
}

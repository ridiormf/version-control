import * as fs from "fs";
import * as path from "path";
import * as os from "os";

/**
 * Configuration interface
 */
export interface Config {
  language?: "en" | "pt" | "es" | "fr";
}

/**
 * Get the configuration file path
 * @returns Path to config file in user's home directory
 */
function getConfigPath(): string {
  return path.join(os.homedir(), ".version-control-config.json");
}

/**
 * Read configuration from file
 * @returns Configuration object or empty object if file doesn't exist
 */
export function readConfig(): Config {
  const configPath = getConfigPath();

  try {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf8");
      return JSON.parse(content);
    }
  } catch (error) {
    // If there's any error reading config, return empty config
    return {};
  }

  return {};
}

/**
 * Write configuration to file
 * @param config - Configuration object to save
 */
export function writeConfig(config: Config): void {
  const configPath = getConfigPath();

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
  } catch (error) {
    throw new Error(`Failed to write config file: ${(error as Error).message}`);
  }
}

/**
 * Get configured language
 * @returns Configured language or undefined if not set
 */
export function getConfiguredLanguage(): "en" | "pt" | "es" | "fr" | undefined {
  const config = readConfig();
  return config.language;
}

/**
 * Set language configuration
 * @param language - Language code to set
 */
export function setLanguage(language: "en" | "pt" | "es" | "fr"): void {
  const config = readConfig();
  config.language = language;
  writeConfig(config);
}

/**
 * Clear language configuration (use system default)
 */
export function clearLanguage(): void {
  const config = readConfig();
  delete config.language;
  writeConfig(config);
}

/**
 * Check if language is configured
 * @returns True if language is manually configured
 */
export function hasConfiguredLanguage(): boolean {
  const config = readConfig();
  return !!config.language;
}

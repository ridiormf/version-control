/**
 * Pre-release version handling
 */

/**
 * Parse version into components
 */
export interface VersionComponents {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  prereleaseNumber?: number;
}

/**
 * Parse version string into components
 */
export function parseVersion(version: string): VersionComponents {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z]+)\.(\d+))?$/);

  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4],
    prereleaseNumber: match[5] ? parseInt(match[5], 10) : undefined,
  };
}

/**
 * Bump version with pre-release identifier
 */
export function bumpPrerelease(
  currentVersion: string,
  versionType: "major" | "minor" | "patch",
  prereleaseId: string
): string {
  const components = parseVersion(currentVersion);

  // If already a prerelease with same identifier, just increment the number
  if (
    components.prerelease === prereleaseId &&
    components.prereleaseNumber !== undefined
  ) {
    return `${components.major}.${components.minor}.${
      components.patch
    }-${prereleaseId}.${components.prereleaseNumber + 1}`;
  }

  // Otherwise, bump the version and add prerelease
  let major = components.major;
  let minor = components.minor;
  let patch = components.patch;

  if (versionType === "major") {
    major++;
    minor = 0;
    patch = 0;
  } else if (versionType === "minor") {
    minor++;
    patch = 0;
  } else {
    patch++;
  }

  return `${major}.${minor}.${patch}-${prereleaseId}.1`;
}

/**
 * Graduate from pre-release to stable
 */
export function graduatePrerelease(currentVersion: string): string {
  const components = parseVersion(currentVersion);

  if (!components.prerelease) {
    throw new Error(`Version ${currentVersion} is not a pre-release`);
  }

  return `${components.major}.${components.minor}.${components.patch}`;
}

/**
 * Check if version is a pre-release
 */
export function isPrerelease(version: string): boolean {
  return version.includes("-");
}

/**
 * Validate pre-release identifier
 */
export function validatePrereleaseId(id: string): boolean {
  return /^[a-zA-Z]+$/.test(id) && ["alpha", "beta", "rc"].includes(id);
}

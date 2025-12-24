import { git } from "./git";

/**
 * File change information
 */
export interface FileChange {
  path: string;
  status: "added" | "modified" | "deleted" | "renamed";
  additions: number;
  deletions: number;
}

/**
 * Commit suggestion
 */
export interface CommitSuggestion {
  type: string;
  scope?: string;
  description: string;
  fullMessage: string;
}

/**
 * Get staged file changes
 */
export function getStagedChanges(): FileChange[] {
  const output = git("diff --cached --numstat");

  if (!output) {
    return [];
  }

  const changes: FileChange[] = [];
  const lines = output.split("\n").filter(Boolean);

  for (const line of lines) {
    const [additions, deletions, path] = line.split("\t");

    // Skip binary files
    if (additions === "-" || deletions === "-") {
      continue;
    }

    // Determine status
    let status: FileChange["status"] = "modified";
    const statusOutput = git(`diff --cached --name-status -- "${path}"`);

    if (statusOutput.startsWith("A")) {
      status = "added";
    } else if (statusOutput.startsWith("D")) {
      status = "deleted";
    } else if (statusOutput.startsWith("R")) {
      status = "renamed";
    }

    changes.push({
      path,
      status,
      additions: parseInt(additions, 10),
      deletions: parseInt(deletions, 10),
    });
  }

  return changes;
}

/**
 * Analyze changes and generate commit message
 */
export function generateCommitMessage(changes: FileChange[]): CommitSuggestion {
  if (changes.length === 0) {
    return {
      type: "chore",
      description: "update project files",
      fullMessage: "chore: update project files",
    };
  }

  // Analyze file types and changes
  const fileTypes = analyzeFileTypes(changes);
  const changeTypes = analyzeChangeTypes(changes);

  // Determine commit type
  let type = "chore";
  let scope: string | undefined;
  let description = "";

  // Check for new files (likely feat)
  const newFiles = changes.filter((c) => c.status === "added");
  const deletedFiles = changes.filter((c) => c.status === "deleted");
  const modifiedFiles = changes.filter((c) => c.status === "modified");

  // Documentation changes
  if (fileTypes.docs > 0 && fileTypes.code === 0) {
    type = "docs";
    if (changes.length === 1) {
      description = `update ${getFileName(changes[0].path)}`;
    } else {
      description = "update documentation";
    }
  }
  // Test changes
  else if (fileTypes.tests > 0 && fileTypes.code === 0) {
    type = "test";
    description = fileTypes.tests === 1 ? "add test" : "update tests";
  }
  // Config changes
  else if (fileTypes.config > 0 && fileTypes.code === 0) {
    type = "chore";
    description = "update configuration";
  }
  // Style/formatting only
  else if (changeTypes.totalChanges < 50 && fileTypes.style > 0) {
    type = "style";
    description = "format code";
  }
  // New features
  else if (newFiles.length > 0 && newFiles.length > deletedFiles.length) {
    type = "feat";
    scope = detectScope(newFiles);

    if (newFiles.length === 1) {
      const fileName = getFileName(newFiles[0].path);
      description = `add ${fileName}`;
    } else {
      const primaryType = getMostCommonFileType(newFiles);
      description = `add ${primaryType} functionality`;
    }
  }
  // Deletions
  else if (deletedFiles.length > newFiles.length) {
    type = "refactor";
    description =
      deletedFiles.length === 1
        ? `remove ${getFileName(deletedFiles[0].path)}`
        : "remove unused code";
  }
  // Bug fixes (check for common patterns)
  else if (containsFixPatterns(changes)) {
    type = "fix";
    scope = detectScope(changes);
    description = generateFixDescription(changes);
  }
  // General updates
  else if (modifiedFiles.length > 0) {
    type = "refactor";
    scope = detectScope(modifiedFiles);

    if (modifiedFiles.length === 1) {
      const fileName = getFileName(modifiedFiles[0].path);
      description = `update ${fileName}`;
    } else if (changeTypes.totalChanges > 200) {
      description = "major code refactoring";
    } else {
      description = "improve code structure";
    }
  }

  // Build full message
  const fullMessage = scope
    ? `${type}(${scope}): ${description}`
    : `${type}: ${description}`;

  return {
    type,
    scope,
    description,
    fullMessage,
  };
}

/**
 * Analyze file types in changes
 */
function analyzeFileTypes(changes: FileChange[]) {
  const types = {
    code: 0,
    tests: 0,
    docs: 0,
    config: 0,
    style: 0,
  };

  for (const change of changes) {
    const path = change.path.toLowerCase();

    if (path.includes("test") || path.includes("spec")) {
      types.tests++;
    } else if (path.match(/\.(md|txt|rst)$/)) {
      types.docs++;
    } else if (
      path.match(/\.(json|yaml|yml|toml|ini|env|config)$/) ||
      path.includes("package.json") ||
      path.includes("tsconfig")
    ) {
      types.config++;
    } else if (path.match(/\.(css|scss|sass|less)$/)) {
      types.style++;
    } else if (path.match(/\.(ts|js|tsx|jsx|py|java|go|rs|c|cpp|h)$/)) {
      types.code++;
    }
  }

  return types;
}

/**
 * Analyze change magnitude
 */
function analyzeChangeTypes(changes: FileChange[]) {
  let totalAdditions = 0;
  let totalDeletions = 0;

  for (const change of changes) {
    totalAdditions += change.additions;
    totalDeletions += change.deletions;
  }

  return {
    totalAdditions,
    totalDeletions,
    totalChanges: totalAdditions + totalDeletions,
  };
}

/**
 * Detect scope from file paths
 */
function detectScope(changes: FileChange[]): string | undefined {
  // Look for common directory patterns
  const paths = changes.map((c) => c.path);

  // Check for specific directories
  const commonDirs = [
    "src",
    "lib",
    "api",
    "ui",
    "components",
    "utils",
    "services",
  ];

  for (const dir of commonDirs) {
    if (paths.some((p) => p.startsWith(`${dir}/`))) {
      return dir;
    }
  }

  // Check for feature-based directories
  const features = paths
    .map((p) => p.split("/")[0])
    .filter((p) => !["src", "dist", "node_modules"].includes(p));

  if (features.length > 0 && features.every((f) => f === features[0])) {
    return features[0];
  }

  return undefined;
}

/**
 * Get file name without extension
 */
function getFileName(path: string): string {
  const parts = path.split("/");
  const fileName = parts[parts.length - 1];
  return fileName.replace(/\.[^.]+$/, "");
}

/**
 * Get most common file type
 */
function getMostCommonFileType(changes: FileChange[]): string {
  const extensions = changes
    .map((c) => c.path.split(".").pop() || "")
    .filter(Boolean);

  if (extensions.length === 0) return "files";

  const counts = extensions.reduce((acc, ext) => {
    acc[ext] = (acc[ext] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];

  const typeMap: Record<string, string> = {
    ts: "TypeScript",
    js: "JavaScript",
    tsx: "React",
    jsx: "React",
    py: "Python",
    md: "documentation",
  };

  return typeMap[mostCommon] || mostCommon;
}

/**
 * Check if changes contain fix patterns
 */
function containsFixPatterns(changes: FileChange[]): boolean {
  // Simple heuristic: more deletions than additions often indicates fixes
  const totalAdditions = changes.reduce((sum, c) => sum + c.additions, 0);
  const totalDeletions = changes.reduce((sum, c) => sum + c.deletions, 0);

  return totalDeletions > totalAdditions * 0.7;
}

/**
 * Generate fix description
 */
function generateFixDescription(changes: FileChange[]): string {
  if (changes.length === 1) {
    return `resolve issue in ${getFileName(changes[0].path)}`;
  }
  return "resolve issues";
}

import { git } from "./git";

/**
 * Commit information
 */
export interface CommitInfo {
  hash: string;
  message: string;
  type: string;
  scope?: string;
  description: string;
  breaking: boolean;
}

/**
 * Changelog sections grouped by type
 */
export interface ChangelogSections {
  breaking: string[];
  added: string[];
  changed: string[];
  deprecated: string[];
  removed: string[];
  fixed: string[];
  security: string[];
  other: string[];
}

/**
 * Get all commits since the last tag/version
 * @returns Array of commit hashes and messages
 */
export function getCommitsSinceLastTag(): CommitInfo[] {
  // Get the last tag
  const lastTag = git("describe --tags --abbrev=0 2>/dev/null");

  // Get commits since last tag, or all commits if no tag exists
  let commits: string;
  if (lastTag) {
    // Commits since last tag
    commits = git(`log ${lastTag}..HEAD --pretty=format:"%H|%s"`);
  } else {
    // No tag exists - get ALL commits (first release)
    commits = git(`log --pretty=format:"%H|%s"`);
  }

  if (!commits) {
    return [];
  }

  return commits
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [hash, message] = line.split("|");
      return parseCommitMessage(hash, message);
    });
}

/**
 * Parse commit message following Conventional Commits format
 * @param hash - Commit hash
 * @param message - Commit message
 * @returns Parsed commit information
 */
export function parseCommitMessage(hash: string, message: string): CommitInfo {
  // Regex para Conventional Commits: type(scope): description
  const conventionalRegex = /^(\w+)(\(([^)]+)\))?(!)?:\s*(.+)$/;
  const match = message.match(conventionalRegex);

  if (match) {
    const [, type, , scope, breaking, description] = match;
    return {
      hash: hash.substring(0, 7),
      message,
      type: type.toLowerCase(),
      scope,
      description,
      breaking: !!breaking || message.toLowerCase().includes("breaking"),
    };
  }

  // Fallback: tenta identificar o tipo por palavras-chave
  const lowerMsg = message.toLowerCase();
  let type = "other";

  if (lowerMsg.match(/^(add|feat|feature|nova|novo|implement|criar)/)) {
    type = "feat";
  } else if (lowerMsg.match(/^(fix|corrig|bug|erro|ajust)/)) {
    type = "fix";
  } else if (lowerMsg.match(/^(remove|remov|delete|delet)/)) {
    type = "removed";
  } else if (lowerMsg.match(/^(deprecat|obsolet)/)) {
    type = "deprecated";
  } else if (lowerMsg.match(/^(refactor|reescrev|rewrite)/)) {
    type = "refactor";
  } else if (lowerMsg.match(/^(docs|doc|documentation)/)) {
    type = "docs";
  } else if (lowerMsg.match(/^(style|format)/)) {
    type = "style";
  } else if (lowerMsg.match(/^(test|tests)/)) {
    type = "test";
  } else if (lowerMsg.match(/^(chore|build|ci)/)) {
    type = "chore";
  } else if (lowerMsg.match(/^(security|segurança|sec)/)) {
    type = "security";
  }

  return {
    hash: hash.substring(0, 7),
    message,
    type,
    description: message,
    breaking: lowerMsg.includes("breaking") || lowerMsg.includes("break"),
  };
}

/**
 * Group commits by type for changelog
 * @param commits - Array of commit information
 * @returns Grouped commits by section
 */
export function groupCommitsByType(commits: CommitInfo[]): ChangelogSections {
  const sections: ChangelogSections = {
    breaking: [],
    added: [],
    changed: [],
    deprecated: [],
    removed: [],
    fixed: [],
    security: [],
    other: [],
  };

  for (const commit of commits) {
    // Skip certain types that shouldn't appear in changelog
    if (
      ["chore", "docs", "style", "test", "build", "ci"].includes(commit.type)
    ) {
      continue;
    }

    const entry = commit.scope
      ? `**${commit.scope}**: ${commit.description}`
      : commit.description;

    if (commit.breaking) {
      sections.breaking.push(`⚠️ **BREAKING CHANGE**: ${entry}`);
    } else if (commit.type === "feat" || commit.type === "feature") {
      sections.added.push(entry);
    } else if (commit.type === "fix") {
      sections.fixed.push(entry);
    } else if (commit.type === "removed" || commit.type === "remove") {
      sections.removed.push(entry);
    } else if (commit.type === "deprecated") {
      sections.deprecated.push(entry);
    } else if (commit.type === "security") {
      sections.security.push(entry);
    } else if (commit.type === "refactor" || commit.type === "perf") {
      sections.changed.push(entry);
    } else {
      sections.other.push(entry);
    }
  }

  return sections;
}

/**
 * Remove duplicate or very similar entries
 * @param entries - Array of changelog entries
 * @returns Filtered array without duplicates
 */
export function removeDuplicates(entries: string[]): string[] {
  const unique = new Map<string, string>();

  for (const entry of entries) {
    // Normaliza o texto para comparação
    const normalized = entry
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // Se já existe uma entrada muito similar, pula
    let isDuplicate = false;
    for (const [key] of unique) {
      const similarity = calculateSimilarity(normalized, key);
      if (similarity > 0.8) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      unique.set(normalized, entry);
    }
  }

  return Array.from(unique.values());
}

/**
 * Calculate similarity between two strings (0-1)
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Edit distance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

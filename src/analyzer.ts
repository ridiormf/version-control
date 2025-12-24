import { git } from "./git";
import { ChangeAnalysis } from "./types";
import { t } from "./i18n";

/**
 * Analyze changes from the last commit and suggest version type
 * @returns Analysis object with suggested version type and reasons
 */
export function analyzeChanges(): ChangeAnalysis {
  const lastCommitMsg = git("log -1 --pretty=%B");
  const filesChanged = git("diff-tree --no-commit-id --name-only -r HEAD")
    .split("\n")
    .filter(Boolean);

  const analysis: ChangeAnalysis = {
    type: "patch", // default
    reason: [],
    filesChanged,
    commitMsg: lastCommitMsg,
  };

  // Keywords that indicate MAJOR (breaking changes)
  const majorKeywords = [
    "breaking",
    "break",
    "incompatível",
    "incompatible",
    "remove",
    "remov",
    "delete",
    "delet",
    "refactor completo",
    "reescrita",
    "rewrite",
  ];

  // Keywords that indicate MINOR (new features)
  const minorKeywords = [
    "add",
    "adicion",
    "nova",
    "novo",
    "new",
    "feature",
    "implement",
    "criar",
    "create",
    "funcionalidade",
  ];

  // Keywords that indicate PATCH (fixes)
  const patchKeywords = [
    "fix",
    "corrig",
    "bug",
    "erro",
    "error",
    "ajust",
    "ajeit",
    "pequen",
    "minor change",
  ];

  const msgLower = lastCommitMsg.toLowerCase();

  // Check for MAJOR
  if (majorKeywords.some((kw) => msgLower.includes(kw))) {
    analysis.type = "major";
    analysis.reason.push(t("breakingChange"));
  }

  // Check for critical files modified (config structure, main entry points)
  const criticalFiles = [
    "index.js",
    "index.ts",
    "package.json",
    "projects.config.js",
    "tasks.config.js",
  ];
  const hasCriticalChanges = filesChanged.some((file) =>
    criticalFiles.some((critical) => file.includes(critical))
  );

  if (hasCriticalChanges && analysis.type !== "major") {
    const configChanges = filesChanged.filter(
      (f) => f.includes("config.js") || f.includes("config.ts")
    );
    if (configChanges.length > 0) {
      analysis.type = "minor";
      analysis.reason.push(t("configFilesModified"));
    }
  }

  // Check for MINOR
  if (
    minorKeywords.some((kw) => msgLower.includes(kw)) &&
    analysis.type === "patch"
  ) {
    analysis.type = "minor";
    analysis.reason.push(t("newFeatureIndicated"));
  }

  // Check for new files
  const newFiles = git(
    "diff-tree --no-commit-id --diff-filter=A --name-only -r HEAD"
  )
    .split("\n")
    .filter(Boolean);
  if (newFiles.length > 0 && analysis.type === "patch") {
    analysis.type = "minor";
    analysis.reason.push(`🟡 ${newFiles.length} ${t("newFilesAdded")}`);
  }

  // Check for PATCH
  if (
    patchKeywords.some((kw) => msgLower.includes(kw)) &&
    analysis.type === "patch"
  ) {
    analysis.reason.push(t("bugFixIndicated"));
  }

  // If still no specific reason
  if (analysis.reason.length === 0) {
    if (analysis.type === "patch") {
      analysis.reason.push(t("smallChange"));
    }
  }

  return analysis;
}

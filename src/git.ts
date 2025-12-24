import { execSync } from "child_process";

/**
 * Execute a git command and return the output
 * @param command - Git command to execute (without 'git' prefix)
 * @returns Command output or empty string on error
 */
export function git(command: string): string {
  try {
    return execSync(`git ${command}`, { encoding: "utf8" }).trim();
  } catch (error) {
    return "";
  }
}

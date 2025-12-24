/**
 * Types for version control system
 */

export type VersionType = "major" | "minor" | "patch";

export interface ChangeAnalysis {
  type: VersionType;
  reason: string[];
  filesChanged: string[];
  commitMsg: string;
}

export interface Colors {
  reset: string;
  bold: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  cyan: string;
}

export interface ReadlineInterface {
  question(query: string, callback: (answer: string) => void): void;
  close(): void;
  removeAllListeners(): void;
  _ttyFd?: number;
  _ttyInput?: NodeJS.ReadStream | null;
  _ttyOutput?: NodeJS.WriteStream | null;
}

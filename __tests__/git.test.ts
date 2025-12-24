import { git } from "../src/git";
import { execSync } from "child_process";

// Mock do execSync
jest.mock("child_process");
const mockedExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe("git", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("successful commands", () => {
    it("should execute git command and return output", () => {
      mockedExecSync.mockReturnValue("main\n" as any);

      const result = git("branch --show-current");

      expect(execSync).toHaveBeenCalledWith("git branch --show-current", {
        encoding: "utf8",
      });
      expect(result).toBe("main");
    });

    it("should trim whitespace from output", () => {
      mockedExecSync.mockReturnValue("  origin/main  \n" as any);

      const result = git("rev-parse --abbrev-ref HEAD");

      expect(result).toBe("origin/main");
    });

    it("should handle empty output", () => {
      mockedExecSync.mockReturnValue("" as any);

      const result = git("status --short");

      expect(result).toBe("");
    });
  });

  describe("error handling", () => {
    it("should return empty string on command failure", () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error("Command failed");
      });

      const result = git("invalid-command");

      expect(result).toBe("");
    });

    it("should handle not in git repository error", () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error("fatal: not a git repository");
      });

      const result = git("status");

      expect(result).toBe("");
    });
  });

  describe("common git commands", () => {
    it("should get current branch", () => {
      mockedExecSync.mockReturnValue("feature/test\n" as any);

      const result = git("branch --show-current");

      expect(result).toBe("feature/test");
    });

    it("should check git status", () => {
      mockedExecSync.mockReturnValue("M package.json\n" as any);

      const result = git("status --short");

      expect(result).toBe("M package.json");
    });

    it("should get commit hash", () => {
      mockedExecSync.mockReturnValue("abc123def456\n" as any);

      const result = git("rev-parse HEAD");

      expect(result).toBe("abc123def456");
    });

    it("should list tags", () => {
      mockedExecSync.mockReturnValue("v1.0.0\nv1.1.0\n" as any);

      const result = git("tag --list");

      expect(result).toBe("v1.0.0\nv1.1.0");
    });
  });
});

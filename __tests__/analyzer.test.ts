import { analyzeChanges } from "../src/analyzer";
import { git } from "../src/git";

jest.mock("../src/git");
const mockedGit = git as jest.MockedFunction<typeof git>;

describe("analyzer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("analyzeChanges", () => {
    it("should detect MAJOR version from breaking change keywords", () => {
      mockedGit.mockImplementation((cmd: string) => {
        if (cmd.includes("log -1")) return "BREAKING: remove old API";
        if (cmd.includes("diff-tree") && cmd.includes("diff-filter=A"))
          return "";
        return "src/api.ts";
      });

      const result = analyzeChanges();

      expect(result.type).toBe("major");
      expect(result.commitMsg).toBe("BREAKING: remove old API");
      expect(result.reason.length).toBeGreaterThan(0);
    });

    it("should detect MINOR version from new feature keywords", () => {
      mockedGit.mockImplementation((cmd: string) => {
        if (cmd.includes("log -1")) return "feat: add new dashboard";
        if (cmd.includes("diff-tree") && cmd.includes("diff-filter=A"))
          return "";
        return "src/dashboard.ts";
      });

      const result = analyzeChanges();

      expect(result.type).toBe("minor");
      expect(result.commitMsg).toBe("feat: add new dashboard");
    });

    it("should detect MINOR version when new files are added", () => {
      mockedGit.mockImplementation((cmd: string) => {
        if (cmd.includes("log -1")) return "chore: update files";
        if (cmd.includes("diff-filter=A"))
          return "src/newFeature.ts\nsrc/newService.ts";
        return "src/newFeature.ts\nsrc/newService.ts";
      });

      const result = analyzeChanges();

      expect(result.type).toBe("minor");
      expect(result.reason.some((r) => r.includes("2"))).toBe(true);
    });

    it("should detect PATCH version from bug fix keywords", () => {
      mockedGit.mockImplementation((cmd: string) => {
        if (cmd.includes("log -1")) return "fix: correct calculation bug";
        if (cmd.includes("diff-tree") && cmd.includes("diff-filter=A"))
          return "";
        return "src/calculator.ts";
      });

      const result = analyzeChanges();

      expect(result.type).toBe("patch");
      expect(result.commitMsg).toBe("fix: correct calculation bug");
    });

    it("should default to PATCH for unrecognized changes", () => {
      mockedGit.mockImplementation((cmd: string) => {
        if (cmd.includes("log -1")) return "docs: update README";
        if (cmd.includes("diff-tree") && cmd.includes("diff-filter=A"))
          return "";
        return "README.md";
      });

      const result = analyzeChanges();

      expect(result.type).toBe("patch");
      expect(result.filesChanged).toContain("README.md");
    });

    it("should detect MINOR when config files are modified", () => {
      mockedGit.mockImplementation((cmd: string) => {
        if (cmd.includes("log -1")) return "chore: update configuration";
        if (cmd.includes("diff-tree") && cmd.includes("diff-filter=A"))
          return "";
        return "projects.config.js\nsrc/file.ts";
      });

      const result = analyzeChanges();

      expect(result.type).toBe("minor");
    });

    it("should not override MAJOR with config changes", () => {
      mockedGit.mockImplementation((cmd: string) => {
        if (cmd.includes("log -1"))
          return "breaking: rewrite entire config system";
        if (cmd.includes("diff-tree") && cmd.includes("diff-filter=A"))
          return "";
        return "config.js";
      });

      const result = analyzeChanges();

      expect(result.type).toBe("major");
    });

    it("should handle multiple keywords correctly", () => {
      mockedGit.mockImplementation((cmd: string) => {
        if (cmd.includes("log -1")) return "feat: add new feature and fix bug";
        if (cmd.includes("diff-tree") && cmd.includes("diff-filter=A"))
          return "";
        return "src/feature.ts";
      });

      const result = analyzeChanges();

      expect(result.type).toBe("minor");
    });

    it("should parse files changed correctly", () => {
      mockedGit.mockImplementation((cmd: string) => {
        if (cmd.includes("log -1")) return "test commit";
        if (cmd.includes("diff-tree") && cmd.includes("diff-filter=A"))
          return "";
        return "file1.ts\nfile2.js\nfile3.json";
      });

      const result = analyzeChanges();

      expect(result.filesChanged).toEqual([
        "file1.ts",
        "file2.js",
        "file3.json",
      ]);
      expect(result.filesChanged.length).toBe(3);
    });

    it("should handle empty files changed", () => {
      mockedGit.mockImplementation((cmd: string) => {
        if (cmd.includes("log -1")) return "empty commit";
        if (cmd.includes("diff-tree")) return "";
        return "";
      });

      const result = analyzeChanges();

      expect(result.filesChanged).toEqual([]);
      expect(result.type).toBe("patch");
    });

    it("should detect config changes as MINOR when not MAJOR (line 88)", () => {
      mockedGit.mockImplementation((cmd: string) => {
        if (cmd.includes("log -1")) return "update config";
        if (cmd.includes("diff-filter=A")) return "";
        return "config.ts\npackage.json";
      });

      const result = analyzeChanges();

      // Should be MINOR due to config changes (line 88)
      expect(result.type).toBe("minor");
      expect(result.reason.join(" ")).toContain("config");
    });

    it("should add small change reason when type is patch and no other reason (line 124)", () => {
      mockedGit.mockImplementation((cmd: string) => {
        if (cmd.includes("log -1")) return "small update";
        if (cmd.includes("diff-filter=A")) return "";
        return "README.md";
      });

      const result = analyzeChanges();

      // Should be PATCH with "small change" reason (line 124)
      expect(result.type).toBe("patch");
      expect(result.reason.length).toBeGreaterThan(0);
    });
  });
});

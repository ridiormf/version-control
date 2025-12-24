import {
  getCommitsSinceLastTag,
  parseCommitMessage,
  groupCommitsByType,
  removeDuplicates,
  CommitInfo,
} from "../src/changelog";
import { git } from "../src/git";

jest.mock("../src/git");
const mockedGit = git as jest.MockedFunction<typeof git>;

describe("changelog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCommitsSinceLastTag", () => {
    it("should return commits since last tag", () => {
      mockedGit.mockImplementation((cmd: string) => {
        if (cmd.includes("describe --tags")) return "v1.0.0";
        if (cmd.includes("log"))
          return "abc1234|feat: add feature\ndef5678|fix: bug fix";
        return "";
      });

      const commits = getCommitsSinceLastTag();

      expect(commits).toHaveLength(2);
      expect(commits[0].type).toBe("feat");
      expect(commits[1].type).toBe("fix");
    });

    it("should return all commits when no tag exists", () => {
      mockedGit.mockImplementation((cmd: string) => {
        if (cmd.includes("describe --tags")) return "";
        if (cmd.includes("log")) return "abc1234|feat: initial commit";
        return "";
      });

      const commits = getCommitsSinceLastTag();

      expect(commits).toHaveLength(1);
      expect(commits[0].type).toBe("feat");
    });

    it("should return empty array when no commits", () => {
      mockedGit.mockReturnValue("");

      const commits = getCommitsSinceLastTag();

      expect(commits).toEqual([]);
    });
  });

  describe("parseCommitMessage", () => {
    it("should parse conventional commit format", () => {
      const result = parseCommitMessage(
        "abc1234567",
        "feat(api): add endpoint"
      );

      expect(result).toEqual({
        hash: "abc1234",
        message: "feat(api): add endpoint",
        type: "feat",
        scope: "api",
        description: "add endpoint",
        breaking: false,
      });
    });

    it("should detect breaking changes with !", () => {
      const result = parseCommitMessage("abc1234567", "feat!: breaking change");

      expect(result.breaking).toBe(true);
    });

    it("should detect breaking changes in message", () => {
      const result = parseCommitMessage(
        "abc1234567",
        "feat: add breaking feature"
      );

      expect(result.breaking).toBe(true);
    });

    it("should parse commit without scope", () => {
      const result = parseCommitMessage("abc1234567", "fix: bug fix");

      expect(result).toEqual({
        hash: "abc1234",
        message: "fix: bug fix",
        type: "fix",
        scope: undefined,
        description: "bug fix",
        breaking: false,
      });
    });

    it("should fallback to keyword detection for feat", () => {
      const result = parseCommitMessage("abc1234567", "add new feature");

      expect(result.type).toBe("feat");
    });

    it("should fallback to keyword detection for fix", () => {
      const result = parseCommitMessage("abc1234567", "fix bug in system");

      expect(result.type).toBe("fix");
    });

    it("should fallback to keyword detection for remove", () => {
      const result = parseCommitMessage("abc1234567", "remove old code");

      expect(result.type).toBe("removed");
    });

    it("should fallback to keyword detection for deprecated", () => {
      const result = parseCommitMessage("abc1234567", "deprecate old API");

      expect(result.type).toBe("deprecated");
    });

    it("should fallback to keyword detection for refactor", () => {
      const result = parseCommitMessage("abc1234567", "refactor code");

      expect(result.type).toBe("refactor");
    });

    it("should fallback to keyword detection for docs", () => {
      const result = parseCommitMessage("abc1234567", "docs: update readme");

      expect(result.type).toBe("docs");
    });

    it("should fallback to keyword detection for style", () => {
      const result = parseCommitMessage("abc1234567", "style: format code");

      expect(result.type).toBe("style");
    });

    it("should fallback to keyword detection for test", () => {
      const result = parseCommitMessage("abc1234567", "test: add tests");

      expect(result.type).toBe("test");
    });

    it("should fallback to keyword detection for chore", () => {
      const result = parseCommitMessage("abc1234567", "chore: update deps");

      expect(result.type).toBe("chore");
    });

    it("should fallback to keyword detection for security", () => {
      const result = parseCommitMessage(
        "abc1234567",
        "security: fix vulnerability"
      );

      expect(result.type).toBe("security");
    });

    it("should default to other for unknown type", () => {
      const result = parseCommitMessage("abc1234567", "random commit message");

      expect(result.type).toBe("other");
    });

    it("should detect deprecated type", () => {
      const result = parseCommitMessage("abc1234567", "deprecate old API");

      expect(result.type).toBe("deprecated");
    });

    it("should detect obsolete as deprecated", () => {
      const result = parseCommitMessage(
        "abc1234567",
        "obsolete feature removed"
      );

      expect(result.type).toBe("deprecated");
    });

    it("should detect removed type", () => {
      const result = parseCommitMessage("abc1234567", "remove unused code");

      expect(result.type).toBe("removed");
    });

    it("should detect delete as removed", () => {
      const result = parseCommitMessage("abc1234567", "delete old files");

      expect(result.type).toBe("removed");
    });

    it("should detect refactor type", () => {
      const result = parseCommitMessage(
        "abc1234567",
        "refactor: improve structure"
      );

      expect(result.type).toBe("refactor");
    });

    it("should detect rewrite as refactor", () => {
      const result = parseCommitMessage(
        "abc1234567",
        "rewrite module completely"
      );

      expect(result.type).toBe("refactor");
    });

    it("should detect docs type", () => {
      const result = parseCommitMessage("abc1234567", "docs: update README");

      expect(result.type).toBe("docs");
    });

    it("should detect documentation keyword", () => {
      const result = parseCommitMessage(
        "abc1234567",
        "documentation improvements"
      );

      expect(result.type).toBe("docs");
    });

    it("should detect style type", () => {
      const result = parseCommitMessage("abc1234567", "style: format code");

      expect(result.type).toBe("style");
    });

    it("should detect format as style", () => {
      const result = parseCommitMessage("abc1234567", "format files");

      expect(result.type).toBe("style");
    });

    it("should detect build as build type", () => {
      const result = parseCommitMessage("abc1234567", "build: update config");

      expect(result.type).toBe("build");
    });

    it("should detect ci as ci type", () => {
      const result = parseCommitMessage("abc1234567", "ci: fix pipeline");

      expect(result.type).toBe("ci");
    });
  });

  describe("groupCommitsByType", () => {
    it("should group commits by type", () => {
      const commits: CommitInfo[] = [
        {
          hash: "abc1234",
          message: "",
          type: "feat",
          description: "new feature",
          breaking: false,
        },
        {
          hash: "def5678",
          message: "",
          type: "fix",
          description: "bug fix",
          breaking: false,
        },
      ];

      const result = groupCommitsByType(commits);

      expect(result.added).toContain("new feature");
      expect(result.fixed).toContain("bug fix");
    });

    it("should include scope in entry", () => {
      const commits: CommitInfo[] = [
        {
          hash: "abc1234",
          message: "",
          type: "feat",
          scope: "api",
          description: "new endpoint",
          breaking: false,
        },
      ];

      const result = groupCommitsByType(commits);

      expect(result.added[0]).toBe("**api**: new endpoint");
    });

    it("should prioritize breaking changes", () => {
      const commits: CommitInfo[] = [
        {
          hash: "abc1234",
          message: "",
          type: "feat",
          description: "breaking feature",
          breaking: true,
        },
      ];

      const result = groupCommitsByType(commits);

      expect(result.breaking).toHaveLength(1);
      expect(result.breaking[0]).toContain("⚠️ **BREAKING CHANGE**");
      expect(result.added).toHaveLength(0);
    });

    it("should skip chore commits", () => {
      const commits: CommitInfo[] = [
        {
          hash: "abc1234",
          message: "",
          type: "chore",
          description: "update deps",
          breaking: false,
        },
      ];

      const result = groupCommitsByType(commits);

      expect(result.other).toHaveLength(0);
    });

    it("should skip docs commits", () => {
      const commits: CommitInfo[] = [
        {
          hash: "abc1234",
          message: "",
          type: "docs",
          description: "update readme",
          breaking: false,
        },
      ];

      const result = groupCommitsByType(commits);

      expect(result.other).toHaveLength(0);
    });

    it("should group removed commits", () => {
      const commits: CommitInfo[] = [
        {
          hash: "abc1234",
          message: "",
          type: "removed",
          description: "old feature",
          breaking: false,
        },
      ];

      const result = groupCommitsByType(commits);

      expect(result.removed).toContain("old feature");
    });

    it("should group deprecated commits", () => {
      const commits: CommitInfo[] = [
        {
          hash: "abc1234",
          message: "",
          type: "deprecated",
          description: "old API",
          breaking: false,
        },
      ];

      const result = groupCommitsByType(commits);

      expect(result.deprecated).toContain("old API");
    });

    it("should group security commits", () => {
      const commits: CommitInfo[] = [
        {
          hash: "abc1234",
          message: "",
          type: "security",
          description: "fix vuln",
          breaking: false,
        },
      ];

      const result = groupCommitsByType(commits);

      expect(result.security).toContain("fix vuln");
    });

    it("should group refactor as changed", () => {
      const commits: CommitInfo[] = [
        {
          hash: "abc1234",
          message: "",
          type: "refactor",
          description: "refactor code",
          breaking: false,
        },
      ];

      const result = groupCommitsByType(commits);

      expect(result.changed).toContain("refactor code");
    });

    it("should group perf as changed", () => {
      const commits: CommitInfo[] = [
        {
          hash: "abc1234",
          message: "",
          type: "perf",
          description: "improve perf",
          breaking: false,
        },
      ];

      const result = groupCommitsByType(commits);

      expect(result.changed).toContain("improve perf");
    });
  });

  describe("removeDuplicates", () => {
    it("should remove exact duplicates", () => {
      const entries = ["fix bug", "fix bug", "add feature"];

      const result = removeDuplicates(entries);

      expect(result).toHaveLength(2);
      expect(result).toContain("fix bug");
      expect(result).toContain("add feature");
    });

    it("should remove similar entries", () => {
      const entries = ["fix bug in api", "fix bug in API", "add feature"];

      const result = removeDuplicates(entries);

      expect(result).toHaveLength(2);
    });

    it("should keep different entries", () => {
      const entries = ["fix bug", "add feature", "update docs"];

      const result = removeDuplicates(entries);

      expect(result).toHaveLength(3);
    });

    it("should handle empty array", () => {
      const result = removeDuplicates([]);

      expect(result).toEqual([]);
    });

    it("should handle single entry", () => {
      const result = removeDuplicates(["fix bug"]);

      expect(result).toEqual(["fix bug"]);
    });

    it("should handle empty strings comparison", () => {
      // Test the similarity function edge case (line 214)
      const entries = ["", "", "test"];
      const result = removeDuplicates(entries);

      // Empty strings are duplicates
      expect(result.length).toBeLessThanOrEqual(2);
    });

    it("should group other types correctly", () => {
      const commits: CommitInfo[] = [
        {
          hash: "abc1234",
          message: "",
          type: "unknown",
          description: "unknown change",
          breaking: false,
        },
      ];

      const result = groupCommitsByType(commits);

      // Should go into 'other' section (line 162)
      expect(result.other).toContain("unknown change");
    });
  });
});

import {
  getStagedChanges,
  generateCommitMessage,
  FileChange,
} from "../src/commitGenerator";
import { git } from "../src/git";

jest.mock("../src/git");
const mockedGit = git as jest.MockedFunction<typeof git>;

describe("commitGenerator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getStagedChanges", () => {
    it("should return empty array when no staged changes", () => {
      mockedGit.mockReturnValue("");

      const changes = getStagedChanges();

      expect(changes).toEqual([]);
    });

    it("should parse staged changes correctly", () => {
      mockedGit.mockImplementation((cmd: string) => {
        if (cmd.includes("--numstat")) {
          return "10\t5\tsrc/file.ts\n20\t3\tREADME.md";
        }
        if (cmd.includes("src/file.ts")) return "M\tsrc/file.ts";
        if (cmd.includes("README.md")) return "A\tREADME.md";
        return "";
      });

      const changes = getStagedChanges();

      expect(changes).toHaveLength(2);
      expect(changes[0].status).toBe("modified");
      expect(changes[1].status).toBe("added");
    });

    it("should skip binary files", () => {
      mockedGit.mockImplementation((cmd: string) => {
        if (cmd.includes("--numstat")) {
          return "10\t5\tsrc/file.ts\n-\t-\timage.png";
        }
        if (cmd.includes("src/file.ts")) return "M\tsrc/file.ts";
        return "";
      });

      const changes = getStagedChanges();

      expect(changes).toHaveLength(1);
      expect(changes[0].path).toBe("src/file.ts");
    });

    it("should detect deleted files", () => {
      mockedGit.mockImplementation((cmd: string) => {
        if (cmd.includes("--numstat")) return "0\t10\tdeleted.ts";
        if (cmd.includes("deleted.ts")) return "D\tdeleted.ts";
        return "";
      });

      const changes = getStagedChanges();

      expect(changes[0].status).toBe("deleted");
    });

    it("should detect renamed files", () => {
      mockedGit.mockImplementation((cmd: string) => {
        if (cmd.includes("--numstat")) return "5\t3\trenamed.ts";
        if (cmd.includes("renamed.ts")) return "R\trenamed.ts";
        return "";
      });

      const changes = getStagedChanges();

      expect(changes[0].status).toBe("renamed");
    });
  });

  describe("generateCommitMessage", () => {
    it("should return default message for empty changes", () => {
      const result = generateCommitMessage([]);

      expect(result.type).toBe("chore");
      expect(result.fullMessage).toBe("chore: update project files");
    });

    it("should generate docs commit for documentation files", () => {
      const changes: FileChange[] = [
        { path: "README.md", status: "modified", additions: 10, deletions: 2 },
      ];

      const result = generateCommitMessage(changes);

      expect(result.type).toBe("docs");
      expect(result.description).toContain("README");
    });

    it("should generate test commit for test files", () => {
      const changes: FileChange[] = [
        {
          path: "src/file.test.ts",
          status: "added",
          additions: 50,
          deletions: 0,
        },
      ];

      const result = generateCommitMessage(changes);

      expect(result.type).toBe("test");
    });

    it("should generate feat commit for new files", () => {
      const changes: FileChange[] = [
        {
          path: "src/newFeature.ts",
          status: "added",
          additions: 100,
          deletions: 0,
        },
      ];

      const result = generateCommitMessage(changes);

      expect(result.type).toBe("feat");
      expect(result.description).toContain("add");
    });

    it("should generate refactor commit for deletions", () => {
      const changes: FileChange[] = [
        { path: "src/old.ts", status: "deleted", additions: 0, deletions: 100 },
      ];

      const result = generateCommitMessage(changes);

      expect(result.type).toBe("refactor");
      expect(result.description).toContain("remove");
    });

    it("should generate chore commit for config files", () => {
      const changes: FileChange[] = [
        {
          path: "package.json",
          status: "modified",
          additions: 5,
          deletions: 2,
        },
      ];

      const result = generateCommitMessage(changes);

      expect(result.type).toBe("chore");
    });

    it("should generate style commit for CSS changes", () => {
      const changes: FileChange[] = [
        { path: "styles.css", status: "modified", additions: 10, deletions: 5 },
      ];

      const result = generateCommitMessage(changes);

      expect(result.type).toBe("style");
    });

    it("should handle multiple file changes", () => {
      const changes: FileChange[] = [
        { path: "src/file1.ts", status: "added", additions: 50, deletions: 0 },
        { path: "src/file2.ts", status: "added", additions: 30, deletions: 0 },
      ];

      const result = generateCommitMessage(changes);

      expect(result.type).toBe("feat");
    });

    it("should generate refactor for major changes", () => {
      const changes: FileChange[] = [
        {
          path: "src/file.ts",
          status: "modified",
          additions: 150,
          deletions: 100,
        },
      ];

      const result = generateCommitMessage(changes);

      expect(result.type).toBe("refactor");
    });

    it("should detect scope from file paths", () => {
      const changes: FileChange[] = [
        {
          path: "api/endpoint.ts",
          status: "modified",
          additions: 20,
          deletions: 10,
        },
      ];

      const result = generateCommitMessage(changes);

      expect(result.scope).toBe("api");
      expect(result.fullMessage).toContain("(api)");
    });

    it("should generate fix commit when more deletions than additions", () => {
      const changes: FileChange[] = [
        {
          path: "src/buggy.ts",
          status: "modified",
          additions: 5,
          deletions: 15,
        },
      ];

      const result = generateCommitMessage(changes);

      expect(result.type).toBe("fix");
    });

    it("should handle single file fix", () => {
      const changes: FileChange[] = [
        {
          path: "src/error.ts",
          status: "modified",
          additions: 2,
          deletions: 8,
        },
      ];

      const result = generateCommitMessage(changes);

      expect(result.type).toBe("fix");
      expect(result.description).toContain("error");
    });

    it("should handle multiple modified files", () => {
      const changes: FileChange[] = [
        {
          path: "src/file1.ts",
          status: "modified",
          additions: 20,
          deletions: 10,
        },
        {
          path: "src/file2.ts",
          status: "modified",
          additions: 15,
          deletions: 5,
        },
      ];

      const result = generateCommitMessage(changes);

      expect(result.type).toBe("refactor");
      expect(result.scope).toBe("src");
    });

    it("should detect major refactoring", () => {
      const changes: FileChange[] = [
        {
          path: "src/big.ts",
          status: "modified",
          additions: 150,
          deletions: 80,
        },
        {
          path: "src/other.ts",
          status: "modified",
          additions: 60,
          deletions: 30,
        },
      ];

      const result = generateCommitMessage(changes);

      expect(result.type).toBe("refactor");
      expect(result.description).toContain("major");
    });

    it("should handle multiple new files of same type", () => {
      const changes: FileChange[] = [
        { path: "src/new1.ts", status: "added", additions: 30, deletions: 0 },
        { path: "src/new2.ts", status: "added", additions: 25, deletions: 0 },
      ];

      const result = generateCommitMessage(changes);

      expect(result.type).toBe("feat");
      expect(result.description).toContain("TypeScript");
    });
  });
});

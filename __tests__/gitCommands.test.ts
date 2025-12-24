import { executeGitCommands } from "../src/gitCommands";
import { execSync } from "child_process";

jest.mock("child_process");
const mockedExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe("gitCommands", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console to avoid cluttering test output
    jest.spyOn(console, "log").mockImplementation();
    // Mock process.exit to prevent test termination
    jest.spyOn(process, "exit").mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("executeGitCommands", () => {
    it("should execute all git commands in correct order", () => {
      const version = "1.2.3";

      executeGitCommands(version);

      expect(mockedExecSync).toHaveBeenCalledTimes(5);
      expect(mockedExecSync).toHaveBeenNthCalledWith(1, "git add -A", {
        stdio: "inherit",
      });
      expect(mockedExecSync).toHaveBeenNthCalledWith(
        2,
        'git commit -m "chore: bump version to 1.2.3"',
        { stdio: "inherit" }
      );
      expect(mockedExecSync).toHaveBeenNthCalledWith(3, "git tag v1.2.3", {
        stdio: "inherit",
      });
      expect(mockedExecSync).toHaveBeenNthCalledWith(4, "git push", {
        stdio: "inherit",
      });
      expect(mockedExecSync).toHaveBeenNthCalledWith(5, "git push --tags", {
        stdio: "inherit",
      });
    });

    it("should handle different version formats", () => {
      executeGitCommands("2.0.0-beta.1");

      expect(mockedExecSync).toHaveBeenCalledWith(
        'git commit -m "chore: bump version to 2.0.0-beta.1"',
        { stdio: "inherit" }
      );
      expect(mockedExecSync).toHaveBeenCalledWith("git tag v2.0.0-beta.1", {
        stdio: "inherit",
      });
    });

    it("should handle errors gracefully", () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error("Git command failed");
      });

      executeGitCommands("1.0.0");

      // Should call process.exit(1) on error
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it("should stop execution if git add fails", () => {
      mockedExecSync.mockImplementationOnce(() => {
        throw new Error("Nothing to add");
      });

      executeGitCommands("1.0.0");

      // Should only call git add, not the others
      expect(mockedExecSync).toHaveBeenCalledTimes(1);
    });

    it("should display success messages", () => {
      executeGitCommands("1.0.0");

      expect(console.log).toHaveBeenCalled();
    });
  });
});

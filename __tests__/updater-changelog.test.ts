import {
  updatePackageJson,
  updateIndexFile,
  updateChangelog,
} from "../src/updater";
import * as fs from "fs";
import * as changelog from "../src/changelog";
import { VersionType } from "../src/types";

jest.mock("fs");
jest.mock("../src/colors", () => ({
  colors: { green: "", reset: "", yellow: "" },
}));
jest.mock("../src/i18n", () => ({ t: (key: string) => key }));
jest.mock("../src/changelog");

describe("updater", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation();
  });

  describe("updatePackageJson", () => {
    it("should update version in package.json", () => {
      const mockPackageJson = { version: "1.0.0", name: "test" };
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockPackageJson)
      );
      (fs.writeFileSync as jest.Mock).mockImplementation();

      updatePackageJson("2.0.0", "/test");

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("package.json"),
        expect.stringContaining('"version": "2.0.0"')
      );
    });
  });

  describe("updateIndexFile", () => {
    it("should update version in index.ts if @version tag exists", () => {
      const mockIndexContent =
        '/**\n * @version 1.0.0\n */\nconsole.log("test");';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockIndexContent);
      (fs.writeFileSync as jest.Mock).mockImplementation();

      updateIndexFile("2.0.0", "/test");

      expect(fs.writeFileSync).toHaveBeenCalled();
      const writtenContent = (fs.writeFileSync as jest.Mock).mock.calls[0][1];
      expect(writtenContent).toContain("@version 2.0.0");
    });

    it("should not update if no index file exists", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      updateIndexFile("2.0.0", "/test");

      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it("should not update if no @version tag exists", () => {
      const mockIndexContent = 'console.log("test");';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockIndexContent);

      updateIndexFile("2.0.0", "/test");

      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe("updateChangelog", () => {
    it("should warn if CHANGELOG.md does not exist", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      updateChangelog("2.0.0", "MINOR" as VersionType, {} as any, "/test");

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("changelogNotFound")
      );
    });

    it("should warn if no new commits", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        "# Changelog\n\n## [1.0.0]\n"
      );
      (changelog.getCommitsSinceLastTag as jest.Mock).mockReturnValue([]);

      updateChangelog("2.0.0", "MINOR" as VersionType, {} as any, "/test");

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("noNewCommits")
      );
    });

    it("should update changelog with commits", () => {
      const mockChangelog = "# Changelog\n\n## [1.0.0]\n";
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockChangelog);
      (fs.writeFileSync as jest.Mock).mockImplementation();
      (changelog.getCommitsSinceLastTag as jest.Mock).mockReturnValue([
        {
          hash: "abc1234",
          message: "feat: new feature",
          type: "feat",
          description: "new feature",
          breaking: false,
        },
      ]);
      (changelog.groupCommitsByType as jest.Mock).mockReturnValue({
        breaking: [],
        added: ["new feature"],
        changed: [],
        deprecated: [],
        removed: [],
        fixed: [],
        security: [],
        other: [],
      });
      (changelog.removeDuplicates as jest.Mock).mockImplementation(
        (arr) => arr
      );

      updateChangelog("2.0.0", "MINOR" as VersionType, {} as any, "/test");

      expect(fs.writeFileSync).toHaveBeenCalled();
      const writtenContent = (fs.writeFileSync as jest.Mock).mock.calls[0][1];
      expect(writtenContent).toContain("## [2.0.0]");
      expect(writtenContent).toContain("new feature");
    });

    it("should add first release message for version 1.0.0", () => {
      const mockChangelog = "# Changelog\n\n## [0.9.0]\n";
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockChangelog);
      (fs.writeFileSync as jest.Mock).mockImplementation();
      (changelog.getCommitsSinceLastTag as jest.Mock).mockReturnValue([
        {
          hash: "abc1234",
          message: "feat: initial",
          type: "feat",
          description: "initial",
          breaking: false,
        },
      ]);
      (changelog.groupCommitsByType as jest.Mock).mockReturnValue({
        breaking: [],
        added: ["initial"],
        changed: [],
        deprecated: [],
        removed: [],
        fixed: [],
        security: [],
        other: [],
      });
      (changelog.removeDuplicates as jest.Mock).mockImplementation(
        (arr) => arr
      );

      updateChangelog("1.0.0", "MAJOR" as VersionType, {} as any, "/test");

      expect(fs.writeFileSync).toHaveBeenCalled();
      const writtenContent = (fs.writeFileSync as jest.Mock).mock.calls[0][1];
      expect(writtenContent).toContain("initialRelease");
    });

    it("should include all changelog sections", () => {
      const mockChangelog = "# Changelog\n\n## [1.0.0]\n";
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockChangelog);
      (fs.writeFileSync as jest.Mock).mockImplementation();
      (changelog.getCommitsSinceLastTag as jest.Mock).mockReturnValue([
        {
          hash: "abc",
          message: "",
          type: "feat",
          description: "added",
          breaking: false,
        },
      ]);
      (changelog.groupCommitsByType as jest.Mock).mockReturnValue({
        breaking: ["breaking change"],
        added: ["added feature"],
        changed: ["changed feature"],
        deprecated: ["deprecated feature"],
        removed: ["removed feature"],
        fixed: ["fixed bug"],
        security: ["security fix"],
        other: ["other change"],
      });
      (changelog.removeDuplicates as jest.Mock).mockImplementation(
        (arr) => arr
      );

      updateChangelog("2.0.0", "MAJOR" as VersionType, {} as any, "/test");

      const writtenContent = (fs.writeFileSync as jest.Mock).mock.calls[0][1];
      expect(writtenContent).toContain("Breaking Changes");
      expect(writtenContent).toContain("Added");
      expect(writtenContent).toContain("Changed");
      expect(writtenContent).toContain("Deprecated");
      expect(writtenContent).toContain("Removed");
      expect(writtenContent).toContain("Fixed");
      expect(writtenContent).toContain("Security");
      expect(writtenContent).toContain("Other");
    });
  });
});

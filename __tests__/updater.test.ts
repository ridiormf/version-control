import { updatePackageJson, updateIndexFile } from "../src/updater";
import * as fs from "fs";
import * as path from "path";

describe("updater", () => {
  const testDir = path.join(__dirname, "..", "test-temp-updater");

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    jest.restoreAllMocks();
  });

  describe("updatePackageJson", () => {
    it("should update version in package.json", () => {
      const packagePath = path.join(testDir, "package.json");
      const initialContent = {
        name: "test-package",
        version: "1.0.0",
        description: "Test package",
      };

      fs.writeFileSync(packagePath, JSON.stringify(initialContent, null, 2));

      updatePackageJson("2.0.0", testDir);

      const updated = JSON.parse(fs.readFileSync(packagePath, "utf8"));
      expect(updated.version).toBe("2.0.0");
      expect(updated.name).toBe("test-package");
      expect(updated.description).toBe("Test package");
    });

    it("should preserve package.json formatting", () => {
      const packagePath = path.join(testDir, "package.json");
      const initialContent = {
        name: "test",
        version: "0.1.0",
        scripts: { test: "jest" },
      };

      fs.writeFileSync(packagePath, JSON.stringify(initialContent, null, 2));

      updatePackageJson("0.2.0", testDir);

      const content = fs.readFileSync(packagePath, "utf8");
      expect(content).toContain('"version": "0.2.0"');
      expect(content).toContain("\n");
    });
  });

  describe("updateIndexFile", () => {
    it("should update @version in index.js", () => {
      const indexPath = path.join(testDir, "index.js");
      const content = `/**
 * Main module
 * @version 1.0.0
 */
module.exports = {};
`;

      fs.writeFileSync(indexPath, content);

      updateIndexFile("2.0.0", testDir);

      const updated = fs.readFileSync(indexPath, "utf8");
      expect(updated).toContain("@version 2.0.0");
      expect(updated).not.toContain("@version 1.0.0");
    });

    it("should not modify file without @version tag", () => {
      const indexPath = path.join(testDir, "index.js");
      const content = `// No version tag here
module.exports = {};
`;

      fs.writeFileSync(indexPath, content);

      updateIndexFile("2.0.0", testDir);

      const unchanged = fs.readFileSync(indexPath, "utf8");
      expect(unchanged).toBe(content);
    });

    it("should handle when no index file exists", () => {
      expect(() => updateIndexFile("1.0.0", testDir)).not.toThrow();
    });
  });
});

import { bumpVersion, getCurrentVersion } from "../src/version";
import * as fs from "fs";
import * as path from "path";

describe("version", () => {
  describe("bumpVersion", () => {
    describe("major version", () => {
      it("should bump from 1.0.0 to 2.0.0", () => {
        expect(bumpVersion("1.0.0", "major")).toBe("2.0.0");
      });

      it("should reset minor and patch", () => {
        expect(bumpVersion("1.5.3", "major")).toBe("2.0.0");
      });
    });

    describe("minor version", () => {
      it("should bump from 1.0.0 to 1.1.0", () => {
        expect(bumpVersion("1.0.0", "minor")).toBe("1.1.0");
      });

      it("should reset patch", () => {
        expect(bumpVersion("1.2.5", "minor")).toBe("1.3.0");
      });
    });

    describe("patch version", () => {
      it("should bump from 1.0.0 to 1.0.1", () => {
        expect(bumpVersion("1.0.0", "patch")).toBe("1.0.1");
      });

      it("should increment patch correctly", () => {
        expect(bumpVersion("2.3.7", "patch")).toBe("2.3.8");
      });
    });

    describe("edge cases", () => {
      it("should handle versions with leading zeros", () => {
        expect(bumpVersion("0.1.0", "major")).toBe("1.0.0");
        expect(bumpVersion("0.0.1", "minor")).toBe("0.1.0");
      });

      it("should handle large version numbers", () => {
        expect(bumpVersion("99.99.99", "patch")).toBe("99.99.100");
      });

      it("should return current version for invalid type", () => {
        expect(bumpVersion("1.2.3", "invalid" as any)).toBe("1.2.3");
      });
    });
  });

  describe("getCurrentVersion", () => {
    const testDir = path.join(__dirname, "..", "test-temp");
    const packagePath = path.join(testDir, "package.json");

    beforeEach(() => {
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
    });

    afterEach(() => {
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true });
      }
    });

    it("should read version from package.json", () => {
      fs.writeFileSync(
        packagePath,
        JSON.stringify({ name: "test", version: "1.2.3" }, null, 2)
      );

      const version = getCurrentVersion(testDir);
      expect(version).toBe("1.2.3");
    });

    it("should handle different version formats", () => {
      fs.writeFileSync(
        packagePath,
        JSON.stringify({ name: "test", version: "0.0.1" }, null, 2)
      );

      const version = getCurrentVersion(testDir);
      expect(version).toBe("0.0.1");
    });
  });
});

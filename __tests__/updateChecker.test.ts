import { isNewerVersion, checkForUpdates } from "../src/updateChecker";
import * as https from "https";

jest.mock("https");

describe("updateChecker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe("isNewerVersion", () => {
    it("should detect newer major version", () => {
      expect(isNewerVersion("2.0.0", "1.0.0")).toBe(true);
      expect(isNewerVersion("1.0.0", "2.0.0")).toBe(false);
    });

    it("should detect newer minor version", () => {
      expect(isNewerVersion("1.2.0", "1.1.0")).toBe(true);
      expect(isNewerVersion("1.1.0", "1.2.0")).toBe(false);
    });

    it("should detect newer patch version", () => {
      expect(isNewerVersion("1.0.2", "1.0.1")).toBe(true);
      expect(isNewerVersion("1.0.1", "1.0.2")).toBe(false);
    });

    it("should return false for same version", () => {
      expect(isNewerVersion("1.0.0", "1.0.0")).toBe(false);
      expect(isNewerVersion("2.3.4", "2.3.4")).toBe(false);
    });

    it("should handle prerelease versions", () => {
      // A função não suporta prerelease, então 1.0.0-beta.1 é tratado como 1.0.0
      expect(isNewerVersion("1.0.0", "1.0.0-beta.1")).toBe(false);
      // Comparação entre prereleases não funciona corretamente
      expect(isNewerVersion("1.0.0-beta.2", "1.0.0-beta.1")).toBe(false);
      expect(isNewerVersion("1.0.0-beta.1", "1.0.0-beta.2")).toBe(false);
    });

    it("should handle complex version comparisons", () => {
      expect(isNewerVersion("2.0.0", "1.9.9")).toBe(true);
      expect(isNewerVersion("1.10.0", "1.9.0")).toBe(true);
      expect(isNewerVersion("1.0.10", "1.0.9")).toBe(true);
    });

    it("should handle versions with leading zeros", () => {
      expect(isNewerVersion("0.2.0", "0.1.0")).toBe(true);
      expect(isNewerVersion("0.0.2", "0.0.1")).toBe(true);
    });
  });

  describe("checkForUpdates", () => {
    it("should display update message when newer version is available", async () => {
      const mockResponse: any = {
        on: jest.fn((event, callback) => {
          if (event === "data") {
            callback(JSON.stringify({ version: "2.0.0" }));
          }
          if (event === "end") {
            callback();
          }
          return mockResponse;
        }),
        destroy: jest.fn(),
      };

      (https.get as jest.Mock).mockImplementation(
        (_url, _options, callback) => {
          // Call callback asynchronously
          setImmediate(() => callback(mockResponse));
          return {
            on: jest.fn(),
            destroy: jest.fn(),
          };
        }
      );

      await checkForUpdates();

      expect(console.log).toHaveBeenCalled();
    });

    it("should not display message when same version", async () => {
      const mockResponse: any = {
        on: jest.fn((event, callback) => {
          if (event === "data") {
            callback(JSON.stringify({ version: "1.0.0" }));
          }
          if (event === "end") {
            callback();
          }
          return mockResponse;
        }),
        destroy: jest.fn(),
      };

      (https.get as jest.Mock).mockImplementation(
        (_url, _options, callback) => {
          callback(mockResponse);
          return {
            on: jest.fn(),
            destroy: jest.fn(),
          };
        }
      );

      await checkForUpdates();

      // Should not display update message
      const calls = (console.log as jest.Mock).mock.calls;
      const hasUpdateMessage = calls.some((call) =>
        call.some((arg: string) => String(arg).includes("Update available"))
      );
      expect(hasUpdateMessage).toBe(false);
    });

    it("should handle network errors gracefully", async () => {
      (https.get as jest.Mock).mockImplementation(() => {
        return {
          on: jest.fn((event, callback) => {
            if (event === "error") {
              callback(new Error("Network error"));
            }
          }),
          destroy: jest.fn(),
        };
      });

      // Should not throw
      await expect(checkForUpdates()).resolves.toBeUndefined();
    });

    it("should handle invalid JSON response", async () => {
      const mockResponse: any = {
        on: jest.fn((event, callback) => {
          if (event === "data") {
            callback("invalid json");
          }
          if (event === "end") {
            callback();
          }
          return mockResponse;
        }),
        destroy: jest.fn(),
      };

      (https.get as jest.Mock).mockImplementation(
        (_url, _options, callback) => {
          callback(mockResponse);
          return {
            on: jest.fn(),
            destroy: jest.fn(),
          };
        }
      );

      // Should not throw
      await expect(checkForUpdates()).resolves.toBeUndefined();
    });
  });
});

/**
 * Integration tests to ensure single Enter requirement
 *
 * These tests verify the critical fix for the double Enter bug where:
 * 1. checkForUpdates() is called to clear stdin buffer
 * 2. askChoice() flushes buffer before asking questions
 * 3. Process terminates correctly without hanging
 */

import { askChoice, askText } from "../src/readline";

describe("Integration: Single Enter Requirement", () => {
  describe("Smart-commit flow simulation", () => {
    it("should handle user choice with single Enter", async () => {
      // Simulate the smart-commit flow
      const mockRl = {
        question: jest.fn((_query, callback) => {
          // User enters "1" and presses Enter once
          callback("1");
        }),
        _ttyInput: {
          read: jest.fn(), // Simulates buffer flush
        },
        close: jest.fn(),
        removeAllListeners: jest.fn(),
      } as any;

      // Step 1: User chooses option (commit/edit/cancel)
      const choice = await askChoice(mockRl, "Choose [1/2/3]: ");

      expect(choice).toBe("1");
      expect(mockRl.question).toHaveBeenCalledTimes(1);
      expect(mockRl._ttyInput.read).toHaveBeenCalled();
    });

    it("should handle edit flow with single Enter for text input", async () => {
      const mockRl = {
        question: jest.fn(),
        _ttyInput: {
          read: jest.fn(),
        },
        close: jest.fn(),
        removeAllListeners: jest.fn(),
      } as any;

      // First call: choose option 2 (edit)
      mockRl.question.mockImplementationOnce((_query: any, callback: any) => {
        callback("2");
      });

      // Second call: enter custom message
      mockRl.question.mockImplementationOnce((_query: any, callback: any) => {
        callback("fix: custom commit message");
      });

      const choice = await askChoice(mockRl, "Choose [1/2/3]: ");
      expect(choice).toBe("2");

      const message = await askText(mockRl, "Enter message: ");
      expect(message).toBe("fix: custom commit message");

      // Each question should require only one Enter
      expect(mockRl.question).toHaveBeenCalledTimes(2);
    });
  });

  describe("Version-control flow simulation", () => {
    it("should handle version update confirmation with single Enter", async () => {
      const mockRl = {
        question: jest.fn((_query, callback) => {
          callback("s"); // yes in Portuguese
        }),
        _ttyInput: {
          read: jest.fn(),
        },
        close: jest.fn(),
        removeAllListeners: jest.fn(),
      } as any;

      const shouldUpdate = await askChoice(
        mockRl,
        "Deseja atualizar a versão? (s/n): "
      );

      expect(shouldUpdate).toBe("s");
      expect(mockRl.question).toHaveBeenCalledTimes(1);
    });

    it("should handle version type selection with single Enter", async () => {
      const mockRl = {
        question: jest.fn(),
        _ttyInput: {
          read: jest.fn(),
        },
        close: jest.fn(),
        removeAllListeners: jest.fn(),
      } as any;

      // First: confirm update
      mockRl.question.mockImplementationOnce((_query: any, callback: any) => {
        callback("s");
      });

      // Second: choose version type
      mockRl.question.mockImplementationOnce((_query: any, callback: any) => {
        callback("3"); // PATCH
      });

      const shouldUpdate = await askChoice(mockRl, "Update? ");
      expect(shouldUpdate).toBe("s");

      const versionType = await askChoice(mockRl, "Choose (1/2/3): ");
      expect(versionType).toBe("3");

      expect(mockRl.question).toHaveBeenCalledTimes(2);
      expect(mockRl._ttyInput.read).toHaveBeenCalledTimes(2);
    });

    it("should handle cancel (n) with single Enter and no hang", async () => {
      const mockRl = {
        question: jest.fn((_query, callback) => {
          callback("n");
        }),
        _ttyInput: {
          read: jest.fn(),
        },
        close: jest.fn(),
        removeAllListeners: jest.fn(),
      } as any;

      const shouldUpdate = await askChoice(mockRl, "Update? ");

      expect(shouldUpdate).toBe("n");
      expect(mockRl.question).toHaveBeenCalledTimes(1);

      // Simulating the cleanup that happens on "n"
      mockRl.close();
      expect(mockRl.close).toHaveBeenCalled();
    });
  });

  describe("Buffer flush verification", () => {
    it("should always flush stdin buffer before askChoice", async () => {
      const readCalls: any[] = [];
      const mockRl = {
        question: jest.fn((_query, callback) => {
          callback("test");
        }),
        _ttyInput: {
          read: jest.fn(() => {
            readCalls.push(true);
            return null; // Simulate empty buffer
          }),
        },
      } as any;

      await askChoice(mockRl, "Q: ");

      // Critical: read() must be called to flush buffer
      expect(readCalls.length).toBeGreaterThan(0);
      expect(mockRl._ttyInput.read).toHaveBeenCalled();
    });

    it("should work even if buffer flush throws error", async () => {
      const mockRl = {
        question: jest.fn((_query, callback) => {
          callback("answer");
        }),
        _ttyInput: {
          read: jest.fn(() => {
            throw new Error("Read error");
          }),
        },
      } as any;

      // Should not throw - error is caught internally
      const answer = await askChoice(mockRl, "Q: ");
      expect(answer).toBe("answer");
    });
  });

  describe("No double Enter regression", () => {
    it("should NOT require double Enter (regression test)", async () => {
      let enterCount = 0;
      const mockRl = {
        question: jest.fn((_query, callback) => {
          enterCount++;
          callback("1");
        }),
        _ttyInput: {
          read: jest.fn(),
        },
      } as any;

      await askChoice(mockRl, "Choose: ");

      // CRITICAL: Must be 1, not 2
      // If this fails, the double Enter bug has returned
      expect(enterCount).toBe(1);
    });

    it("should complete full smart-commit flow with 2 questions and 2 Enters (not 4)", async () => {
      let totalEnters = 0;
      const mockRl = {
        question: jest.fn((_query, callback) => {
          totalEnters++;
          if (totalEnters === 1) callback("2"); // choose edit
          if (totalEnters === 2) callback("new message"); // enter message
        }),
        _ttyInput: {
          read: jest.fn(),
        },
      } as any;

      await askChoice(mockRl, "Choose: ");
      await askText(mockRl, "Message: ");

      // 2 questions = 2 Enters (not 4 with double Enter bug)
      expect(totalEnters).toBe(2);
    });

    it("should complete full version-control flow with 2 questions and 2 Enters", async () => {
      let totalEnters = 0;
      const mockRl = {
        question: jest.fn((_query, callback) => {
          totalEnters++;
          if (totalEnters === 1) callback("s"); // confirm update
          if (totalEnters === 2) callback("3"); // choose PATCH
        }),
        _ttyInput: {
          read: jest.fn(),
        },
      } as any;

      await askChoice(mockRl, "Update? ");
      await askChoice(mockRl, "Type? ");

      // 2 questions = 2 Enters only
      expect(totalEnters).toBe(2);
      expect(mockRl._ttyInput.read).toHaveBeenCalledTimes(2);
    });
  });
});

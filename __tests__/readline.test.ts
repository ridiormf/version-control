import { createInterface, question, closeInterface } from "../src/readline";
import * as readline from "readline";
import * as fs from "fs";

jest.mock("readline");
jest.mock("fs");

const mockedReadline = readline as jest.Mocked<typeof readline>;
const mockedFs = fs as jest.Mocked<typeof fs>;

describe("readline", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createInterface", () => {
    it("should create readline interface with stdin/stdout when /dev/tty fails", () => {
      const mockRl = {
        question: jest.fn(),
        close: jest.fn(),
        removeAllListeners: jest.fn(),
      };

      mockedFs.openSync.mockImplementation(() => {
        throw new Error("Cannot open /dev/tty");
      });

      mockedReadline.createInterface.mockReturnValue(mockRl as any);

      const rl = createInterface();

      expect(readline.createInterface).toHaveBeenCalledWith({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
      });
      expect(rl).toBeDefined();
    });

    it("should create readline interface with /dev/tty when available", () => {
      const mockRl = {
        question: jest.fn(),
        close: jest.fn(),
        removeAllListeners: jest.fn(),
      };

      const mockFd = 10;
      const mockInput = {} as any;
      const mockOutput = {} as any;

      mockedFs.openSync.mockReturnValue(mockFd);
      mockedFs.createReadStream.mockReturnValue(mockInput);
      mockedFs.createWriteStream.mockReturnValue(mockOutput);
      mockedReadline.createInterface.mockReturnValue(mockRl as any);

      const rl = createInterface();

      expect(fs.openSync).toHaveBeenCalledWith("/dev/tty", "r+");
      expect(fs.createReadStream).toHaveBeenCalled();
      expect(fs.createWriteStream).toHaveBeenCalled();
      expect(rl._ttyFd).toBe(mockFd);
    });
  });

  describe("question", () => {
    it("should ask question and return trimmed answer", async () => {
      const mockRl = {
        question: jest.fn((_query, callback) => {
          callback("  test answer  ");
        }),
      } as any;

      const answer = await question(mockRl, "What is your name?");

      expect(mockRl.question).toHaveBeenCalledWith(
        "What is your name?",
        expect.any(Function)
      );
      expect(answer).toBe("test answer");
    });

    it("should handle empty answers", async () => {
      const mockRl = {
        question: jest.fn((_query, callback) => {
          callback("   ");
        }),
      } as any;

      const answer = await question(mockRl, "Question?");

      expect(answer).toBe("");
    });
  });

  describe("closeInterface", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should close readline interface without TTY", async () => {
      const mockRl = {
        close: jest.fn(),
        removeAllListeners: jest.fn(),
        _ttyFd: undefined,
        _ttyInput: null,
        _ttyOutput: null,
      } as any;

      const closePromise = closeInterface(mockRl);
      jest.advanceTimersByTime(100);
      await closePromise;

      expect(mockRl.removeAllListeners).toHaveBeenCalled();
      expect(mockRl.close).toHaveBeenCalled();
    });

    it("should close readline interface with TTY resources", async () => {
      const mockInput = { destroy: jest.fn() } as any;
      const mockOutput = { destroy: jest.fn() } as any;
      const mockFd = 10;

      const mockRl = {
        close: jest.fn(),
        removeAllListeners: jest.fn(),
        _ttyFd: mockFd,
        _ttyInput: mockInput,
        _ttyOutput: mockOutput,
      } as any;

      mockedFs.closeSync.mockImplementation(() => {});

      const closePromise = closeInterface(mockRl);
      jest.advanceTimersByTime(100);
      await closePromise;

      expect(mockRl.removeAllListeners).toHaveBeenCalled();
      expect(mockRl.close).toHaveBeenCalled();
      expect(mockInput.destroy).toHaveBeenCalled();
      expect(mockOutput.destroy).toHaveBeenCalled();
      expect(fs.closeSync).toHaveBeenCalledWith(mockFd);
    });

    it("should handle errors when destroying streams", async () => {
      const mockInput = {
        destroy: jest.fn(() => {
          throw new Error("Destroy failed");
        }),
      } as any;
      const mockOutput = {
        destroy: jest.fn(() => {
          throw new Error("Destroy failed");
        }),
      } as any;

      const mockRl = {
        close: jest.fn(),
        removeAllListeners: jest.fn(),
        _ttyFd: 10,
        _ttyInput: mockInput,
        _ttyOutput: mockOutput,
      } as any;

      mockedFs.closeSync.mockImplementation(() => {});

      const closePromise = closeInterface(mockRl);
      jest.advanceTimersByTime(100);

      // Should not throw
      await expect(closePromise).resolves.toBeUndefined();
    });

    it("should handle errors when closing file descriptor", async () => {
      const mockRl = {
        close: jest.fn(),
        removeAllListeners: jest.fn(),
        _ttyFd: 10,
        _ttyInput: null,
        _ttyOutput: null,
      } as any;

      mockedFs.closeSync.mockImplementation(() => {
        throw new Error("Close failed");
      });

      const closePromise = closeInterface(mockRl);
      jest.advanceTimersByTime(100);

      // Should not throw
      await expect(closePromise).resolves.toBeUndefined();
    });
  });
});

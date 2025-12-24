import * as readline from "readline";
import * as fs from "fs";
import { ReadlineInterface } from "./types";

/**
 * Create readline interface that works in git hooks
 * @returns Readline interface
 */
export function createInterface(): ReadlineInterface {
  // Try to use /dev/tty if available (necessary for git hooks)
  let input: NodeJS.ReadStream = process.stdin;
  let output: NodeJS.WriteStream = process.stdout;
  let ttyFd: number | null = null;

  try {
    ttyFd = fs.openSync("/dev/tty", "r+");
    // autoClose: false to manually control closing the FD
    input = fs.createReadStream("", {
      fd: ttyFd,
      autoClose: false,
    }) as any;
    output = fs.createWriteStream("", {
      fd: ttyFd,
      autoClose: false,
    }) as any;
  } catch (e) {
    // If it fails, use default stdin/stdout
  }

  const rl = readline.createInterface({
    input,
    output,
    terminal: true,
  }) as ReadlineInterface;

  // Store FD and streams to close later
  rl._ttyFd = ttyFd ?? undefined;
  rl._ttyInput = input !== process.stdin ? input : null;
  rl._ttyOutput = output !== process.stdout ? output : null;

  return rl;
}

/**
 * Ask question to user
 * @param rl - Readline interface
 * @param query - Question to ask
 * @returns User's answer
 */
export function question(
  rl: ReadlineInterface,
  query: string
): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer: string) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Ask for menu choice (specific for option selection)
 * @param rl - Readline interface
 * @param query - Question to ask
 * @returns User's choice
 */
export function askChoice(
  rl: ReadlineInterface,
  query: string
): Promise<string> {
  return new Promise((resolve) => {
    // Flush any pending input
    if (rl._ttyInput && typeof (rl._ttyInput as any).read === "function") {
      try {
        (rl._ttyInput as any).read();
      } catch (error) {
        // Ignore errors during buffer flush
      }
    }

    rl.question(query, (answer: string) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Ask for text input (specific for commit message editing)
 * @param rl - Readline interface
 * @param query - Question to ask
 * @returns User's input
 */
export function askText(rl: ReadlineInterface, query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer: string) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Close readline interface and TTY resources
 * @param rl - Readline interface to close
 */
export async function closeInterface(rl: ReadlineInterface): Promise<void> {
  const ttyFd = rl._ttyFd;
  const ttyInput = rl._ttyInput;
  const ttyOutput = rl._ttyOutput;

  // 1. Close readline interface
  rl.removeAllListeners();
  rl.close();

  // 2. Wait for readline to process closure
  await new Promise((resolve) => setTimeout(resolve, 50));

  // 3. Close streams (don't close FD because of autoClose: false)
  if (ttyInput) {
    try {
      ttyInput.destroy();
    } catch (e) {
      // Ignore error
    }
  }
  if (ttyOutput) {
    try {
      ttyOutput.destroy();
    } catch (e) {
      // Ignore error
    }
  }

  // 4. Manually close file descriptor
  if (ttyFd !== undefined) {
    try {
      fs.closeSync(ttyFd);
    } catch (e) {
      // Ignore error
    }
  }
}

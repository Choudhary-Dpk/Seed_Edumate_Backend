import { spawn } from "child_process";
import path from "path";
import { PythonFetchResult } from "../types/program";
import { createTaskLogger } from "../utils/logger";

const log = createTaskLogger("python-runner");

const PYTHON_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const SCRIPT_PATH = path.join(process.cwd(), "src", "python", "tuition_fetcher.py", "program_master.py");

export type PythonErrorCode =
  | "TIMEOUT"
  | "SPAWN_ERROR"
  | "PYTHON_CRASH"
  | "SCRIPT_ERROR"
  | "INVALID_JSON";

export class PythonRunnerError extends Error {
  code: PythonErrorCode;

  constructor(code: PythonErrorCode, message: string) {
    super(message);
    this.name = "PythonRunnerError";
    this.code = code;
  }
}

export interface PythonRunResult {
  result: PythonFetchResult;
  executionTimeMs: number;
}

export interface ProgressInfo {
  phase: string;
  percent: number;
  message: string;
}

export function runTuitionFetcher(
  university: string,
  degreeType: string,
  studentType: string,
  onProgress?: (p: ProgressInfo) => void
): Promise<PythonRunResult> {
  return new Promise((resolve, reject) => {
    const pythonPath = process.env.PYTHON_PATH || "python3";
    const startTime = Date.now();

    const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
    log.start("Spawning tuition fetcher", { university, degreeType, studentType, pythonPath, hasApiKey });

    const args = [
      SCRIPT_PATH,
      "--university", university,
      "--degree", degreeType,
      "--student-type", studentType,
      "--json-output",
    ];

    const child = spawn(pythonPath, args, {
      env: {
        ...process.env,
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout.setEncoding('utf-8');
    child.stderr.setEncoding('utf-8');

    let stdout = "";
    let stderr = "";

    // Track which phases we've already emitted so we check against
    // the full accumulated stderr (handles markers split across chunks).
    // Phase markers are emitted on STDERR by the Python script in --json-output mode.
    // STDOUT is reserved for the final JSON result only.
    let lastPhaseIndex = -1;

    const PHASE_MARKERS: { pattern: string; phase: string; percent: number; message: string }[] = [
      { pattern: "PHASE 1: Discovering", phase: "discovering", percent: 10, message: "Discovering programs" },
      { pattern: "PHASE 2+3: Scraping", phase: "downloading", percent: 30, message: "Downloading sources" },
      { pattern: "\u{1F916} Extracting fees", phase: "extracting", percent: 60, message: "Extracting fees from sources" },
      { pattern: "PHASE 4+5: Mapping", phase: "mapping", percent: 85, message: "Mapping fees to programs" },
      { pattern: "PHASE 6: Normalizing", phase: "normalizing", percent: 95, message: "Finalizing results" },
    ];

    child.stdout.on("data", (data: Buffer) => {
      // STDOUT contains only the final JSON result
      stdout += data.toString();
    });

    child.stderr.on("data", (data: Buffer) => {
      // STDERR contains progress markers + any actual error output
      stderr += data.toString();

      // Detect phase transitions and notify caller
      if (onProgress) {
        for (let i = lastPhaseIndex + 1; i < PHASE_MARKERS.length; i++) {
          if (stderr.includes(PHASE_MARKERS[i].pattern)) {
            const m = PHASE_MARKERS[i];
            lastPhaseIndex = i;
            onProgress({ phase: m.phase, percent: m.percent, message: m.message });
          }
        }
      }
    });

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      const elapsed = Date.now() - startTime;
      log.fail("Python script timed out", { university, elapsed });
      reject(new PythonRunnerError("TIMEOUT", `Script timed out after ${PYTHON_TIMEOUT_MS}ms`));
    }, PYTHON_TIMEOUT_MS);

    child.on("error", (err) => {
      clearTimeout(timer);
      log.fail("Failed to spawn Python process", { error: err.message });
      reject(new PythonRunnerError("SPAWN_ERROR", `Failed to spawn process: ${err.message}`));
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      const executionTimeMs = Date.now() - startTime;

      // Note: stderr now contains progress output by design (Python prints
      // PHASE markers to stderr so we can stream them). Only log stderr
      // as a warning when the script actually failed.
      if (code !== 0) {
        log.fail("Python script exited with non-zero code", {
          code,
          university,
          stderr: stderr.trim().slice(-500), // last 500 chars are usually the error
        });
        reject(
          new PythonRunnerError(
            "PYTHON_CRASH",
            `Script exited with code ${code}: ${stderr.trim().slice(-500)}`
          )
        );
        return;
      }

      let parsed: PythonFetchResult;
      try {
        parsed = JSON.parse(stdout.trim());
      } catch {
        log.fail("Invalid JSON from Python script", { stdout: stdout.slice(0, 300) });
        reject(new PythonRunnerError("INVALID_JSON", "Script output is not valid JSON"));
        return;
      }

      if (parsed.error) {
        log.fail("Python script returned error", { message: parsed.error_message });
        reject(
          new PythonRunnerError(
            "SCRIPT_ERROR",
            parsed.error_message || "Unknown script error"
          )
        );
        return;
      }

      log.complete("Tuition fetcher completed", {
        university,
        programs: parsed.total_programs,
        duration: `${executionTimeMs}ms`,
      });

      resolve({ result: parsed, executionTimeMs });
    });
  });
}
import { createTaskLogger } from "../utils/logger";
import { runTuitionFetcher, PythonRunnerError } from "./pythonRunner";
import {
  markJobRunning,
  updateJobProgress,
  updateFetchRun,
  saveResult,
  getResultByFetchRunId,
} from "./programService";
import { jobEvents } from "./jobEventBus";

const log = createTaskLogger("job-processor");

export async function processJobAsync(
  fetchRunId: bigint,
  jobId: string,
  university: string,
  degree: string,
  studentType: string
): Promise<void> {
  try {
    // 1. Mark as running
    await markJobRunning(fetchRunId);

    // 2. Run the Python fetcher with progress tracking
    const { result, executionTimeMs } = await runTuitionFetcher(
      university,
      degree,
      studentType,
      async (p) => {
        // Update DB
        await updateJobProgress(fetchRunId, p.phase, p.percent, p.message).catch((err) =>
          log.warn("Failed to update job progress in DB", { error: err.message })
        );
        // Emit to SSE listeners
        jobEvents.emit(`job:${jobId}`, {
          phase: p.phase,
          progressPercent: p.percent,
          progressMessage: p.message,
        });
      }
    );

    // 3. Handle not-found
    if (!result.found) {
      await updateJobProgress(fetchRunId, "complete", 100, "No programs found");
      await updateFetchRun(fetchRunId, {
        status: "not_found",
        executionTimeMs,
        notes: result.reason ?? null,
      });
      jobEvents.emit(`job:${jobId}:complete`, { status: "not_found", data: result });
      return;
    }

    // 4. Save result to DB
    // Pass the original request so saveResult can:
    //   (a) store rows under the request's degree/student type (LLM normalizes inconsistently)
    //   (b) record the user's query as an alias for future cache hits
    const { status } = await saveResult(result, fetchRunId, {
      university,
      degreeType: degree,
      studentType,
    });

    // 5. Mark progress as complete
    await updateJobProgress(fetchRunId, "complete", 100, "Done").catch((err) =>
      log.warn("Failed to set final progress", { error: err.message })
    );

    // 6. Read back from DB for a consistent response
    const fresh = await getResultByFetchRunId(fetchRunId);
    const data = fresh?.data ?? result;

    jobEvents.emit(`job:${jobId}:complete`, { status, data });

    log.complete("Async job completed", { jobId, status, executionTimeMs });
  } catch (err: any) {
    const isPythonErr = err instanceof PythonRunnerError;
    const status = isPythonErr && err.code === "TIMEOUT" ? "timeout" : "failed";
    const errorMessage = err.message?.slice(0, 500) ?? "Unknown error";

    await updateFetchRun(fetchRunId, { status, errorMessage }).catch((e) =>
      log.warn("Failed to update fetch run after error", { error: e.message })
    );

    jobEvents.emit(`job:${jobId}:error`, { message: errorMessage, code: isPythonErr ? err.code : "UNKNOWN" });

    log.fail("Async job failed", { jobId, status, error: errorMessage });
  }
}
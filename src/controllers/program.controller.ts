import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { sendResponse } from "../utils/api";
import { createTaskLogger } from "../utils/logger";
import {
  getCachedResult,
  getResultByFetchRunId,
  createQueuedFetchRun,
  getJobByJobId,
  markJobTimedOut,
  buildWarnings,
} from "../services/programService";
import { processJobAsync } from "../services/jobProcessor";
import { jobEvents } from "../services/jobEventBus";

const log = createTaskLogger("programs");

const STALE_JOB_MS = 5 * 60 * 1000; // 5 minutes

const TERMINAL_STATUSES = ["success", "partial", "failed", "timeout", "not_found"];

const fetchSchema = z.object({
  university: z.string().min(2, "university must be at least 2 characters"),
  degree: z.string().optional().default("Undergraduate"),
  studentType: z.string().optional().default("International"),
  forceRefresh: z.boolean().optional().default(false),
});

// ---------------------------------------------------------------------------
// POST /api/programs/fetch
// ---------------------------------------------------------------------------

export const fetchPrograms = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = fetchSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendResponse(res, 400, "Validation failed", [], parsed.error.issues as any);
    }

    const { university, degree, studentType, forceRefresh } = parsed.data;

    // Check cache first
    if (!forceRefresh) {
      const cached = await getCachedResult(university, degree, studentType);
      if (cached) {
        log.info("Returning cached result", { university });
        const warnings = buildWarnings(cached.data);
        return sendResponse(res, 200, "Tuition data fetched successfully", {
          success: true,
          cached: true,
          fetchedAt: cached.fetchedAt.toISOString(),
          data: cached.data,
          warnings,
        });
      }
    }

    // Cache miss — create queued job and return immediately
    const { id: fetchRunId, jobId } = await createQueuedFetchRun({
      universityName: university,
      degreeType: degree,
      studentType,
    });

    // Fire and forget — do NOT await
    processJobAsync(fetchRunId, jobId, university, degree, studentType).catch((err) =>
      log.fail("Unhandled error in processJobAsync", { jobId, error: err.message })
    );

    return sendResponse(res, 202, "Fetch job queued", {
      success: true,
      cached: false,
      jobId,
      status: "queued",
    });
  } catch (error: any) {
    log.fail("Unhandled error in fetchPrograms", { error: error.message });
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/programs/jobs/:jobId
// ---------------------------------------------------------------------------

export const getJobStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId } = req.params;

    const job = await getJobByJobId(jobId);
    if (!job) {
      return sendResponse(res, 404, "Job not found", { jobId });
    }

    // Stale job check
    if (
      job.status === "running" &&
      job.startedAt &&
      Date.now() - job.startedAt.getTime() > STALE_JOB_MS
    ) {
      await markJobTimedOut(jobId);
      job.status = "timeout";
      job.errorMessage = "Exceeded 5-minute limit";
    }

    const response: Record<string, any> = {
      jobId,
      status: job.status,
      phase: job.phase,
      progressPercent: job.progressPercent,
      progressMessage: job.progressMessage,
    };

    // Include full result for terminal data statuses
    if (["success", "partial", "not_found"].includes(job.status)) {
      const result = await getResultByFetchRunId(job.id);
      if (result) {
        response.result = result.data;
      }
    }

    if (job.errorMessage) {
      response.errorMessage = job.errorMessage;
    }

    return sendResponse(res, 200, "Job status retrieved", response);
  } catch (error: any) {
    log.fail("Unhandled error in getJobStatus", { error: error.message });
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/programs/jobs/:jobId/stream  (SSE)
// ---------------------------------------------------------------------------

export const streamJobProgress = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const { jobId } = req.params;

  // SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const job = await getJobByJobId(jobId);

  if (!job) {
    res.write(`event: error\ndata: ${JSON.stringify({ message: "Job not found", code: "NOT_FOUND" })}\n\n`);
    res.end();
    return;
  }

  // Already terminal — emit final event and close
  if (TERMINAL_STATUSES.includes(job.status)) {
    let data: any = null;
    if (["success", "partial", "not_found"].includes(job.status)) {
      const result = await getResultByFetchRunId(job.id);
      if (result) data = result.data;
    }
    res.write(`event: complete\ndata: ${JSON.stringify({ status: job.status, data })}\n\n`);
    res.end();
    return;
  }

  // Running — emit last-known progress immediately so late subscribers see current state
  if (job.status === "running" && job.phase) {
    res.write(
      `event: progress\ndata: ${JSON.stringify({
        phase: job.phase,
        progressPercent: job.progressPercent,
        progressMessage: job.progressMessage,
      })}\n\n`
    );
  }

  // Subscribe to live events
  const onProgress = (p: any) => {
    res.write(`event: progress\ndata: ${JSON.stringify(p)}\n\n`);
  };

  const onComplete = (p: any) => {
    res.write(`event: complete\ndata: ${JSON.stringify(p)}\n\n`);
    cleanup();
    res.end();
  };

  const onError = (p: any) => {
    res.write(`event: error\ndata: ${JSON.stringify(p)}\n\n`);
    cleanup();
    res.end();
  };

  const cleanup = () => {
    jobEvents.removeListener(`job:${jobId}`, onProgress);
    jobEvents.removeListener(`job:${jobId}:complete`, onComplete);
    jobEvents.removeListener(`job:${jobId}:error`, onError);
  };

  jobEvents.on(`job:${jobId}`, onProgress);
  jobEvents.on(`job:${jobId}:complete`, onComplete);
  jobEvents.on(`job:${jobId}:error`, onError);

  req.on("close", cleanup);
};


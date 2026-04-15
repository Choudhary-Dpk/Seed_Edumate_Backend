import { Router } from "express";
import { authenticate } from "../middlewares";
import { AuthMethod } from "../types/auth";
import { fetchPrograms, getJobStatus, streamJobProgress } from "../controllers/program.controller";

const router = Router();

router.post(
  "/fetch",
  authenticate({ method: AuthMethod.API_KEY }),
  fetchPrograms
);

router.get(
  "/jobs/:jobId",
  authenticate({ method: AuthMethod.API_KEY }),
  getJobStatus
);

router.get(
  "/jobs/:jobId/stream",
  authenticate({ method: AuthMethod.API_KEY }),
  streamJobProgress
);

export { router as programRoutes };

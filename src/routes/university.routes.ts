import { Router } from "express";
import { authenticate } from "../middlewares";
import { AuthMethod } from "../types/auth";
import { searchUniversitiesController } from "../controllers/university.controller";

const router = Router();

router.get(
  "/search",
  authenticate({ method: AuthMethod.API_KEY }),
  searchUniversitiesController
);

export { router as universityRoutes };

import { Router } from "express";
import { getCurrencyConfigs } from "../controllers/index.controller";

const router = Router();

router.get("/currency-configs", getCurrencyConfigs)

export { router as masterRoutes };

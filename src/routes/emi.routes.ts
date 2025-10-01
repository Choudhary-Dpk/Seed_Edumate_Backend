import { Router } from "express";
import {
  createEligibilityCheckerLead,
  createEmiCalculatorLead,
} from "../controllers/emi.controller";
const router = Router();

router.post("/createEligibilityCheckerLead", createEligibilityCheckerLead);
router.post("createEmiCalculatorLead", createEmiCalculatorLead);

export { router as emiRoutes };

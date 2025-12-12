import { Router } from "express";
import * as gupshupController from "../controllers/gupshup.controller";

const router = Router();

router.post("/assignment-webhook", gupshupController.processAssignmentWebhook);
router.post("/send-otp", gupshupController.sendOtp);

export { router as gupshupRoutes };

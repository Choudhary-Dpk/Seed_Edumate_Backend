import { Router } from "express";
import { adminAuthRoutes } from "./adminAuth.routes";

const router = Router();

router.use("/auth", adminAuthRoutes)

export { router as adminRoutes };

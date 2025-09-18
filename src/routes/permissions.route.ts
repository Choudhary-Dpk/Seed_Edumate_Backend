import { Router } from "express";
import { getPermissions } from "../controllers/permissions.controller";
import { validateToken } from "../middlewares";

const router = Router();

router.get("/", validateToken(["Admin","Manager","User"]), getPermissions);

export { router as permissionsRoutes };

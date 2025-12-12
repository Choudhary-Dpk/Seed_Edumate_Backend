import { Router } from "express";
import { getPermissions } from "../controllers/permissions.controller";
import { authenticate } from "../middlewares";
import { AuthMethod } from "../types/auth";

const router = Router();

router.get(
  "/",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  getPermissions
);

export { router as permissionsRoutes };

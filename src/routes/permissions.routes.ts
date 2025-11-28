import { Router } from "express";
import { getPermissions } from "../controllers/permissions.controller";
import { authenticate, AuthMethod } from "../middlewares";

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

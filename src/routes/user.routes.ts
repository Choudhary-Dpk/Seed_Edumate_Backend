import { Router } from "express";
import {
  getAllUsers,
  createUser,
  getIpInfo,
  getProfile,
} from "../controllers/user.controller";
import authRoutes from "./auth.routes";
import { getRoles } from "../controllers/hubspot.controller";
import { authenticate } from "../middlewares";
import { createUserValidator } from "../middlewares/validators/validator";
import { AuthMethod } from "../types/auth";

const router = Router();

router.get("/", getAllUsers);

router.post("/", createUserValidator, createUser);

router.get("/ip-info", getIpInfo);
router.use("/auth", authRoutes);
router.get(
  "/profile",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin", "Manager", "User"],
  }),
  getProfile
);
router.get("/roles", getRoles);

export { router as userRoutes };

import { Router } from 'express';
import {
  getAllUsers,
  createUser,
  getIpInfo,
  getProfile,
} from "../controllers/user.controller";
import { createUserValidator } from "../validators/user.validator";
import authRoutes from "./auth.routes";
import { getRoles } from "../controllers/hubspot.controller";
import { validateToken } from "../middlewares";

const router = Router();

router.get("/", getAllUsers);

router.post("/", createUserValidator, createUser);

router.get("/ip-info", getIpInfo);
router.use("/auth", authRoutes);
router.get("/profile", validateToken(["Admin", "Manager", "User"]), getProfile);
router.get("/roles", getRoles);

export { router as userRoutes };

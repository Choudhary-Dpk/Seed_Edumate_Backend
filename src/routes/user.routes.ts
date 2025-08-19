import { Router } from 'express';
import { getAllUsers, createUser, getIpInfo } from '../controllers/user.controller';
import { createUserValidator } from '../validators/user.validator';
import authRoutes from "./auth.routes";
import { getRoles } from "../controllers/hubspot.controller";
import { validateApiKey } from "../middlewares";

const router = Router();

router.get("/", getAllUsers);

router.post("/", createUserValidator, createUser);

router.get("/ip-info", validateApiKey, getIpInfo);
router.use("/auth", authRoutes);
router.get("/roles", getRoles);

export { router as userRoutes };

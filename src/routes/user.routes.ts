import { Router } from 'express';
import { getAllUsers, createUser, getIpInfo } from '../controllers/user.controller';
import { createUserValidator } from '../validators/user.validator';
import authRoutes from "./auth.routes";
import { getPartnersList, getRoles } from "../controllers/hubspot.controller";

const router = Router();

router.get("/", getAllUsers);

router.post("/", createUserValidator, createUser);

router.get("/ip-info", getIpInfo);
router.use("/auth", authRoutes);
router.get("/partners", getPartnersList);
router.get("/roles", getRoles);

export { router as userRoutes };

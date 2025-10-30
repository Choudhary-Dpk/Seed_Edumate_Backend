import { Router } from "express";
import { adminAuthRoutes } from "./adminAuth.routes";
import { loanApplicationRouter } from "./loanApplication.routes";
import { contactRoutes } from "./contact.routes";
import { partnerRoutes } from "./partner.routes";
import { lenderRoutes } from "./lender.routes";

const router = Router();

router.use("/auth", adminAuthRoutes);
router.use("/loanApplications", loanApplicationRouter);
router.use("/contacts", contactRoutes);
router.use("/partners", partnerRoutes);
router.use("/lenders", lenderRoutes);

export { router as adminRoutes };

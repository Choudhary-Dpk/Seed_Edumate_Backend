import { Router } from "express";
import { adminAuthRoutes } from "./adminAuth.routes";
import { shortUrlRoutes } from "../shorturl.routes";
import { loanApplicationRouter } from "../loanApplication.routes";
import { contactRoutes } from "../contact.routes";
import { partnerRoutes } from "../partner.routes";
import { lenderRoutes } from "../lender.routes";
import { loanProuductRoutes } from "../loanProudct.routes";
import { commissionRoutes } from "../commission.routes";

const router = Router();

router.use("/auth", adminAuthRoutes);
router.use("/loanApplications", loanApplicationRouter);
router.use("/contacts", contactRoutes);
router.use("/partners", partnerRoutes);
router.use("/lenders", lenderRoutes);
router.use("/loanProduct", loanProuductRoutes);
router.use("/commission", commissionRoutes);
router.use("/shorturl", shortUrlRoutes);

export { router as adminRoutes };

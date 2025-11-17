import { Router } from "express";
import { adminAuthRoutes } from "./adminAuth.routes";
import { loanApplicationRouter } from "./loanApplication.routes";
import { contactRoutes } from "./contact.routes";
import { partnerRoutes } from "./partner.routes";
import { lenderRoutes } from "./lender.routes";
import { loanProuductRoutes } from "./loanProduct.route";
import { commissionRoutes } from "../commission.routes";

const router = Router();

router.use("/auth", adminAuthRoutes);
router.use("/loanApplications", loanApplicationRouter);
router.use("/contacts", contactRoutes);
router.use("/partners", partnerRoutes);
router.use("/lenders", lenderRoutes);
router.use("/loanProduct", loanProuductRoutes);
router.use("/commission", commissionRoutes);

export { router as adminRoutes };

import { Router } from "express";
import { validateAdminToken } from "../../middlewares";
import { getPartnersList } from "../../controllers/hubspot.controller";
import { createB2bPartner, updateB2bPartner, deletePartner, getB2bPartnerDetails, getB2bPartnersList, getLeadsByPartnerFieldsController } from "../../controllers/partner.controller";
import { checkDuplicateB2BPartnerFields } from "../../middlewares/partner.middleware";
import { validateId, validateReqParams } from "../../middlewares/validators/validator";

const router = Router();

router.get("/list", getPartnersList);
router.post(
  "/",
  validateAdminToken(["Admin"]),
  checkDuplicateB2BPartnerFields,
  createB2bPartner
);
router.put(
  "/:id",
  validateAdminToken(["Admin"]),
  validateId(),
  validateReqParams,
  updateB2bPartner
);
router.delete(
  "/:id",
  validateAdminToken(["Admin"]),
  validateId(),
  validateReqParams,
  deletePartner
);
router.get(
  "/details/:id",
  validateAdminToken(["Admin"]),
  validateId(),
  validateReqParams,
  getB2bPartnerDetails
);
router.get(
  "/pagination",
  validateAdminToken(["Admin"]),
  getB2bPartnersList
);
router.get("/filter", getLeadsByPartnerFieldsController);

export { router as partnerRoutes };
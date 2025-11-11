import { Router } from "express";
import { getPartnersList } from "../controllers/hubspot.controller";
import { validateApiKey } from "../middlewares";
import {
  createB2bPartner,
  deletePartner,
  getB2bPartnerDetails,
  getB2bPartnersList,
  getLeadsByPartnerFieldsController,
  updateB2bPartner,
} from "../controllers/partner.controller";
import {
  validateId,
  validateReqParams,
} from "../middlewares/validators/validator";
import { checkDuplicateB2BPartnerFields } from "../middlewares/partner.middleware";

const router = Router();

router.get("/list", getPartnersList);
router.post(
  "/",
  validateApiKey,
  checkDuplicateB2BPartnerFields,
  createB2bPartner
);
router.put(
  "/:id",
  validateApiKey,
  validateId(),
  validateReqParams,
  updateB2bPartner
);
router.delete(
  "/:id",
  validateApiKey,
  validateId(),
  validateReqParams,
  deletePartner
);
router.get(
  "/details/:id",
  validateApiKey,
  validateId(),
  validateReqParams,
  getB2bPartnerDetails
);
router.get("/pagination", validateApiKey, getB2bPartnersList);
router.get("/filter", getLeadsByPartnerFieldsController);

export { router as partnerRoutes };

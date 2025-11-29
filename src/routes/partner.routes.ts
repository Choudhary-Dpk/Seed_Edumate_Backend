import { Router } from "express";
import { getPartnersList } from "../controllers/hubspot.controller";
import { authenticate, AuthMethod, validateApiKey } from "../middlewares";
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
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  checkDuplicateB2BPartnerFields,
  createB2bPartner
);
router.put(
  "/:id",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  validateId(),
  validateReqParams,
  updateB2bPartner
);
router.delete(
  "/:id",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  validateId(),
  validateReqParams,
  deletePartner
);
router.get(
  "/details/:id",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  validateId(),
  validateReqParams,
  getB2bPartnerDetails
);
router.get(
  "/pagination",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  getB2bPartnersList
);
router.get("/filter", getLeadsByPartnerFieldsController);

export { router as partnerRoutes };

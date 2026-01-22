import { Router } from "express";
import { authenticate } from "../middlewares";
import {
  createB2bPartner,
  deletePartner,
  getB2bPartnerDetails,
  getB2bPartnersList,
  getLeadsByPartnerFieldsController,
  getPartnersList,
  updateB2bPartner,
  upsertUniversityController,
} from "../controllers/partner.controller";
import {
  validateId,
  validateReqParams,
} from "../middlewares/validators/validator";
import { checkDuplicateB2BPartnerFields } from "../middlewares/partner.middleware";
import { AuthMethod } from "../types/auth";

const router = Router();

router.get("/list", getPartnersList);
router.post(
  "/",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  checkDuplicateB2BPartnerFields,
  createB2bPartner,
);
router.put(
  "/:id",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  validateId(),
  validateReqParams,
  updateB2bPartner,
);
router.delete(
  "/:id",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  validateId(),
  validateReqParams,
  deletePartner,
);
router.get(
  "/details/:id",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  validateId(),
  validateReqParams,
  getB2bPartnerDetails,
);
router.get(
  "/pagination",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  getB2bPartnersList,
);
router.get("/filter", getLeadsByPartnerFieldsController);
router.put(
  "/pulse/university",
  authenticate({
    method: AuthMethod.API_KEY,
  }),
  upsertUniversityController,
);

export { router as partnerRoutes };

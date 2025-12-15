import { Router } from "express";
import { authenticate } from "../../middlewares";
import { getPartnersList } from "../../controllers/hubspot.controller";
import {
  createB2bPartner,
  updateB2bPartner,
  deletePartner,
  getB2bPartnerDetails,
  getB2bPartnersList,
  getLeadsByPartnerFieldsController,
} from "../../controllers/partner.controller";
import { checkDuplicateB2BPartnerFields } from "../../middlewares/partner.middleware";
import {
  validateId,
  validateReqParams,
} from "../../middlewares/validators/validator";
import { AuthMethod } from "../../types/auth";

const router = Router();

router.get("/list", getPartnersList);
router.post(
  "/",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  checkDuplicateB2BPartnerFields,
  createB2bPartner
);
router.put(
  "/:id",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  validateId(),
  validateReqParams,
  updateB2bPartner
);
router.delete(
  "/:id",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  validateId(),
  validateReqParams,
  deletePartner
);
router.get(
  "/details/:id",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  validateId(),
  validateReqParams,
  getB2bPartnerDetails
);
router.get(
  "/pagination",
  authenticate({
    method: AuthMethod.JWT,
    allowedRoles: ["Admin"],
  }),
  getB2bPartnersList
);
router.get("/filter", getLeadsByPartnerFieldsController);

export { router as partnerRoutes };

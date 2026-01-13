import { NextFunction, Response } from "express";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import { sendResponse } from "../utils/api";
import {
  getContactLeadById,
  getEdumateContactByEmail,
  getEdumateContactByPhone,
} from "../models/helpers/contact.helper";

export const validateContactsLeadPayload = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, phone_number } = req.body;

    const existingLead = await getEdumateContactByEmail(email);
    if (existingLead && existingLead.is_deleted === false) {
      return sendResponse(res, 400, "Lead already exists");
    }

    const existingContact = await getEdumateContactByPhone(phone_number);
    if (existingContact && existingContact.is_deleted === false) {
      return sendResponse(res, 400, "Phone number already exists");
    }

    next();
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Error while creating contact leads");
  }
};

export const validateContactLeadById = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const leadDetails = await getContactLeadById(+id);
    if (!leadDetails || leadDetails.is_deleted === true) {
      return sendResponse(res, 404, "Lead not found");
    }

    next();
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Error while validating lead id");
  }
};

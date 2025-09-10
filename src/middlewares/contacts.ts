import { NextFunction,Response } from "express";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import { sendResponse } from "../utils/api";
import * as hubspotService from "../services/hubspot.service";
import { getEdumateContactByEmail, getEdumateContactByPhone } from "../models/helpers/contacts";

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
    console.log("existingContact",existingContact)
    if (existingContact && existingContact.is_deleted === false) {
      return sendResponse(res, 400, "Phone number already exists");
    }

    next();
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Error while creating contact leads");
  }
};
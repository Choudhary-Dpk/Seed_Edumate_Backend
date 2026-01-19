import { NextFunction, Response } from "express";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import { sendResponse } from "../utils/api";
import {
  getContactLeadById,
  getEdumateContactByEmail,
  getEdumateContactByEmailAndPartnerId,
  getEdumateContactByPhone,
  getEdumateContactByPhoneAndPartnerId,
} from "../models/helpers/contact.helper";
import logger from "../utils/logger";
import { getPartnerIdByUserId } from "../models/helpers/partners.helper";

export const validateContactsLeadPayload = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, phone_number } = req.body;
    const id = req.payload?.id || null;
    let partnerId = req?.body?.b2b_partner_db_id || null;

    if (!partnerId && id) {
      logger.debug(`Fetching partner id from request`);
      partnerId = (await getPartnerIdByUserId(id))?.b2b_id || null;
      logger.debug(`Partner id fetched successfully`);
    }

    const existingLead = await getEdumateContactByEmailAndPartnerId(email, partnerId);
    if (existingLead && existingLead.is_deleted === false) {
      return sendResponse(res, 400, "Lead already exists");
    }

    const existingContact = await getEdumateContactByPhoneAndPartnerId(phone_number, partnerId);
    if (existingContact && existingContact.is_deleted === false) {
      return sendResponse(res, 400, "Lead already exists");
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


/**
 * Middleware to validate JSON payload for bulk contact import
 */
export const validateContactsJSONPayload = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { contacts } = req.body;

    // Check if contacts array exists
    if (!contacts) {
      return sendResponse(res, 400, "Missing 'contacts' array in request body");
    }

    // Check if contacts is an array
    if (!Array.isArray(contacts)) {
      return sendResponse(res, 400, "'contacts' must be an array");
    }

    // Check if array is empty
    if (contacts.length === 0) {
      return sendResponse(res, 400, "Contacts array cannot be empty");
    }

    // Check maximum allowed records (prevent overload)
    const MAX_RECORDS = 10000;
    if (contacts.length > MAX_RECORDS) {
      return sendResponse(
        res,
        400,
        `Maximum ${MAX_RECORDS} contacts allowed per request. You provided ${contacts.length}.`
      );
    }

    // Basic validation of first contact to ensure proper structure
    const firstContact = contacts[0];
    if (typeof firstContact !== "object" || firstContact === null) {
      return sendResponse(
        res,
        400,
        "Each contact must be an object with properties"
      );
    }

    // Transform the contacts array to match CSV format expected by validateContactRows
    // This allows us to reuse existing validation logic
    const transformedContacts = contacts.map((contact: any) => ({
      "First Name": contact.firstName || contact.first_name,
      "Last Name": contact.lastName || contact.last_name,
      Email: contact.email,
      "Phone Number": contact.phone || contact.phoneNumber || contact.phone_number,
      "Intake Year": contact.intakeYear || contact.intake_year,
      Gender: contact.gender,
      "B2B Partner Name":
        contact.partnerName || contact.b2bPartnerName || contact.b2b_partner_name,
      "Course Type": contact.courseType || contact.course_type,
      "Date of Birth": contact.dateOfBirth || contact.date_of_birth,
      "Preferred Study Destination":
        contact.studyDestination ||
        contact.preferredStudyDestination ||
        contact.preferred_study_destination,
      "Target Degree Level":
        contact.targetDegreeLevel || contact.target_degree_level,
      "Intake Month": contact.intakeMonth || contact.intake_month,
      "Admission Status": contact.admissionStatus || contact.admission_status,
      "Current Education Level":
        contact.educationLevel ||
        contact.currentEducationLevel ||
        contact.current_education_level,
    }));

    // Attach transformed data to request for controller
    req.body.transformedContacts = transformedContacts;
    req.body.totalRecords = contacts.length;

    next();
  } catch (error) {
    console.error("Error in validateContactsJSONPayload:", error);
    sendResponse(res, 500, "Error while validating JSON payload");
  }
};

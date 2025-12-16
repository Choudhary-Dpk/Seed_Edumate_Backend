import { Response, NextFunction, Request } from "express";
import logger from "../../utils/logger";

import {
  createEdumateContact,
  createEdumateAcademicProfile,
  createEdumateLeadAttribution,
  createEdumatePersonalInformation,
  createEdumateSystemTracking,
  updateEdumateContact,
  updateEdumatePersonalInformation,
  updateEdumateAcademicProfile,
  updateEdumateLeadAttribution,
  getEdumateContactByEmail,
  updateEdumateContactSystemTracking,
  updateEdumateContactApplicationJourney,
  updateEdumateContactLoanPreference,
  updateEdumateContactFinancialInfo,
  getEdumateContactByPhone,
  createApplicationJourney,
  createFinancialInfo,
  createLoanPreferences,
} from "../../models/helpers/contact.helper";
import { handleLeadCreation } from "../../services/DBServices/loan.services";
import { sendResponse } from "../../utils/api";
import {
  createStudentUser,
  findStudentByPhoneNumber,
  getStudentForUpdate,
  getStudentProfileById,
  getUpdatedStudentProfile,
  updateContactUser,
  updateStudentFavouriteInterested,
  validateLoanProductIds,
} from "../../models/helpers/student.helper";
import { mapAllFields } from "../../mappers/edumateContact/mapping";
import { categorizeByTable } from "../../services/DBServices/edumateContacts.service";
import prisma from "../../config/prisma";

export const studentSignupController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, formType, phoneNumber, full_name } = req.body;
    let data: any = {};
    let leadAttribution: any;
    // 1. Map fields to internal structure
    const mappedFields = await mapAllFields(req.body);
    const categorized = categorizeByTable(mappedFields);

    let existingContactDb = null;
    if (phoneNumber) {
      existingContactDb = await getEdumateContactByPhone(phoneNumber);
    } else if (email) {
      existingContactDb = await getEdumateContactByEmail(email);
    }

    let result;

    // -----------------------------
    // UPDATE FLOW
    // -----------------------------
    if (existingContactDb?.id) {
      const leadId = existingContactDb.id;

      data.contact = {
        ...(categorized["mainContact"] || {}),
        ...(categorized["personalInformation"] || {}),
        ...(categorized["academicProfile"] || {}),
        ...(categorized["leadAttribution"] || {}),
        ...(categorized["applicationJourney"] || {}),
        ...(categorized["financialInfo"] || {}),
        ...(categorized["loanPreferences"] || {}),
      };

      result = await prisma.$transaction(
        async (tx: any) => {
          const contact = await updateEdumateContact(
            tx,
            leadId,
            categorized["mainContact"]
          );

          await updateEdumatePersonalInformation(
            tx,
            contact.id,
            categorized["personalInformation"]
          );

          await updateEdumateContactApplicationJourney(
            tx,
            contact.id,
            categorized["applicationJourney"]
          );

          await updateEdumateContactFinancialInfo(
            tx,
            contact.id,
            categorized["financialInfo"]
          );

          await updateEdumateContactLoanPreference(
            tx,
            contact.id,
            categorized["loanPreferences"]
          );

          await updateEdumateAcademicProfile(
            tx,
            contact.id,
            categorized["academicProfile"]
          );

          await updateEdumateLeadAttribution(
            tx,
            contact.id,
            categorized["leadAttribution"]
          );

          return contact;
        },
        { timeout: 180000 }
      );
    }

    // -----------------------------
    // CREATE FLOW
    // -----------------------------
    else {
      result = await prisma.$transaction(
        async (tx: any) => {
          const contact = await createEdumateContact(
            tx,
            categorized["mainContact"]
          );

          const personalInfo = await createEdumatePersonalInformation(
            tx,
            contact.id,
            categorized["personalInformation"]
          );

          const academicsProfile = await createEdumateAcademicProfile(
            tx,
            contact.id,
            categorized["academicProfile"]
          );

          leadAttribution = await createEdumateLeadAttribution(
            tx,
            contact.id,
            categorized["leadAttribution"]
          );

          const application = await createApplicationJourney(
            tx,
            contact.id,
            categorized["applicationJourney"]
          );

          const financial = await createFinancialInfo(
            tx,
            contact.id,
            categorized["financialInfo"]
          );

          const loanPreference = await createLoanPreferences(
            tx,
            contact.id,
            categorized["loanPreferences"]
          );

          const systemTracking = await createEdumateSystemTracking(
            tx,
            contact.id
          );

          data.contact = {
            ...personalInfo,
            ...academicsProfile,
            ...leadAttribution,
            ...application,
            ...financial,
            ...loanPreference,
            ...systemTracking,
          };

          return contact;
        },
        { timeout: 180000 }
      );
    }

    // -----------------------------
    // ALWAYS CREATE/UPSERT STUDENT USER
    // -----------------------------

    const studentUser = await createStudentUser(
      result.id,
      email,
      phoneNumber,
      full_name
    );

    data.student = studentUser;

    // -----------------------------
    // HANDLE LEAD CREATION
    // -----------------------------

    if (result?.id && formType) {
      await handleLeadCreation(result.id, formType, email);
    }

    logger.debug(`Signup flow completed for contactId: ${result.id}`);

    return sendResponse(res, 200, "Student signup successfully", data);
  } catch (error) {
    next(error);
  }
};

export const studentSigninController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phoneNumber } = req.body;

    // Validate phone number
    if (!phoneNumber) {
      return sendResponse(res, 400, "Phone number is required");
    }

    // Get student and contact data using helper
    const data = await findStudentByPhoneNumber(phoneNumber);

    return sendResponse(res, 200, "Student logged in successfully", data);
  } catch (error: any) {
    next(error);
  }
};

export const studentProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Validate student_id
    if (!id) {
      return sendResponse(res, 400, "Student ID is required");
    }

    // Convert student_id to number
    const studentId = parseInt(id, 10);

    // Check if student_id is a valid number
    if (isNaN(studentId)) {
      return sendResponse(res, 400, "Invalid student ID format");
    }

    // Get student and contact data using helper
    const data = await getStudentProfileById(studentId);

    return sendResponse(res, 200, "Student profile fetched successfully", data);
  } catch (error: any) {
    next(error);
  }
};

export const updateStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId } = req.body;
    const updateData = req.body;

    // Validate student_id
    if (!studentId) {
      return sendResponse(res, 400, "Student ID is required");
    }

    // Convert student_id to number
    const studentIdNumber = parseInt(studentId, 10);

    // Check if student_id is a valid number
    if (isNaN(studentIdNumber)) {
      return sendResponse(res, 400, "Invalid student ID format");
    }

    // Validate request body
    if (!updateData || Object.keys(updateData).length === 0) {
      return sendResponse(res, 400, "No update data provided");
    }

    // Map and categorize fields
    const mappedFields = await mapAllFields(req.body);
    console.log("mappedFields", mappedFields);
    const categorized = categorizeByTable(mappedFields);
    console.log("categorized", categorized);

    // Get student and validate
    const student = await getStudentForUpdate(studentId);

    // Validate loan product IDs if provided
    let validationResults: {
      favourite: { valid: number[]; invalid: number[] };
      interested: { valid: number[]; invalid: number[] };
    } = {
      favourite: { valid: [], invalid: [] },
      interested: { valid: [], invalid: [] },
    };

    if (updateData.favourite && updateData.favourite.length > 0) {
      validationResults.favourite = await validateLoanProductIds(
        updateData.favourite
      );
    }

    if (updateData.interested && updateData.interested.length > 0) {
      validationResults.interested = await validateLoanProductIds(
        updateData.interested
      );
    }

    // Check if there are any invalid IDs
    const hasInvalidIds =
      validationResults.favourite.invalid.length > 0 ||
      validationResults.interested.invalid.length > 0;

    if (hasInvalidIds) {
      const errorMessage = [];
      if (validationResults.favourite.invalid.length > 0) {
        errorMessage.push(
          `Invalid favourite loan product IDs: ${validationResults.favourite.invalid.join(
            ", "
          )}`
        );
      }
      if (validationResults.interested.invalid.length > 0) {
        errorMessage.push(
          `Invalid interested loan product IDs: ${validationResults.interested.invalid.join(
            ", "
          )}`
        );
      }
      return sendResponse(res, 400, errorMessage.join(". "));
    }

    // Prepare ContactUsers update data
    const contactUserUpdateData: any = {};

    // Check if email, full_name, or phone are in the request (ContactUsers fields)
    if (updateData.email !== undefined) {
      contactUserUpdateData.email = updateData.email;
    }
    if (updateData.full_name !== undefined) {
      contactUserUpdateData.full_name = updateData.full_name;
    }
    if (updateData.phone !== undefined) {
      contactUserUpdateData.phone = updateData.phone;
    }
    if (updateData.favourite !== undefined) {
      contactUserUpdateData.favourite =
        validationResults.favourite.valid.length > 0
          ? validationResults.favourite.valid
          : updateData.favourite;
    }
    if (updateData.interested !== undefined) {
      contactUserUpdateData.interested =
        validationResults.interested.valid.length > 0
          ? validationResults.interested.valid
          : updateData.interested;
    }

    if (!categorized.mainContact) {
      categorized.mainContact = {};
    }

    // Add favourite to mainContact for HSEdumateContacts update
    if (updateData.favourite !== undefined) {
      (categorized.mainContact as any).favourite =
        validationResults.favourite.valid.length > 0
          ? validationResults.favourite.valid
          : updateData.favourite;
    }

    // Add interested to mainContact for HSEdumateContacts update
    if (updateData.interested !== undefined) {
      (categorized.mainContact as any).interested =
        validationResults.interested.valid.length > 0
          ? validationResults.interested.valid
          : updateData.interested;
    }

    // Use transaction for atomic updates
    await prisma.$transaction(async (tx) => {
      // Update ContactUsers table (email, full_name, phone, favourite, interested)
      if (Object.keys(contactUserUpdateData).length > 0) {
        await updateContactUser(studentId, contactUserUpdateData);
      }

      // Update edumate contact tables using categorized data
      // NOTE: This will now include favourite and interested fields
      if (
        categorized.mainContact &&
        Object.keys(categorized.mainContact).length > 0
      ) {
        await updateEdumateContact(
          tx,
          student.contact_id,
          categorized.mainContact
        );
      }

      if (
        categorized.personalInformation &&
        Object.keys(categorized.personalInformation).length > 0
      ) {
        await updateEdumatePersonalInformation(
          tx,
          student.contact_id,
          categorized.personalInformation
        );
      }

      if (
        categorized.academicProfile &&
        Object.keys(categorized.academicProfile).length > 0
      ) {
        await updateEdumateAcademicProfile(
          tx,
          student.contact_id,
          categorized.academicProfile
        );
      }

      if (
        categorized.leadAttribution &&
        Object.keys(categorized.leadAttribution).length > 0
      ) {
        await updateEdumateLeadAttribution(
          tx,
          student.contact_id,
          categorized.leadAttribution
        );
      }

      // Add support for other categorized tables if needed
      if (
        categorized.financialInfo &&
        Object.keys(categorized.financialInfo).length > 0
      ) {
        await updateEdumateContactFinancialInfo(
          tx,
          student.contact_id,
          categorized.financialInfo
        );
      }

      if (
        categorized.loanPreferences &&
        Object.keys(categorized.loanPreferences).length > 0
      ) {
        await updateEdumateContactLoanPreference(
          tx,
          student.contact_id,
          categorized.loanPreferences
        );
      }

      if (
        categorized.applicationJourney &&
        Object.keys(categorized.applicationJourney).length > 0
      ) {
        await updateEdumateContactApplicationJourney(
          tx,
          student.contact_id,
          categorized.applicationJourney
        );
      }

      if (
        categorized.systemTracking &&
        Object.keys(categorized.systemTracking).length > 0
      ) {
        await updateEdumateContactSystemTracking(
          tx,
          student.contact_id,
          categorized.systemTracking
        );
      }
    });

    // Fetch updated student and contact data
    const data = await getUpdatedStudentProfile(studentId, student.contact_id);

    return sendResponse(res, 200, "Student profile updated successfully", data);
  } catch (error: any) {
    next(error);
  }
};

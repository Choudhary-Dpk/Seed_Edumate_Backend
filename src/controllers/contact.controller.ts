import { NextFunction, Response, Request } from "express";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import logger from "../utils/logger";
import { sendResponse } from "../utils/api";
import {
  createContactsLoanLeads,
  createEdumateContactsLeads,
  deleteHubspotByContactsLeadId,
  updateContactsLoanLead,
} from "../services/hubspot.service";
import prisma from "../config/prisma";
import {
  deleteContactsLoan,
  getContactsLead,
  getHubspotByContactLeadId,
  createEdumateContact,
  createEdumateAcademicProfile,
  createEdumateLeadAttribution,
  createEdumatePersonalInformation,
  createEdumateSystemTracking,
  updateEdumateContact,
  updateEdumatePersonalInformation,
  updateEdumateAcademicProfile,
  updateEdumateLeadAttribution,
  fetchContactsLeadList,
  createCSVContacts,
  updateContactsSystemTracking,
} from "../models/helpers/contact.helper";
import { resolveLeadsCsvPath } from "../utils/leads";
import { FileData } from "../types/leads.types";
import {
  deduplicateContactsInDb,
  deduplicateContactsInFile,
  validateContactRows,
} from "../utils/helper";
import {
  addFileRecord,
  addFileType,
  updateFileRecord,
} from "../models/helpers";
import { getPartnerIdByUserId } from "../models/helpers/partners.helper";

export const createContactsLead = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.payload!;
    const {
      intake_year,
      intake_month,
      preferred_study_destination,
      date_of_birth,
      gender,
      course_type,
      target_degree_level,
      admission_status,
      current_education_level,
      b2b_partner_name,
      last_name,
      first_name,
      phone_number,
      email,
    } = req.body;
    let data: any = {};
    let leadAttribution: any;

    logger.debug(`Fetching partner id from request`);
    const partnerId = await getPartnerIdByUserId(id);
    logger.debug(`Partner id fetched successfully`);

    logger.debug(`Creating hubspot edumate contacts leads application`);
    const lead = await createEdumateContactsLeads([
      {
        email,
        phone: phone_number,
        firstName: first_name,
        lastName: last_name,
        partnerName: b2b_partner_name,
        educationLevel: current_education_level,
        admissionStatus: admission_status,
        targetDegreeLevel: target_degree_level,
        courseType: course_type,
        studyDestination: preferred_study_destination,
        dateOfBirth: date_of_birth,
        gender,
        intakeYear: intake_year,
        intakeMonth: intake_month,
      },
    ]);
    logger.debug(`Hubspot loan contacts leads created successfully`);

    // Use database transaction to ensure all related records are created atomically
    const result = await prisma.$transaction(async (tx) => {
      logger.debug(`Creating edumate contact for userId: ${id}`);
      const contact = await createEdumateContact(
        tx,
        course_type,
        lead[0]?.id,
        id,
        partnerId!.id
      );
      logger.debug(`Contact created successfully with id: ${contact.id}`);

      logger.debug(`Creating personal information for contact: ${contact.id}`);
      const personalInfo = await createEdumatePersonalInformation(
        tx,
        contact.id,
        {
          first_name,
          last_name,
          email,
          phone_number,
          date_of_birth,
          gender,
        }
      );
      logger.debug(
        `Personal information created successfully for contact: ${contact.id}`
      );

      logger.debug(`Creating academic profile for contact: ${contact.id}`);
      const academicsProfile = await createEdumateAcademicProfile(
        tx,
        contact.id,
        {
          admission_status,
          current_education_level,
          target_degree_level,
          preferred_study_destination,
          intake_year,
          intake_month,
        }
      );
      logger.debug(
        `Academic profile created successfully for contact: ${contact.id}`
      );

      if (b2b_partner_name) {
        logger.debug(`Creating lead attribution for contact: ${contact.id}`);
        leadAttribution = await createEdumateLeadAttribution(
          tx,
          contact.id,
          b2b_partner_name
        );
        logger.debug(
          `Lead attribution created successfully for contact: ${contact.id}`
        );
      }

      logger.debug(`Creating system tracking for contact: ${contact.id}`);
      await createEdumateSystemTracking(tx, contact.id, id);
      logger.debug(
        `System tracking created successfully for contact: ${contact.id}`
      );

      data = {
        contact: {
          ...contact,
        },
        personalInfo: {
          ...personalInfo,
        },
        academicsProfile: {
          ...academicsProfile,
        },
        leadAttribution: {
          ...leadAttribution,
        },
      };

      return contact;
    });

    logger.debug(
      `All contact data created successfully for contactId: ${result.id}`
    );
    sendResponse(res, 200, "Contacts Lead created successfully", data);
  } catch (error) {
    next(error);
  }
};

export const deleteContactLead = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.payload!;
    const leadId = req.params.id;

    logger.debug(`Fethcing hubspot details by leadId: ${leadId}`);
    const lead = await getHubspotByContactLeadId(+leadId);
    logger.debug(`Hubspot details fetched successfully`);

    logger.debug(`Deleting hubspot lead details for id: ${lead?.hs_object_id}`);
    await deleteHubspotByContactsLeadId(lead?.hs_object_id!);
    logger.debug(`Hubspot contact leads deleted successfully`);

    logger.debug(`Deleting contact leads for userId: ${id}`);
    await deleteContactsLoan(+leadId, id);
    logger.debug(`Contact leads deleted successfully`);

    sendResponse(res, 200, "Lead deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const getContactsLeadDetails = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const leadId = req.params.id;

    logger.debug(`Fetching contacts lead details for id: ${leadId}`);
    const leadDetails = await getContactsLead(+leadId);
    logger.debug(`Lead details fetched successfully`);

    sendResponse(res, 200, "Lead details fetched successfully", leadDetails);
  } catch (error) {
    next(error);
  }
};

export const editContactsLead = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.payload!;
    const leadId = req.params.id;
    const {
      intake_year,
      intake_month,
      preferred_study_destination,
      date_of_birth,
      gender,
      course_type,
      target_degree_level,
      admission_status,
      current_education_level,
      b2b_partner_name,
      last_name,
      first_name,
      phone_number,
      email,
    } = req.body;

    logger.debug(`Fethcing hubspot details by leadId: ${leadId}`);
    const lead = await getHubspotByContactLeadId(+leadId);
    logger.debug(`Hubspot details fetched successfully`);

    logger.debug(`Updating hubspot loan application`);
    await updateContactsLoanLead(lead?.hs_object_id!, {
      email,
      phone: phone_number,
      firstName: first_name,
      lastName: last_name,
      partnerName: b2b_partner_name,
      educationLevel: current_education_level,
      admissionStatus: admission_status,
      targetDegreeLevel: target_degree_level,
      courseType: course_type,
      studyDestination: preferred_study_destination,
      dateOfBirth: date_of_birth ? new Date(date_of_birth) : undefined,
      gender,
      intakeYear: intake_year,
      intakeMonth: intake_month,
    });
    logger.debug(`Hubspot loan application updated successfully`);

    await prisma.$transaction(async (tx) => {
      logger.debug(`Updating edumate contact for userId: ${id}`);
      const contact = await updateEdumateContact(tx, +leadId, course_type);
      logger.debug(`Contact udpated successfully with id: ${contact.id}`);

      logger.debug(`Updating personal information for contact: ${contact.id}`);
      await updateEdumatePersonalInformation(tx, contact.id, {
        first_name,
        last_name,
        email,
        phone_number,
        date_of_birth,
        gender,
      });
      logger.debug(
        `Personal information updated successfully for contact: ${contact.id}`
      );

      logger.debug(`Updating academic profile for contact: ${contact.id}`);
      await updateEdumateAcademicProfile(tx, contact.id, {
        admission_status,
        current_education_level,
        target_degree_level,
        preferred_study_destination,
        intake_year,
        intake_month,
      });
      logger.debug(
        `Academic profile updated successfully for contact: ${contact.id}`
      );

      if (b2b_partner_name) {
        logger.debug(`Updating lead attribution for contact: ${contact.id}`);
        await updateEdumateLeadAttribution(tx, contact.id, b2b_partner_name);
        logger.debug(
          `Lead attribution updated successfully for contact: ${contact.id}`
        );
      }

      return contact;
    });

    sendResponse(res, 200, "Lead updated successfully");
  } catch (error) {
    next(error);
  }
};

export const getContactsLeadsList = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const size = Number(req.query.size) || 10;
    const page = Number(req.query.page) || 1;
    const search = (req.query.search as string) || null;
    const sortKey = (req.query.sortKey as string) || null;
    const sortDir = (req.query.sortDir as "asc" | "desc") || null;

    const offset = size * (page - 1);

    logger.debug(`Fetching partner id from request`);
    const partnerId = await getPartnerIdByUserId(req.payload!.id);
    logger.debug(`Partner id fetched successfully`);

    logger.debug(`Fetching leads list with pagination and filters`);
    const list = await fetchContactsLeadList(
      size,
      offset,
      sortKey,
      sortDir,
      search,
      partnerId!.id
    );
    logger.debug(`Leads list fetched successfully`);

    sendResponse(res, 200, "Leads list fetched successfully", {
      total: list.count,
      page,
      size,
      data: list.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadContactsTemplate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filePath = resolveLeadsCsvPath("contacts.csv");
    console.log("filePath", filePath);
    // Download as contacts_leads.csv
    res.download(filePath, "contacts_leads.csv", (err) => {
      if (err) return next(err);
    });
  } catch (error) {
    next(error);
  }
};

export const uploadContactsCSV = async (
  req: RequestWithPayload<LoginPayload, FileData>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.payload!;
    const fileData = req.fileData;

    if (!fileData) {
      return sendResponse(res, 400, "Invalid or missing file data");
    }

    const {
      file_data: rows,
      total_records,
      filename,
      mime_type,
      entity_type,
    } = fileData;

    // 1. Store metadata into FileUpload table
    logger.debug(`Entering File type in database`);
    const fileEntity = await addFileType(entity_type);
    logger.debug(`File type added successfully`);

    // Now create file upload
    logger.debug(`Entering file records history`);
    const fileUpload = await addFileRecord(
      filename,
      mime_type,
      rows,
      total_records,
      id,
      fileEntity.id!
    );
    logger.debug(`File records history added successfully`);

    // 2. Validate + Normalize rows
    const { validRows, errors } = validateContactRows(rows, id);
    if (validRows.length === 0) {
      return sendResponse(res, 400, "No valid rows found in CSV", { errors });
    }

    // 3. Deduplicate inside file
    const { unique: uniqueInFile, duplicates: duplicatesInFile } =
      deduplicateContactsInFile(validRows);
    console.log("unique", uniqueInFile, duplicatesInFile);

    // 4. Deduplicate against DB
    const { unique: toInsert, duplicates: duplicatesInDb } =
      await deduplicateContactsInDb(uniqueInFile);
    console.log("toInsert", toInsert, duplicatesInDb);

    // 5. Handle no new records
    if (toInsert.length === 0) {
      logger.debug(`Updating fileUpload records`);
      await updateFileRecord(fileUpload.id, 0, validRows.length);
      logger.debug(`File upload records updated successfully`);

      return sendResponse(res, 200, "No new records to insert", {
        totalRows: rows.length,
        validRows: validRows.length,
        inserted: 0,
        skippedInvalid: errors.length,
        skippedDuplicatesInFile: duplicatesInFile,
        skippedDuplicatesInDb: duplicatesInDb,
        errors,
      });
    }

    // 6. Insert into HubSpot (batch)
    logger.debug(`Creating ${toInsert.length} HubSpot loan applications`);
    const hubspotResults = await createContactsLoanLeads(toInsert);
    console.log("hubspot", hubspotResults);
    logger.debug(`HubSpot loan applications created`);

    // 7. Insert into DB (safely with skipDuplicates)
    logger.debug(`Creating csv leads in database`);
    const result = await createCSVContacts(toInsert,id);
    logger.debug(`Leads created successfully in database`);

    updateContactsSystemTracking(hubspotResults as any[]);

    // 8. Update FileUpload stats
    logger.debug(`Updating fileUpload records`);
    await updateFileRecord(fileUpload.id, result.count, errors.length);
    logger.debug(`File upload records updated successfully`);

    return sendResponse(res, 201, "CSV processed successfully", {
      totalRows: rows.length,
      validRows: validRows.length,
      inserted: result.count,
      skippedInvalid: errors.length,
      skippedDuplicatesInFile: duplicatesInFile,
      skippedDuplicatesInDb: duplicatesInDb,
      errors,
    });
  } catch (error) {
    next(error);
  }
};

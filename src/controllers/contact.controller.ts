import { NextFunction, Response, Request } from "express";
import { v4 as uuidv4 } from "uuid";
import { RequestWithPayload } from "../types/api.types";
import { LoginPayload } from "../types/auth";
import logger from "../utils/logger";
import { sendResponse } from "../utils/api";
import prisma from "../config/prisma";
import {
  deleteContactsLoan,
  getContactsLead,
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
  getEdumateContactByEmail,
  createApplicationJourney,
  createFinancialInfo,
  createLoanPreferences,
  updateEdumateContactApplicationJourney,
  updateEdumateContactLoanPreference,
  updateEdumateContactFinancialInfo,
  updateEdumateContactSystemTracking,
} from "../models/helpers/contact.helper";
import { resolveLeadsCsvPath } from "../utils/leads";
import { FileData } from "../types/leads.types";
import {
  chunkArray,
  deduplicateContactsInDb,
  deduplicateContactsInFile,
  validateContactRows,
} from "../utils/helper";
import {
  addFileRecord,
  addFileType,
  updateFileRecord,
} from "../models/helpers";
import {
  getHubspotIdByUserId,
  getPartnerIdByUserId,
} from "../models/helpers/partners.helper";
import { ContactsLead } from "../types/contact.types";
import { mapAllFields } from "../mappers/edumateContact/mapping";
import { categorizeByTable } from "../services/DBServices/edumateContacts.service";
import { handleLeadCreation } from "../services/DBServices/loan.services";

export const createContactsLead = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.payload!;
    let data: any = {};
    let leadAttribution: any;

    logger.debug(`Fetching partner id from request`);
    const partnerId = await getPartnerIdByUserId(id);
    logger.debug(`Partner id fetched successfully`);

    const mappedFields = await mapAllFields(req.body);
    console.log("mappedFields", mappedFields);
    const categorized = categorizeByTable(mappedFields);
    console.log("categorized", categorized);

    const result = await prisma.$transaction(async (tx: any) => {
      logger.debug(`Creating edumate contact for userId: ${id}`);
      const contact = await createEdumateContact(
        tx,
        categorized["mainContact"],
        // null, // ⬅️ HubSpot ID ab null hai
        partnerId!.b2b_id
      );
      logger.debug(`Contact created successfully with id: ${contact.id}`);

      logger.debug(`Creating personal information for contact: ${contact.id}`);
      const personalInfo = await createEdumatePersonalInformation(
        tx,
        contact.id,
        categorized["personalInformation"]
      );
      logger.debug(
        `Personal information created successfully for contact: ${contact.id}`
      );

      logger.debug(`Creating academic profile for contact: ${contact.id}`);
      const academicsProfile = await createEdumateAcademicProfile(
        tx,
        contact.id,
        categorized["academicProfile"]
      );
      logger.debug(
        `Academic profile created successfully for contact: ${contact.id}`
      );

      if (req.body.b2b_partner_name) {
        logger.debug(`Creating lead attribution for contact: ${contact.id}`);
        leadAttribution = await createEdumateLeadAttribution(
          tx,
          contact.id,
          categorized["leadAttribution"]
        );
        logger.debug(
          `Lead attribution created successfully for contact: ${contact.id}`
        );
      }

      logger.debug(
        `Creating lead application journey for contact: ${contact.id}`
      );
      await createApplicationJourney(
        tx,
        contact.id,
        categorized["applicationJourney"]
      );
      logger.debug(
        `Lead journey created successfully for contact: ${contact.id}`
      );

      logger.debug(`Creating lead financial info for contact: ${contact.id}`);
      await createFinancialInfo(tx, contact.id, categorized["financialInfo"]);
      logger.debug(
        `Lead financial info created successfully for contact: ${contact.id}`
      );

      logger.debug(`Creating lead loan preference for contact: ${contact.id}`);
      await createLoanPreferences(
        tx,
        contact.id,
        categorized["loanPreferences"]
      );
      logger.debug(
        `Lead loan preference created successfully for contact: ${contact.id}`
      );

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

    sendResponse(
      res,
      200,
      "Contacts Lead created successfully (sync queued)",
      data
    );
  } catch (error) {
    next(error);
  }
};

export const upsertContactsLead = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    // const { id } = req.payload!;
    const { email, formType } = req.body;
    let data: any = {};
    let leadAttribution: any;

    logger.debug(`Fetching partner id from request`);
    // const partnerId = await getPartnerIdByUserId(id);
    logger.debug(`Partner id fetched successfully`);

    const mappedFields = await mapAllFields(req.body);
    console.log("mappedFields", mappedFields);
    const categorized = categorizeByTable(mappedFields);
    console.log("categorized", categorized);

    const existingContactDb = await getEdumateContactByEmail(email);
    let result;
    if (existingContactDb?.id) {
      const leadId = existingContactDb?.id;
      // ✅ HubSpot update call REMOVE - sirf DB update
      result = await prisma.$transaction(async (tx: any) => {
        // logger.debug(`Updating edumate contact for userId: ${id}`);
        const contact = await updateEdumateContact(
          tx,
          +leadId,
          categorized["mainContact"]
        );
        logger.debug(`Contact updated successfully with id: ${contact.id}`);

        logger.debug(
          `Updating personal information for contact: ${contact.id}`
        );
        await updateEdumatePersonalInformation(
          tx,
          contact.id,
          categorized["personalInformation"]
        );
        logger.debug(
          `Personal information updated successfully for contact: ${contact.id}`
        );

        logger.debug(`Updating academic profile for contact: ${contact.id}`);
        await updateEdumateAcademicProfile(
          tx,
          contact.id,
          categorized["academicProfile"]
        );
        logger.debug(
          `Academic profile updated successfully for contact: ${contact.id}`
        );

        logger.debug(`Updating lead attribution for contact: ${contact.id}`);
        await updateEdumateLeadAttribution(
          tx,
          contact.id,
          categorized["leadAttribution"]
        );
        logger.debug(
          `Lead attribution updated successfully for contact: ${contact.id}`
        );

        return contact;
      });
    } else {
      result = await prisma.$transaction(
        async (tx: any) => {
          // logger.debug(`Creating edumate contact for userId: ${id}`);
          const contact = await createEdumateContact(
            tx,
            categorized["mainContact"]
            // null // ⬅️ HubSpot ID ab null hai
          );
          logger.debug(`Contact created successfully with id: ${contact.id}`);

          logger.debug(
            `Creating personal information for contact: ${contact.id}`
          );
          const personalInfo = await createEdumatePersonalInformation(
            tx,
            contact.id,
            categorized["personalInformation"]
          );
          logger.debug(
            `Personal information created successfully for contact: ${contact.id}`
          );

          logger.debug(`Creating academic profile for contact: ${contact.id}`);
          const academicsProfile = await createEdumateAcademicProfile(
            tx,
            contact.id,
            categorized["academicProfile"]
          );
          logger.debug(
            `Academic profile created successfully for contact: ${contact.id}`
          );

          logger.debug(`Creating lead attribution for contact: ${contact.id}`);
          leadAttribution = await createEdumateLeadAttribution(
            tx,
            contact.id,
            categorized["leadAttribution"]
          );
          logger.debug(
            `Lead attribution created successfully for contact: ${contact.id}`
          );

          logger.debug(`Creating system tracking for contact: ${contact.id}`);
          await createEdumateSystemTracking(tx, contact.id);
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
        },
        {
          timeout: 180000,
        }
      );
    }

    if (result?.id && formType) {
      await handleLeadCreation(result.id, formType, email);
    }

    logger.debug(
      `All contact data created successfully for contactId: ${result.id}`
    );

    sendResponse(
      res,
      200,
      "Contacts Lead created successfully (sync queued)",
      data
    );
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

    logger.debug(`Deleting contact leads for userId: ${id}`);
    await deleteContactsLoan(+leadId, id);
    logger.debug(`Contact leads deleted successfully`);

    sendResponse(res, 200, "Lead deleted successfully (sync queued)");
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

    const mappedFields = await mapAllFields(req.body);
    console.log("mappedFields", mappedFields);
    const categorized = categorizeByTable(mappedFields);
    console.log("categorized", categorized);

    // ✅ HubSpot update call REMOVE - sirf DB update
    await prisma.$transaction(async (tx: any) => {
      logger.debug(`Updating edumate contact for userId: ${id}`);
      const contact = await updateEdumateContact(
        tx,
        +leadId,
        categorized["mainContact"]
      );
      logger.debug(`Contact updated successfully with id: ${contact.id}`);

      logger.debug(`Updating personal information for contact: ${contact.id}`);
      await updateEdumatePersonalInformation(
        tx,
        contact.id,
        categorized["personalInformation"]
      );
      logger.debug(
        `Personal information updated successfully for contact: ${contact.id}`
      );

      logger.debug(`Updating academic profile for contact: ${contact.id}`);
      await updateEdumateAcademicProfile(
        tx,
        contact.id,
        categorized["academicProfile"]
      );
      logger.debug(
        `Academic profile updated successfully for contact: ${contact.id}`
      );

      if (req.body.b2b_partner_name) {
        logger.debug(`Updating lead attribution for contact: ${contact.id}`);
        await updateEdumateLeadAttribution(
          tx,
          contact.id,
          categorized["leadAttribution"]
        );
        logger.debug(
          `Lead attribution updated successfully for contact: ${contact.id}`
        );
      }

      logger.debug(
        `Updating lead application journey for contact: ${contact.id}`
      );
      await updateEdumateContactApplicationJourney(
        tx,
        contact.id,
        categorized["applicationJourney"]
      );
      logger.debug(
        `Lead journey updated successfully for contact: ${contact.id}`
      );

      logger.debug(`Updating lead financial info for contact: ${contact.id}`);
      await updateEdumateContactFinancialInfo(
        tx,
        contact.id,
        categorized["financialInfo"]
      );
      logger.debug(
        `Lead financial info updated successfully for contact: ${contact.id}`
      );

      logger.debug(`Updating lead loan preference for contact: ${contact.id}`);
      await updateEdumateContactLoanPreference(
        tx,
        contact.id,
        categorized["loanPreferences"]
      );
      logger.debug(
        `Lead loan preference updated successfully for contact: ${contact.id}`
      );

      logger.debug(`Updating system tracking for contact: ${contact.id}`);
      await updateEdumateContactSystemTracking(
        tx,
        contact.id,
        categorized["systemTracking"]
      );
      logger.debug(
        `System tracking updated successfully for contact: ${contact.id}`
      );

      return contact;
    });

    // ✅ Middleware ne automatically outbox entry create kar di
    sendResponse(res, 200, "Lead updated successfully (sync queued)");
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
    console.log("req.query", req.query);
    const size = Number(req.query.size) || 10;
    const page = Number(req.query.page) || 1;
    const search = (req.query.search as string) || null;
    const sortKey = (req.query.sortKey as string) || null;
    const sortDir = (req.query.sortDir as "asc" | "desc") || null;

    // Extract filters from query params (filters is already an object)
    const filtersFromQuery =
      (req.query.filters as {
        partner?: string;
        status?: string;
      }) || {};

    const filters = {
      partner: filtersFromQuery.partner || null,
      status: filtersFromQuery.status || null,
    };

    console.log("Parsed filters:", filters);

    const offset = size * (page - 1);

    logger.debug(`Fetching partner id from request`);
    const partnerId = await getPartnerIdByUserId(req.payload!.id);
    logger.debug(`Partner id fetched successfully`);

    logger.debug(
      `Fetching contacts leads list with pagination and filters`,
      filters
    );
    const list = await fetchContactsLeadList(
      size,
      offset,
      sortKey,
      sortDir,
      search,
      partnerId!.b2b_id,
      filters
    );
    logger.debug(`Contacts leads list fetched successfully`);

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

    logger.debug(`Fetching hubspotId from userId: ${id}`);
    logger.debug(`Hubspot id fetched successfully`);

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

    // ✅ 6. Generate unique batch ID for this upload
    const batchId = uuidv4();
    logger.debug(
      `Generated batch ID: ${batchId} for ${toInsert.length} records`
    );

    const mappedRecords = await Promise.all(
      toInsert.map((contact) => mapAllFields(contact))
    );
    console.log("mappedRecords", mappedRecords);

    // ✅ 7. Process in batches (DB insertion only - NO HubSpot calls)
    const BATCH_SIZE = 50;
    const batches = chunkArray(mappedRecords, BATCH_SIZE);

    logger.debug(
      `Processing ${mappedRecords.length} records in ${batches.length} batches of ${BATCH_SIZE}`
    );

    let totalInserted = 0;
    const insertionErrors: any[] = [];

    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchNumber = batchIndex + 1;
      const categorizedRecords = await Promise.all(
        batch.map((contact) => categorizeByTable(contact))
      );
      console.log("categorizedRecords", categorizedRecords);
      try {
        logger.debug(`Processing batch ${batchNumber}/${batches.length}`);

        // ✅ Insert into DB only
        const result = await createCSVContacts(categorizedRecords, id, null); // No HubSpot results
        totalInserted += result.count;

        logger.debug(
          `Batch ${batchNumber}: ${result.count} records inserted into DB`
        );

        // ✅ Manually create outbox entries for this batch
        // (Because createMany doesn't trigger individual create hooks)
        await createBulkOutboxEntries(batch, batchId, batchIndex * BATCH_SIZE);

        logger.debug(
          `Batch ${batchNumber}: Outbox entries created for sync queue`
        );
      } catch (error: any) {
        logger.error(`Batch ${batchNumber}: DB insertion failed`, { error });

        insertionErrors.push({
          batchNumber,
          error: error.message,
          recordCount: batch.length,
        });
      }
    }

    logger.debug(`All ${batches.length} batches processed`);

    // 8. Update FileUpload stats
    logger.debug(`Updating fileUpload records`);
    await updateFileRecord(
      fileUpload.id,
      totalInserted,
      errors.length + insertionErrors.length
    );
    logger.debug(`File upload records updated successfully`);

    return sendResponse(res, 201, "CSV processed successfully (sync queued)", {
      totalRows: rows.length,
      validRows: validRows.length,
      inserted: totalInserted,
      skippedInvalid: errors.length,
      skippedDuplicatesInFile: duplicatesInFile,
      skippedDuplicatesInDb: duplicatesInDb,
      batchesProcessed: batches.length,
      batchId: batchId,
      syncStatus: "queued",
      errors: errors.concat(insertionErrors),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Helper: Create bulk outbox entries for CSV batch
 */
async function createBulkOutboxEntries(
  contacts: ContactsLead[],
  batchId: string,
  startPosition: number
): Promise<void> {
  try {
    const outboxEntries = contacts.map((contact, index) => ({
      id: uuidv4(),
      entity_type: "HSEdumateContacts",
      entity_id: 0, // Will be updated after we fetch actual IDs
      operation: "CREATE",
      payload: contact,
      status: "PENDING",
      batch_id: batchId,
      batch_size: contacts.length,
      batch_position: startPosition + index,
      priority: 7, // Lower priority for bulk
      created_at: new Date(),
      updated_at: new Date(),
      attempts: 0,
      max_attempts: 5,
    }));

    // Fetch actual contact IDs from DB
    const emails = contacts
      .map((c) => c.email)
      .filter(
        (email): email is string =>
          typeof email === "string" && email.trim() !== ""
      );
    let insertedContacts: Array<any> = [];
    if (emails.length > 0) {
      insertedContacts = await prisma.hSEdumateContacts.findMany({
        where: {
          personal_information: {
            email: { in: emails },
          },
        },
        select: {
          id: true,
          personal_information: {
            select: { email: true },
          },
        },
      });
    }

    // Map emails to IDs
    const emailToIdMap = new Map(
      insertedContacts.map((c) => [c.personal_information?.email, c.id])
    );

    // Update outbox entries with actual IDs
    outboxEntries.forEach((entry) => {
      const contact = entry.payload as ContactsLead;
      const actualId = emailToIdMap.get(contact.email);
      if (actualId) {
        entry.entity_id = actualId;
      }
    });

    // Bulk insert outbox entries
    await prisma.syncOutbox.createMany({
      data: outboxEntries.filter((e) => e.entity_id !== 0), // Only insert entries with valid IDs
    });

    logger.debug(
      `Created ${outboxEntries.length} outbox entries for batch ${batchId}`
    );
  } catch (error) {
    logger.error(`Failed to create bulk outbox entries:`, error);
    throw error;
  }
}

// Helper: Extract failed emails from error message
const extractFailedEmailsFromError = (error: any): string[] => {
  const failedEmails: string[] = [];

  try {
    // Check if error contains specific record information
    const errorMessage = error?.response?.data?.message || error?.message || "";

    // Common HubSpot error patterns
    if (errorMessage.includes("Contact already exists")) {
      // Try to extract email from error message
      const emailMatch = errorMessage.match(/[\w.-]+@[\w.-]+\.\w+/g);
      if (emailMatch) {
        failedEmails.push(...emailMatch);
      }
    }

    // If HubSpot provides error details in response
    if (
      error?.response?.data?.errors &&
      Array.isArray(error.response.data.errors)
    ) {
      error.response.data.errors.forEach((err: any) => {
        if (err.email) {
          failedEmails.push(err.email);
        }
      });
    }

    // Check for validation errors with context
    if (error?.response?.data?.validationErrors) {
      const validationErrors = error.response.data.validationErrors;
      Object.keys(validationErrors).forEach((key) => {
        if (key.includes("email") || validationErrors[key].email) {
          const email = validationErrors[key].email || validationErrors[key];
          if (typeof email === "string" && email.includes("@")) {
            failedEmails.push(email);
          }
        }
      });
    }
  } catch (parseError) {
    logger.error("Error parsing failed emails from error", { parseError });
  }

  return [...new Set(failedEmails)]; // Remove duplicates
};

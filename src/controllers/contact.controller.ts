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
  createCSVContacts,
  getEdumateContactByEmail,
  createApplicationJourney,
  createFinancialInfo,
  createLoanPreferences,
  updateEdumateContactApplicationJourney,
  updateEdumateContactLoanPreference,
  updateEdumateContactFinancialInfo,
  updateEdumateContactSystemTracking,
  getEdumateContactByPhone,
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
import { getPartnerIdByUserId } from "../models/helpers/partners.helper";
import { ContactsLead, LeadStatsResponse, LifecycleStageCount, LifecycleStatusCount } from "../types/contact.types";
import { mapAllFields } from "../mappers/edumateContact/mapping";
import { categorizeByTable } from "../services/DBServices/edumateContacts.service";
import { handleLeadCreation } from "../services/DBServices/loan.services";

export const createContactsLead = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.payload?.id || null;
    let data: any = {};
    let leadAttribution: any;
    let partnerId = req?.body?.b2b_partner_db_id || null;

    if (!partnerId && id) {
      logger.debug(`Fetching partner id from request`);
      partnerId = (await getPartnerIdByUserId(id))?.b2b_id || null;
      logger.debug(`Partner id fetched successfully`);
    }

    const mappedFields = await mapAllFields(req.body);
    console.log("mappedFields", mappedFields);
    const categorized = categorizeByTable(mappedFields);
    console.log("categorized", categorized);

    const result = await prisma.$transaction(async (tx: any) => {
      logger.debug(`Creating edumate contact for userId: ${id}`);
      const contact = await createEdumateContact(
        tx,
        categorized["mainContact"],
        // null, //  HubSpot ID as null
        partnerId,
        req.body.created_by,
      );
      logger.debug(`Contact created successfully with id: ${contact.id}`);

      logger.debug(`Creating personal information for contact: ${contact.id}`);
      const personalInfo = await createEdumatePersonalInformation(
        tx,
        contact.id,
        categorized["personalInformation"],
      );
      logger.debug(
        `Personal information created successfully for contact: ${contact.id}`,
      );

      logger.debug(`Creating academic profile for contact: ${contact.id}`);
      const academicsProfile = await createEdumateAcademicProfile(
        tx,
        contact.id,
        categorized["academicProfile"],
      );
      logger.debug(
        `Academic profile created successfully for contact: ${contact.id}`,
      );

      if (req.body.b2b_partner_name) {
        logger.debug(`Creating lead attribution for contact: ${contact.id}`);
        leadAttribution = await createEdumateLeadAttribution(
          tx,
          contact.id,
          categorized["leadAttribution"],
        );
        logger.debug(
          `Lead attribution created successfully for contact: ${contact.id}`,
        );
      }

      logger.debug(
        `Creating lead application journey for contact: ${contact.id}`,
      );
      await createApplicationJourney(
        tx,
        contact.id,
        categorized["applicationJourney"],
      );
      logger.debug(
        `Lead journey created successfully for contact: ${contact.id}`,
      );

      logger.debug(`Creating lead financial info for contact: ${contact.id}`);
      await createFinancialInfo(tx, contact.id, categorized["financialInfo"]);
      logger.debug(
        `Lead financial info created successfully for contact: ${contact.id}`,
      );

      logger.debug(`Creating lead loan preference for contact: ${contact.id}`);
      await createLoanPreferences(
        tx,
        contact.id,
        categorized["loanPreferences"],
      );
      logger.debug(
        `Lead loan preference created successfully for contact: ${contact.id}`,
      );

      logger.debug(`Creating system tracking for contact: ${contact.id}`);
      await createEdumateSystemTracking(tx, contact.id, id);
      logger.debug(
        `System tracking created successfully for contact: ${contact.id}`,
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
      `All contact data created successfully for contactId: ${result.id}`,
    );

    sendResponse(
      res,
      200,
      "Contacts Lead created successfully (sync queued)",
      data,
    );
  } catch (error) {
    next(error);
  }
};

export const upsertContactsLead = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    // const { id } = req.payload!;
    const { email, formType, phoneNumber } = req.body;
    let data: any = {};
    let leadAttribution: any;

    logger.debug(`Fetching partner id from request`);
    // const partnerId = await getPartnerIdByUserId(id);
    logger.debug(`Partner id fetched successfully`);

    const mappedFields = await mapAllFields(req.body);
    console.log("mappedFields", mappedFields);
    const categorized = categorizeByTable(mappedFields);
    console.log("categorized", categorized);

    let existingContactDb = null;
    if (email) {
      existingContactDb = await getEdumateContactByEmail(email);
    } else if (phoneNumber) {
      existingContactDb = await getEdumateContactByPhone(phoneNumber);
    }

    let result;
    if (existingContactDb?.id) {
      const leadId = existingContactDb?.id;
      //  HubSpot update call REMOVE - sirf DB update
      result = await prisma.$transaction(
        async (tx: any) => {
          // logger.debug(`Updating edumate contact for userId: ${id}`);
          const contact = await updateEdumateContact(
            tx,
            +leadId,
            categorized["mainContact"],
          );
          logger.debug(`Contact updated successfully with id: ${contact.id}`);

          logger.debug(
            `Updating personal information for contact: ${contact.id}`,
          );
          const personalInfo = await updateEdumatePersonalInformation(
            tx,
            contact.id,
            categorized["personalInformation"],
          );
          logger.debug(
            `Personal information updated successfully for contact: ${contact.id}`,
          );

          logger.debug(`Updating academic profile for contact: ${contact.id}`);
          const academicsProfile = await updateEdumateAcademicProfile(
            tx,
            contact.id,
            categorized["academicProfile"],
          );
          logger.debug(
            `Academic profile updated successfully for contact: ${contact.id}`,
          );

          logger.debug(`Updating lead attribution for contact: ${contact.id}`);
          const leadAttribution = await updateEdumateLeadAttribution(
            tx,
            contact.id,
            categorized["leadAttribution"],
          );
          logger.debug(
            `Lead attribution updated successfully for contact: ${contact.id}`,
          );

          // populate response data similarly to creation flow
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
        { timeout: 180000 },
      );
    } else {
      result = await prisma.$transaction(
        async (tx: any) => {
          // logger.debug(`Creating edumate contact for userId: ${id}`);
          const contact = await createEdumateContact(
            tx,
            categorized["mainContact"],
            // null //  HubSpot ID ab null hai
          );
          logger.debug(`Contact created successfully with id: ${contact.id}`);

          logger.debug(
            `Creating personal information for contact: ${contact.id}`,
          );
          const personalInfo = await createEdumatePersonalInformation(
            tx,
            contact.id,
            categorized["personalInformation"],
          );
          logger.debug(
            `Personal information created successfully for contact: ${contact.id}`,
          );

          logger.debug(`Creating academic profile for contact: ${contact.id}`);
          const academicsProfile = await createEdumateAcademicProfile(
            tx,
            contact.id,
            categorized["academicProfile"],
          );
          logger.debug(
            `Academic profile created successfully for contact: ${contact.id}`,
          );

          logger.debug(`Creating lead attribution for contact: ${contact.id}`);
          leadAttribution = await createEdumateLeadAttribution(
            tx,
            contact.id,
            categorized["leadAttribution"],
          );
          logger.debug(
            `Lead attribution created successfully for contact: ${contact.id}`,
          );

          logger.debug(
            `Creating lead application journey for contact: ${contact.id}`,
          );
          await createApplicationJourney(
            tx,
            contact.id,
            categorized["applicationJourney"],
          );
          logger.debug(
            `Lead journey created successfully for contact: ${contact.id}`,
          );

          logger.debug(
            `Creating lead financial info for contact: ${contact.id}`,
          );
          await createFinancialInfo(
            tx,
            contact.id,
            categorized["financialInfo"],
          );
          logger.debug(
            `Lead financial info created successfully for contact: ${contact.id}`,
          );

          logger.debug(
            `Creating lead loan preference for contact: ${contact.id}`,
          );
          await createLoanPreferences(
            tx,
            contact.id,
            categorized["loanPreferences"],
          );
          logger.debug(
            `Lead loan preference created successfully for contact: ${contact.id}`,
          );

          logger.debug(`Creating system tracking for contact: ${contact.id}`);
          await createEdumateSystemTracking(tx, contact.id);
          logger.debug(
            `System tracking created successfully for contact: ${contact.id}`,
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
        },
      );
    }

    if (result?.id && formType) {
      await handleLeadCreation(result.id, formType, email);
    }

    logger.debug(
      `All contact data created successfully for contactId: ${result.id}`,
    );

    sendResponse(
      res,
      200,
      "Contacts Lead created successfully (sync queued)",
      data,
    );
  } catch (error) {
    next(error);
  }
};

export const deleteContactLead = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction,
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
  next: NextFunction,
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
  next: NextFunction,
) => {
  try {
    const id = req.payload?.id || null;
    const leadId = req.params.id;
    let partnerId = req?.body?.b2b_partner_db_id || null;

    if (!partnerId && id) {
      logger.debug(`Fetching partner id from request`);
      partnerId = await getPartnerIdByUserId(id);
      logger.debug(`Partner id fetched successfully`);
    }

    const mappedFields = await mapAllFields(req.body);
    console.log("mappedFields", mappedFields);
    const categorized = categorizeByTable(mappedFields);
    console.log("categorized", categorized);

    //  HubSpot update call REMOVE - sirf DB update
    await prisma.$transaction(async (tx: any) => {
      logger.debug(`Updating edumate contact for userId: ${id}`);
      const contact = await updateEdumateContact(
        tx,
        +leadId,
        categorized["mainContact"],
        partnerId,
      );
      logger.debug(`Contact updated successfully with id: ${contact.id}`);

      logger.debug(`Updating personal information for contact: ${contact.id}`);
      await updateEdumatePersonalInformation(
        tx,
        contact.id,
        categorized["personalInformation"],
      );
      logger.debug(
        `Personal information updated successfully for contact: ${contact.id}`,
      );

      logger.debug(`Updating academic profile for contact: ${contact.id}`);
      await updateEdumateAcademicProfile(
        tx,
        contact.id,
        categorized["academicProfile"],
      );
      logger.debug(
        `Academic profile updated successfully for contact: ${contact.id}`,
      );

      if (req.body.b2b_partner_name) {
        logger.debug(`Updating lead attribution for contact: ${contact.id}`);
        await updateEdumateLeadAttribution(
          tx,
          contact.id,
          categorized["leadAttribution"],
        );
        logger.debug(
          `Lead attribution updated successfully for contact: ${contact.id}`,
        );
      }

      logger.debug(
        `Updating lead application journey for contact: ${contact.id}`,
      );
      await updateEdumateContactApplicationJourney(
        tx,
        contact.id,
        categorized["applicationJourney"],
      );
      logger.debug(
        `Lead journey updated successfully for contact: ${contact.id}`,
      );

      logger.debug(`Updating lead financial info for contact: ${contact.id}`);
      await updateEdumateContactFinancialInfo(
        tx,
        contact.id,
        categorized["financialInfo"],
      );
      logger.debug(
        `Lead financial info updated successfully for contact: ${contact.id}`,
      );

      logger.debug(`Updating lead loan preference for contact: ${contact.id}`);
      await updateEdumateContactLoanPreference(
        tx,
        contact.id,
        categorized["loanPreferences"],
      );
      logger.debug(
        `Lead loan preference updated successfully for contact: ${contact.id}`,
      );

      logger.debug(`Updating system tracking for contact: ${contact.id}`);
      await updateEdumateContactSystemTracking(
        tx,
        contact.id,
        categorized["systemTracking"],
      );
      logger.debug(
        `System tracking updated successfully for contact: ${contact.id}`,
      );

      return contact;
    });

    //  Middleware ne automatically outbox entry create kar di
    sendResponse(res, 200, "Lead updated successfully (sync queued)");
  } catch (error) {
    next(error);
  }
};

export const downloadContactsTemplate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const filePath = resolveLeadsCsvPath("contacts.csv");
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
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.payload?.id || req.body?.id);
    console.log("id", id);
    const fileData = req.fileData;
    let partnerId = null;
    if (!partnerId && id) {
      logger.debug(`Fetching partner id from request`);
      partnerId = (await getPartnerIdByUserId(id)) || null;
      console.log("partnerId", partnerId);
      logger.debug(`Partner id fetched successfully`);
    }

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

    logger.debug(`Processing uploaded CSV with ${total_records} records`, rows);

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
      fileEntity.id!,
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
      await deduplicateContactsInDb(uniqueInFile, partnerId?.b2b_id!);
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

    //  6. Generate unique batch ID for this upload
    const batchId = uuidv4();
    logger.debug(
      `Generated batch ID: ${batchId} for ${toInsert.length} records`,
    );

    const mappedRecords = await Promise.all(
      toInsert.map((contact) => mapAllFields(contact)),
    );
    console.log("mappedRecords", mappedRecords);

    //  7. Process in batches (DB insertion only - NO HubSpot calls)
    const BATCH_SIZE = 50;
    const batches = chunkArray(mappedRecords, BATCH_SIZE);

    logger.debug(
      `Processing ${mappedRecords.length} records in ${batches.length} batches of ${BATCH_SIZE}`,
    );

    let totalInserted = 0;
    const insertionErrors: any[] = [];

    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchNumber = batchIndex + 1;
      const categorizedRecords = await Promise.all(
        batch.map((contact) => categorizeByTable(contact)),
      );
      console.log("categorizedRecords", categorizedRecords);
      try {
        logger.debug(`Processing batch ${batchNumber}/${batches.length}`);

        //  Insert into DB only
        const result = await createCSVContacts(
          categorizedRecords,
          partnerId?.b2b_id!,
          null,
        ); // No HubSpot results
        totalInserted += result.count;

        logger.debug(
          `Batch ${batchNumber}: ${result.count} records inserted into DB`,
        );

        //  Manually create outbox entries for this batch
        // (Because createMany doesn't trigger individual create hooks)
        // await createBulkOutboxEntries(batch, batchId, batchIndex * BATCH_SIZE);

        logger.debug(
          `Batch ${batchNumber}: Outbox entries created for sync queue`,
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
      errors.length + insertionErrors.length,
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
 * Controller to handle bulk contact import via JSON
 * POST /api/contacts/upload-json
 */
export const uploadContactsJSON = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.payload?.id || req.body?.id);
    const { transformedContacts, totalRecords } = req.body;
    const partnerId = (await getPartnerIdByUserId(id))!.b2b_id;
    if (!transformedContacts || !Array.isArray(transformedContacts)) {
      return sendResponse(res, 400, "Invalid or missing contact data");
    }

    logger.debug(
      `Processing JSON upload with ${totalRecords} records for userId: ${id}`,
    );

    // 1. Store metadata into FileUpload table (JSON type)
    logger.debug(`Recording file type in database`);
    const fileEntity = await addFileType("JSON");
    logger.debug(`File type recorded successfully`);

    // logger.debug(`Creating file upload record`);
    // const fileUpload = await addFileRecord(
    //   "bulk_contacts_import.json", // Generic filename
    //   "application/json", // MIME type
    //   transformedContacts,
    //   totalRecords,
    //   id,
    //   fileEntity.id!
    // );
    // logger.debug(`File upload record created successfully`);

    // 2. Validate + Normalize rows (reusing CSV validation logic)
    logger.debug(`Validating contact rows`);
    const { validRows, errors } = validateContactRows(transformedContacts, id);

    if (validRows.length === 0) {
      logger.warn(`No valid rows found in JSON payload`);
      return sendResponse(res, 400, "No valid contacts found in JSON", {
        errors,
      });
    }

    logger.debug(
      `Validation complete: ${validRows.length} valid, ${errors.length} invalid`,
    );

    // 3. Deduplicate inside payload
    logger.debug(`Checking for duplicates within payload`);
    const { unique: uniqueInFile, duplicates: duplicatesInFile } =
      deduplicateContactsInFile(validRows);
    logger.debug(
      `In-payload duplicates: ${duplicatesInFile}, unique: ${uniqueInFile.length}`,
    );

    // 4. Deduplicate against DB
    logger.debug(`Checking for duplicates in database`);
    const { unique: toInsert, duplicates: duplicatesInDb } =
      await deduplicateContactsInDb(uniqueInFile, partnerId);
    logger.debug(
      `DB duplicates: ${duplicatesInDb}, records to insert: ${toInsert.length}`,
    );

    // 5. Handle no new records
    if (toInsert.length === 0) {
      logger.debug(`No new records to insert, updating file record`);
      // await updateFileRecord(fileUpload.id, 0, validRows.length);

      return sendResponse(res, 200, "No new contacts to insert", {
        totalRecords: totalRecords,
        validRows: validRows.length,
        inserted: 0,
        skippedInvalid: errors.length,
        skippedDuplicatesInFile: duplicatesInFile,
        skippedDuplicatesInDb: duplicatesInDb,
        errors,
      });
    }

    // 6. Generate unique batch ID for this upload
    const batchId = uuidv4();
    logger.debug(
      `Generated batch ID: ${batchId} for ${toInsert.length} records`,
    );

    // 7. Map fields to database structure
    logger.debug(`Mapping contact fields to database structure`);
    const mappedRecords = await Promise.all(
      toInsert.map((contact) => mapAllFields(contact)),
    );
    logger.debug(`Mapped ${mappedRecords.length} records successfully`);

    // 8. Process in batches (DB insertion only - NO HubSpot calls)
    const BATCH_SIZE = 50;
    const batches = chunkArray(mappedRecords, BATCH_SIZE);

    logger.debug(
      `Processing ${mappedRecords.length} records in ${batches.length} batches of ${BATCH_SIZE}`,
    );

    let totalInserted = 0;
    const insertionErrors: any[] = [];

    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchNumber = batchIndex + 1;

      // Categorize records for database insertion
      const categorizedRecords = await Promise.all(
        batch.map((contact) => categorizeByTable(contact)),
      );

      try {
        logger.debug(
          `Processing batch ${batchNumber}/${batches.length} (${batch.length} records)`,
        );

        // Insert into DB only (no HubSpot sync during bulk)
        const result = await createCSVContacts(
          categorizedRecords,
          partnerId,
          null,
        );
        totalInserted += result.count;

        logger.debug(
          `Batch ${batchNumber}: ${result.count} records inserted into DB`,
        );

        // Create outbox entries for this batch (for async HubSpot sync)
        // await createBulkOutboxEntries(batch, batchId, batchIndex * BATCH_SIZE);

        logger.debug(
          `Batch ${batchNumber}: Outbox entries created for sync queue`,
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

    logger.debug(
      `All ${batches.length} batches processed. Total inserted: ${totalInserted}`,
    );

    // 9. Update FileUpload stats
    // logger.debug(`Updating file upload record with results`);
    // await updateFileRecord(
    //   fileUpload.id,
    //   totalInserted,
    //   errors.length + insertionErrors.length
    // );
    // logger.debug(`File upload record updated successfully`);

    return sendResponse(
      res,
      201,
      "JSON bulk import processed successfully (sync queued)",
      {
        totalRecords: totalRecords,
        validRows: validRows.length,
        inserted: totalInserted,
        skippedInvalid: errors.length,
        skippedDuplicatesInFile: duplicatesInFile,
        skippedDuplicatesInDb: duplicatesInDb,
        batchesProcessed: batches.length,
        batchId: batchId,
        syncStatus: "queued",
        errors: errors.concat(insertionErrors),
      },
    );
  } catch (error) {
    logger.error("Error in uploadContactsJSON:", error);
    next(error);
  }
};


/**
 * Get Lead Statistics
 * GET /contacts/lead-stats?partner=true/false
 * 
 * Returns aggregated counts of leads grouped by:
 * - lifecycle_stages
 * - lifecycle_stages_status
 * 
 * If partner=true, filters by authenticated user's b2b_partner_id
 */
export const getLeadStats = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    // Parse partner query parameter (default: false)
    const partnerParam = req.query.partner;
    const isPartnerFilter = String(partnerParam).toLowerCase() === "true";
    const id = parseInt(req.payload?.id || req.body?.id);

    // Build where clause
    const whereClause: any = {};

    // If partner filter is enabled, filter by b2b_partner_id
    if (isPartnerFilter) {
      
    const partnerId = (await getPartnerIdByUserId(id))!.b2b_id;

      if (!partnerId) {
        return sendResponse(
          res,
          400,
          "Partner filter requires authentication with b2b_partner_id"
        );
      }

      whereClause.b2b_partner_id = partnerId;
    }

    // Fetch all leads from the view with optional filtering
    const leads = await prisma.leads_view.findMany({
      where: whereClause,
      select: {
        lifecycle_stages: true,
        lifecycle_stages_status: true,
      },
    });

    // Aggregate counts for lifecycle_stages
    const lifecycleStages: LifecycleStageCount = {};
    const lifecycleStagesStatus: LifecycleStatusCount = {};

    leads.forEach((lead) => {
      // Count lifecycle_stages
      if (lead.lifecycle_stages) {
        const stage = lead.lifecycle_stages;
        lifecycleStages[stage] = (lifecycleStages[stage] || 0) + 1;
      }

      // Count lifecycle_stages_status
      if (lead.lifecycle_stages_status) {
        const status = lead.lifecycle_stages_status;
        lifecycleStagesStatus[status] = (lifecycleStagesStatus[status] || 0) + 1;
      }
    });

    // Build response
    const response: LeadStatsResponse = {
      lifecycleStages,
      lifecycleStagesStatus,
      totalLeads: leads.length,
      filteredBy: {
        partner: isPartnerFilter,
        ...(isPartnerFilter && { partnerId: whereClause.b2b_partner_id }),
      },
    };

    return sendResponse(res, 200, "Lead statistics retrieved successfully", response);
  } catch (error: any) {
    console.error("Error in getLeadStats:", error);
    return sendResponse(res, 500, "Error retrieving lead statistics", {
      error: error.message,
    });
  }
};

/**
 *  Helper: Create bulk outbox entries for CSV batch
 */
async function createBulkOutboxEntries(
  contacts: ContactsLead[],
  batchId: string,
  startPosition: number,
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
          typeof email === "string" && email.trim() !== "",
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
      insertedContacts.map((c) => [c.personal_information?.email, c.id]),
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
      `Created ${outboxEntries.length} outbox entries for batch ${batchId}`,
    );
  } catch (error) {
    logger.error(`Failed to create bulk outbox entries:`, error);
    throw error;
  }
}

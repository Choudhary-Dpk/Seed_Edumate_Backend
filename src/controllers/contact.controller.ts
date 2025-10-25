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
import { queue } from "async";
import { BatchResult, ContactsLead, RecordError } from "../types/contact.types";
import { mapAllFields } from "../mappers/edumateContact/mapping";
import { categorizeByTable } from "../services/DBServices/edumateContacts.service";

export const createContactsLead = async (
  req: RequestWithPayload<LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.payload!;
    let data: any = {};
    let leadAttribution: any;

    logger.debug(`Fetching hubspotId from userId: ${id}`);
    const hubspotId = await getHubspotIdByUserId(id);
    logger.debug(`Hubspot id fetched successfully`);

    const mappedFields = await mapAllFields(req.body);
    console.log("mappedFields", mappedFields);
    const categorized = categorizeByTable(mappedFields);
    console.log("categorized", categorized);

    logger.debug(`Fetching partner id from request`);
    const partnerId = await getPartnerIdByUserId(id);
    logger.debug(`Partner id fetched successfully`);

    logger.debug(`Creating hubspot edumate contacts leads application`);
    const lead = await createEdumateContactsLeads([
      {
        email: req.body.email,
        phone: req.body.phone_number,
        firstName: req.body.first_name,
        lastName: req.body.last_name,
        partnerName: req.body.b2b_partner_name,
        educationLevel: req.body.current_education_level,
        admissionStatus: req.body.admission_status,
        targetDegreeLevel: req.body.target_degree_level,
        courseType: req.body.course_type,
        studyDestination: req.body.preferred_study_destination,
        dateOfBirth: req.body.date_of_birth,
        gender: req.body.gender,
        intakeYear: req.body.intake_year,
        intakeMonth: req.body.intake_month,
        b2bHubspotId: hubspotId!,
      },
    ]);
    logger.debug(`Hubspot loan contacts leads created successfully`);

    // // Use database transaction to ensure all related records are created atomically
    const result = await prisma.$transaction(async (tx: any) => {
      logger.debug(`Creating edumate contact for userId: ${id}`);
      const contact = await createEdumateContact(
        tx,
        categorized["mainContact"],
        lead[0]?.id,
        id,
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

    const mappedFields = await mapAllFields(req.body);
    console.log("mappedFields", mappedFields);
    const categorized = categorizeByTable(mappedFields);
    console.log("categorized", categorized);

    logger.debug(`Fethcing hubspot details by leadId: ${leadId}`);
    const lead = await getHubspotByContactLeadId(+leadId);
    logger.debug(`Hubspot details fetched successfully`);

    logger.debug(`Updating hubspot loan application`);
    await updateContactsLoanLead(lead?.hs_object_id!, {
      email: req.body.email,
      phone: req.body.phone_number,
      firstName: req.body.first_name,
      lastName: req.body.last_name,
      partnerName: req.body.b2b_partner_name,
      educationLevel: req.body.current_education_level,
      admissionStatus: req.body.admission_status,
      targetDegreeLevel: req.body.target_degree_level,
      courseType: req.body.course_type,
      studyDestination: req.body.preferred_study_destination,
      dateOfBirth: req.body.date_of_birth,
      gender: req.body.gender,
      intakeYear: req.body.intake_year,
      intakeMonth: req.body.intake_month,
    });
    logger.debug(`Hubspot loan application updated successfully`);

    await prisma.$transaction(async (tx: any) => {
      logger.debug(`Updating edumate contact for userId: ${id}`);
      const contact = await updateEdumateContact(
        tx,
        +leadId,
        categorized["mainContact"]
      );
      logger.debug(`Contact udpated successfully with id: ${contact.id}`);

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

      return contact;
    });

    sendResponse(res, 200, "Lead updated successfully");
  } catch (error) {
    next(error);
  }
};

// export const getContactsLeadsList = async (
//   req: RequestWithPayload<LoginPayload>,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const size = Number(req.query.size) || 10;
//     const page = Number(req.query.page) || 1;
//     const search = (req.query.search as string) || null;
//     const sortKey = (req.query.sortKey as string) || null;
//     const sortDir = (req.query.sortDir as "asc" | "desc") || null;

//     const offset = size * (page - 1);

//     logger.debug(`Fetching partner id from request`);
//     const partnerId = await getPartnerIdByUserId(req.payload!.id);
//     logger.debug(`Partner id fetched successfully`);

//     logger.debug(`Fetching leads list with pagination and filters`);
//     const list = await fetchContactsLeadList(
//       size,
//       offset,
//       sortKey,
//       sortDir,
//       search,
//       partnerId!.b2b_id
//     );
//     logger.debug(`Leads list fetched successfully`);

//     sendResponse(res, 200, "Leads list fetched successfully", {
//       total: list.count,
//       page,
//       size,
//       data: list.rows,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

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
    const hubspotId = await getHubspotIdByUserId(id);
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
    const { validRows, errors } = validateContactRows(rows, id, hubspotId!);
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

    // 6. Process in batches of 50
    const BATCH_SIZE = 50;
    const batches = chunkArray(toInsert, BATCH_SIZE);
    console.log("batches", batches);

    logger.debug(
      `Processing ${toInsert.length} records in ${batches.length} batches of ${BATCH_SIZE}`
    );

    // Track results across all batches
    const batchResults: BatchResult[] = [];

    // Process batches using queue
    await processBatchesWithQueue(batches, id, batchResults);

    logger.debug(`All ${batches.length} batches processed`);

    // Calculate total results
    const totalInserted = batchResults.reduce(
      (sum, br) => sum + br.inserted,
      0
    );
    const batchErrors = batchResults.flatMap((br) => br.errors);

    // 8. Update FileUpload stats
    logger.debug(`Updating fileUpload records`);
    await updateFileRecord(
      fileUpload.id,
      totalInserted,
      errors.length + batchErrors.length
    );
    logger.debug(`File upload records updated successfully`);

    return sendResponse(res, 201, "CSV processed successfully", {
      totalRows: rows.length,
      validRows: validRows.length,
      inserted: totalInserted,
      skippedInvalid: errors.length,
      skippedDuplicatesInFile: duplicatesInFile,
      skippedDuplicatesInDb: duplicatesInDb,
      batchesProcessed: batches.length,
      batchErrors: batchErrors.length > 0 ? batchErrors : undefined,
      errors,
    });
  } catch (error) {
    next(error);
  }
};

// Process batches using async queue with optimized batch-first approach
const processBatchesWithQueue = (
  batches: ContactsLead[][],
  userId: number,
  batchResults: BatchResult[]
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const processingQueue = queue(
      (task: { batch: ContactsLead[]; index: number }, callback) => {
        const { batch, index } = task;
        const batchNumber = index + 1;

        (async () => {
          try {
            logger.debug(
              `Processing batch ${batchNumber}/${batches.length} with ${batch.length} records`
            );

            let successfulRecords: ContactsLead[] = [];
            let hubspotResults: any[] = [];
            const recordErrors: RecordError[] = [];

            // Step 1: Try to insert entire batch at once (OPTIMIZED)
            logger.debug(
              `Batch ${batchNumber}: Attempting bulk HubSpot insertion`
            );

            try {
              const batchHubspotResults = await createContactsLoanLeads(batch);

              // If successful, all records are good!
              if (batchHubspotResults && batchHubspotResults.length > 0) {
                successfulRecords = [...batch];
                hubspotResults = batchHubspotResults;

                logger.debug(
                  `Batch ${batchNumber}: Bulk HubSpot insertion successful - all ${batch.length} records inserted`
                );
              }
            } catch (batchError: any) {
              // Batch failed - now we need to identify problem records
              logger.warn(
                `Batch ${batchNumber}: Bulk insertion failed - identifying problematic records`,
                { error: batchError.message }
              );

              // Try to extract which records failed from error message
              const failedEmails = extractFailedEmailsFromError(batchError);

              if (failedEmails.length > 0) {
                // We know which records failed - process accordingly
                logger.debug(
                  `Batch ${batchNumber}: Identified ${failedEmails.length} problematic records`
                );

                // Separate good and bad records
                const validRecords = batch.filter(
                  (record) => !failedEmails.includes(record.email)
                );
                const invalidRecords = batch.filter((record) =>
                  failedEmails.includes(record.email)
                );

                // Add errors for invalid records
                invalidRecords.forEach((record) => {
                  const recordIndex =
                    batch.findIndex((r) => r.email === record.email) + 1;
                  recordErrors.push({
                    batchNumber,
                    recordIndex,
                    email: record.email,
                    firstName: record.firstName,
                    lastName: record.lastName,
                    stage: "hubspot",
                    reason: extractErrorReasonForEmail(
                      batchError,
                      record.email
                    ),
                    timestamp: new Date().toISOString(),
                  });
                });

                // Retry with only valid records
                if (validRecords.length > 0) {
                  try {
                    logger.debug(
                      `Batch ${batchNumber}: Retrying with ${validRecords.length} valid records`
                    );

                    const retryResults = await createContactsLoanLeads(
                      validRecords
                    );
                    successfulRecords = validRecords;
                    hubspotResults = retryResults;

                    logger.debug(
                      `Batch ${batchNumber}: Retry successful - ${validRecords.length} records inserted`
                    );
                  } catch (retryError: any) {
                    logger.error(
                      `Batch ${batchNumber}: Retry also failed - falling back to individual processing`,
                      { error: retryError }
                    );

                    // Fall back to individual processing
                    const individualResult = await processRecordsIndividually(
                      validRecords,
                      batchNumber,
                      batch
                    );
                    successfulRecords = individualResult.successful;
                    hubspotResults = individualResult.hubspotResults;
                    recordErrors.push(...individualResult.errors);
                  }
                }
              } else {
                // Can't identify specific failures - process individually
                logger.debug(
                  `Batch ${batchNumber}: Cannot identify specific failures - processing individually`
                );

                const individualResult = await processRecordsIndividually(
                  batch,
                  batchNumber,
                  batch
                );
                successfulRecords = individualResult.successful;
                hubspotResults = individualResult.hubspotResults;
                recordErrors.push(...individualResult.errors);
              }
            }

            // Step 2: Insert successful records into DB
            let dbInsertedCount = 0;
            if (successfulRecords.length > 0) {
              try {
                const dbResult = await createCSVContacts(
                  successfulRecords,
                  userId,
                  hubspotResults
                );
                dbInsertedCount = dbResult.count;

                logger.debug(
                  `Batch ${batchNumber}: DB insertion completed (${dbInsertedCount} records)`
                );
              } catch (dbError: any) {
                logger.error(`Batch ${batchNumber}: DB insertion error`, {
                  error: dbError,
                });

                // Mark all as DB failures
                successfulRecords.forEach((record) => {
                  const originalIndex =
                    batch.findIndex((r) => r.email === record.email) + 1;

                  recordErrors.push({
                    batchNumber,
                    recordIndex: originalIndex,
                    email: record.email,
                    firstName: record.firstName,
                    lastName: record.lastName,
                    stage: "database",
                    reason: dbError?.message || "Database insertion failed",
                    timestamp: new Date().toISOString(),
                  });
                });

                dbInsertedCount = 0;
              }
            }
            
            // Store batch result
            batchResults.push({
              inserted: dbInsertedCount,
              failed: batch.length - dbInsertedCount,
              hubspotResults,
              errors: recordErrors,
            });

            logger.debug(
              `Batch ${batchNumber}/${batches.length} completed - Inserted: ${dbInsertedCount}, Failed: ${recordErrors.length}`
            );

            callback();
          } catch (error) {
            logger.error(`Batch ${batchNumber}: Unexpected error`, { error });

            batchResults.push({
              inserted: 0,
              failed: batch.length,
              hubspotResults: [],
              errors: batch.map((record, recordIndex) => ({
                batchNumber,
                recordIndex: recordIndex + 1,
                email: record.email,
                firstName: record.firstName,
                lastName: record.lastName,
                stage: "hubspot",
                reason:
                  error instanceof Error
                    ? error.message
                    : "Unexpected batch processing error",
                timestamp: new Date().toISOString(),
              })),
            });

            callback();
          }
        })();
      },
      1
    );

    processingQueue.drain(() => {
      resolve();
    });

    processingQueue.error((error) => {
      logger.error("Queue processing error", { error });
    });

    batches.forEach((batch, index) => {
      processingQueue.push({ batch, index });
    });
  });
};

// Helper: Process records individually (fallback)
const processRecordsIndividually = async (
  records: ContactsLead[],
  batchNumber: number,
  originalBatch: ContactsLead[]
): Promise<{
  successful: ContactsLead[];
  hubspotResults: any[];
  errors: RecordError[];
}> => {
  const successful: ContactsLead[] = [];
  const hubspotResults: any[] = [];
  const errors: RecordError[] = [];

  for (const record of records) {
    try {
      const result = await createContactsLoanLeads([record]);

      if (result && result.length > 0) {
        successful.push(record);
        hubspotResults.push(result[0]);
      } else {
        const recordIndex =
          originalBatch.findIndex((r) => r.email === record.email) + 1;
        errors.push({
          batchNumber,
          recordIndex,
          email: record.email,
          firstName: record.firstName,
          lastName: record.lastName,
          stage: "hubspot",
          reason: "HubSpot returned empty result",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      const recordIndex =
        originalBatch.findIndex((r) => r.email === record.email) + 1;
      errors.push({
        batchNumber,
        recordIndex,
        email: record.email,
        firstName: record.firstName,
        lastName: record.lastName,
        stage: "hubspot",
        reason:
          error?.response?.data?.message ||
          error?.message ||
          "HubSpot insertion failed",
        timestamp: new Date().toISOString(),
      });
    }
  }

  return { successful, hubspotResults, errors };
};

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

// Helper: Extract specific error reason for an email
const extractErrorReasonForEmail = (error: any, email: string): string => {
  try {
    const errorMessage = error?.response?.data?.message || error?.message || "";

    if (
      errorMessage.toLowerCase().includes("duplicate") ||
      errorMessage.toLowerCase().includes("already exists")
    ) {
      return `Contact with email ${email} already exists in HubSpot`;
    }

    if (errorMessage.toLowerCase().includes("invalid email")) {
      return `Invalid email format: ${email}`;
    }

    return errorMessage || "Failed to create contact in HubSpot";
  } catch {
    return "Failed to create contact in HubSpot";
  }
};

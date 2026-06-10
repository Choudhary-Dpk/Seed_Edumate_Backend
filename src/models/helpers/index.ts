import prisma from "../../config/prisma";
import { Row } from "../../types/leads.types";

// Map legacy email type titles to DB slugs
const TITLE_TO_SLUG: Record<string, string> = {
  "Set Password": "set-password",
  "Otp": "otp",
  "Forgot Password": "forgot-password",
  "Show Interest": "show-interest",
  "Monthly MIS Performance Report": "monthly-mis-report",
  "Event Registration Confirmation": "event-registration-confirmation",
  "Loan Connect Reminder": "loan-connect-reminder",
};

/**
 * Fetches email template HTML by emailType.
 *
 * Accepts either a legacy title (mapped to its slug via TITLE_TO_SLUG) OR a
 * slug directly. New templates only need to be seeded — no entry here is
 * required; the value is treated as a slug and looked up in the DB.
 * Falls back to an empty string if no active template matches.
 */
export const getEmailTemplate = async (title: string): Promise<string> => {
  const slug = TITLE_TO_SLUG[title] ?? title;

  try {
    const template = await prisma.emailTemplate.findFirst({
      where: { slug, is_active: true, is_deleted: false },
      select: { html_content: true },
    });

    if (template?.html_content) {
      return template.html_content;
    }
  } catch {
    // DB not migrated yet or query failed — fall through
  }

  return "";
};

export const getUserDetailsByEmail = async (email: string) => {
  const userData = await prisma.b2BPartnersUsers.findFirst({
    where: {
      email,
      is_active: true,
    },
    select: {
      id: true,
      is_active: true,
      email: true,
      password_hash: true,
      updated_at: true,
      full_name: true,
    },
  });

  return userData;
};

export const getAdminDetailsByEmail = async (email: string) => {
  const adminData = await prisma.adminUsers.findFirst({
    where: {
      email,
      is_active: true,
    },
    select: {
      id: true,
      is_active: true,
      email: true,
      password_hash: true,
      updated_at: true,
      full_name: true,
    },
  });

  return adminData;
};

export const addFileType = async (fileName: string) => {
  const fileType = await prisma.fileEntities.upsert({
    where: { type: fileName },
    update: {},
    create: { type: fileName, description: `${fileName} files` },
  });

  return fileType;
};

export const addFileRecord = async (
  filename: string,
  mime_type: string,
  rows: Row,
  total_records: number,
  uploadedBy: number,
  fileId: number,
) => {
  const fileUpload = await prisma.fileUploads.create({
    data: {
      filename,
      mime_type,
      file_data: rows,
      total_records,
      uploaded_by_id: uploadedBy,
      entity_type_id: fileId,
    },
    include: { entity_type: true },
  });

  return fileUpload;
};

export const updateFileRecord = async (
  fileId: number,
  processedRecords: number,
  failedRecords: number,
) => {
  await prisma.fileUploads.update({
    where: { id: fileId },
    data: {
      processed_records: processedRecords,
      failed_records: failedRecords,
      processed_at: new Date(),
    },
  });
};

export const getModulePermissions = async (userId: number) => {
  const user = await prisma.b2BPartnersUsers.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return user?.roles ?? [];
};

export const fetchCurrencyConfigs = async () => {
  const currencyConfigs = await prisma.currencyConfigs.findMany({
    orderBy: {
      code: "asc",
    },
  });
  return currencyConfigs;
};

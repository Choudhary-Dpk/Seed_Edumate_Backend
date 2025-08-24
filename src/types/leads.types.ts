import { ApplicationStatusEnum } from "@prisma/client";

export type Row = {
  name: string;
  email: string;
  loanAmountRequested: number;
  loanAmountApproved: number;
  loanTenureYears: number;
  applicationStatus: ApplicationStatusType;
  userId: number;
  createdBy: number;
};

export type ValidationResult = {
  validRows: Row[];
  errors: { row: number; reason: string }[];
};

export type ApplicationStatusType =
  | "Pre-Approved"
  | "Approved"
  | "Sanction Letter Issued"
  | "Disbursement Pending"
  | "Disbursed"
  | "Rejected"
  | "On Hold"
  | "Withdrawn"
  | "Cancelled";

export const ApplicationStatusToEnum: Record<
  ApplicationStatusType,
  ApplicationStatusEnum
> = {
  "Pre-Approved": ApplicationStatusEnum.PRE_APPROVED,
  Approved: ApplicationStatusEnum.APPROVED,
  "Sanction Letter Issued": ApplicationStatusEnum.SANCTION_LETTER_ISSUED,
  "Disbursement Pending": ApplicationStatusEnum.DISBURSEMENT_PENDING,
  Disbursed: ApplicationStatusEnum.DISBURSED,
  Rejected: ApplicationStatusEnum.REJECTED,
  "On Hold": ApplicationStatusEnum.ON_HOLD,
  Withdrawn: ApplicationStatusEnum.WITHDRAWN,
  Cancelled: ApplicationStatusEnum.CANCELLED,
};

export type FileData = {
  filename: string;
  mime_type: string;
  file_data: any;
  total_records: number;
  uploaded_by_id: number;
  entity_type: string;
};
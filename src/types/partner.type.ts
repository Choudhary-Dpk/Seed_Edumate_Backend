import { ApiAccessStatus, B2BIntegrationStatus, PortalAccessStatus, PartnerRecordStatus, B2BDataSource } from "@prisma/client";

// ApiAccessStatus mapping
export const apiAccessStatusMap: Record<string, ApiAccessStatus> = {
  Yes: ApiAccessStatus.YES,
  No: ApiAccessStatus.NO,
  "Not Required": ApiAccessStatus.NOT_REQUIRED,
};

// B2BDataSource mapping
export const b2bDataSourceMap: Record<string, B2BDataSource> = {
  "Manual Entry": B2BDataSource.MANUAL_ENTRY,
  Import: B2BDataSource.IMPORT,
  "Partner Application": B2BDataSource.PARTNER_APPLICATION,
  Referral: B2BDataSource.REFERRAL,
};

// B2BIntegrationStatus mapping
export const b2bIntegrationStatusMap: Record<string, B2BIntegrationStatus> = {
  "Not Required": B2BIntegrationStatus.NOT_REQUIRED,
  Pending: B2BIntegrationStatus.PENDING,
  Complete: B2BIntegrationStatus.COMPLETE,
  Issues: B2BIntegrationStatus.ISSUES,
};

// PartnerRecordStatus mapping
export const partnerRecordStatusMap: Record<string, PartnerRecordStatus> = {
  Active: PartnerRecordStatus.ACTIVE,
  Inactive: PartnerRecordStatus.INACTIVE,
  Suspended: PartnerRecordStatus.SUSPENDED,
  "Under Review": PartnerRecordStatus.UNDER_REVIEW,
  Archived: PartnerRecordStatus.ARCHIVED,
};

// PortalAccessStatus mapping
export const portalAccessStatusMap: Record<string, PortalAccessStatus> = {
  Yes: PortalAccessStatus.YES,
  No: PortalAccessStatus.NO,
  Pending: PortalAccessStatus.PENDING,
};
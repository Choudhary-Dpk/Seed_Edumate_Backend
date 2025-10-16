// Settlement Period Mapping
export const settlementPeriodMap: Record<string, string> = {
  Monthly: "MONTHLY",
  Quarterly: "QUARTERLY",
  "Half Yearly": "HALF_YEARLY",
  Yearly: "YEARLY",
  "Ad Hoc": "AD_HOC",
};

// Settlement Month Mapping
export const settlementMonthMap: Record<string, string> = {
  January: "JANUARY",
  February: "FEBRUARY",
  March: "MARCH",
  April: "APRIL",
  May: "MAY",
  June: "JUNE",
  July: "JULY",
  August: "AUGUST",
  September: "SEPTEMBER",
  October: "OCTOBER",
  November: "NOVEMBER",
  December: "DECEMBER",
};

// Settlement Status Mapping
export const settlementStatusMap: Record<string, string> = {
  "Pending Calculation": "PENDING_CALCULATION",
  Calculated: "CALCULATED",
  "Pending Approval": "PENDING_APPROVAL",
  Approved: "APPROVED",
  "Payment Initiated": "PAYMENT_INITIATED",
  Paid: "PAID",
  "On Hold": "ON_HOLD",
  Rejected: "REJECTED",
  Cancelled: "CANCELLED",
  Disputed: "DISPUTED",
};

// Verification Status Mapping
export const verificationStatusMap: Record<string, string> = {
  Pending: "PENDING",
  "In Progress": "IN_PROGRESS",
  Verified: "VERIFIED",
  Rejected: "REJECTED",
  Expired: "EXPIRED",
  "Not Required": "NOT_REQUIRED",
  "Additional Info Required": "ADDITIONAL_INFO_REQUIRED",
};

// Commission Data Source Mapping
export const commissionDataSourceMap: Record<string, string> = {
  "Manual Entry": "MANUAL_ENTRY",
  "Automated Calculation": "AUTOMATED_CALCULATION",
  Import: "IMPORT",
  Api: "API",
  "Bulk Upload": "BULK_UPLOAD",
};

// Integration Status Mapping
export const integrationStatusMap: Record<string, string> = {
  Synced: "SYNCED",
  "Pending Sync": "PENDING_SYNC",
  "Sync Failed": "SYNC_FAILED",
  "Not Required": "NOT_REQUIRED",
};

// Settlement Record Status Mapping
export const settlementRecordStatusMap: Record<string, string> = {
  Active: "ACTIVE",
  Completed: "COMPLETED",
  Cancelled: "CANCELLED",
  Archived: "ARCHIVED",
  "Under Investigation": "UNDER_INVESTIGATION",
};

// System Generated Mapping
export const systemGeneratedMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  Partially: "PARTIALLY",
};

// Disbursement Trigger Mapping
export const disbursementTriggerMap: Record<string, string> = {
  "Loan Disbursed": "LOAN_DISBURSED",
  "Application Approved": "APPLICATION_APPROVED",
  "Target Achieved": "TARGET_ACHIEVED",
  "Manual Trigger": "MANUAL_TRIGGER",
  "Scheduled Payment": "SCHEDULED_PAYMENT",
};

// Transaction Types Mapping
export const transactionTypesMap: Record<string, string> = {
  "Commission Payment": "COMMISSION_PAYMENT",
  "Bonus Payment": "BONUS_PAYMENT",
  Adjustment: "ADJUSTMENT",
  Reversal: "REVERSAL",
  "Penalty Deduction": "PENALTY_DEDUCTION",
  "Advance Payment": "ADVANCE_PAYMENT",
  "Final Settlement": "FINAL_SETTLEMENT",
};

// Commission Model Mapping
export const commissionModelMap: Record<string, string> = {
  Percentage: "PERCENTAGE",
  "Fixed Amount": "FIXED_AMOUNT",
  Tiered: "TIERED",
  Hybrid: "HYBRID",
  "Performance Based": "PERFORMANCE_BASED",
};

// Acknowledgment Status Mapping
export const acknowledgmentStatusMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  Pending: "PENDING",
};

// Notification Method Mapping
export const notificationMethodMap: Record<string, string> = {
  Email: "EMAIL",
  Sms: "SMS",
  Whatsapp: "WHATSAPP",
  "Phone Call": "PHONE_CALL",
  "Portal Notification": "PORTAL_NOTIFICATION",
};

// Partner Notification Sent Mapping
export const partnerNotificationSentMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  Pending: "PENDING",
  Failed: "FAILED",
};

// Payment Method Mapping
export const paymentMethodMap: Record<string, string> = {
  "Bank Transfer": "BANK_TRANSFER",
  Neft: "NEFT",
  Rtgs: "RTGS",
  Imps: "IMPS",
  Upi: "UPI",
  Cheque: "CHEQUE",
  "Demand Draft": "DEMAND_DRAFT",
  "Digital Wallet": "DIGITAL_WALLET",
  "International Wire": "INTERNATIONAL_WIRE",
};

// Payment Status Mapping
export const paymentStatusMap: Record<string, string> = {
  Pending: "PENDING",
  Initiated: "INITIATED",
  "In Process": "IN_PROCESS",
  Completed: "COMPLETED",
  Failed: "FAILED",
  Cancelled: "CANCELLED",
  Returned: "RETURNED",
};

// Invoice Status Mapping
export const invoiceStatusMap: Record<string, string> = {
  Pending: "PENDING",
  Generated: "GENERATED",
  Sent: "SENT",
  Received: "RECEIVED",
  Approved: "APPROVED",
  Rejected: "REJECTED",
};

// Tax Certificate Required Mapping
export const taxCertificateRequiredMap: Record<string, string> = {
  Yes: "YES",
  No: "NO",
  "Auto Generated": "AUTO_GENERATED",
};

// Hold Reason Mapping
export const holdReasonMap: Record<string, string> = {
  "Document Verification Pending": "DOCUMENT_VERIFICATION_PENDING",
  "Invoice Issues": "INVOICE_ISSUES",
  "Partner Agreement Dispute": "PARTNER_AGREEMENT_DISPUTE",
  "Calculation Error": "CALCULATION_ERROR",
  "Compliance Issues": "COMPLIANCE_ISSUES",
  "Management Review": "MANAGEMENT_REVIEW",
  "Legal Issues": "LEGAL_ISSUES",
  "System Error": "SYSTEM_ERROR",
};

// Reconciliation Status Mapping
export const reconciliationStatusMap: Record<string, string> = {
  Pending: "PENDING",
  Reconciled: "RECONCILED",
  "Discrepancy Found": "DISCREPANCY_FOUND",
  "Under Review": "UNDER_REVIEW",
  Resolved: "RESOLVED",
};

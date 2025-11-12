export const categorizeCommissionSettlementByTable = (
  mappedFields: Record<string, any>
) => {
  const categorized: Record<string, Record<string, any>> = {};

  // Main Commission Settlement Fields
  const mainSettlementFields = [
    "application_id",
    "lead_reference_id",
    "settlement_id",
    "student_id",
    "partner_id",
    "partner_name",
    "student_name",
    "verified_by",
    "settlement_period",
    "settlement_month",
    "settlement_year",
    "settlement_reference_number",
    "is_active",
    "created_by",
    "updated_by",
    "hs_created_by_user_id",
    "hs_createdate",
    "hs_lastmodifieddate",
    "hs_object_id",
    "hs_updated_by_user_id",
    "hubspot_owner_id",
  ];

  // Settlement Status Fields
  const settlementStatusFields = [
    "calculated_by",
    "calculation_date",
    "settlement_status",
    "verification_date",
    "verification_status",
  ];

  // System Tracking Fields
  const systemTrackingFields = [
    "audit_trail",
    "change_log",
    "created_date",
    "data_source",
    "integration_status",
    "internal_notes",
    "last_modified_by",
    "last_modified_date",
    "notes",
    "settlement_record_status",
    "system_generated",
    "version_number",
  ];

  // Transaction Details Fields
  const transactionDetailsFields = [
    "batch_payment_id",
    "disbursement_trigger",
    "original_transaction_id",
    "related_settlement_id",
    "transaction_sub_type",
    "transaction_type",
  ];

  // Commission Calculation Fields
  const commissionCalculationFields = [
    "commission_model",
    "commission_rate_applied",
    "commission_tier_applied",
    "gross_commission_amount",
    "bonus_amount",
    "bonus_rate_applied",
    "incentive_amount",
    "adjustment_amount",
    "adjustment_reason",
    "penalty_amount",
    "total_gross_amount",
  ];

  // Communication Fields
  const communicationFields = [
    "acknowledgment_date",
    "acknowledgment_received",
    "communication_log",
    "email_sent_count",
    "last_communication_date",
    "notification_date",
    "notification_method",
    "partner_notification_sent",
    "sms_sent_count",
  ];

  // Loan Details Fields
  const loanDetailsFields = [
    "course_name",
    "lender_name",
    "loan_amount_disbursed",
    "loan_disbursement_date",
    "loan_product_name",
    "student_destination_country",
    "university_name",
  ];

  // Payment Processing Fields
  const paymentProcessingFields = [
    "beneficiary_name",
    "beneficiary_account_number",
    "beneficiary_bank_name",
    "beneficiary_ifsc_code",
    "last_retry_date",
    "payment_completed_date",
    "payment_failure_reason",
    "payment_initiation_date",
    "payment_method",
    "payment_reference_number",
    "payment_status",
    "retry_attempt_count",
    "bank_transaction_id",
    "payment_gateway_reference",
  ];

  // Tax and Deductions Fields
  const taxDeductionsFields = [
    "gst_applicable",
    "gst_rate_applied",
    "gst_amount",
    "net_payable_amount",
    "service_tax_amount",
    "other_deductions",
    "other_deductions_description",
    "tds_applicable",
    "tds_rate_applied",
    "tds_amount",
    "tds_certificate_number",
    "withholding_tax_applicable",
    "withholding_tax_rate",
    "withholding_tax_amount",
    "total_deductions",
  ];

  // Documentation Fields
  const documentationFields = [
    "agreement_reference",
    "invoice_required",
    "invoice_number",
    "invoice_date",
    "invoice_amount",
    "invoice_status",
    "invoice_url",
    "payment_terms_applied",
    "supporting_documents",
    "tax_certificate_required",
    "tax_certificate_url",
  ];

  // Hold and Disputes Fields
  const holdDisputesFields = [
    "dispute_date",
    "dispute_description",
    "dispute_raised",
    "dispute_raised_by",
    "dispute_resolution",
    "dispute_resolution_date",
    "dispute_resolved_by",
    "hold_date",
    "hold_initiated_by",
    "hold_reason",
    "hold_release_approved_by",
    "hold_release_date",
    "on_hold",
  ];

  // Reconciliation Fields
  const reconciliationFields = [
    "reconciliation_status",
    "reconciliation_date",
    "reconciled_by",
    "reconciliation_notes",
    "bank_statement_reference",
    "discrepancy_amount",
    "discrepancy_reason",
  ];

  // Performance Analytics Fields
  const performanceAnalyticsFields = [
    "sla_breach",
    "sla_breach_reason",
    "partner_satisfaction_rating",
    "payment_delay_days",
    "processing_time_days",
  ];

  // Categorize main settlement
  const mainSettlement: Record<string, any> = {};
  for (const field of mainSettlementFields) {
    if (field in mappedFields) {
      mainSettlement[field] = mappedFields[field];
    }
  }
  if (Object.keys(mainSettlement).length > 0) {
    categorized.mainSettlement = mainSettlement;
  }

  // Categorize settlement status
  const settlementStatus: Record<string, any> = {};
  for (const field of settlementStatusFields) {
    if (field in mappedFields) {
      settlementStatus[field] = mappedFields[field];
    }
  }
  if (Object.keys(settlementStatus).length > 0) {
    categorized.settlementStatus = settlementStatus;
  }

  // Categorize system tracking
  const systemTracking: Record<string, any> = {};
  for (const field of systemTrackingFields) {
    if (field in mappedFields) {
      systemTracking[field] = mappedFields[field];
    }
  }
  if (Object.keys(systemTracking).length > 0) {
    categorized.systemTracking = systemTracking;
  }

  // Categorize transaction details
  const transactionDetails: Record<string, any> = {};
  for (const field of transactionDetailsFields) {
    if (field in mappedFields) {
      transactionDetails[field] = mappedFields[field];
    }
  }
  if (Object.keys(transactionDetails).length > 0) {
    categorized.transactionDetails = transactionDetails;
  }

  // Categorize commission calculation
  const commissionCalculation: Record<string, any> = {};
  for (const field of commissionCalculationFields) {
    if (field in mappedFields) {
      commissionCalculation[field] = mappedFields[field];
    }
  }
  if (Object.keys(commissionCalculation).length > 0) {
    categorized.commissionCalculation = commissionCalculation;
  }

  // Categorize communication
  const communication: Record<string, any> = {};
  for (const field of communicationFields) {
    if (field in mappedFields) {
      communication[field] = mappedFields[field];
    }
  }
  if (Object.keys(communication).length > 0) {
    categorized.communication = communication;
  }

  // Categorize loan details
  const loanDetails: Record<string, any> = {};
  for (const field of loanDetailsFields) {
    if (field in mappedFields) {
      loanDetails[field] = mappedFields[field];
    }
  }
  if (Object.keys(loanDetails).length > 0) {
    categorized.loanDetails = loanDetails;
  }

  // Categorize payment processing
  const paymentProcessing: Record<string, any> = {};
  for (const field of paymentProcessingFields) {
    if (field in mappedFields) {
      paymentProcessing[field] = mappedFields[field];
    }
  }
  if (Object.keys(paymentProcessing).length > 0) {
    categorized.paymentProcessing = paymentProcessing;
  }

  // Categorize tax deductions
  const taxDeductions: Record<string, any> = {};
  for (const field of taxDeductionsFields) {
    if (field in mappedFields) {
      taxDeductions[field] = mappedFields[field];
    }
  }
  if (Object.keys(taxDeductions).length > 0) {
    categorized.taxDeductions = taxDeductions;
  }

  // Categorize documentation
  const documentation: Record<string, any> = {};
  for (const field of documentationFields) {
    if (field in mappedFields) {
      documentation[field] = mappedFields[field];
    }
  }
  if (Object.keys(documentation).length > 0) {
    categorized.documentation = documentation;
  }

  // Categorize hold disputes
  const holdDisputes: Record<string, any> = {};
  for (const field of holdDisputesFields) {
    if (field in mappedFields) {
      holdDisputes[field] = mappedFields[field];
    }
  }
  if (Object.keys(holdDisputes).length > 0) {
    categorized.holdDisputes = holdDisputes;
  }

  // Categorize reconciliation
  const reconciliation: Record<string, any> = {};
  for (const field of reconciliationFields) {
    if (field in mappedFields) {
      reconciliation[field] = mappedFields[field];
    }
  }
  if (Object.keys(reconciliation).length > 0) {
    categorized.reconciliation = reconciliation;
  }

  // Categorize performance analytics
  const performanceAnalytics: Record<string, any> = {};
  for (const field of performanceAnalyticsFields) {
    if (field in mappedFields) {
      performanceAnalytics[field] = mappedFields[field];
    }
  }
  if (Object.keys(performanceAnalytics).length > 0) {
    categorized.performanceAnalytics = performanceAnalytics;
  }

  return categorized;
};

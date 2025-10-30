export const categorizeHSLendersByTable = (
  mappedFields: Record<string, any>
) => {
  const categorized: Record<string, Record<string, any>> = {};

  // Main HSLenders Fields
  const hsLendersFields = [
    "external_id",
    "lender_display_name",
    "lender_name",
    "legal_name",
    "short_code",
    "lender_logo_url",
    "website_url",
    "lender_category",
    "lender_type",
    "is_active",
    "created_at",
    "updated_at",
    "created_by",
    "updated_by",
    "hs_created_by_user_id",
    "hs_createdate",
    "hs_lastmodifieddate",
    "hs_object_id",
    "hs_updated_by_user_id",
    "hubspot_owner_id",
  ];

  // HSLendersContactInfo Fields
  const hsLendersContactInfoFields = [
    "primary_contact_email",
    "primary_contact_phone",
    "primary_contact_designation",
    "primary_contact_person",
    "relationship_manager_email",
    "relationship_manager_name",
    "relationship_manager_phone",
    "escalation_hierarchy_1_designation",
    "escalation_hierarchy_1_email",
    "escalation_hierarchy_1_name",
    "escalation_hierarchy_1_phone",
    "customer_service_email",
    "customer_service_number",
  ];

  // HSLendersBusinessMetrics Fields
  const hsLendersBusinessMetricsFields = [
    "average_approval_rate",
    "monthly_application_volume",
    "quarterly_application_volume",
    "yearly_application_volume",
    "average_processing_days",
    "average_disbursement_days",
  ];

  // HSLendersLoanOfferings Fields
  const hsLendersLoanOfferingsFields = [
    "co_signer_requirements",
    "collateral_requirements",
    "interest_rate_range_max_secured",
    "interest_rate_range_max_unsecured",
    "interest_rate_range_min_secured",
    "interest_rate_range_min_unsecured",
    "margin_money_requirement",
    "maximum_loan_amount_secured",
    "maximum_loan_amount_unsecured",
    "minimum_loan_amount_secured",
    "minimum_loan_amount_unsecured",
    "not_supported_universities",
    "processing_fee_range",
    "special_programs",
    "supported_course_types",
    "supported_destinations",
  ];

  // HSLendersOperationalDetails Fields
  const hsLendersOperationalDetailsFields = [
    "api_connectivity_status",
    "digital_integration_level",
    "documentation_requirements",
    "holiday_processing",
    "late_payment_charges",
    "prepayment_charges",
    "repayment_options",
    "turnaround_time_commitment",
    "working_hours",
  ];

  // HSLendersPartnershipsDetails Fields
  const hsLendersPartnershipsDetailsFields = [
    "partnership_type",
    "agreement_start_date",
    "agreement_end_date",
    "auto_renewal",
    "renewal_notice_days",
    "commission_structure",
    "commission_percentage",
    "partnership_end_date",
    "partnership_start_date",
    "partnership_status",
    "payout_terms",
    "revenue_share_model",
  ];

  // HSLendersSystemTracking Fields
  const hsLendersSystemTrackingFields = [
    "data_source",
    "lender_record_status",
    "notes",
    "performance_rating",
    "last_modified_by",
    "last_modified_date",
  ];

  // Categorize HSLenders main table
  const hsLenders: Record<string, any> = {};
  for (const field of hsLendersFields) {
    if (field in mappedFields) {
      hsLenders[field] = mappedFields[field];
    }
  }
  if (Object.keys(hsLenders).length > 0) {
    categorized.hsLenders = hsLenders;
  }

  // Categorize HSLendersContactInfo
  const hsLendersContactInfo: Record<string, any> = {};
  for (const field of hsLendersContactInfoFields) {
    if (field in mappedFields) {
      hsLendersContactInfo[field] = mappedFields[field];
    }
  }
  if (Object.keys(hsLendersContactInfo).length > 0) {
    categorized.hsLendersContactInfo = hsLendersContactInfo;
  }

  // Categorize HSLendersBusinessMetrics
  const hsLendersBusinessMetrics: Record<string, any> = {};
  for (const field of hsLendersBusinessMetricsFields) {
    if (field in mappedFields) {
      hsLendersBusinessMetrics[field] = mappedFields[field];
    }
  }
  if (Object.keys(hsLendersBusinessMetrics).length > 0) {
    categorized.hsLendersBusinessMetrics = hsLendersBusinessMetrics;
  }

  // Categorize HSLendersLoanOfferings
  const hsLendersLoanOfferings: Record<string, any> = {};
  for (const field of hsLendersLoanOfferingsFields) {
    if (field in mappedFields) {
      hsLendersLoanOfferings[field] = mappedFields[field];
    }
  }
  if (Object.keys(hsLendersLoanOfferings).length > 0) {
    categorized.hsLendersLoanOfferings = hsLendersLoanOfferings;
  }

  // Categorize HSLendersOperationalDetails
  const hsLendersOperationalDetails: Record<string, any> = {};
  for (const field of hsLendersOperationalDetailsFields) {
    if (field in mappedFields) {
      hsLendersOperationalDetails[field] = mappedFields[field];
    }
  }
  if (Object.keys(hsLendersOperationalDetails).length > 0) {
    categorized.hsLendersOperationalDetails = hsLendersOperationalDetails;
  }

  // Categorize HSLendersPartnershipsDetails
  const hsLendersPartnershipsDetails: Record<string, any> = {};
  for (const field of hsLendersPartnershipsDetailsFields) {
    if (field in mappedFields) {
      hsLendersPartnershipsDetails[field] = mappedFields[field];
    }
  }
  if (Object.keys(hsLendersPartnershipsDetails).length > 0) {
    categorized.hsLendersPartnershipsDetails = hsLendersPartnershipsDetails;
  }

  // Categorize HSLendersSystemTracking
  const hsLendersSystemTracking: Record<string, any> = {};
  for (const field of hsLendersSystemTrackingFields) {
    if (field in mappedFields) {
      hsLendersSystemTracking[field] = mappedFields[field];
    }
  }
  if (Object.keys(hsLendersSystemTracking).length > 0) {
    categorized.hsLendersSystemTracking = hsLendersSystemTracking;
  }

  return categorized;
};

// Alternative categorization by functional areas (similar to loan application structure)
export const categorizeHSLendersByFunctionalArea = (
  mappedFields: Record<string, any>
) => {
  const categorized: Record<string, Record<string, any>> = {};

  // Basic Lender Information
  const basicInformationFields = [
    "external_id",
    "lender_display_name",
    "lender_name",
    "legal_name",
    "short_code",
    "lender_logo_url",
    "website_url",
    "lender_category",
    "lender_type",
    "is_active",
  ];

  // Contact & Communication
  const contactCommunicationFields = [
    "primary_contact_email",
    "primary_contact_phone",
    "primary_contact_designation",
    "primary_contact_person",
    "relationship_manager_email",
    "relationship_manager_name",
    "relationship_manager_phone",
    "escalation_hierarchy_1_designation",
    "escalation_hierarchy_1_email",
    "escalation_hierarchy_1_name",
    "escalation_hierarchy_1_phone",
    "customer_service_email",
    "customer_service_number",
  ];

  // Performance & Metrics
  const performanceMetricsFields = [
    "average_approval_rate",
    "monthly_application_volume",
    "quarterly_application_volume",
    "yearly_application_volume",
    "average_processing_days",
    "average_disbursement_days",
    "performance_rating",
  ];

  // Loan Product Configuration
  const loanProductConfigFields = [
    "co_signer_requirements",
    "collateral_requirements",
    "interest_rate_range_max_secured",
    "interest_rate_range_max_unsecured",
    "interest_rate_range_min_secured",
    "interest_rate_range_min_unsecured",
    "margin_money_requirement",
    "maximum_loan_amount_secured",
    "maximum_loan_amount_unsecured",
    "minimum_loan_amount_secured",
    "minimum_loan_amount_unsecured",
    "not_supported_universities",
    "processing_fee_range",
    "special_programs",
    "supported_course_types",
    "supported_destinations",
  ];

  // Operations & Processing
  const operationsProcessingFields = [
    "api_connectivity_status",
    "digital_integration_level",
    "documentation_requirements",
    "holiday_processing",
    "late_payment_charges",
    "prepayment_charges",
    "repayment_options",
    "turnaround_time_commitment",
    "working_hours",
  ];

  // Partnership & Commercial
  const partnershipCommercialFields = [
    "partnership_type",
    "agreement_start_date",
    "agreement_end_date",
    "auto_renewal",
    "renewal_notice_days",
    "commission_structure",
    "commission_percentage",
    "partnership_end_date",
    "partnership_start_date",
    "partnership_status",
    "payout_terms",
    "revenue_share_model",
  ];

  // System & Tracking
  const systemTrackingFields = [
    "data_source",
    "lender_record_status",
    "notes",
    "created_at",
    "updated_at",
    "created_by",
    "updated_by",
    "last_modified_by",
    "last_modified_date",
    "hs_created_by_user_id",
    "hs_createdate",
    "hs_lastmodifieddate",
    "hs_object_id",
    "hs_updated_by_user_id",
    "hubspot_owner_id",
  ];

  // Categorize basic information
  const basicInformation: Record<string, any> = {};
  for (const field of basicInformationFields) {
    if (field in mappedFields) {
      basicInformation[field] = mappedFields[field];
    }
  }
  if (Object.keys(basicInformation).length > 0) {
    categorized.basicInformation = basicInformation;
  }

  // Categorize contact & communication
  const contactCommunication: Record<string, any> = {};
  for (const field of contactCommunicationFields) {
    if (field in mappedFields) {
      contactCommunication[field] = mappedFields[field];
    }
  }
  if (Object.keys(contactCommunication).length > 0) {
    categorized.contactCommunication = contactCommunication;
  }

  // Categorize performance metrics
  const performanceMetrics: Record<string, any> = {};
  for (const field of performanceMetricsFields) {
    if (field in mappedFields) {
      performanceMetrics[field] = mappedFields[field];
    }
  }
  if (Object.keys(performanceMetrics).length > 0) {
    categorized.performanceMetrics = performanceMetrics;
  }

  // Categorize loan product configuration
  const loanProductConfig: Record<string, any> = {};
  for (const field of loanProductConfigFields) {
    if (field in mappedFields) {
      loanProductConfig[field] = mappedFields[field];
    }
  }
  if (Object.keys(loanProductConfig).length > 0) {
    categorized.loanProductConfig = loanProductConfig;
  }

  // Categorize operations & processing
  const operationsProcessing: Record<string, any> = {};
  for (const field of operationsProcessingFields) {
    if (field in mappedFields) {
      operationsProcessing[field] = mappedFields[field];
    }
  }
  if (Object.keys(operationsProcessing).length > 0) {
    categorized.operationsProcessing = operationsProcessing;
  }

  // Categorize partnership & commercial
  const partnershipCommercial: Record<string, any> = {};
  for (const field of partnershipCommercialFields) {
    if (field in mappedFields) {
      partnershipCommercial[field] = mappedFields[field];
    }
  }
  if (Object.keys(partnershipCommercial).length > 0) {
    categorized.partnershipCommercial = partnershipCommercial;
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

  return categorized;
};

// Usage example
export const processLenderData = (rawData: Record<string, any>) => {
  // First categorize by table
  const categorizedByTable = categorizeHSLendersByTable(rawData);

  // Alternatively, categorize by functional area
  const categorizedByFunction = categorizeHSLendersByFunctionalArea(rawData);

  return {
    byTable: categorizedByTable,
    byFunction: categorizedByFunction,
  };
};

// Helper function to determine which table(s) need to be updated
export const determineAffectedTables = (
  mappedFields: Record<string, any>
): string[] => {
  const affectedTables: string[] = [];
  const categorized = categorizeHSLendersByTable(mappedFields);

  for (const tableName in categorized) {
    if (Object.keys(categorized[tableName]).length > 0) {
      affectedTables.push(tableName);
    }
  }

  return affectedTables;
};

// Helper function to split data for batch operations
export const splitDataForBatchInsert = (
  dataArray: Record<string, any>[]
): Record<string, Record<string, any>[]> => {
  const batchData: Record<string, Record<string, any>[]> = {
    hsLenders: [],
    hsLendersContactInfo: [],
    hsLendersBusinessMetrics: [],
    hsLendersLoanOfferings: [],
    hsLendersOperationalDetails: [],
    hsLendersPartnershipsDetails: [],
    hsLendersSystemTracking: [],
  };

  for (const data of dataArray) {
    const categorized = categorizeHSLendersByTable(data);

    for (const tableName in categorized) {
      if (batchData[tableName]) {
        batchData[tableName].push(categorized[tableName]);
      }
    }
  }

  return batchData;
};

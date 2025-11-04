export const categorizeB2BByTable = (mappedFields: Record<string, any>) => {
  // Initialize with empty objects for ALL categories
  const categorized: Record<string, Record<string, any>> = {
    mainPartner: {},
    businessCapabilities: {},
    commissionStructure: {},
    complianceDocumentation: {},
    contactInfo: {},
    financialTracking: {},
    leadAttribution: {},
    marketingPromotion: {},
    partnershipDetails: {},
    performanceMetrics: {},
    relationshipManagement: {},
    systemTracking: {},
  };

  // Main Partner Fields
  const mainPartnerFields = [
    "business_address",
    "business_type",
    "city",
    "country",
    "gst_number",
    "incorporation_date",
    "pan_number",
    "partner_display_name",
    "partner_name",
    "partner_type",
    "pincode",
    "registration_number",
    "state",
    "website_url",
    "hs_created_by_user_id",
    "hs_createdate",
    "hs_lastmodifieddate",
    "hs_object_id",
    "hs_updated_by_user_id",
    "hubspot_owner_id",
  ];

  // Business Capabilities Fields
  const businessCapabilitiesFields = [
    "experience_years",
    "student_capacity_monthly",
    "student_capacity_yearly",
    "target_courses",
    "target_desrinations",
    "target_universities",
    "team_size",
  ];

  // Commission Structure Fields
  const commissionStructureFields = [
    "bank_account_number",
    "bank_branch",
    "bank_name",
    "beneficiary_name",
    "bonus_structure",
    "commission_model",
    "commission_rate",
    "commission_type",
    "fixed_commission_amount",
    "gst_applicable",
    "ifsc_code",
    "invoice_requirements",
    "payment_frequency",
    "payment_method",
    "payment_terms",
    "tds_applicable",
    "tds_rate",
    "tiered_commission_structure",
  ];

  // Compliance & Documentation Fields
  const complianceDocumentationFields = [
    "agreement_signed_date",
    "background_verification_status",
    "kyc_completion_date",
    "kyc_status",
  ];

  // Contact Information Fields
  const contactInfoFields = [
    "accounts_contact_email",
    "accounts_contact_person",
    "accounts_contact_phone",
    "marketing_contact_email",
    "marketing_contact_person",
    "marketing_contact_phone",
    "primary_contact_designation",
    "primary_contact_email",
    "primary_contact_person",
    "primary_contact_phone",
    "secondary_contact_email",
    "secondary_contact_person",
    "secondary_contact_phone",
  ];

  // Financial Tracking Fields
  const financialTrackingFields = [
    "average_monthly_commission",
    "current_month_commission",
    "last_payment_amount",
    "last_payment_date",
    "lifetime_value",
    "next_payment_due_date",
    "outstanding_commission",
    "payment_status",
    "total_commission_earned",
    "total_commission_paid",
    "ytd_commission_earned",
    "ytd_commission_paid",
  ];

  // Lead Attribution Fields
  const leadAttributionFields = [
    "lead_submission_method",
    "lead_tracking_method",
    "tracking_link",
    "unique_referral_code",
    "utm_source_assigned",
  ];

  // Marketing & Promotion Fields
  const marketingPromotionFields = [
    "brand_usage_guidelines",
    "co_marketing_approval",
    "content_collaboration",
    "digital_presence_rating",
    "event_participation",
    "marketing_materials_provided",
    "promotional_activities",
    "social_media_followers",
  ];

  // Partnership Details Fields
  const partnershipDetailsFields = [
    "agreement_type",
    "partnership_end_date",
    "partnership_start_date",
    "partnership_status",
  ];

  // Performance Metrics Fields
  const performanceMetricsFields = [
    "application_conversion_rate",
    "applications_approved",
    "approval_conversion_rate",
    "average_lead_quality_score",
    "average_loan_amount",
    "best_performing_month",
    "last_lead_date",
    "lead_conversion_rate",
    "leads_converted_to_applications",
    "loans_disbursed",
    "partner_rating",
    "qualified_leads_provided",
    "seasonal_performance_pattern",
    "total_leads_provided",
    "total_loan_value_generated",
  ];

  // Relationship Management Fields
  const relationshipManagementFields = [
    "assigned_account_manager",
    "communication_frequency",
    "escalation_history",
    "feedback_comments",
    "joint_marketing_activities",
    "last_interaction_date",
    "relationship_status",
    "satisfaction_score",
    "training_completed",
  ];

  // System Tracking Fields
  const systemTrackingFields = [
    "partner_name",
    "api_access_provided",
    "created_by",
    "created_date",
    "data_source",
    "integration_status",
    "internal_tags",
    "last_modified_by",
    "last_modified_date",
    "notes",
    "partner_record_status",
    "portal_access_provided",
  ];

  // Populate mainPartner
  for (const field of mainPartnerFields) {
    if (field in mappedFields) {
      categorized.mainPartner[field] = mappedFields[field];
    }
  }

  // Populate businessCapabilities
  for (const field of businessCapabilitiesFields) {
    if (field in mappedFields) {
      categorized.businessCapabilities[field] = mappedFields[field];
    }
  }

  // Populate commissionStructure
  for (const field of commissionStructureFields) {
    if (field in mappedFields) {
      categorized.commissionStructure[field] = mappedFields[field];
    }
  }

  // Populate complianceDocumentation
  for (const field of complianceDocumentationFields) {
    if (field in mappedFields) {
      categorized.complianceDocumentation[field] = mappedFields[field];
    }
  }

  // Populate contactInfo
  for (const field of contactInfoFields) {
    if (field in mappedFields) {
      categorized.contactInfo[field] = mappedFields[field];
    }
  }

  // Populate financialTracking
  for (const field of financialTrackingFields) {
    if (field in mappedFields) {
      categorized.financialTracking[field] = mappedFields[field];
    }
  }

  // Populate leadAttribution
  for (const field of leadAttributionFields) {
    if (field in mappedFields) {
      categorized.leadAttribution[field] = mappedFields[field];
    }
  }

  // Populate marketingPromotion
  for (const field of marketingPromotionFields) {
    if (field in mappedFields) {
      categorized.marketingPromotion[field] = mappedFields[field];
    }
  }

  // Populate partnershipDetails
  for (const field of partnershipDetailsFields) {
    if (field in mappedFields) {
      categorized.partnershipDetails[field] = mappedFields[field];
    }
  }

  // Populate performanceMetrics
  for (const field of performanceMetricsFields) {
    if (field in mappedFields) {
      categorized.performanceMetrics[field] = mappedFields[field];
    }
  }

  // Populate relationshipManagement
  for (const field of relationshipManagementFields) {
    if (field in mappedFields) {
      categorized.relationshipManagement[field] = mappedFields[field];
    }
  }

  // Populate systemTracking
  for (const field of systemTrackingFields) {
    if (field in mappedFields) {
      categorized.systemTracking[field] = mappedFields[field];
    }
  }

  return categorized;
};

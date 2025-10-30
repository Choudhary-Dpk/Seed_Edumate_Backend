import {
  ApiAccessStatus,
  B2BDataSource,
  B2BIntegrationStatus,
  PartnerRecordStatus,
  PortalAccessStatus,
} from "@prisma/client";
import {
  apiAccessStatusMap,
  b2bDataSourceMap,
  b2bIntegrationStatusMap,
  partnerRecordStatusMap,
  portalAccessStatusMap,
} from "../../types/partner.type";

// Field Mappings - SEPARATED (no duplicates)
export const B2B_FIELD_MAPPINGS = {
  // Main B2B Partners Table (removed system tracking duplicates)
  mainPartner: [
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
  ],

  // Business Capabilities
  businessCapabilities: [
    "experience_years",
    "student_capacity_monthly",
    "student_capacity_yearly",
    "target_courses",
    "target_desrinations",
    "target_universities",
    "team_size",
  ],

  // Commission Structure
  commissionStructure: [
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
  ],

  // Compliance & Documentation
  complianceDocumentation: [
    "agreement_signed_date",
    "background_verification_status",
    "kyc_completion_date",
    "kyc_status",
  ],

  // Contact Information
  contactInfo: [
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
  ],

  // Financial Tracking
  financialTracking: [
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
  ],

  // Lead Attribution
  leadAttribution: [
    "lead_submission_method",
    "lead_tracking_method",
    "tracking_link",
    "unique_referral_code",
    "utm_source_assigned",
  ],

  // Marketing & Promotion
  marketingPromotion: [
    "brand_usage_guidelines",
    "co_marketing_approval",
    "content_collaboration",
    "digital_presence_rating",
    "event_participation",
    "marketing_materials_provided",
    "promotional_activities",
    "social_media_followers",
  ],

  // Partnership Details
  partnershipDetails: [
    "agreement_type",
    "partnership_end_date",
    "partnership_start_date",
    "partnership_status",
  ],

  // Performance Metrics
  performanceMetrics: [
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
  ],

  // Relationship Management
  relationshipManagement: [
    "assigned_account_manager",
    "communication_frequency",
    "escalation_history",
    "feedback_comments",
    "joint_marketing_activities",
    "last_interaction_date",
    "relationship_status",
    "satisfaction_score",
    "training_completed",
  ],

  // System Tracking (only these fields, no duplicates with main)
  systemTracking: [
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
  ],
};

// ==================== MAPPING FUNCTIONS ====================

export const mapMainPartner = (data: Record<string, any>) => {
  return {
    business_address: data.business_address,
    business_type: data.business_type,
    city: data.city,
    country: data.country,
    gst_number: data.gst_number,
    incorporation_date: data.incorporation_date,
    pan_number: data.pan_number,
    partner_display_name: data.partner_display_name,
    partner_name: data.partner_name,
    partner_type: data.partner_type,
    pincode: data.pincode,
    registration_number: data.registration_number,
    state: data.state,
    website_url: data.website_url,
    hs_created_by_user_id: data.hs_created_by_user_id,
    hs_createdate: data.hs_createdate,
    hs_lastmodifieddate: data.hs_lastmodifieddate,
    hs_object_id: data.hs_object_id,
    hs_updated_by_user_id: data.hs_updated_by_user_id,
    hubspot_owner_id: data.hubspot_owner_id,
  };
};

export const mapBusinessCapabilities = (data: Record<string, any>) => {
  return {
    experience_years: data.experience_years,
    student_capacity_monthly: data.student_capacity_monthly,
    student_capacity_yearly: data.student_capacity_yearly,
    target_courses: data.target_courses,
    target_desrinations: data.target_desrinations,
    target_universities: data.target_universities,
    team_size: data.team_size,
  };
};

export const mapCommissionStructure = (data: Record<string, any>) => {
  return {
    bank_account_number: data.bank_account_number,
    bank_branch: data.bank_branch,
    bank_name: data.bank_name,
    beneficiary_name: data.beneficiary_name,
    bonus_structure: data.bonus_structure,
    commission_model: data.commission_model,
    commission_rate: data.commission_rate,
    commission_type: data.commission_type,
    fixed_commission_amount: data.fixed_commission_amount,
    gst_applicable: data.gst_applicable,
    ifsc_code: data.ifsc_code,
    invoice_requirements: data.invoice_requirements,
    payment_frequency: data.payment_frequency,
    payment_method: data.payment_method,
    payment_terms: data.payment_terms,
    tds_applicable: data.tds_applicable,
    tds_rate: data.tds_rate,
    tiered_commission_structure: data.tiered_commission_structure,
  };
};

export const mapComplianceDocumentation = (data: Record<string, any>) => {
  return {
    agreement_signed_date: data.agreement_signed_date,
    background_verification_status: data.background_verification_status,
    kyc_completion_date: data.kyc_completion_date,
    kyc_status: data.kyc_status,
  };
};

export const mapContactInfo = (data: Record<string, any>) => {
  return {
    accounts_contact_email: data.accounts_contact_email,
    accounts_contact_person: data.accounts_contact_person,
    accounts_contact_phone: data.accounts_contact_phone,
    marketing_contact_email: data.marketing_contact_email,
    marketing_contact_person: data.marketing_contact_person,
    marketing_contact_phone: data.marketing_contact_phone,
    primary_contact_designation: data.primary_contact_designation,
    primary_contact_email: data.primary_contact_email,
    primary_contact_person: data.primary_contact_person,
    primary_contact_phone: data.primary_contact_phone,
    secondary_contact_email: data.secondary_contact_email,
    secondary_contact_person: data.secondary_contact_person,
    secondary_contact_phone: data.secondary_contact_phone,
  };
};

export const mapFinancialTracking = (data: Record<string, any>) => {
  return {
    average_monthly_commission: data.average_monthly_commission,
    current_month_commission: data.current_month_commission,
    last_payment_amount: data.last_payment_amount,
    last_payment_date: data.last_payment_date,
    lifetime_value: data.lifetime_value,
    next_payment_due_date: data.next_payment_due_date,
    outstanding_commission: data.outstanding_commission,
    payment_status: data.payment_status,
    total_commission_earned: data.total_commission_earned,
    total_commission_paid: data.total_commission_paid,
    ytd_commission_earned: data.ytd_commission_earned,
    ytd_commission_paid: data.ytd_commission_paid,
  };
};

export const mapLeadAttribution = (data: Record<string, any>) => {
  return {
    lead_submission_method: data.lead_submission_method,
    lead_tracking_method: data.lead_tracking_method,
    tracking_link: data.tracking_link,
    unique_referral_code: data.unique_referral_code,
    utm_source_assigned: data.utm_source_assigned,
  };
};

export const mapMarketingPromotion = (data: Record<string, any>) => {
  return {
    brand_usage_guidelines: data.brand_usage_guidelines,
    co_marketing_approval: data.co_marketing_approval,
    content_collaboration: data.content_collaboration,
    digital_presence_rating: data.digital_presence_rating,
    event_participation: data.event_participation,
    marketing_materials_provided: data.marketing_materials_provided,
    promotional_activities: data.promotional_activities,
    social_media_followers: data.social_media_followers,
  };
};

export const mapPartnershipDetails = (data: Record<string, any>) => {
  return {
    agreement_type: data.agreement_type,
    partnership_end_date: data.partnership_end_date,
    partnership_start_date: data.partnership_start_date,
    partnership_status: data.partnership_status,
  };
};

export const mapPerformanceMetrics = (data: Record<string, any>) => {
  return {
    application_conversion_rate: data.application_conversion_rate,
    applications_approved: data.applications_approved,
    approval_conversion_rate: data.approval_conversion_rate,
    average_lead_quality_score: data.average_lead_quality_score,
    average_loan_amount: data.average_loan_amount,
    best_performing_month: data.best_performing_month,
    last_lead_date: data.last_lead_date,
    lead_conversion_rate: data.lead_conversion_rate,
    leads_converted_to_applications: data.leads_converted_to_applications,
    loans_disbursed: data.loans_disbursed,
    partner_rating: data.partner_rating,
    qualified_leads_provided: data.qualified_leads_provided,
    seasonal_performance_pattern: data.seasonal_performance_pattern,
    total_leads_provided: data.total_leads_provided,
    total_loan_value_generated: data.total_loan_value_generated,
  };
};

export const mapRelationshipManagement = (data: Record<string, any>) => {
  return {
    assigned_account_manager: data.assigned_account_manager,
    communication_frequency: data.communication_frequency,
    escalation_history: data.escalation_history,
    feedback_comments: data.feedback_comments,
    joint_marketing_activities: data.joint_marketing_activities,
    last_interaction_date: data.last_interaction_date,
    relationship_status: data.relationship_status,
    satisfaction_score: data.satisfaction_score,
    training_completed: data.training_completed,
  };
};

// System Tracking with proper enum handling
export const mapSystemTracking = (data: Record<string, any>) => {
  return {
    partner_name: data.partner_name,
    api_access_provided: apiAccessStatusMap[
      data.api_access_provided
    ] as ApiAccessStatus,
    created_by: data.created_by,
    created_date: data.created_date,
    data_source: b2bDataSourceMap[data.data_source] as B2BDataSource,
    integration_status: b2bIntegrationStatusMap[
      data.integration_status
    ] as B2BIntegrationStatus,
    internal_tags: data.internal_tags,
    last_modified_by: data.last_modified_by,
    last_modified_date: data.last_modified_date,
    notes: data.notes,
    partner_record_status: partnerRecordStatusMap[
      data.partner_record_status
    ] as PartnerRecordStatus,
    portal_access_provided: portalAccessStatusMap[
      data.portal_access_provided
    ] as PortalAccessStatus,
  };
};

// ==================== COMPREHENSIVE MAPPING FUNCTION ====================

export const mapAllB2BPartnerFields = async (
  input: Record<string, any>
): Promise<Record<string, any>> => {
  const mapped: Record<string, any> = {};

  // ===== MAIN PARTNER FIELDS (no system tracking duplicates) =====
  if (input.business_address !== undefined)
    mapped.business_address = input.business_address || null;
  if (input.business_type !== undefined)
    mapped.business_type = input.business_type || null;
  if (input.city !== undefined) mapped.city = input.city || null;
  if (input.country !== undefined) mapped.country = input.country || null;
  if (input.gst_number !== undefined)
    mapped.gst_number = input.gst_number || null;
  if (input.incorporation_date !== undefined)
    mapped.incorporation_date = input.incorporation_date || null;
  if (input.pan_number !== undefined)
    mapped.pan_number = input.pan_number || null;
  if (input.partner_display_name !== undefined)
    mapped.partner_display_name = input.partner_display_name || null;
  if (input.partner_name !== undefined)
    mapped.partner_name = input.partner_name || null;
  if (input.partner_type !== undefined)
    mapped.partner_type = input.partner_type || null;
  if (input.pincode !== undefined) mapped.pincode = input.pincode || null;
  if (input.registration_number !== undefined)
    mapped.registration_number = input.registration_number || null;
  if (input.state !== undefined) mapped.state = input.state || null;
  if (input.website_url !== undefined)
    mapped.website_url = input.website_url || null;
  if (input.hs_created_by_user_id !== undefined)
    mapped.hs_created_by_user_id = input.hs_created_by_user_id || null;
  if (input.hs_createdate !== undefined)
    mapped.hs_createdate = input.hs_createdate || null;
  if (input.hs_lastmodifieddate !== undefined)
    mapped.hs_lastmodifieddate = input.hs_lastmodifieddate || null;
  if (input.hs_object_id !== undefined)
    mapped.hs_object_id = input.hs_object_id || null;
  if (input.hs_updated_by_user_id !== undefined)
    mapped.hs_updated_by_user_id = input.hs_updated_by_user_id || null;
  if (input.hubspot_owner_id !== undefined)
    mapped.hubspot_owner_id = input.hubspot_owner_id || null;

  // ===== BUSINESS CAPABILITIES FIELDS =====
  if (input.experience_years !== undefined)
    mapped.experience_years = input.experience_years || null;
  if (input.student_capacity_monthly !== undefined)
    mapped.student_capacity_monthly = input.student_capacity_monthly || null;
  if (input.student_capacity_yearly !== undefined)
    mapped.student_capacity_yearly = input.student_capacity_yearly || null;
  if (input.target_courses !== undefined)
    mapped.target_courses = input.target_courses || null;
  if (input.target_desrinations !== undefined)
    mapped.target_desrinations = input.target_desrinations || null;
  if (input.target_universities !== undefined)
    mapped.target_universities = input.target_universities || null;
  if (input.team_size !== undefined) mapped.team_size = input.team_size || null;

  // ===== COMMISSION STRUCTURE FIELDS =====
  if (input.bank_account_number !== undefined)
    mapped.bank_account_number = input.bank_account_number || null;
  if (input.bank_branch !== undefined)
    mapped.bank_branch = input.bank_branch || null;
  if (input.bank_name !== undefined) mapped.bank_name = input.bank_name || null;
  if (input.beneficiary_name !== undefined)
    mapped.beneficiary_name = input.beneficiary_name || null;
  if (input.bonus_structure !== undefined)
    mapped.bonus_structure = input.bonus_structure || null;
  if (input.commission_model !== undefined)
    mapped.commission_model = input.commission_model || null;
  if (input.commission_rate !== undefined)
    mapped.commission_rate = input.commission_rate || null;
  if (input.commission_type !== undefined)
    mapped.commission_type = input.commission_type || null;
  if (input.fixed_commission_amount !== undefined)
    mapped.fixed_commission_amount = input.fixed_commission_amount || null;
  if (input.gst_applicable !== undefined)
    mapped.gst_applicable = input.gst_applicable || null;
  if (input.ifsc_code !== undefined) mapped.ifsc_code = input.ifsc_code || null;
  if (input.invoice_requirements !== undefined)
    mapped.invoice_requirements = input.invoice_requirements || null;
  if (input.payment_frequency !== undefined)
    mapped.payment_frequency = input.payment_frequency || null;
  if (input.payment_method !== undefined)
    mapped.payment_method = input.payment_method || null;
  if (input.payment_terms !== undefined)
    mapped.payment_terms = input.payment_terms || null;
  if (input.tds_applicable !== undefined)
    mapped.tds_applicable = input.tds_applicable || null;
  if (input.tds_rate !== undefined) mapped.tds_rate = input.tds_rate || null;
  if (input.tiered_commission_structure !== undefined)
    mapped.tiered_commission_structure =
      input.tiered_commission_structure || null;

  // ===== COMPLIANCE & DOCUMENTATION FIELDS =====
  if (input.agreement_signed_date !== undefined)
    mapped.agreement_signed_date = input.agreement_signed_date || null;
  if (input.background_verification_status !== undefined)
    mapped.background_verification_status =
      input.background_verification_status || null;
  if (input.kyc_completion_date !== undefined)
    mapped.kyc_completion_date = input.kyc_completion_date || null;
  if (input.kyc_status !== undefined)
    mapped.kyc_status = input.kyc_status || null;

  // ===== CONTACT INFORMATION FIELDS =====
  if (input.accounts_contact_email !== undefined)
    mapped.accounts_contact_email = input.accounts_contact_email || null;
  if (input.accounts_contact_person !== undefined)
    mapped.accounts_contact_person = input.accounts_contact_person || null;
  if (input.accounts_contact_phone !== undefined)
    mapped.accounts_contact_phone = input.accounts_contact_phone || null;
  if (input.marketing_contact_email !== undefined)
    mapped.marketing_contact_email = input.marketing_contact_email || null;
  if (input.marketing_contact_person !== undefined)
    mapped.marketing_contact_person = input.marketing_contact_person || null;
  if (input.marketing_contact_phone !== undefined)
    mapped.marketing_contact_phone = input.marketing_contact_phone || null;
  if (input.primary_contact_designation !== undefined)
    mapped.primary_contact_designation =
      input.primary_contact_designation || null;
  if (input.primary_contact_email !== undefined)
    mapped.primary_contact_email = input.primary_contact_email || null;
  if (input.primary_contact_person !== undefined)
    mapped.primary_contact_person = input.primary_contact_person || null;
  if (input.primary_contact_phone !== undefined)
    mapped.primary_contact_phone = input.primary_contact_phone || null;
  if (input.secondary_contact_email !== undefined)
    mapped.secondary_contact_email = input.secondary_contact_email || null;
  if (input.secondary_contact_person !== undefined)
    mapped.secondary_contact_person = input.secondary_contact_person || null;
  if (input.secondary_contact_phone !== undefined)
    mapped.secondary_contact_phone = input.secondary_contact_phone || null;

  // ===== FINANCIAL TRACKING FIELDS =====
  if (input.average_monthly_commission !== undefined)
    mapped.average_monthly_commission =
      input.average_monthly_commission || null;
  if (input.current_month_commission !== undefined)
    mapped.current_month_commission = input.current_month_commission || null;
  if (input.last_payment_amount !== undefined)
    mapped.last_payment_amount = input.last_payment_amount || null;
  if (input.last_payment_date !== undefined)
    mapped.last_payment_date = input.last_payment_date || null;
  if (input.lifetime_value !== undefined)
    mapped.lifetime_value = input.lifetime_value || null;
  if (input.next_payment_due_date !== undefined)
    mapped.next_payment_due_date = input.next_payment_due_date || null;
  if (input.outstanding_commission !== undefined)
    mapped.outstanding_commission = input.outstanding_commission || null;
  if (input.payment_status !== undefined)
    mapped.payment_status = input.payment_status || null;
  if (input.total_commission_earned !== undefined)
    mapped.total_commission_earned = input.total_commission_earned || null;
  if (input.total_commission_paid !== undefined)
    mapped.total_commission_paid = input.total_commission_paid || null;
  if (input.ytd_commission_earned !== undefined)
    mapped.ytd_commission_earned = input.ytd_commission_earned || null;
  if (input.ytd_commission_paid !== undefined)
    mapped.ytd_commission_paid = input.ytd_commission_paid || null;

  // ===== LEAD ATTRIBUTION FIELDS =====
  if (input.lead_submission_method !== undefined)
    mapped.lead_submission_method = input.lead_submission_method || null;
  if (input.lead_tracking_method !== undefined)
    mapped.lead_tracking_method = input.lead_tracking_method || null;
  if (input.tracking_link !== undefined)
    mapped.tracking_link = input.tracking_link || null;
  if (input.unique_referral_code !== undefined)
    mapped.unique_referral_code = input.unique_referral_code || null;
  if (input.utm_source_assigned !== undefined)
    mapped.utm_source_assigned = input.utm_source_assigned || null;

  // ===== MARKETING & PROMOTION FIELDS =====
  if (input.brand_usage_guidelines !== undefined)
    mapped.brand_usage_guidelines = input.brand_usage_guidelines || null;
  if (input.co_marketing_approval !== undefined)
    mapped.co_marketing_approval = input.co_marketing_approval || null;
  if (input.content_collaboration !== undefined)
    mapped.content_collaboration = input.content_collaboration || null;
  if (input.digital_presence_rating !== undefined)
    mapped.digital_presence_rating = input.digital_presence_rating || null;
  if (input.event_participation !== undefined)
    mapped.event_participation = input.event_participation || null;
  if (input.marketing_materials_provided !== undefined)
    mapped.marketing_materials_provided =
      input.marketing_materials_provided || null;
  if (input.promotional_activities !== undefined)
    mapped.promotional_activities = input.promotional_activities || null;
  if (input.social_media_followers !== undefined)
    mapped.social_media_followers = input.social_media_followers || null;

  // ===== PARTNERSHIP DETAILS FIELDS =====
  if (input.agreement_type !== undefined)
    mapped.agreement_type = input.agreement_type || null;
  if (input.partnership_end_date !== undefined)
    mapped.partnership_end_date = input.partnership_end_date || null;
  if (input.partnership_start_date !== undefined)
    mapped.partnership_start_date = input.partnership_start_date || null;
  if (input.partnership_status !== undefined)
    mapped.partnership_status = input.partnership_status || null;

  // ===== PERFORMANCE METRICS FIELDS =====
  if (input.application_conversion_rate !== undefined)
    mapped.application_conversion_rate =
      input.application_conversion_rate || null;
  if (input.applications_approved !== undefined)
    mapped.applications_approved = input.applications_approved || null;
  if (input.approval_conversion_rate !== undefined)
    mapped.approval_conversion_rate = input.approval_conversion_rate || null;
  if (input.average_lead_quality_score !== undefined)
    mapped.average_lead_quality_score =
      input.average_lead_quality_score || null;
  if (input.average_loan_amount !== undefined)
    mapped.average_loan_amount = input.average_loan_amount || null;
  if (input.best_performing_month !== undefined)
    mapped.best_performing_month = input.best_performing_month || null;
  if (input.last_lead_date !== undefined)
    mapped.last_lead_date = input.last_lead_date || null;
  if (input.lead_conversion_rate !== undefined)
    mapped.lead_conversion_rate = input.lead_conversion_rate || null;
  if (input.leads_converted_to_applications !== undefined)
    mapped.leads_converted_to_applications =
      input.leads_converted_to_applications || null;
  if (input.loans_disbursed !== undefined)
    mapped.loans_disbursed = input.loans_disbursed || null;
  if (input.partner_rating !== undefined)
    mapped.partner_rating = input.partner_rating || null;
  if (input.qualified_leads_provided !== undefined)
    mapped.qualified_leads_provided = input.qualified_leads_provided || null;
  if (input.seasonal_performance_pattern !== undefined)
    mapped.seasonal_performance_pattern =
      input.seasonal_performance_pattern || null;
  if (input.total_leads_provided !== undefined)
    mapped.total_leads_provided = input.total_leads_provided || null;
  if (input.total_loan_value_generated !== undefined)
    mapped.total_loan_value_generated =
      input.total_loan_value_generated || null;

  // ===== RELATIONSHIP MANAGEMENT FIELDS =====
  if (input.assigned_account_manager !== undefined)
    mapped.assigned_account_manager = input.assigned_account_manager || null;
  if (input.communication_frequency !== undefined)
    mapped.communication_frequency = input.communication_frequency || null;
  if (input.escalation_history !== undefined)
    mapped.escalation_history = input.escalation_history || null;
  if (input.feedback_comments !== undefined)
    mapped.feedback_comments = input.feedback_comments || null;
  if (input.joint_marketing_activities !== undefined)
    mapped.joint_marketing_activities =
      input.joint_marketing_activities || null;
  if (input.last_interaction_date !== undefined)
    mapped.last_interaction_date = input.last_interaction_date || null;
  if (input.relationship_status !== undefined)
    mapped.relationship_status = input.relationship_status || null;
  if (input.satisfaction_score !== undefined)
    mapped.satisfaction_score = input.satisfaction_score || null;
  if (input.training_completed !== undefined)
    mapped.training_completed = input.training_completed || null;

  // ===== SYSTEM TRACKING FIELDS (separate from main partner) =====
  if (input.partner_name !== undefined)
    mapped.partner_name = input.partner_name || null;
  if (input.api_access_provided !== undefined)
    mapped.api_access_provided = input.api_access_provided
      ? apiAccessStatusMap[
          input.api_access_provided ? input.api_access_provided : "No"
        ]
      : null;
  if (input.created_by !== undefined)
    mapped.created_by = input.created_by || null;
  if (input.created_date !== undefined)
    mapped.created_date = input.created_date || null;
  if (input.data_source !== undefined)
    mapped.data_source = input.data_source
      ? b2bDataSourceMap[input.data_source]
      : null;
  if (input.integration_status !== undefined)
    mapped.integration_status = input.integration_status
      ? b2bIntegrationStatusMap[input.integration_status]
      : null;
  if (input.internal_tags !== undefined)
    mapped.internal_tags = input.internal_tags || null;
  if (input.last_modified_by !== undefined)
    mapped.last_modified_by = input.last_modified_by || null;
  if (input.last_modified_date !== undefined)
    mapped.last_modified_date = input.last_modified_date || null;
  if (input.notes !== undefined) mapped.notes = input.notes || null;
  if (input.partner_record_status !== undefined)
    mapped.partner_record_status = input.partner_record_status
      ? partnerRecordStatusMap[input.partner_record_status]
      : null;
  if (input.portal_access_provided !== undefined)
    mapped.portal_access_provided = input.portal_access_provided
      ? portalAccessStatusMap[
          input.portal_access_provided ? input.portal_access_provided : "No"
        ]
      : null;

  return mapped;
};

// Helper function to extract fields by category
export const extractFieldsByCategory = (
  data: Record<string, any>,
  category: keyof typeof B2B_FIELD_MAPPINGS
): Record<string, any> => {
  const fields = B2B_FIELD_MAPPINGS[category];
  const extracted: Record<string, any> = {};

  fields.forEach((field) => {
    if (data[field] !== undefined) {
      extracted[field] = data[field];
    }
  });

  return extracted;
};

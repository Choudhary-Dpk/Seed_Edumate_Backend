import { enumMappingService } from "../enumMapping";

export const mapAllB2BPartnerFields = async (
  input: Record<string, any>
): Promise<Record<string, any>> => {
  const mapped: Record<string, any> = {};

  // ===== MAIN PARTNER FIELDS =====
  if (input.source !== undefined)
    mapped.source =
      input.source !== null && input.source !== "" ? input.source : null;

  if (input.business_address !== undefined)
    mapped.business_address =
      input.business_address !== null && input.business_address !== ""
        ? input.business_address
        : null;

  if (input.business_type !== undefined)
    mapped.business_type =
      input.business_type !== null && input.business_type !== ""
        ? input.business_type
        : null;

  if (input.city !== undefined)
    mapped.city = input.city !== null && input.city !== "" ? input.city : null;

  if (input.country !== undefined)
    mapped.country =
      input.country !== null && input.country !== "" ? input.country : null;

  if (input.gst_number !== undefined)
    mapped.gst_number =
      input.gst_number !== null && input.gst_number !== ""
        ? input.gst_number
        : null;

  if (input.incorporation_date !== undefined)
    mapped.incorporation_date =
      input.incorporation_date !== null && input.incorporation_date !== ""
        ? input.incorporation_date
        : null;

  if (input.pan_number !== undefined)
    mapped.pan_number =
      input.pan_number !== null && input.pan_number !== ""
        ? input.pan_number
        : null;

  if (input.partner_display_name !== undefined)
    mapped.partner_display_name =
      input.partner_display_name !== null && input.partner_display_name !== ""
        ? input.partner_display_name
        : null;

  if (input.partner_name !== undefined)
    mapped.partner_name =
      input.partner_name !== null && input.partner_name !== ""
        ? input.partner_name
        : null;

  if (input.partner_type !== undefined)
    mapped.partner_type =
      input.partner_type !== null && input.partner_type !== ""
        ? input.partner_type
        : null;

  if (input.pincode !== undefined)
    mapped.pincode =
      input.pincode !== null && input.pincode !== "" ? input.pincode : null;

  if (input.registration_number !== undefined)
    mapped.registration_number =
      input.registration_number !== null && input.registration_number !== ""
        ? input.registration_number
        : null;

  if (input.state !== undefined)
    mapped.state =
      input.state !== null && input.state !== "" ? input.state : null;

  if (input.website_url !== undefined)
    mapped.website_url =
      input.website_url !== null && input.website_url !== ""
        ? input.website_url
        : null;

  if (input.gst_rate !== undefined)
    mapped.gst_rate =
      input.gst_rate !== null && input.gst_rate !== "" ? input.gst_rate : null;

  if (input.hs_created_by_user_id !== undefined)
    mapped.hs_created_by_user_id =
      input.hs_created_by_user_id !== null && input.hs_created_by_user_id !== ""
        ? input.hs_created_by_user_id
        : null;

  if (input.hs_createdate !== undefined)
    mapped.hs_createdate =
      input.hs_createdate !== null && input.hs_createdate !== ""
        ? input.hs_createdate
        : null;

  if (input.hs_lastmodifieddate !== undefined)
    mapped.hs_lastmodifieddate =
      input.hs_lastmodifieddate !== null && input.hs_lastmodifieddate !== ""
        ? input.hs_lastmodifieddate
        : null;

  if (input.hs_object_id !== undefined)
    mapped.hs_object_id =
      input.hs_object_id !== null && input.hs_object_id !== ""
        ? input.hs_object_id
        : null;

  if (input.hs_updated_by_user_id !== undefined)
    mapped.hs_updated_by_user_id =
      input.hs_updated_by_user_id !== null && input.hs_updated_by_user_id !== ""
        ? input.hs_updated_by_user_id
        : null;

  if (input.hubspot_owner_id !== undefined)
    mapped.hubspot_owner_id =
      input.hubspot_owner_id !== null && input.hubspot_owner_id !== ""
        ? input.hubspot_owner_id
        : null;

  if (input.hs_merged_object_ids !== undefined)
    mapped.hs_merged_object_ids =
      input.hs_merged_object_ids !== null && input.hs_merged_object_ids !== ""
        ? input.hs_merged_object_ids
        : null;

  if (input.hs_object_source_detail_1 !== undefined)
    mapped.hs_object_source_detail_1 =
      input.hs_object_source_detail_1 !== null &&
      input.hs_object_source_detail_1 !== ""
        ? input.hs_object_source_detail_1
        : null;

  if (input.hs_object_source_detail_2 !== undefined)
    mapped.hs_object_source_detail_2 =
      input.hs_object_source_detail_2 !== null &&
      input.hs_object_source_detail_2 !== ""
        ? input.hs_object_source_detail_2
        : null;

  if (input.hs_object_source_detail_3 !== undefined)
    mapped.hs_object_source_detail_3 =
      input.hs_object_source_detail_3 !== null &&
      input.hs_object_source_detail_3 !== ""
        ? input.hs_object_source_detail_3
        : null;

  if (input.hs_object_source_label !== undefined)
    mapped.hs_object_source_label =
      input.hs_object_source_label !== null &&
      input.hs_object_source_label !== ""
        ? input.hs_object_source_label
        : null;

  if (input.hs_shared_team_ids !== undefined)
    mapped.hs_shared_team_ids =
      input.hs_shared_team_ids !== null && input.hs_shared_team_ids !== ""
        ? input.hs_shared_team_ids
        : null;

  if (input.hs_shared_user_ids !== undefined)
    mapped.hs_shared_user_ids =
      input.hs_shared_user_ids !== null && input.hs_shared_user_ids !== ""
        ? input.hs_shared_user_ids
        : null;

  if (input.hubspot_owner_assigneddate !== undefined)
    mapped.hubspot_owner_assigneddate =
      input.hubspot_owner_assigneddate !== null &&
      input.hubspot_owner_assigneddate !== ""
        ? input.hubspot_owner_assigneddate
        : null;

  if (input.hubspot_team_id !== undefined)
    mapped.hubspot_team_id =
      input.hubspot_team_id !== null && input.hubspot_team_id !== ""
        ? input.hubspot_team_id
        : null;

  // ===== BUSINESS CAPABILITIES FIELDS =====
  if (input.experience_years !== undefined)
    mapped.experience_years =
      input.experience_years !== null && input.experience_years !== ""
        ? input.experience_years
        : null;

  if (input.student_capacity_monthly !== undefined)
    mapped.student_capacity_monthly =
      input.student_capacity_monthly !== null &&
      input.student_capacity_monthly !== ""
        ? input.student_capacity_monthly
        : null;

  if (input.student_capacity_yearly !== undefined)
    mapped.student_capacity_yearly =
      input.student_capacity_yearly !== null &&
      input.student_capacity_yearly !== ""
        ? input.student_capacity_yearly
        : null;

  if (input.target_courses !== undefined)
    mapped.target_courses =
      input.target_courses !== null && input.target_courses !== ""
        ? input.target_courses
        : null;

  if (input.target_destinations !== undefined)
    mapped.target_destinations =
      input.target_destinations !== null && input.target_destinations !== ""
        ? input.target_destinations
        : null;

  if (input.target_universities !== undefined)
    mapped.target_universities =
      input.target_universities !== null && input.target_universities !== ""
        ? input.target_universities
        : null;

  if (input.team_size !== undefined)
    mapped.team_size =
      input.team_size !== null && input.team_size !== ""
        ? input.team_size
        : null;

  // ===== COMMISSION STRUCTURE FIELDS =====
  if (input.bank_account_number !== undefined)
    mapped.bank_account_number =
      input.bank_account_number !== null && input.bank_account_number !== ""
        ? input.bank_account_number
        : null;

  if (input.bank_branch !== undefined)
    mapped.bank_branch =
      input.bank_branch !== null && input.bank_branch !== ""
        ? input.bank_branch
        : null;

  if (input.bank_name !== undefined)
    mapped.bank_name =
      input.bank_name !== null && input.bank_name !== ""
        ? input.bank_name
        : null;

  if (input.beneficiary_name !== undefined)
    mapped.beneficiary_name =
      input.beneficiary_name !== null && input.beneficiary_name !== ""
        ? input.beneficiary_name
        : null;

  if (input.bonus_structure !== undefined)
    mapped.bonus_structure =
      input.bonus_structure !== null && input.bonus_structure !== ""
        ? input.bonus_structure
        : null;

  if (input.commission_model !== undefined)
    mapped.commission_model =
      input.commission_model !== null && input.commission_model !== ""
        ? input.commission_model
        : null;

  if (input.commission_rate !== undefined)
    mapped.commission_rate =
      input.commission_rate !== null && input.commission_rate !== ""
        ? input.commission_rate
        : null;

  if (input.commission_type !== undefined)
    mapped.commission_type =
      input.commission_type !== null && input.commission_type !== ""
        ? input.commission_type
        : null;

  if (input.fixed_commission_amount !== undefined)
    mapped.fixed_commission_amount =
      input.fixed_commission_amount !== null &&
      input.fixed_commission_amount !== ""
        ? input.fixed_commission_amount
        : null;

  if (input.gst_applicable !== undefined)
    mapped.gst_applicable =
      input.gst_applicable !== null && input.gst_applicable !== ""
        ? input.gst_applicable
        : null;

  if (input.ifsc_code !== undefined)
    mapped.ifsc_code =
      input.ifsc_code !== null && input.ifsc_code !== ""
        ? input.ifsc_code
        : null;

  if (input.invoice_requirements !== undefined)
    mapped.invoice_requirements =
      input.invoice_requirements !== null && input.invoice_requirements !== ""
        ? input.invoice_requirements
        : null;

  if (input.payment_frequency !== undefined)
    mapped.payment_frequency =
      input.payment_frequency !== null && input.payment_frequency !== ""
        ? input.payment_frequency
        : null;

  if (input.payment_method !== undefined)
    mapped.payment_method =
      input.payment_method !== null && input.payment_method !== ""
        ? input.payment_method
        : null;

  if (input.payment_terms !== undefined)
    mapped.payment_terms =
      input.payment_terms !== null && input.payment_terms !== ""
        ? input.payment_terms
        : null;

  if (input.tds_applicable !== undefined)
    mapped.tds_applicable =
      input.tds_applicable !== null && input.tds_applicable !== ""
        ? input.tds_applicable
        : null;

  if (input.tds_rate !== undefined)
    mapped.tds_rate =
      input.tds_rate !== null && input.tds_rate !== "" ? input.tds_rate : null;

  if (input.tiered_commission_structure !== undefined)
    mapped.tiered_commission_structure =
      input.tiered_commission_structure !== null &&
      input.tiered_commission_structure !== ""
        ? input.tiered_commission_structure
        : null;

  // ===== COMPLIANCE & DOCUMENTATION FIELDS =====
  if (input.agreement_signed_date !== undefined)
    mapped.agreement_signed_date =
      input.agreement_signed_date !== null && input.agreement_signed_date !== ""
        ? input.agreement_signed_date
        : null;

  if (input.background_verification_status !== undefined)
    mapped.background_verification_status =
      input.background_verification_status !== null &&
      input.background_verification_status !== ""
        ? input.background_verification_status
        : null;

  if (input.kyc_completion_date !== undefined)
    mapped.kyc_completion_date =
      input.kyc_completion_date !== null && input.kyc_completion_date !== ""
        ? input.kyc_completion_date
        : null;

  if (input.kyc_status !== undefined)
    mapped.kyc_status =
      input.kyc_status !== null && input.kyc_status !== ""
        ? input.kyc_status
        : null;

  // ===== CONTACT INFORMATION FIELDS =====
  if (input.accounts_contact_email !== undefined)
    mapped.accounts_contact_email =
      input.accounts_contact_email !== null &&
      input.accounts_contact_email !== ""
        ? input.accounts_contact_email
        : null;

  if (input.accounts_contact_person !== undefined)
    mapped.accounts_contact_person =
      input.accounts_contact_person !== null &&
      input.accounts_contact_person !== ""
        ? input.accounts_contact_person
        : null;

  if (input.accounts_contact_phone !== undefined)
    mapped.accounts_contact_phone =
      input.accounts_contact_phone !== null &&
      input.accounts_contact_phone !== ""
        ? input.accounts_contact_phone
        : null;

  if (input.marketing_contact_email !== undefined)
    mapped.marketing_contact_email =
      input.marketing_contact_email !== null &&
      input.marketing_contact_email !== ""
        ? input.marketing_contact_email
        : null;

  if (input.marketing_contact_person !== undefined)
    mapped.marketing_contact_person =
      input.marketing_contact_person !== null &&
      input.marketing_contact_person !== ""
        ? input.marketing_contact_person
        : null;

  if (input.marketing_contact_phone !== undefined)
    mapped.marketing_contact_phone =
      input.marketing_contact_phone !== null &&
      input.marketing_contact_phone !== ""
        ? input.marketing_contact_phone
        : null;

  if (input.primary_contact_designation !== undefined)
    mapped.primary_contact_designation =
      input.primary_contact_designation !== null &&
      input.primary_contact_designation !== ""
        ? input.primary_contact_designation
        : null;

  if (input.primary_contact_email !== undefined)
    mapped.primary_contact_email =
      input.primary_contact_email !== null && input.primary_contact_email !== ""
        ? input.primary_contact_email
        : null;

  if (input.primary_contact_person !== undefined)
    mapped.primary_contact_person =
      input.primary_contact_person !== null &&
      input.primary_contact_person !== ""
        ? input.primary_contact_person
        : null;

  if (input.primary_contact_phone !== undefined)
    mapped.primary_contact_phone =
      input.primary_contact_phone !== null && input.primary_contact_phone !== ""
        ? input.primary_contact_phone
        : null;

  if (input.secondary_contact_email !== undefined)
    mapped.secondary_contact_email =
      input.secondary_contact_email !== null &&
      input.secondary_contact_email !== ""
        ? input.secondary_contact_email
        : null;

  if (input.secondary_contact_person !== undefined)
    mapped.secondary_contact_person =
      input.secondary_contact_person !== null &&
      input.secondary_contact_person !== ""
        ? input.secondary_contact_person
        : null;

  if (input.secondary_contact_phone !== undefined)
    mapped.secondary_contact_phone =
      input.secondary_contact_phone !== null &&
      input.secondary_contact_phone !== ""
        ? input.secondary_contact_phone
        : null;

  // ===== FINANCIAL TRACKING FIELDS =====
  if (input.average_monthly_commission !== undefined)
    mapped.average_monthly_commission =
      input.average_monthly_commission !== null &&
      input.average_monthly_commission !== ""
        ? input.average_monthly_commission
        : null;

  if (input.current_month_commission !== undefined)
    mapped.current_month_commission =
      input.current_month_commission !== null &&
      input.current_month_commission !== ""
        ? input.current_month_commission
        : null;

  if (input.last_payment_amount !== undefined)
    mapped.last_payment_amount =
      input.last_payment_amount !== null && input.last_payment_amount !== ""
        ? input.last_payment_amount
        : null;

  if (input.last_payment_date !== undefined)
    mapped.last_payment_date =
      input.last_payment_date !== null && input.last_payment_date !== ""
        ? input.last_payment_date
        : null;

  if (input.lifetime_value !== undefined)
    mapped.lifetime_value =
      input.lifetime_value !== null && input.lifetime_value !== ""
        ? input.lifetime_value
        : null;

  if (input.next_payment_due_date !== undefined)
    mapped.next_payment_due_date =
      input.next_payment_due_date !== null && input.next_payment_due_date !== ""
        ? input.next_payment_due_date
        : null;

  if (input.outstanding_commission !== undefined)
    mapped.outstanding_commission =
      input.outstanding_commission !== null &&
      input.outstanding_commission !== ""
        ? input.outstanding_commission
        : null;

  if (input.payment_status !== undefined)
    mapped.payment_status =
      input.payment_status !== null && input.payment_status !== ""
        ? input.payment_status
        : null;

  if (input.total_commission_earned !== undefined)
    mapped.total_commission_earned =
      input.total_commission_earned !== null &&
      input.total_commission_earned !== ""
        ? input.total_commission_earned
        : null;

  if (input.total_commission_paid !== undefined)
    mapped.total_commission_paid =
      input.total_commission_paid !== null && input.total_commission_paid !== ""
        ? input.total_commission_paid
        : null;

  if (input.ytd_commission_earned !== undefined)
    mapped.ytd_commission_earned =
      input.ytd_commission_earned !== null && input.ytd_commission_earned !== ""
        ? input.ytd_commission_earned
        : null;

  if (input.ytd_commission_paid !== undefined)
    mapped.ytd_commission_paid =
      input.ytd_commission_paid !== null && input.ytd_commission_paid !== ""
        ? input.ytd_commission_paid
        : null;

  // ===== LEAD ATTRIBUTION FIELDS =====
  if (input.lead_submission_method !== undefined)
    mapped.lead_submission_method =
      input.lead_submission_method !== null &&
      input.lead_submission_method !== ""
        ? input.lead_submission_method
        : null;

  if (input.lead_tracking_method !== undefined)
    mapped.lead_tracking_method =
      input.lead_tracking_method !== null && input.lead_tracking_method !== ""
        ? input.lead_tracking_method
        : null;

  if (input.tracking_link !== undefined)
    mapped.tracking_link =
      input.tracking_link !== null && input.tracking_link !== ""
        ? input.tracking_link
        : null;

  if (input.unique_referral_code !== undefined)
    mapped.unique_referral_code =
      input.unique_referral_code !== null && input.unique_referral_code !== ""
        ? input.unique_referral_code
        : null;

  if (input.utm_source_assigned !== undefined)
    mapped.utm_source_assigned =
      input.utm_source_assigned !== null && input.utm_source_assigned !== ""
        ? input.utm_source_assigned
        : null;

  // ===== MARKETING & PROMOTION FIELDS =====
  if (input.brand_usage_guidelines !== undefined)
    mapped.brand_usage_guidelines =
      input.brand_usage_guidelines !== null &&
      input.brand_usage_guidelines !== ""
        ? input.brand_usage_guidelines
        : null;

  if (input.co_marketing_approval !== undefined)
    mapped.co_marketing_approval =
      input.co_marketing_approval !== null && input.co_marketing_approval !== ""
        ? input.co_marketing_approval
        : null;

  if (input.content_collaboration !== undefined)
    mapped.content_collaboration =
      input.content_collaboration !== null && input.content_collaboration !== ""
        ? input.content_collaboration
        : null;

  if (input.digital_presence_rating !== undefined)
    mapped.digital_presence_rating =
      input.digital_presence_rating !== null &&
      input.digital_presence_rating !== ""
        ? input.digital_presence_rating
        : null;

  if (input.event_participation !== undefined)
    mapped.event_participation =
      input.event_participation !== null && input.event_participation !== ""
        ? input.event_participation
        : null;

  if (input.marketing_materials_provided !== undefined)
    mapped.marketing_materials_provided =
      input.marketing_materials_provided !== null &&
      input.marketing_materials_provided !== ""
        ? input.marketing_materials_provided
        : null;

  if (input.promotional_activities !== undefined)
    mapped.promotional_activities =
      input.promotional_activities !== null &&
      input.promotional_activities !== ""
        ? input.promotional_activities
        : null;

  if (input.social_media_followers !== undefined)
    mapped.social_media_followers =
      input.social_media_followers !== null &&
      input.social_media_followers !== ""
        ? input.social_media_followers
        : null;

  // ===== PARTNERSHIP DETAILS FIELDS =====
  if (input.agreement_type !== undefined)
    mapped.agreement_type =
      input.agreement_type !== null && input.agreement_type !== ""
        ? input.agreement_type
        : null;

  if (input.partnership_end_date !== undefined)
    mapped.partnership_end_date =
      input.partnership_end_date !== null && input.partnership_end_date !== ""
        ? input.partnership_end_date
        : null;

  if (input.partnership_start_date !== undefined)
    mapped.partnership_start_date =
      input.partnership_start_date !== null &&
      input.partnership_start_date !== ""
        ? input.partnership_start_date
        : null;

  if (input.partnership_status !== undefined)
    mapped.partnership_status =
      input.partnership_status !== null && input.partnership_status !== ""
        ? input.partnership_status
        : null;

  // ===== PERFORMANCE METRICS FIELDS =====
  if (input.application_conversion_rate !== undefined)
    mapped.application_conversion_rate =
      input.application_conversion_rate !== null &&
      input.application_conversion_rate !== ""
        ? input.application_conversion_rate
        : null;

  if (input.applications_approved !== undefined)
    mapped.applications_approved =
      input.applications_approved !== null && input.applications_approved !== ""
        ? input.applications_approved
        : null;

  if (input.approval_conversion_rate !== undefined)
    mapped.approval_conversion_rate =
      input.approval_conversion_rate !== null &&
      input.approval_conversion_rate !== ""
        ? input.approval_conversion_rate
        : null;

  if (input.average_lead_quality_score !== undefined)
    mapped.average_lead_quality_score =
      input.average_lead_quality_score !== null &&
      input.average_lead_quality_score !== ""
        ? input.average_lead_quality_score
        : null;

  if (input.average_loan_amount !== undefined)
    mapped.average_loan_amount =
      input.average_loan_amount !== null && input.average_loan_amount !== ""
        ? input.average_loan_amount
        : null;

  if (input.best_performing_month !== undefined)
    mapped.best_performing_month =
      input.best_performing_month !== null && input.best_performing_month !== ""
        ? input.best_performing_month
        : null;

  if (input.last_lead_date !== undefined)
    mapped.last_lead_date =
      input.last_lead_date !== null && input.last_lead_date !== ""
        ? input.last_lead_date
        : null;

  if (input.lead_conversion_rate !== undefined)
    mapped.lead_conversion_rate =
      input.lead_conversion_rate !== null && input.lead_conversion_rate !== ""
        ? input.lead_conversion_rate
        : null;

  if (input.leads_converted_to_applications !== undefined)
    mapped.leads_converted_to_applications =
      input.leads_converted_to_applications !== null &&
      input.leads_converted_to_applications !== ""
        ? input.leads_converted_to_applications
        : null;

  if (input.loans_disbursed !== undefined)
    mapped.loans_disbursed =
      input.loans_disbursed !== null && input.loans_disbursed !== ""
        ? input.loans_disbursed
        : null;

  if (input.partner_rating !== undefined)
    mapped.partner_rating =
      input.partner_rating !== null && input.partner_rating !== ""
        ? input.partner_rating
        : null;

  if (input.qualified_leads_provided !== undefined)
    mapped.qualified_leads_provided =
      input.qualified_leads_provided !== null &&
      input.qualified_leads_provided !== ""
        ? input.qualified_leads_provided
        : null;

  if (input.seasonal_performance_pattern !== undefined)
    mapped.seasonal_performance_pattern =
      input.seasonal_performance_pattern !== null &&
      input.seasonal_performance_pattern !== ""
        ? input.seasonal_performance_pattern
        : null;

  if (input.total_leads_provided !== undefined)
    mapped.total_leads_provided =
      input.total_leads_provided !== null && input.total_leads_provided !== ""
        ? input.total_leads_provided
        : null;

  if (input.total_loan_value_generated !== undefined)
    mapped.total_loan_value_generated =
      input.total_loan_value_generated !== null &&
      input.total_loan_value_generated !== ""
        ? input.total_loan_value_generated
        : null;

  // ===== RELATIONSHIP MANAGEMENT FIELDS =====
  if (input.assigned_account_manager !== undefined)
    mapped.assigned_account_manager =
      input.assigned_account_manager !== null &&
      input.assigned_account_manager !== ""
        ? input.assigned_account_manager
        : null;

  if (input.communication_frequency !== undefined)
    mapped.communication_frequency =
      input.communication_frequency !== null &&
      input.communication_frequency !== ""
        ? input.communication_frequency
        : null;

  if (input.escalation_history !== undefined)
    mapped.escalation_history =
      input.escalation_history !== null && input.escalation_history !== ""
        ? input.escalation_history
        : null;

  if (input.feedback_comments !== undefined)
    mapped.feedback_comments =
      input.feedback_comments !== null && input.feedback_comments !== ""
        ? input.feedback_comments
        : null;

  if (input.joint_marketing_activities !== undefined)
    mapped.joint_marketing_activities =
      input.joint_marketing_activities !== null &&
      input.joint_marketing_activities !== ""
        ? input.joint_marketing_activities
        : null;

  if (input.last_interaction_date !== undefined)
    mapped.last_interaction_date =
      input.last_interaction_date !== null && input.last_interaction_date !== ""
        ? input.last_interaction_date
        : null;

  if (input.relationship_status !== undefined)
    mapped.relationship_status =
      input.relationship_status !== null && input.relationship_status !== ""
        ? input.relationship_status
        : null;

  if (input.satisfaction_score !== undefined)
    mapped.satisfaction_score =
      input.satisfaction_score !== null && input.satisfaction_score !== ""
        ? input.satisfaction_score
        : null;

  if (input.training_completed !== undefined)
    mapped.training_completed =
      input.training_completed !== null && input.training_completed !== ""
        ? input.training_completed
        : null;

  // ===== SYSTEM TRACKING FIELDS =====
  if (input.api_access_provided !== undefined)
    mapped.api_access_provided =
      input.api_access_provided !== null && input.api_access_provided !== ""
        ? input.api_access_provided
        : null;

  if (input.created_by_user !== undefined)
    mapped.created_by_user =
      input.created_by_user !== null && input.created_by_user !== ""
        ? input.created_by_user
        : null;

  if (input.created_date !== undefined)
    mapped.created_date =
      input.created_date !== null && input.created_date !== ""
        ? input.created_date
        : null;

  if (input.data_source !== undefined)
    mapped.data_source =
      input.data_source !== null && input.data_source !== ""
        ? input.data_source
        : null;

  if (input.integration_status !== undefined)
    mapped.integration_status =
      input.integration_status !== null && input.integration_status !== ""
        ? input.integration_status
        : null;

  if (input.internal_tags !== undefined)
    mapped.internal_tags =
      input.internal_tags !== null && input.internal_tags !== ""
        ? input.internal_tags
        : null;

  if (input.last_modified_by_user !== undefined)
    mapped.last_modified_by_user =
      input.last_modified_by_user !== null && input.last_modified_by_user !== ""
        ? input.last_modified_by_user
        : null;

  if (input.last_modified_date !== undefined)
    mapped.last_modified_date =
      input.last_modified_date !== null && input.last_modified_date !== ""
        ? input.last_modified_date
        : null;

  if (input.notes !== undefined)
    mapped.notes =
      input.notes !== null && input.notes !== "" ? input.notes : null;

  if (input.partner_record_status !== undefined)
    mapped.partner_record_status =
      input.partner_record_status !== null && input.partner_record_status !== ""
        ? input.partner_record_status
        : null;

  if (input.portal_access_provided !== undefined)
    mapped.portal_access_provided =
      input.portal_access_provided !== null &&
      input.portal_access_provided !== ""
        ? input.portal_access_provided
        : null;

  // ===== COLLECT ENUM TRANSLATIONS =====
  const enumTranslations = [];

  // 1. Business Type
  if (
    input.business_type !== undefined &&
    input.business_type !== null &&
    input.business_type !== ""
  ) {
    enumTranslations.push({
      field: "business_type",
      enumName: "businessType",
      sourceValue: input.business_type,
    });
  }

  // 2. Partner Type
  if (
    input.partner_type !== undefined &&
    input.partner_type !== null &&
    input.partner_type !== ""
  ) {
    enumTranslations.push({
      field: "partner_type",
      enumName: "partnerType",
      sourceValue: input.partner_type,
    });
  }

  // 3. Target Courses
  if (
    input.target_courses !== undefined &&
    input.target_courses !== null &&
    input.target_courses !== ""
  ) {
    enumTranslations.push({
      field: "target_courses",
      enumName: "targetCourses",
      sourceValue: input.target_courses,
    });
  }

  // 4. Target Destinations
  if (
    input.target_destinations !== undefined &&
    input.target_destinations !== null &&
    input.target_destinations !== ""
  ) {
    enumTranslations.push({
      field: "target_destinations",
      enumName: "targetDestinations",
      sourceValue: input.target_destinations,
    });
  }

  // 5. Commission Model
  if (
    input.commission_model !== undefined &&
    input.commission_model !== null &&
    input.commission_model !== ""
  ) {
    enumTranslations.push({
      field: "commission_model",
      enumName: "partnerCommissionModel",
      sourceValue: input.commission_model,
    });
  }

  // 6. Commission Type
  if (
    input.commission_type !== undefined &&
    input.commission_type !== null &&
    input.commission_type !== ""
  ) {
    enumTranslations.push({
      field: "commission_type",
      enumName: "partnerCommissionType",
      sourceValue: input.commission_type,
    });
  }

  // 7. GST Applicable
  if (
    input.gst_applicable !== undefined &&
    input.gst_applicable !== null &&
    input.gst_applicable !== ""
  ) {
    enumTranslations.push({
      field: "gst_applicable",
      enumName: "gstApplicable",
      sourceValue: input.gst_applicable,
    });
  }

  // 8. Payment Frequency
  if (
    input.payment_frequency !== undefined &&
    input.payment_frequency !== null &&
    input.payment_frequency !== ""
  ) {
    enumTranslations.push({
      field: "payment_frequency",
      enumName: "partnerPaymentFrequency",
      sourceValue: input.payment_frequency,
    });
  }

  // 9. Payment Method
  if (
    input.payment_method !== undefined &&
    input.payment_method !== null &&
    input.payment_method !== ""
  ) {
    enumTranslations.push({
      field: "payment_method",
      enumName: "partnerPaymentMethod",
      sourceValue: input.payment_method,
    });
  }

  // 10. Payment Terms
  if (
    input.payment_terms !== undefined &&
    input.payment_terms !== null &&
    input.payment_terms !== ""
  ) {
    enumTranslations.push({
      field: "payment_terms",
      enumName: "paymentTerms",
      sourceValue: input.payment_terms,
    });
  }

  // 11. TDS Applicable
  if (
    input.tds_applicable !== undefined &&
    input.tds_applicable !== null &&
    input.tds_applicable !== ""
  ) {
    enumTranslations.push({
      field: "tds_applicable",
      enumName: "tdsApplicable",
      sourceValue: input.tds_applicable,
    });
  }

  // 12. Background Verification Status
  if (
    input.background_verification_status !== undefined &&
    input.background_verification_status !== null &&
    input.background_verification_status !== ""
  ) {
    enumTranslations.push({
      field: "background_verification_status",
      enumName: "backgroundVerificationStatus",
      sourceValue: input.background_verification_status,
    });
  }

  // 13. KYC Status
  if (
    input.kyc_status !== undefined &&
    input.kyc_status !== null &&
    input.kyc_status !== ""
  ) {
    enumTranslations.push({
      field: "kyc_status",
      enumName: "kycStatus",
      sourceValue: input.kyc_status,
    });
  }

  // 14. Payment Status
  if (
    input.payment_status !== undefined &&
    input.payment_status !== null &&
    input.payment_status !== ""
  ) {
    enumTranslations.push({
      field: "payment_status",
      enumName: "partnerPaymentStatus",
      sourceValue: input.payment_status,
    });
  }

  // 15. Lead Submission Method
  if (
    input.lead_submission_method !== undefined &&
    input.lead_submission_method !== null &&
    input.lead_submission_method !== ""
  ) {
    enumTranslations.push({
      field: "lead_submission_method",
      enumName: "leadSubmissionMethod",
      sourceValue: input.lead_submission_method,
    });
  }

  // 16. Lead Tracking Method
  if (
    input.lead_tracking_method !== undefined &&
    input.lead_tracking_method !== null &&
    input.lead_tracking_method !== ""
  ) {
    enumTranslations.push({
      field: "lead_tracking_method",
      enumName: "leadTrackingMethod",
      sourceValue: input.lead_tracking_method,
    });
  }

  // 17. Co-Marketing Approval
  if (
    input.co_marketing_approval !== undefined &&
    input.co_marketing_approval !== null &&
    input.co_marketing_approval !== ""
  ) {
    enumTranslations.push({
      field: "co_marketing_approval",
      enumName: "coMarketingApproval",
      sourceValue: input.co_marketing_approval,
    });
  }

  // 18. Content Collaboration
  if (
    input.content_collaboration !== undefined &&
    input.content_collaboration !== null &&
    input.content_collaboration !== ""
  ) {
    enumTranslations.push({
      field: "content_collaboration",
      enumName: "contentCollaboration",
      sourceValue: input.content_collaboration,
    });
  }

  // 19. Marketing Materials Provided
  if (
    input.marketing_materials_provided !== undefined &&
    input.marketing_materials_provided !== null &&
    input.marketing_materials_provided !== ""
  ) {
    enumTranslations.push({
      field: "marketing_materials_provided",
      enumName: "marketingMaterialsProvided",
      sourceValue: input.marketing_materials_provided,
    });
  }

  // 20. Agreement Type
  if (
    input.agreement_type !== undefined &&
    input.agreement_type !== null &&
    input.agreement_type !== ""
  ) {
    enumTranslations.push({
      field: "agreement_type",
      enumName: "agreementType",
      sourceValue: input.agreement_type,
    });
  }

  // 21. Partnership Status
  if (
    input.partnership_status !== undefined &&
    input.partnership_status !== null &&
    input.partnership_status !== ""
  ) {
    enumTranslations.push({
      field: "partnership_status",
      enumName: "partnershipStatus",
      sourceValue: input.partnership_status,
    });
  }

  // 22. Best Performing Month
  if (
    input.best_performing_month !== undefined &&
    input.best_performing_month !== null &&
    input.best_performing_month !== ""
  ) {
    enumTranslations.push({
      field: "best_performing_month",
      enumName: "bestPerformingMonth",
      sourceValue: input.best_performing_month,
    });
  }

  // 23. Communication Frequency
  if (
    input.communication_frequency !== undefined &&
    input.communication_frequency !== null &&
    input.communication_frequency !== ""
  ) {
    enumTranslations.push({
      field: "communication_frequency",
      enumName: "communicationFrequency",
      sourceValue: input.communication_frequency,
    });
  }

  // 24. Relationship Status
  if (
    input.relationship_status !== undefined &&
    input.relationship_status !== null &&
    input.relationship_status !== ""
  ) {
    enumTranslations.push({
      field: "relationship_status",
      enumName: "relationshipStatus",
      sourceValue: input.relationship_status,
    });
  }

  // 25. Training Completed
  if (
    input.training_completed !== undefined &&
    input.training_completed !== null &&
    input.training_completed !== ""
  ) {
    enumTranslations.push({
      field: "training_completed",
      enumName: "trainingCompleted",
      sourceValue: input.training_completed,
    });
  }

  // 26. API Access Provided
  if (
    input.api_access_provided !== undefined &&
    input.api_access_provided !== null &&
    input.api_access_provided !== ""
  ) {
    enumTranslations.push({
      field: "api_access_provided",
      enumName: "apiAccessProvided",
      sourceValue: input.api_access_provided,
    });
  }

  // 27. Data Source
  if (
    input.data_source !== undefined &&
    input.data_source !== null &&
    input.data_source !== ""
  ) {
    enumTranslations.push({
      field: "data_source",
      enumName: "partnerDataSource",
      sourceValue: input.data_source,
    });
  }

  // 28. Integration Status
  if (
    input.integration_status !== undefined &&
    input.integration_status !== null &&
    input.integration_status !== ""
  ) {
    enumTranslations.push({
      field: "integration_status",
      enumName: "partnerIntegrationStatus",
      sourceValue: input.integration_status,
    });
  }

  // 29. Partner Record Status
  if (
    input.partner_record_status !== undefined &&
    input.partner_record_status !== null &&
    input.partner_record_status !== ""
  ) {
    enumTranslations.push({
      field: "partner_record_status",
      enumName: "partnerRecordStatus",
      sourceValue: input.partner_record_status,
    });
  }

  // 30. Portal Access Provided
  if (
    input.portal_access_provided !== undefined &&
    input.portal_access_provided !== null &&
    input.portal_access_provided !== ""
  ) {
    enumTranslations.push({
      field: "portal_access_provided",
      enumName: "portalAccessProvided",
      sourceValue: input.portal_access_provided,
    });
  }

  // ===== TRANSLATE ALL ENUMS IN ONE BATCH DATABASE QUERY =====
  if (enumTranslations.length > 0) {
    const translated = await enumMappingService.translateBatch(
      enumTranslations.map((t) => ({
        enumName: t.enumName,
        sourceValue: t.sourceValue,
      }))
    );

    // Map translated values back to fields
    for (const translation of enumTranslations) {
      const key = `${translation.enumName}:${translation.sourceValue}`;
      mapped[translation.field] = translated[key];
    }
  }

  return mapped;
};

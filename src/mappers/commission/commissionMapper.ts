import {
  settlementPeriodMap,
  settlementMonthMap,
  settlementStatusMap,
  verificationStatusMap,
  commissionDataSourceMap,
  integrationStatusMap,
  settlementRecordStatusMap,
  systemGeneratedMap,
  disbursementTriggerMap,
  transactionTypesMap,
  commissionModelMap,
  acknowledgmentStatusMap,
  notificationMethodMap,
  partnerNotificationSentMap,
  paymentMethodMap,
  paymentStatusMap,
  invoiceStatusMap,
  taxCertificateRequiredMap,
  holdReasonMap,
  reconciliationStatusMap,
} from "../../types/commission.types";

export const mapAllCommissionSettlementFields = async (
  input: Record<string, any>
): Promise<Record<string, any>> => {
  const mapped: Record<string, any> = {};

  // ===== MAIN COMMISSION SETTLEMENT FIELDS =====
  if (input.lead_reference_id !== undefined)
    mapped.lead_reference_id =
      input.lead_reference_id !== null && input.lead_reference_id !== ""
        ? input.lead_reference_id
        : null;
  if (input.student_id !== undefined)
    mapped.student_id =
      input.student_id !== null && input.student_id !== ""
        ? input.student_id
        : null;
  if (input.partner_id !== undefined)
    mapped.partner_id =
      input.partner_id !== null && input.partner_id !== ""
        ? input.partner_id
        : null;
  if (input.partner_name !== undefined)
    mapped.partner_name =
      input.partner_name !== null && input.partner_name !== ""
        ? input.partner_name
        : null;
  if (input.student_name !== undefined)
    mapped.student_name =
      input.student_name !== null && input.student_name !== ""
        ? input.student_name
        : null;
  if (input.verified_by !== undefined)
    mapped.verified_by =
      input.verified_by !== null && input.verified_by !== ""
        ? input.verified_by
        : null;
  if (input.settlement_period !== undefined)
    mapped.settlement_period =
      input.settlement_period !== null && input.settlement_period !== ""
        ? settlementPeriodMap[input.settlement_period] || null
        : null;
  if (input.settlement_month !== undefined)
    mapped.settlement_month =
      input.settlement_month !== null && input.settlement_month !== ""
        ? settlementMonthMap[input.settlement_month] || null
        : null;
  if (input.settlement_year !== undefined)
    mapped.settlement_year =
      input.settlement_year !== null && input.settlement_year !== ""
        ? input.settlement_year
        : null;
  if (input.settlement_reference_number !== undefined)
    mapped.settlement_reference_number =
      input.settlement_reference_number !== null &&
      input.settlement_reference_number !== ""
        ? input.settlement_reference_number
        : null;
  if (input.is_active !== undefined)
    mapped.is_active =
      input.is_active !== null && input.is_active !== ""
        ? input.is_active
        : null;
  if (input.created_by !== undefined)
    mapped.created_by =
      input.created_by !== null && input.created_by !== ""
        ? input.created_by
        : null;
  if (input.updated_by !== undefined)
    mapped.updated_by =
      input.updated_by !== null && input.updated_by !== ""
        ? input.updated_by
        : null;
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

  // ===== SETTLEMENT STATUS FIELDS =====
  if (input.calculated_by !== undefined)
    mapped.calculated_by =
      input.calculated_by !== null && input.calculated_by !== ""
        ? input.calculated_by
        : null;
  if (input.calculation_date !== undefined)
    mapped.calculation_date =
      input.calculation_date !== null && input.calculation_date !== ""
        ? input.calculation_date
        : null;
  if (input.settlement_status !== undefined)
    mapped.settlement_status =
      input.settlement_status !== null && input.settlement_status !== ""
        ? settlementStatusMap[input.settlement_status] || null
        : null;
  if (input.verification_date !== undefined)
    mapped.verification_date =
      input.verification_date !== null && input.verification_date !== ""
        ? input.verification_date
        : null;
  if (input.verification_status !== undefined)
    mapped.verification_status =
      input.verification_status !== null && input.verification_status !== ""
        ? verificationStatusMap[input.verification_status] || null
        : null;

  // ===== SYSTEM TRACKING FIELDS =====
  if (input.audit_trail !== undefined)
    mapped.audit_trail =
      input.audit_trail !== null && input.audit_trail !== ""
        ? input.audit_trail
        : null;
  if (input.change_log !== undefined)
    mapped.change_log =
      input.change_log !== null && input.change_log !== ""
        ? input.change_log
        : null;
  if (input.created_date !== undefined)
    mapped.created_date =
      input.created_date !== null && input.created_date !== ""
        ? input.created_date
        : null;
  if (input.data_source !== undefined)
    mapped.data_source =
      input.data_source !== null && input.data_source !== ""
        ? commissionDataSourceMap[input.data_source] || null
        : null;
  if (input.integration_status !== undefined)
    mapped.integration_status =
      input.integration_status !== null && input.integration_status !== ""
        ? integrationStatusMap[input.integration_status] || null
        : null;
  if (input.internal_notes !== undefined)
    mapped.internal_notes =
      input.internal_notes !== null && input.internal_notes !== ""
        ? input.internal_notes
        : null;
  if (input.last_modified_by !== undefined)
    mapped.last_modified_by =
      input.last_modified_by !== null && input.last_modified_by !== ""
        ? input.last_modified_by
        : null;
  if (input.last_modified_date !== undefined)
    mapped.last_modified_date =
      input.last_modified_date !== null && input.last_modified_date !== ""
        ? input.last_modified_date
        : null;
  if (input.notes !== undefined)
    mapped.notes =
      input.notes !== null && input.notes !== "" ? input.notes : null;
  if (input.settlement_record_status !== undefined)
    mapped.settlement_record_status =
      input.settlement_record_status !== null &&
      input.settlement_record_status !== ""
        ? settlementRecordStatusMap[input.settlement_record_status] || null
        : null;
  if (input.system_generated !== undefined)
    mapped.system_generated =
      input.system_generated !== null && input.system_generated !== ""
        ? systemGeneratedMap[input.system_generated] || null
        : null;
  if (input.version_number !== undefined)
    mapped.version_number =
      input.version_number !== null && input.version_number !== ""
        ? input.version_number
        : null;
  if (input.batch_payment_id !== undefined)
    mapped.batch_payment_id =
      input.batch_payment_id !== null && input.batch_payment_id !== ""
        ? input.batch_payment_id
        : null;
  if (input.disbursement_trigger !== undefined)
    mapped.disbursement_trigger =
      input.disbursement_trigger !== null && input.disbursement_trigger !== ""
        ? disbursementTriggerMap[input.disbursement_trigger] || null
        : null;
  if (input.original_transaction_id !== undefined)
    mapped.original_transaction_id =
      input.original_transaction_id !== null &&
      input.original_transaction_id !== ""
        ? input.original_transaction_id
        : null;
  if (input.related_settlement_id !== undefined)
    mapped.related_settlement_id =
      input.related_settlement_id !== null && input.related_settlement_id !== ""
        ? input.related_settlement_id
        : null;
  if (input.transaction_sub_type !== undefined)
    mapped.transaction_sub_type =
      input.transaction_sub_type !== null && input.transaction_sub_type !== ""
        ? input.transaction_sub_type
        : null;
  if (input.transaction_type !== undefined)
    mapped.transaction_type =
      input.transaction_type !== null && input.transaction_type !== ""
        ? transactionTypesMap[input.transaction_type] || null
        : null;

  // ===== COMMISSION CALCULATION FIELDS =====
  if (input.commission_model !== undefined)
    mapped.commission_model =
      input.commission_model !== null && input.commission_model !== ""
        ? commissionModelMap[input.commission_model] || null
        : null;
  if (input.commission_rate_applied !== undefined)
    mapped.commission_rate_applied =
      input.commission_rate_applied !== null &&
      input.commission_rate_applied !== ""
        ? input.commission_rate_applied
        : null;
  if (input.commission_tier_applied !== undefined)
    mapped.commission_tier_applied =
      input.commission_tier_applied !== null &&
      input.commission_tier_applied !== ""
        ? input.commission_tier_applied
        : null;
  if (input.gross_commission_amount !== undefined)
    mapped.gross_commission_amount =
      input.gross_commission_amount !== null &&
      input.gross_commission_amount !== ""
        ? input.gross_commission_amount
        : null;
  if (input.bonus_amount !== undefined)
    mapped.bonus_amount =
      input.bonus_amount !== null && input.bonus_amount !== ""
        ? input.bonus_amount
        : null;
  if (input.bonus_rate_applied !== undefined)
    mapped.bonus_rate_applied =
      input.bonus_rate_applied !== null && input.bonus_rate_applied !== ""
        ? input.bonus_rate_applied
        : null;
  if (input.incentive_amount !== undefined)
    mapped.incentive_amount =
      input.incentive_amount !== null && input.incentive_amount !== ""
        ? input.incentive_amount
        : null;
  if (input.adjustment_amount !== undefined)
    mapped.adjustment_amount =
      input.adjustment_amount !== null && input.adjustment_amount !== ""
        ? input.adjustment_amount
        : null;
  if (input.adjustment_reason !== undefined)
    mapped.adjustment_reason =
      input.adjustment_reason !== null && input.adjustment_reason !== ""
        ? input.adjustment_reason
        : null;
  if (input.penalty_amount !== undefined)
    mapped.penalty_amount =
      input.penalty_amount !== null && input.penalty_amount !== ""
        ? input.penalty_amount
        : null;
  if (input.total_gross_amount !== undefined)
    mapped.total_gross_amount =
      input.total_gross_amount !== null && input.total_gross_amount !== ""
        ? input.total_gross_amount
        : null;

  // ===== COMMUNICATION FIELDS =====
  if (input.acknowledgment_date !== undefined)
    mapped.acknowledgment_date =
      input.acknowledgment_date !== null && input.acknowledgment_date !== ""
        ? input.acknowledgment_date
        : null;
  if (input.acknowledgment_received !== undefined)
    mapped.acknowledgment_received =
      input.acknowledgment_received !== null &&
      input.acknowledgment_received !== ""
        ? acknowledgmentStatusMap[input.acknowledgment_received] || null
        : null;
  if (input.communication_log !== undefined)
    mapped.communication_log =
      input.communication_log !== null && input.communication_log !== ""
        ? input.communication_log
        : null;
  if (input.email_sent_count !== undefined)
    mapped.email_sent_count =
      input.email_sent_count !== null && input.email_sent_count !== ""
        ? input.email_sent_count
        : null;
  if (input.last_communication_date !== undefined)
    mapped.last_communication_date =
      input.last_communication_date !== null &&
      input.last_communication_date !== ""
        ? input.last_communication_date
        : null;
  if (input.notification_date !== undefined)
    mapped.notification_date =
      input.notification_date !== null && input.notification_date !== ""
        ? input.notification_date
        : null;
  if (input.notification_method !== undefined)
    mapped.notification_method =
      input.notification_method !== null && input.notification_method !== ""
        ? notificationMethodMap[input.notification_method] || null
        : null;
  if (input.partner_notification_sent !== undefined)
    mapped.partner_notification_sent =
      input.partner_notification_sent !== null &&
      input.partner_notification_sent !== ""
        ? partnerNotificationSentMap[input.partner_notification_sent] || null
        : null;
  if (input.sms_sent_count !== undefined)
    mapped.sms_sent_count =
      input.sms_sent_count !== null && input.sms_sent_count !== ""
        ? input.sms_sent_count
        : null;

  // ===== LOAN DETAILS FIELDS =====
  if (input.course_name !== undefined)
    mapped.course_name =
      input.course_name !== null && input.course_name !== ""
        ? input.course_name
        : null;
  if (input.lender_name !== undefined)
    mapped.lender_name =
      input.lender_name !== null && input.lender_name !== ""
        ? input.lender_name
        : null;
  if (input.loan_amount_disbursed !== undefined)
    mapped.loan_amount_disbursed =
      input.loan_amount_disbursed !== null && input.loan_amount_disbursed !== ""
        ? input.loan_amount_disbursed
        : null;
  if (input.loan_disbursement_date !== undefined)
    mapped.loan_disbursement_date =
      input.loan_disbursement_date !== null &&
      input.loan_disbursement_date !== ""
        ? input.loan_disbursement_date
        : null;
  if (input.loan_product_name !== undefined)
    mapped.loan_product_name =
      input.loan_product_name !== null && input.loan_product_name !== ""
        ? input.loan_product_name
        : null;
  if (input.student_destination_country !== undefined)
    mapped.student_destination_country =
      input.student_destination_country !== null &&
      input.student_destination_country !== ""
        ? input.student_destination_country
        : null;
  if (input.university_name !== undefined)
    mapped.university_name =
      input.university_name !== null && input.university_name !== ""
        ? input.university_name
        : null;

  // ===== PAYMENT PROCESSING FIELDS =====
  if (input.beneficiary_name !== undefined)
    mapped.beneficiary_name =
      input.beneficiary_name !== null && input.beneficiary_name !== ""
        ? input.beneficiary_name
        : null;
  if (input.beneficiary_account_number !== undefined)
    mapped.beneficiary_account_number =
      input.beneficiary_account_number !== null &&
      input.beneficiary_account_number !== ""
        ? input.beneficiary_account_number
        : null;
  if (input.beneficiary_bank_name !== undefined)
    mapped.beneficiary_bank_name =
      input.beneficiary_bank_name !== null && input.beneficiary_bank_name !== ""
        ? input.beneficiary_bank_name
        : null;
  if (input.beneficiary_ifsc_code !== undefined)
    mapped.beneficiary_ifsc_code =
      input.beneficiary_ifsc_code !== null && input.beneficiary_ifsc_code !== ""
        ? input.beneficiary_ifsc_code
        : null;
  if (input.last_retry_date !== undefined)
    mapped.last_retry_date =
      input.last_retry_date !== null && input.last_retry_date !== ""
        ? input.last_retry_date
        : null;
  if (input.payment_completed_date !== undefined)
    mapped.payment_completed_date =
      input.payment_completed_date !== null &&
      input.payment_completed_date !== ""
        ? input.payment_completed_date
        : null;
  if (input.payment_failure_reason !== undefined)
    mapped.payment_failure_reason =
      input.payment_failure_reason !== null &&
      input.payment_failure_reason !== ""
        ? input.payment_failure_reason
        : null;
  if (input.payment_initiation_date !== undefined)
    mapped.payment_initiation_date =
      input.payment_initiation_date !== null &&
      input.payment_initiation_date !== ""
        ? input.payment_initiation_date
        : null;
  if (input.payment_method !== undefined)
    mapped.payment_method =
      input.payment_method !== null && input.payment_method !== ""
        ? paymentMethodMap[input.payment_method] || null
        : null;
  if (input.payment_reference_number !== undefined)
    mapped.payment_reference_number =
      input.payment_reference_number !== null &&
      input.payment_reference_number !== ""
        ? input.payment_reference_number
        : null;
  if (input.payment_status !== undefined)
    mapped.payment_status =
      input.payment_status !== null && input.payment_status !== ""
        ? paymentStatusMap[input.payment_status] || null
        : null;
  if (input.retry_attempt_count !== undefined)
    mapped.retry_attempt_count =
      input.retry_attempt_count !== null && input.retry_attempt_count !== ""
        ? input.retry_attempt_count
        : null;
  if (input.bank_transaction_id !== undefined)
    mapped.bank_transaction_id =
      input.bank_transaction_id !== null && input.bank_transaction_id !== ""
        ? input.bank_transaction_id
        : null;
  if (input.payment_gateway_reference !== undefined)
    mapped.payment_gateway_reference =
      input.payment_gateway_reference !== null &&
      input.payment_gateway_reference !== ""
        ? input.payment_gateway_reference
        : null;

  // ===== TAX AND DEDUCTIONS FIELDS =====
  if (input.gst_applicable !== undefined)
    mapped.gst_applicable =
      input.gst_applicable !== null && input.gst_applicable !== ""
        ? input.gst_applicable
        : null;
  if (input.gst_rate_applied !== undefined)
    mapped.gst_rate_applied =
      input.gst_rate_applied !== null && input.gst_rate_applied !== ""
        ? input.gst_rate_applied
        : null;
  if (input.gst_amount !== undefined)
    mapped.gst_amount =
      input.gst_amount !== null && input.gst_amount !== ""
        ? input.gst_amount
        : null;
  if (input.net_payable_amount !== undefined)
    mapped.net_payable_amount =
      input.net_payable_amount !== null && input.net_payable_amount !== ""
        ? input.net_payable_amount
        : null;
  if (input.service_tax_amount !== undefined)
    mapped.service_tax_amount =
      input.service_tax_amount !== null && input.service_tax_amount !== ""
        ? input.service_tax_amount
        : null;
  if (input.other_deductions !== undefined)
    mapped.other_deductions =
      input.other_deductions !== null && input.other_deductions !== ""
        ? input.other_deductions
        : null;
  if (input.other_deductions_description !== undefined)
    mapped.other_deductions_description =
      input.other_deductions_description !== null &&
      input.other_deductions_description !== ""
        ? input.other_deductions_description
        : null;
  if (input.tds_applicable !== undefined)
    mapped.tds_applicable =
      input.tds_applicable !== null && input.tds_applicable !== ""
        ? input.tds_applicable
        : null;
  if (input.tds_rate_applied !== undefined)
    mapped.tds_rate_applied =
      input.tds_rate_applied !== null && input.tds_rate_applied !== ""
        ? input.tds_rate_applied
        : null;
  if (input.tds_amount !== undefined)
    mapped.tds_amount =
      input.tds_amount !== null && input.tds_amount !== ""
        ? input.tds_amount
        : null;
  if (input.tds_certificate_number !== undefined)
    mapped.tds_certificate_number =
      input.tds_certificate_number !== null &&
      input.tds_certificate_number !== ""
        ? input.tds_certificate_number
        : null;
  if (input.withholding_tax_applicable !== undefined)
    mapped.withholding_tax_applicable =
      input.withholding_tax_applicable !== null &&
      input.withholding_tax_applicable !== ""
        ? input.withholding_tax_applicable
        : null;
  if (input.withholding_tax_rate !== undefined)
    mapped.withholding_tax_rate =
      input.withholding_tax_rate !== null && input.withholding_tax_rate !== ""
        ? input.withholding_tax_rate
        : null;
  if (input.withholding_tax_amount !== undefined)
    mapped.withholding_tax_amount =
      input.withholding_tax_amount !== null &&
      input.withholding_tax_amount !== ""
        ? input.withholding_tax_amount
        : null;
  if (input.total_deductions !== undefined)
    mapped.total_deductions =
      input.total_deductions !== null && input.total_deductions !== ""
        ? input.total_deductions
        : null;

  // ===== DOCUMENTATION FIELDS =====
  if (input.agreement_reference !== undefined)
    mapped.agreement_reference =
      input.agreement_reference !== null && input.agreement_reference !== ""
        ? input.agreement_reference
        : null;
  if (input.invoice_required !== undefined)
    mapped.invoice_required =
      input.invoice_required !== null && input.invoice_required !== ""
        ? input.invoice_required
        : null;
  if (input.invoice_number !== undefined)
    mapped.invoice_number =
      input.invoice_number !== null && input.invoice_number !== ""
        ? input.invoice_number
        : null;
  if (input.invoice_date !== undefined)
    mapped.invoice_date =
      input.invoice_date !== null && input.invoice_date !== ""
        ? input.invoice_date
        : null;
  if (input.invoice_amount !== undefined)
    mapped.invoice_amount =
      input.invoice_amount !== null && input.invoice_amount !== ""
        ? input.invoice_amount
        : null;
  if (input.invoice_status !== undefined)
    mapped.invoice_status =
      input.invoice_status !== null && input.invoice_status !== ""
        ? invoiceStatusMap[input.invoice_status] || null
        : null;
  if (input.invoice_url !== undefined)
    mapped.invoice_url =
      input.invoice_url !== null && input.invoice_url !== ""
        ? input.invoice_url
        : null;
  if (input.payment_terms_applied !== undefined)
    mapped.payment_terms_applied =
      input.payment_terms_applied !== null && input.payment_terms_applied !== ""
        ? input.payment_terms_applied
        : null;
  if (input.supporting_documents !== undefined)
    mapped.supporting_documents =
      input.supporting_documents !== null && input.supporting_documents !== ""
        ? input.supporting_documents
        : null;
  if (input.tax_certificate_required !== undefined)
    mapped.tax_certificate_required =
      input.tax_certificate_required !== null &&
      input.tax_certificate_required !== ""
        ? taxCertificateRequiredMap[input.tax_certificate_required] || null
        : null;
  if (input.tax_certificate_url !== undefined)
    mapped.tax_certificate_url =
      input.tax_certificate_url !== null && input.tax_certificate_url !== ""
        ? input.tax_certificate_url
        : null;

  // ===== HOLD AND DISPUTES FIELDS =====
  if (input.dispute_date !== undefined)
    mapped.dispute_date =
      input.dispute_date !== null && input.dispute_date !== ""
        ? input.dispute_date
        : null;
  if (input.dispute_description !== undefined)
    mapped.dispute_description =
      input.dispute_description !== null && input.dispute_description !== ""
        ? input.dispute_description
        : null;
  if (input.dispute_raised !== undefined)
    mapped.dispute_raised =
      input.dispute_raised !== null && input.dispute_raised !== ""
        ? input.dispute_raised
        : null;
  if (input.dispute_raised_by !== undefined)
    mapped.dispute_raised_by =
      input.dispute_raised_by !== null && input.dispute_raised_by !== ""
        ? input.dispute_raised_by
        : null;
  if (input.dispute_resolution !== undefined)
    mapped.dispute_resolution =
      input.dispute_resolution !== null && input.dispute_resolution !== ""
        ? input.dispute_resolution
        : null;
  if (input.dispute_resolution_date !== undefined)
    mapped.dispute_resolution_date =
      input.dispute_resolution_date !== null &&
      input.dispute_resolution_date !== ""
        ? input.dispute_resolution_date
        : null;
  if (input.dispute_resolved_by !== undefined)
    mapped.dispute_resolved_by =
      input.dispute_resolved_by !== null && input.dispute_resolved_by !== ""
        ? input.dispute_resolved_by
        : null;
  if (input.hold_date !== undefined)
    mapped.hold_date =
      input.hold_date !== null && input.hold_date !== ""
        ? input.hold_date
        : null;
  if (input.hold_initiated_by !== undefined)
    mapped.hold_initiated_by =
      input.hold_initiated_by !== null && input.hold_initiated_by !== ""
        ? input.hold_initiated_by
        : null;
  if (input.hold_reason !== undefined)
    mapped.hold_reason =
      input.hold_reason !== null && input.hold_reason !== ""
        ? holdReasonMap[input.hold_reason] || null
        : null;
  if (input.hold_release_approved_by !== undefined)
    mapped.hold_release_approved_by =
      input.hold_release_approved_by !== null &&
      input.hold_release_approved_by !== ""
        ? input.hold_release_approved_by
        : null;
  if (input.hold_release_date !== undefined)
    mapped.hold_release_date =
      input.hold_release_date !== null && input.hold_release_date !== ""
        ? input.hold_release_date
        : null;
  if (input.on_hold !== undefined)
    mapped.on_hold =
      input.on_hold !== null && input.on_hold !== "" ? input.on_hold : null;

  // ===== RECONCILIATION FIELDS =====
  if (input.reconciliation_status !== undefined)
    mapped.reconciliation_status =
      input.reconciliation_status !== null && input.reconciliation_status !== ""
        ? reconciliationStatusMap[input.reconciliation_status] || null
        : null;
  if (input.reconciliation_date !== undefined)
    mapped.reconciliation_date =
      input.reconciliation_date !== null && input.reconciliation_date !== ""
        ? input.reconciliation_date
        : null;
  if (input.reconciled_by !== undefined)
    mapped.reconciled_by =
      input.reconciled_by !== null && input.reconciled_by !== ""
        ? input.reconciled_by
        : null;
  if (input.reconciliation_notes !== undefined)
    mapped.reconciliation_notes =
      input.reconciliation_notes !== null && input.reconciliation_notes !== ""
        ? input.reconciliation_notes
        : null;
  if (input.bank_statement_reference !== undefined)
    mapped.bank_statement_reference =
      input.bank_statement_reference !== null &&
      input.bank_statement_reference !== ""
        ? input.bank_statement_reference
        : null;
  if (input.discrepancy_amount !== undefined)
    mapped.discrepancy_amount =
      input.discrepancy_amount !== null && input.discrepancy_amount !== ""
        ? input.discrepancy_amount
        : null;
  if (input.discrepancy_reason !== undefined)
    mapped.discrepancy_reason =
      input.discrepancy_reason !== null && input.discrepancy_reason !== ""
        ? input.discrepancy_reason
        : null;

  // ===== PERFORMANCE ANALYTICS FIELDS =====
  if (input.sla_breach !== undefined)
    mapped.sla_breach =
      input.sla_breach !== null && input.sla_breach !== ""
        ? input.sla_breach
        : null;
  if (input.sla_breach_reason !== undefined)
    mapped.sla_breach_reason =
      input.sla_breach_reason !== null && input.sla_breach_reason !== ""
        ? input.sla_breach_reason
        : null;
  if (input.partner_satisfaction_rating !== undefined)
    mapped.partner_satisfaction_rating =
      input.partner_satisfaction_rating !== null &&
      input.partner_satisfaction_rating !== ""
        ? input.partner_satisfaction_rating
        : null;
  if (input.payment_delay_days !== undefined)
    mapped.payment_delay_days =
      input.payment_delay_days !== null && input.payment_delay_days !== ""
        ? input.payment_delay_days
        : null;
  if (input.processing_time_days !== undefined)
    mapped.processing_time_days =
      input.processing_time_days !== null && input.processing_time_days !== ""
        ? input.processing_time_days
        : null;

  return mapped;
};

DROP VIEW IF EXISTS public.create_leads_view CASCADE;

CREATE VIEW public.create_leads_view AS
SELECT
  c.id AS contact_id,
  c.b2b_partner_id,
  pi.first_name,
  pi.last_name,
  pi.email,
  pi.phone_number,
  ap.admission_status,
  ap.current_education_level,
  ap.current_institution,
  ap.current_course_major,
  ap.preferred_study_destination,
  ap.target_universities,
  
  -- Loan Application
  la.id AS loan_application_id,
  la.application_date,
  la.student_id,
  la.student_name,
  la.student_email,
  la.student_phone,
  la.application_source,
  
  -- Academic Details
  lad.visa_status,
  
  -- Application Status
  las.status,
  
  -- System Tracking
  lst.integration_status,
  
  -- Commission Records
  lcr.commission_status,
  lcr.commission_amount,
  
  -- Financial Requirements
  lfr.loan_amount_requested,
  lfr.loan_amount_approved,
  lfr.loan_amount_disbursed,
  
  -- Lender Information
  lli.processing_fee

FROM public.hs_edumate_contacts c
LEFT JOIN public.hs_edumate_contacts_personal_information pi ON c.id = pi.contact_id
LEFT JOIN public.hs_edumate_contacts_academic_profiles ap ON c.id = ap.contact_id
LEFT JOIN public.hs_loan_applications la ON c.id = la.contact_id
LEFT JOIN public.hs_loan_applications_academic_details lad ON la.id = lad.loan_application_id
LEFT JOIN public.hs_loan_applications_status las ON la.id = las.loan_application_id
LEFT JOIN public.hs_loan_applications_system_tracking lst ON la.id = lst.loan_application_id
LEFT JOIN public.hs_loan_applications_commission_records lcr ON la.id = lcr.loan_application_id
LEFT JOIN public.hs_loan_applications_financial_requirements lfr ON la.id = lfr.loan_application_id
LEFT JOIN public.hs_loan_applications_lender_information lli ON la.id = lli.loan_application_id
WHERE c.is_deleted = FALSE;
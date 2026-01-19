SELECT
  c.id AS contact_id,
  c.b2b_partner_id,
  c.hubspot_owner_id,
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
  ap.intake_year,
  ap.intake_month,
  ap.program_of_interest_final,
  aj.lifecycle_stages,
  aj.lifecycle_stages_status,
  la.id AS loan_application_id,
  la.application_date,
  la.student_id,
  la.student_name,
  la.student_email,
  la.student_phone,
  la.application_source,
  lad.visa_status,
  las.application_status,
  lst.integration_status,
  lcr.commission_status,
  lcr.commission_amount,
  lfr.loan_amount_requested,
  lfr.loan_amount_approved,
  lfr.loan_amount_disbursed,
  lli.processing_fee
FROM
  (
    (
      (
        (
          (
            (
              (
                (
                  (
                    (
                      hs_edumate_contacts c
                      LEFT JOIN hs_edumate_contacts_personal_information pi ON ((c.id = pi.contact_id))
                    )
                    LEFT JOIN hs_edumate_contacts_academic_profiles ap ON ((c.id = ap.contact_id))
                  )
                  LEFT JOIN hs_edumate_contacts_application_journey aj ON ((c.id = aj.contact_id))
                )
                LEFT JOIN hs_loan_applications la ON ((pi.email = la.student_email))
              )
              LEFT JOIN hs_loan_applications_academic_details lad ON ((la.id = lad.application_id))
            )
            LEFT JOIN hs_loan_applications_status las ON ((la.id = las.application_id))
          )
          LEFT JOIN hs_loan_applications_system_tracking lst ON ((la.id = lst.application_id))
        )
        LEFT JOIN hs_loan_applications_commission_records lcr ON ((la.id = lcr.application_id))
      )
      LEFT JOIN hs_loan_applications_financial_requirements lfr ON ((la.id = lfr.application_id))
    )
    LEFT JOIN hs_loan_applications_lender_information lli ON ((la.id = lli.application_id))
  )
WHERE
  (c.is_deleted = false);
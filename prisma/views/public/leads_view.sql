WITH loan_apps_agg AS (
  SELECT
    la.id AS loan_application_id,
    la.contact_id,
    la.student_email,
    la.application_date,
    la.student_id,
    la.student_name,
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
    lli.processing_fee,
    row_number() OVER (
      PARTITION BY la.contact_id
      ORDER BY
        CASE
          WHEN (las.application_status = 'Approved' :: text) THEN 0
          ELSE 1
        END,
        la.id
    ) AS rn
  FROM
    (
      (
        (
          (
            (
              (
                hs_loan_applications la
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
    (la.is_deleted = false)
),
loan_apps_per_contact AS (
  SELECT
    loan_apps_agg.contact_id,
    count(loan_apps_agg.loan_application_id) AS loan_application_count,
    array_agg(
      loan_apps_agg.loan_application_id
      ORDER BY
        loan_apps_agg.loan_application_id
    ) AS loan_application_ids,
    max(
      CASE
        WHEN (loan_apps_agg.rn = 1) THEN loan_apps_agg.loan_application_id
        ELSE NULL :: integer
      END
    ) AS loan_application_id,
    max(
      CASE
        WHEN (loan_apps_agg.rn = 1) THEN loan_apps_agg.student_email
        ELSE NULL :: text
      END
    ) AS student_email,
    max(
      CASE
        WHEN (loan_apps_agg.rn = 1) THEN loan_apps_agg.application_date
        ELSE NULL :: timestamp without time zone
      END
    ) AS application_date,
    max(
      CASE
        WHEN (loan_apps_agg.rn = 1) THEN loan_apps_agg.student_id
        ELSE NULL :: text
      END
    ) AS student_id,
    max(
      CASE
        WHEN (loan_apps_agg.rn = 1) THEN loan_apps_agg.student_name
        ELSE NULL :: text
      END
    ) AS student_name,
    max(
      CASE
        WHEN (loan_apps_agg.rn = 1) THEN loan_apps_agg.student_phone
        ELSE NULL :: text
      END
    ) AS student_phone,
    max(
      CASE
        WHEN (loan_apps_agg.rn = 1) THEN loan_apps_agg.application_source
        ELSE NULL :: text
      END
    ) AS application_source,
    max(
      CASE
        WHEN (loan_apps_agg.rn = 1) THEN loan_apps_agg.visa_status
        ELSE NULL :: text
      END
    ) AS visa_status,
    max(
      CASE
        WHEN (loan_apps_agg.rn = 1) THEN loan_apps_agg.application_status
        ELSE NULL :: text
      END
    ) AS application_status,
    max(
      CASE
        WHEN (loan_apps_agg.rn = 1) THEN loan_apps_agg.integration_status
        ELSE NULL :: text
      END
    ) AS integration_status,
    max(
      CASE
        WHEN (loan_apps_agg.rn = 1) THEN loan_apps_agg.commission_status
        ELSE NULL :: text
      END
    ) AS commission_status,
    max(
      CASE
        WHEN (loan_apps_agg.rn = 1) THEN loan_apps_agg.commission_amount
        ELSE NULL :: numeric
      END
    ) AS commission_amount,
    max(
      CASE
        WHEN (loan_apps_agg.rn = 1) THEN loan_apps_agg.loan_amount_requested
        ELSE NULL :: numeric
      END
    ) AS loan_amount_requested,
    max(
      CASE
        WHEN (loan_apps_agg.rn = 1) THEN loan_apps_agg.loan_amount_approved
        ELSE NULL :: numeric
      END
    ) AS loan_amount_approved,
    max(
      CASE
        WHEN (loan_apps_agg.rn = 1) THEN loan_apps_agg.loan_amount_disbursed
        ELSE NULL :: numeric
      END
    ) AS loan_amount_disbursed,
    max(
      CASE
        WHEN (loan_apps_agg.rn = 1) THEN loan_apps_agg.processing_fee
        ELSE NULL :: numeric
      END
    ) AS processing_fee
  FROM
    loan_apps_agg
  GROUP BY
    loan_apps_agg.contact_id
)
SELECT
  c.id AS contact_id,
  c.b2b_partner_id,
  c.hubspot_owner_id,
  c.created_at,
  c.updated_at,
  c.course_type,
  pi.first_name,
  pi.last_name,
  pi.email,
  pi.phone_number,
  pi.gender,
  pi.date_of_birth,
  ap.admission_status,
  ap.current_education_level,
  ap.current_institution,
  ap.current_course_major,
  ap.preferred_study_destination,
  ap.target_degree_level,
  ap.target_universities,
  ap.intake_year,
  ap.intake_month,
  ap.program_of_interest_final,
  aj.lifecycle_stages,
  aj.lifecycle_stages_status,
  lpc.loan_application_id,
  lpc.application_date,
  lpc.student_id,
  lpc.student_name,
  lpc.student_email,
  lpc.student_phone,
  lpc.application_source,
  lpc.visa_status,
  lpc.application_status,
  lpc.integration_status,
  lpc.commission_status,
  lpc.commission_amount,
  lpc.loan_amount_requested,
  lpc.loan_amount_approved,
  lpc.loan_amount_disbursed,
  lpc.processing_fee,
  COALESCE(lpc.loan_application_count, (0) :: bigint) AS loan_application_count,
  COALESCE(lpc.loan_application_ids, '{}' :: integer []) AS loan_application_ids
FROM
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
    LEFT JOIN loan_apps_per_contact lpc ON ((c.id = lpc.contact_id))
  )
WHERE
  (c.is_deleted = false);
-- CreateEnum
CREATE TYPE "public"."AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "public"."I20CasStatus" AS ENUM ('Yes', 'No', 'Not Applicable', 'Pending');

-- CreateEnum
CREATE TYPE "public"."ApplicationStatusEnum" AS ENUM ('Pre-Approved', 'Approved', 'Sanction Letter Issued', 'Disbursement Pending', 'Disbursed', 'Rejected', 'On Hold', 'Withdrawn', 'Cancelled');

-- CreateEnum
CREATE TYPE "public"."PriorityLevel" AS ENUM ('High', 'Medium', 'Low', 'Urgent');

-- CreateEnum
CREATE TYPE "public"."RecordStatus" AS ENUM ('Active', 'Completed', 'Cancelled', 'Archived');

-- CreateEnum
CREATE TYPE "public"."LoanProductType" AS ENUM ('Secured', 'Unsecured', 'Government Scheme');

-- CreateEnum
CREATE TYPE "public"."InterestRateType" AS ENUM ('Fixed', 'Floating', 'Hybrid', 'Choice Based');

-- CreateEnum
CREATE TYPE "public"."DelayReason" AS ENUM ('Incomplete Documents', 'Customer Not Responding', 'Lender Processing', 'Internal Review', 'Compliance Check', 'Other');

-- CreateEnum
CREATE TYPE "public"."rejection_reason" AS ENUM ('Insufficient Income', 'Poor Credit Score', 'Incomplete Documents', 'Course Not Approved', 'University Not Approved', 'High Risk Profile', 'Policy Changes', 'Invalid Format', 'Expired Document', 'Unclear Image', 'Incomplete Information', 'Mismatch Data', 'Fraudulent', 'Wrong Document', 'Not Certified', 'Other');

-- CreateEnum
CREATE TYPE "public"."AppealOutcome" AS ENUM ('Pending', 'Approved', 'Rejected', 'Not Applicable');

-- CreateEnum
CREATE TYPE "public"."CommunicationChannel" AS ENUM ('Phone', 'Email', 'Whatsapp', 'Sms', 'Video Call');

-- CreateEnum
CREATE TYPE "public"."FollowUpFrequency" AS ENUM ('Daily', 'Weekly', 'Bi Weekly', 'Monthly', 'As Needed');

-- CreateEnum
CREATE TYPE "public"."ApplicationSourceSystem" AS ENUM ('Manual Entry', 'Website Form', 'Partner Portal', 'Import', 'Api');

-- CreateEnum
CREATE TYPE "public"."IntegrationStatus" AS ENUM ('Synced', 'Pending Sync', 'Sync Failed', 'Not Required');

-- CreateEnum
CREATE TYPE "public"."CommissionBase" AS ENUM ('Loan Amount', 'Fixed Amount', 'Tiered');

-- CreateEnum
CREATE TYPE "public"."CommissionStatus" AS ENUM ('Not Applicable', 'Pending Calculation', 'Calculated', 'Approved For Payment', 'Paid', 'On Hold');

-- CreateEnum
CREATE TYPE "public"."admission_status" AS ENUM ('Not Applied', 'Applied', 'Interview Scheduled', 'Waitlisted', 'Admitted', 'Rejected');

-- CreateEnum
CREATE TYPE "public"."education_level" AS ENUM ('High School', 'Bachelor', 'Master', 'PhD', 'Diploma', 'Other');

-- CreateEnum
CREATE TYPE "public"."academic_term" AS ENUM ('Fall', 'Spring', 'Summer', 'Winter');

-- CreateEnum
CREATE TYPE "public"."application_status" AS ENUM ('Lead', 'Prospect', 'Application Started', 'Application Submitted', 'In Review', 'Approved', 'Rejected', 'Enrolled', 'Deferred', 'Withdrawn');

-- CreateEnum
CREATE TYPE "public"."AdmissionStatuses" AS ENUM ('Not Applied', 'Applied', 'Admitted', 'Waitlisted', 'Rejected', 'Deferred');

-- CreateEnum
CREATE TYPE "public"."VisaStatus" AS ENUM ('Not Applied', 'Applied', 'Approved', 'Rejected', 'Pending');

-- CreateEnum
CREATE TYPE "public"."ApplicationSource" AS ENUM ('Direct', 'B2b Partner', 'Website', 'Referral', 'Advertisement');

-- CreateEnum
CREATE TYPE "public"."CourseLevel" AS ENUM ('Bachelors', 'Masters', 'PhD', 'Diploma', 'Certificate', 'Professional');

-- CreateEnum
CREATE TYPE "public"."hs_lenders_category" AS ENUM ('Domestic', 'International', 'Both');

-- CreateEnum
CREATE TYPE "public"."hs_lenders_type" AS ENUM ('Public Bank', 'Private Bank', 'Nbfc', 'Credit Union', 'International Lender', 'Fintech');

-- CreateEnum
CREATE TYPE "public"."hs_lenders_status" AS ENUM ('Active', 'Inactive', 'Suspended', 'Pending Approval', 'Under Review');

-- CreateEnum
CREATE TYPE "public"."co_signer_requirement" AS ENUM ('Always Required', 'Sometimes Required', 'Not Required');

-- CreateEnum
CREATE TYPE "public"."collateral_type" AS ENUM ('Residential Property', 'Commercial Property', 'Non Agricultural Land', 'Fixed Deposits', 'Government Securities', 'Lic Policies', 'Nsc Kvp', 'Gold', 'Shares Mutual Funds', 'Property', 'Securities', 'Guarantor Only', 'No Collateral', 'Na Plot');

-- CreateEnum
CREATE TYPE "public"."course_type" AS ENUM ('Undergraduate', 'Graduate', 'PhD', 'Diploma', 'Certificate', 'Professional', 'Technical', 'Full Time', 'Part Time', 'Distance Learning', 'Online', 'Executive', 'Regular', 'Accelerated');

-- CreateEnum
CREATE TYPE "public"."api_connectivity_status" AS ENUM ('Connected', 'Disconnected', 'In Progress', 'Failed', 'Not Applicable');

-- CreateEnum
CREATE TYPE "public"."integration_level" AS ENUM ('Full Digital', 'Partial Digital', 'Manual', 'Hybrid');

-- CreateEnum
CREATE TYPE "public"."data_source" AS ENUM ('Manual Entry', 'Api Sync', 'Import', 'Third Party', 'System Generated', 'Api', 'Website Form', 'Partner Integration');

-- CreateEnum
CREATE TYPE "public"."partnership_status" AS ENUM ('Active', 'Inactive', 'Pending', 'Terminated', 'On Hold');

-- CreateEnum
CREATE TYPE "public"."product_status" AS ENUM ('Active', 'Inactive', 'Discontinued', 'Coming Soon', 'Under Review');

-- CreateEnum
CREATE TYPE "public"."product_type" AS ENUM ('Secured Education Loan', 'Unsecured Education Loan', 'Government Scheme', 'Scholar Loan', 'Express Loan', 'Premium Loan', 'Skill Development Loan');

-- CreateEnum
CREATE TYPE "public"."loan_category" AS ENUM ('Domestic', 'International', 'Both', 'Vocational', 'Professional');

-- CreateEnum
CREATE TYPE "public"."application_mode" AS ENUM ('Online', 'Offline', 'Hybrid', 'Mobile App', 'Portal');

-- CreateEnum
CREATE TYPE "public"."disbursement_process" AS ENUM ('Direct To University', 'Direct To Student', 'Installment Based', 'Full Amount', 'Partial Disbursement');

-- CreateEnum
CREATE TYPE "public"."collateral_requirement" AS ENUM ('Always Required', 'Above Threshold', 'Not Required', 'Optional');

-- CreateEnum
CREATE TYPE "public"."processing_fee_type" AS ENUM ('Percentage', 'Fixed Amount', 'Nil', 'Tiered');

-- CreateEnum
CREATE TYPE "public"."repayment_frequency" AS ENUM ('Monthly', 'Quarterly', 'Half Yearly', 'Annually', 'Flexible', 'Custom');

-- CreateEnum
CREATE TYPE "public"."moratorium_type" AS ENUM ('Complete', 'Interest Only', 'Partial Emi', 'No Moratorium');

-- CreateEnum
CREATE TYPE "public"."integration_complexity" AS ENUM ('Simple', 'Moderate', 'Complex', 'Very Complex');

-- CreateEnum
CREATE TYPE "public"."market_positioning" AS ENUM ('Premium', 'Competitive', 'Budget', 'Value For Money', 'Niche');

-- CreateEnum
CREATE TYPE "public"."loan_status" AS ENUM ('Not Applied', 'Exploring', 'Application Started', 'Documents Pending', 'Under Review', 'Approved', 'Rejected', 'Disbursed', 'Active', 'Closed');

-- CreateEnum
CREATE TYPE "public"."gender" AS ENUM ('Male', 'Female', 'Other', 'Prefer Not To Say');

-- CreateEnum
CREATE TYPE "public"."employment_status" AS ENUM ('Employed', 'Unemployed', 'Self Employed', 'Student', 'Retired');

-- CreateEnum
CREATE TYPE "public"."marital_status" AS ENUM ('Single', 'Married', 'Divorced', 'Widowed');

-- CreateEnum
CREATE TYPE "public"."hs_loan_documents_category" AS ENUM ('Student Documents', 'Co-Applicant 1 Documents', 'Co-Applicant 2 Documents', 'Co-Applicant 3 Documents', 'Collateral Documents', 'Institutional Documents', 'Supporting Documents');

-- CreateEnum
CREATE TYPE "public"."hs_loan_documents_type" AS ENUM ('Identity Proof', 'Address Proof', 'Income Proof', 'Academic Documents', 'Employment Proof', 'Property Documents', 'Bank Statements', 'Tax Documents', 'Admission Documents', 'Visa Documents', 'Financial Documents', 'Guarantee Documents', 'Other');

-- CreateEnum
CREATE TYPE "public"."hs_loan_documents_priority" AS ENUM ('Mandatory', 'Conditional', 'Optional', 'Nice To Have');

-- CreateEnum
CREATE TYPE "public"."hs_loan_documents_stage" AS ENUM ('Application', 'Initial Review', 'Credit Assessment', 'Final Approval', 'Disbursement', 'Post Disbursement');

-- CreateEnum
CREATE TYPE "public"."hs_loan_documents_format" AS ENUM ('Pdf', 'Jpg', 'Jpeg', 'Png', 'Tiff', 'Doc', 'Docx', 'Original Hard Copy', 'Scanned Copy', 'Digital Copy');

-- CreateEnum
CREATE TYPE "public"."hs_loan_documents_status" AS ENUM ('Active', 'Inactive', 'Under Review', 'Deprecated', 'Archived');

-- CreateEnum
CREATE TYPE "public"."verification_status" AS ENUM ('Pending', 'In Progress', 'Verified', 'Rejected', 'Expired', 'Not Required', 'Additional Info Required');

-- CreateEnum
CREATE TYPE "public"."verification_method" AS ENUM ('Manual', 'Automated', 'Hybrid', 'Third Party', 'Blockchain', 'Digilocker');

-- CreateEnum
CREATE TYPE "public"."data_sensitivity" AS ENUM ('Highly Sensitive', 'Sensitive', 'Moderate', 'Low', 'Public');

-- CreateEnum
CREATE TYPE "public"."applicability_status" AS ENUM ('Yes', 'No', 'Conditional');

-- CreateEnum
CREATE TYPE "public"."automation_level" AS ENUM ('Full', 'Partial', 'Manual Only', 'Hybrid');

-- CreateEnum
CREATE TYPE "public"."commission_model" AS ENUM ('Percentage', 'Fixed Amount', 'Tiered', 'Hybrid', 'Performance Based');

-- CreateEnum
CREATE TYPE "public"."settlement_status" AS ENUM ('Pending Calculation', 'Calculated', 'Pending Approval', 'Approved', 'Payment Initiated', 'Paid', 'On Hold', 'Rejected', 'Cancelled', 'Disputed');

-- CreateEnum
CREATE TYPE "public"."payment_status" AS ENUM ('Pending', 'Initiated', 'In Process', 'Completed', 'Failed', 'Cancelled', 'Returned');

-- CreateEnum
CREATE TYPE "public"."payment_method" AS ENUM ('Bank Transfer', 'Neft', 'Rtgs', 'Imps', 'Upi', 'Cheque', 'Demand Draft', 'Digital Wallet', 'International Wire');

-- CreateEnum
CREATE TYPE "public"."settlement_period" AS ENUM ('Monthly', 'Quarterly', 'Half Yearly', 'Yearly', 'Ad Hoc');

-- CreateEnum
CREATE TYPE "public"."disbursement_trigger" AS ENUM ('Loan Disbursed', 'Application Approved', 'Target Achieved', 'Manual Trigger', 'Scheduled Payment');

-- CreateEnum
CREATE TYPE "public"."invoice_status" AS ENUM ('Pending', 'Generated', 'Sent', 'Received', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "public"."reconciliation_status" AS ENUM ('Pending', 'Reconciled', 'Discrepancy Found', 'Under Review', 'Resolved');

-- CreateEnum
CREATE TYPE "public"."hold_reason" AS ENUM ('Document Verification Pending', 'Invoice Issues', 'Partner Agreement Dispute', 'Calculation Error', 'Compliance Issues', 'Management Review', 'Legal Issues', 'System Error');

-- CreateEnum
CREATE TYPE "public"."notification_method" AS ENUM ('Email', 'Sms', 'Whatsapp', 'Phone Call', 'Portal Notification');

-- CreateEnum
CREATE TYPE "public"."acknowledgment_status" AS ENUM ('Yes', 'No', 'Pending');

-- CreateEnum
CREATE TYPE "public"."api_access_status" AS ENUM ('Yes', 'No', 'Not Required');

-- CreateEnum
CREATE TYPE "public"."b2b_data_source" AS ENUM ('Manual Entry', 'Import', 'Partner Application', 'Referral');

-- CreateEnum
CREATE TYPE "public"."b2b_integration_status" AS ENUM ('Not Required', 'Pending', 'Complete', 'Issues');

-- CreateEnum
CREATE TYPE "public"."b2b_partners_record_status" AS ENUM ('Active', 'Inactive', 'Suspended', 'Under Review', 'Archived');

-- CreateEnum
CREATE TYPE "public"."b2b_portal_access_status" AS ENUM ('Yes', 'No', 'Pending');

-- CreateEnum
CREATE TYPE "public"."LoginStatus" AS ENUM ('Success', 'Failed', 'Logout');

-- CreateEnum
CREATE TYPE "public"."LenderCollateralType" AS ENUM ('Property', 'Fixed Deposits', 'Lic Policies', 'Securities', 'Guarantor Only', 'No Collateral', 'Na Plot');

-- CreateEnum
CREATE TYPE "public"."SupportedCourseTypes" AS ENUM ('Undergraduate', 'Graduate', 'PhD', 'Diploma', 'Certificate', 'Professional', 'Technical');

-- CreateEnum
CREATE TYPE "public"."SupportedDestinations" AS ENUM ('Us', 'Uk', 'Canada', 'Australia', 'Germany', 'France', 'Singapore', 'Italy', 'Uae', 'Other');

-- CreateEnum
CREATE TYPE "public"."HolidayProcessing" AS ENUM ('Yes', 'No', 'Limited');

-- CreateEnum
CREATE TYPE "public"."repayment_options" AS ENUM ('Emi', 'Simple Int', 'Partial Int', 'Complete Morat');

-- CreateEnum
CREATE TYPE "public"."payout_terms" AS ENUM ('Net 30', 'Net 45', 'Net 60', 'Custom');

-- CreateEnum
CREATE TYPE "public"."performance_rating" AS ENUM ('Excellent', 'Good', 'Average', 'Poor');

-- CreateEnum
CREATE TYPE "public"."hs_lenders_record_status" AS ENUM ('Active', 'Inactive', 'Under Review', 'Suspended');

-- CreateEnum
CREATE TYPE "public"."hs_lenders_data_source" AS ENUM ('Manual Entry', 'Import', 'Api Integration');

-- CreateEnum
CREATE TYPE "public"."guarantor_required" AS ENUM ('Always', 'Above Threshold', 'Not Required', 'Optional');

-- CreateEnum
CREATE TYPE "public"."insurance_required" AS ENUM ('Life Insurance', 'Property Insurance', 'Both', 'Not Required');

-- CreateEnum
CREATE TYPE "public"."third_party_guarantee_required" AS ENUM ('Yes', 'No', 'Case By Case');

-- CreateEnum
CREATE TYPE "public"."hs_loan_products_market_segment" AS ENUM ('Premium', 'Mid-Market', 'Budget', 'Niche', 'Mass Market');

-- CreateEnum
CREATE TYPE "public"."pricing_strategy" AS ENUM ('Competitive', 'Premium', 'Penetration', 'Value Based');

-- CreateEnum
CREATE TYPE "public"."nationality_restrictions" AS ENUM ('Indian', 'Others');

-- CreateEnum
CREATE TYPE "public"."residency_requirements" AS ENUM ('Resident', 'Non-Resident');

-- CreateEnum
CREATE TYPE "public"."target_segment" AS ENUM ('Undergraduate', 'Graduate', 'PhD', 'Diploma', 'Certificate', 'Professional', 'Technical', 'Medical', 'Management');

-- CreateEnum
CREATE TYPE "public"."hs_loan_products_course_types" AS ENUM ('Full Time', 'Part Time', 'Distance Learning', 'Online', 'Executive', 'Regular', 'Accelerated');

-- CreateEnum
CREATE TYPE "public"."part_payment_allowed" AS ENUM ('Yes', 'No', 'Minimum Amount');

-- CreateEnum
CREATE TYPE "public"."customer_support_features" AS ENUM ('24x7 Support', 'Dedicated Rm', 'Online Chat', 'Video Kyc', 'Door Step Service');

-- CreateEnum
CREATE TYPE "public"."digital_features" AS ENUM ('Online Application', 'Digital Documentation', 'E-Statements', 'Mobile App', 'Sms Alerts', 'Email Notifications');

-- CreateEnum
CREATE TYPE "public"."flexible_repayment_options" AS ENUM ('Step Up Emi', 'Step Down Emi', 'Bullet Payment', 'Flexible Emi', 'Holiday Options');

-- CreateEnum
CREATE TYPE "public"."sandbox_environment" AS ENUM ('Available', 'Not Available', 'On Request');

-- CreateEnum
CREATE TYPE "public"."data_format" AS ENUM ('Json', 'Xml', 'Csv', 'Api', 'Manual');

-- CreateEnum
CREATE TYPE "public"."api_availability" AS ENUM ('Yes', 'No', 'Under Development', 'Planned');

-- CreateEnum
CREATE TYPE "public"."webhook_support" AS ENUM ('Yes', 'No', 'Limited');

-- CreateEnum
CREATE TYPE "public"."product_record_status" AS ENUM ('Active', 'Inactive', 'Under Review', 'Discontinued');

-- CreateEnum
CREATE TYPE "public"."review_frequency" AS ENUM ('Monthly', 'Quarterly', 'Half-yearly', 'Yearly');

-- CreateEnum
CREATE TYPE "public"."settlement_month" AS ENUM ('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');

-- CreateEnum
CREATE TYPE "public"."tax_certificate_required" AS ENUM ('Yes', 'No', 'Auto Generated');

-- CreateEnum
CREATE TYPE "public"."commission_data_source" AS ENUM ('Manual Entry', 'Automated Calculation', 'Import', 'Api', 'Bulk Upload');

-- CreateEnum
CREATE TYPE "public"."settlement_record_status" AS ENUM ('Active', 'Completed', 'Cancelled', 'Archived', 'Under Investigation');

-- CreateEnum
CREATE TYPE "public"."system_generated" AS ENUM ('Yes', 'No', 'Partially');

-- CreateEnum
CREATE TYPE "public"."partner_notification_sent" AS ENUM ('Yes', 'No', 'Pending', 'Failed');

-- CreateEnum
CREATE TYPE "public"."transaction_types" AS ENUM ('Commission Payment', 'Bonus Payment', 'Adjustment', 'Reversal', 'Penalty Deduction', 'Advance Payment', 'Final Settlement');

-- CreateEnum
CREATE TYPE "public"."collateral_dependency" AS ENUM ('Yes', 'No', 'Not Applicable');

-- CreateEnum
CREATE TYPE "public"."required_for_countries" AS ENUM ('Us', 'Uk', 'Canada', 'Australia', 'Germany', 'France', 'Other');

-- CreateEnum
CREATE TYPE "public"."required_for_courses" AS ENUM ('Engineering', 'Mba', 'Ms', 'Medicine', 'Law', 'Arts', 'Science', 'Other');

-- CreateEnum
CREATE TYPE "public"."gdpr_relevance" AS ENUM ('Yes', 'No', 'Partial', 'Not Applicable');

-- CreateEnum
CREATE TYPE "public"."hs_loan_documents_availability" AS ENUM ('Yes', 'No', 'Planned', 'Not Required');

-- CreateEnum
CREATE TYPE "public"."automated_processing" AS ENUM ('Full', 'Partial', 'Manual Only', 'Hybrid');

-- CreateEnum
CREATE TYPE "public"."blockchain_verification" AS ENUM ('Yes', 'No', 'Not Applicable', 'Future');

-- CreateEnum
CREATE TYPE "public"."digital_signature_required" AS ENUM ('Yes', 'No', 'Optional', 'Preferred');

-- CreateEnum
CREATE TYPE "public"."e_signature_accepted" AS ENUM ('Yes', 'No', 'Case By Case');

-- CreateEnum
CREATE TYPE "public"."real_time_verification" AS ENUM ('Yes', 'No', 'Planned', 'Not Applicable');

-- CreateEnum
CREATE TYPE "public"."accepted_formats" AS ENUM ('Pdf', 'Jpg', 'Jpeg', 'Png', 'Tiff', 'Doc', 'Docx', 'Original Hard Copy', 'Scanned Copy', 'Digital Copy');

-- CreateEnum
CREATE TYPE "public"."color_requirements" AS ENUM ('Color Only', 'Black White Only', 'Both Acceptable', 'Color Preferred');

-- CreateEnum
CREATE TYPE "public"."combined_document_allowed" AS ENUM ('Yes', 'No', 'Single Page Only');

-- CreateEnum
CREATE TYPE "public"."language_requirements" AS ENUM ('English', 'Hindi', 'Regional With Translation', 'Notarized Translation Required');

-- CreateEnum
CREATE TYPE "public"."multiple_pages_allowed" AS ENUM ('Yes', 'No', 'Single Page Only');

-- CreateEnum
CREATE TYPE "public"."quality_standards" AS ENUM ('Clear Legible', 'All Corners Visible', 'No Shadows', 'Original Colors', 'Stamped Signed', 'Notarized', 'Apostilled');

-- CreateEnum
CREATE TYPE "public"."auto_extraction_possible" AS ENUM ('Yes', 'No', 'Partial');

-- CreateEnum
CREATE TYPE "public"."ocr_compatibility" AS ENUM ('High', 'Medium', 'Low', 'Not Compatible');

-- CreateEnum
CREATE TYPE "public"."parallel_processing_allowed" AS ENUM ('Yes', 'No', 'Preferred');

-- CreateEnum
CREATE TYPE "public"."resubmission_allowed" AS ENUM ('Yes', 'No', 'Limited Attempts');

-- CreateEnum
CREATE TYPE "public"."hs_loan_documents_record_status" AS ENUM ('Active', 'Inactive', 'Under Review', 'Deprecated');

-- CreateEnum
CREATE TYPE "public"."hs_loan_documents_review_frequency" AS ENUM ('Monthly', 'Quarterly', 'Half-yearly', 'Yearly', 'As Needed');

-- CreateEnum
CREATE TYPE "public"."edumate_contact_admission_status" AS ENUM ('Not Applied', 'Applied', 'Interview Scheduled', 'Waitlisted', 'Admitted', 'Rejected');

-- CreateEnum
CREATE TYPE "public"."current_education_level" AS ENUM ('High School', 'Bachelors', 'Masters', 'PhD', 'Diploma', 'Other');

-- CreateEnum
CREATE TYPE "public"."intended_start_term" AS ENUM ('Fall', 'Spring', 'Summer', 'Winter');

-- CreateEnum
CREATE TYPE "public"."preferred_study_destination" AS ENUM ('Us', 'Uk', 'Canada', 'Australia', 'Germany', 'France', 'Singapore', 'Italy', 'Uae', 'Japan', 'China', 'India', 'New Zealand', 'Ireland', 'Other');

-- CreateEnum
CREATE TYPE "public"."target_degree_level" AS ENUM ('Bachelors', 'Masters', 'PhD', 'Diploma', 'Certificate', 'Professional Course');

-- CreateEnum
CREATE TYPE "public"."current_status_disposition" AS ENUM ('Not Interested', 'Wrong Number', 'Call Not Answered', 'Follow Up', 'Int For Next Year', 'Partial Documents Received');

-- CreateEnum
CREATE TYPE "public"."status_disposition_reason" AS ENUM ('Already Applied', 'Not Looking At Loan', 'Self Funding', 'Others');

-- CreateEnum
CREATE TYPE "public"."edumate_contact_course_type" AS ENUM ('Stem', 'Business', 'Others');

-- CreateEnum
CREATE TYPE "public"."co_applicant_occupation" AS ENUM ('Salaried', 'Self Employed', 'Retired', 'Others');

-- CreateEnum
CREATE TYPE "public"."co_applicant_relationship" AS ENUM ('Father', 'Mother', 'Spouse', 'Sibling', 'Uncle', 'Aunt', 'Grand Father', 'Grand Mother', 'Others');

-- CreateEnum
CREATE TYPE "public"."collateral_available" AS ENUM ('Yes', 'No');

-- CreateEnum
CREATE TYPE "public"."edumate_contact_collateral_type" AS ENUM ('Property', 'Fd', 'Na Plot', 'Other');

-- CreateEnum
CREATE TYPE "public"."financial_currency" AS ENUM ('Inr', 'Usd', 'Eur', 'Gbp', 'Cad', 'Aud', 'Other');

-- CreateEnum
CREATE TYPE "public"."lead_source" AS ENUM ('Organic Search', 'Social Media', 'B2b Partner', 'Referral', 'Advertisement', 'Website', 'Walk-in', 'Other');

-- CreateEnum
CREATE TYPE "public"."partner_commission_applicable" AS ENUM ('Yes', 'No');

-- CreateEnum
CREATE TYPE "public"."loan_type_preference" AS ENUM ('Secured', 'Unsecured', 'Government Scheme', 'No Preference');

-- CreateEnum
CREATE TYPE "public"."preferred_lenders" AS ENUM ('Axis');

-- CreateEnum
CREATE TYPE "public"."repayment_type_preference" AS ENUM ('Emi', 'Simple Int', 'Partial Int', 'Complete Morat');

-- CreateEnum
CREATE TYPE "public"."nationality" AS ENUM ('Afghanistan', 'Albania', 'Antarctica', 'Åland Islands', 'Algeria', 'American Samoa', 'Andorra', 'Angola', 'Anguilla', 'Antigua And Barbuda', 'Aruba', 'Asia/Pacific Region', 'Azerbaijan', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belgium', 'Bhutan', 'Bolivia', 'Bosnia And Herzegovina', 'Botswana', 'Bouvet Island', 'Brazil', 'Caribbean Netherlands', 'Belize', 'Solomon Islands', 'Brunei', 'Bulgaria', 'Burundi', 'Belarus', 'Bermuda', 'Cambodia', 'Cayman Islands', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Cuba', 'Curaçao', 'Sri Lanka', 'Chad', 'Chile', 'China', 'Christmas Island', 'Cocos (Keeling) Islands', 'Colombia', 'Comoros', 'Congo', 'Democratic Republic Of The Congo', 'Cook Islands', 'Costa Rica', 'Croatia', 'Cyprus', 'Czech Republic', 'Benin', 'Denmark', 'Dominica', 'Dominican Republic', 'Ecuador', 'El Salvador', 'Equatorial Guinea', 'Ethiopia', 'Eritrea', 'Estonia', 'Europe', 'South Georgia And The South Sandwich Islands', 'Fiji', 'Finland', 'France', 'Falkland Islands', 'Faroe Islands', 'French Polynesia', 'French Southern And Antarctic Lands', 'Djibouti', 'Gabon', 'Georgia', 'Gambia', 'Germany', 'Ghana', 'Greenland', 'Guadeloupe', 'Guernsey', 'Kiribati', 'Greece', 'Grenada', 'Guam', 'Guatemala', 'Guinea', 'Guyana', 'French Guiana', 'Gibraltar', 'Haiti', 'Heard Island And Mcdonald Islands', 'Vatican City', 'Honduras', 'Hungary', 'Hong Kong', 'Isle Of Man', 'Iran', 'Jersey', 'Macau', 'Martinique', 'Montserrat', 'Myanmar (Burma)', 'North Korea', 'Palestine', 'Puerto Rico', 'Réunion', 'Saint Barthélemy', 'Saint Martin', 'Sint Maarten', 'South Sudan', 'Sudan', 'Syria', 'Taiwan', 'Turks And Caicos Islands', 'U.S. Virgin Islands', 'Iceland', 'India', 'Indonesia', 'Iraq', 'Ireland', 'Israel', 'Italy', 'British Indian Ocean Territory', 'Cote Divoire', 'Jamaica', 'Japan', 'Kazakhstan', 'Jordan', 'Kenya', 'South Korea', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Lesotho', 'Latvia', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Mauritania', 'Mauritius', 'Mayotte', 'Mexico', 'Monaco', 'Mongolia', 'Moldova', 'Montenegro', 'Morocco', 'Mozambique', 'Oman', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Caledonia', 'Vanuatu', 'Netherlands Antilles', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'Norfolk Island', 'Norway', 'Northern Mariana Islands', 'United States Minor Outlying Islands', 'Micronesia', 'Marshall Islands', 'Palau', 'Pakistan', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Pitcairn Islands', 'Poland', 'Portugal', 'Guinea-Bissau', 'East Timor', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Helena', 'Saint Kitts And Nevis', 'Saint Lucia', 'Saint Pierre And Miquelon', 'Saint Vincent And The Grenadines', 'San Marino', 'Sao Tome And Principe', 'Saudi Arabia', 'Senegal', 'Svalbard And Jan Mayen', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Vietnam', 'Western Sahara', 'Slovenia', 'Somalia', 'South Africa', 'Zimbabwe', 'Spain', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Tajikistan', 'Thailand', 'Togo', 'Tokelau', 'Tonga', 'Trinidad And Tobago', 'United Arab Emirates', 'Tunisia', 'Türkiye', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'Macedonia (Fyrom)', 'Egypt', 'United Kingdom', 'Tanzania', 'United States', 'Burkina Faso', 'Uruguay', 'Uzbekistan', 'Venezuela', 'British Virgin Islands', 'Wallis And Futuna', 'Samoa', 'Yemen', 'Zambia', 'Canary Islands');

-- CreateEnum
CREATE TYPE "public"."gdpr_consent" AS ENUM ('Yes', 'No', 'Pending');

-- CreateEnum
CREATE TYPE "public"."marketing_consent" AS ENUM ('Yes', 'No');

-- CreateEnum
CREATE TYPE "public"."student_record_status" AS ENUM ('Active', 'Inactive', 'Duplicate', 'Merged');

-- CreateTable
CREATE TABLE "public"."admin_users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "full_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phone" TEXT,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_roles" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "admin_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_user_roles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_permissions" (
    "id" SERIAL NOT NULL,
    "permission" TEXT NOT NULL,
    "module" TEXT,
    "description" TEXT,

    CONSTRAINT "admin_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_role_permissions" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "admin_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "refresh_token_hash" TEXT,
    "device_info" TEXT,
    "ip_address" TEXT,
    "is_valid" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT NOT NULL,

    CONSTRAINT "admin_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."loan_eligibility_matrix" (
    "id" SERIAL NOT NULL,
    "country_of_study" VARCHAR(100),
    "level_of_education" VARCHAR(50),
    "course_type" VARCHAR(100),
    "is_stem_designated" BOOLEAN,
    "analytical_exam_name" VARCHAR(50),
    "language_exam_name" VARCHAR(50),
    "preference" VARCHAR(20),
    "loan_amount" DECIMAL(12,2),
    "loan_amount_currency" VARCHAR(3),
    "analytical_score_min" DECIMAL(6,2),
    "analytical_score_max" DECIMAL(6,2),
    "language_exam_score_min" DECIMAL(6,2),
    "language_exam_score_max" DECIMAL(6,2),

    CONSTRAINT "loan_eligibility_matrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."b2b_partners_roles" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "b2b_partners_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."b2b_partners_user_roles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "b2b_partners_user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."b2b_partners_sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "device_info" TEXT,
    "ip_address" INET,
    "is_valid" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "b2b_partners_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."login_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ip_address" INET,
    "device_info" TEXT,
    "status" "public"."LoginStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."b2b_partners_permissions" (
    "id" SERIAL NOT NULL,
    "permission" TEXT NOT NULL,
    "module" TEXT,

    CONSTRAINT "b2b_partners_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."b2b_partners_role_permissions" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "b2b_partners_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_b2b_partners" (
    "id" SERIAL NOT NULL,
    "deleted_by_id" INTEGER,
    "business_address" TEXT,
    "business_type" TEXT,
    "city" TEXT,
    "country" TEXT,
    "gst_number" TEXT,
    "incorporation_date" TIMESTAMP(3),
    "pan_number" TEXT,
    "partner_display_name" TEXT,
    "partner_name" TEXT,
    "partner_type" TEXT,
    "pincode" TEXT,
    "registration_number" TEXT,
    "state" TEXT,
    "website_url" TEXT,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3),
    "data_source" TEXT,
    "integration_status" TEXT,
    "internal_tags" TEXT,
    "last_modified_by" TEXT,
    "last_modified_date" TIMESTAMP(3),
    "notes" TEXT,
    "partner_record_status" TEXT,
    "portal_access_provided" TEXT,
    "api_access_provided" TEXT,
    "hs_created_by_user_id" INTEGER,
    "hs_createdate" TIMESTAMP(3),
    "hs_lastmodifieddate" TIMESTAMP(3),
    "hs_object_id" TEXT,
    "hs_updated_by_user_id" INTEGER,
    "hubspot_owner_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "hs_b2b_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_b2b_partners_business_capabilities" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "experience_years" DOUBLE PRECISION,
    "student_capacity_monthly" DOUBLE PRECISION,
    "student_capacity_yearly" DOUBLE PRECISION,
    "target_courses" TEXT,
    "target_desrinations" TEXT,
    "target_universities" TEXT,
    "team_size" DOUBLE PRECISION,

    CONSTRAINT "hs_b2b_partners_business_capabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_b2b_partners_commission_structure" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "bank_account_number" TEXT,
    "bank_branch" TEXT,
    "bank_name" TEXT,
    "beneficiary_name" TEXT,
    "bonus_structure" TEXT,
    "commission_model" TEXT,
    "commission_rate" DOUBLE PRECISION,
    "commission_type" TEXT,
    "fixed_commission_amount" DOUBLE PRECISION,
    "gst_applicable" TEXT,
    "ifsc_code" TEXT,
    "invoice_requirements" TEXT,
    "payment_frequency" TEXT,
    "payment_method" TEXT,
    "payment_terms" TEXT,
    "tds_applicable" TEXT,
    "tds_rate" DOUBLE PRECISION,
    "tiered_commission_structure" TEXT,

    CONSTRAINT "hs_b2b_partners_commission_structure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_b2b_partners_compliance_and_documentation" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "agreement_signed_date" TIMESTAMP(3),
    "background_verification_status" TEXT,
    "kyc_completion_date" TIMESTAMP(3),
    "kyc_status" TEXT,

    CONSTRAINT "hs_b2b_partners_compliance_and_documentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_b2b_partners_contact_info" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "accounts_contact_email" TEXT,
    "accounts_contact_person" TEXT,
    "accounts_contact_phone" TEXT,
    "marketing_contact_email" TEXT,
    "marketing_contact_person" TEXT,
    "marketing_contact_phone" TEXT,
    "primary_contact_designation" TEXT,
    "primary_contact_email" TEXT,
    "primary_contact_person" TEXT,
    "primary_contact_phone" TEXT,
    "secondary_contact_email" TEXT,
    "secondary_contact_person" TEXT,
    "secondary_contact_phone" TEXT,

    CONSTRAINT "hs_b2b_partners_contact_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_b2b_partners_financial_tracking" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "average_monthly_commission" DOUBLE PRECISION,
    "current_month_commission" DOUBLE PRECISION,
    "last_payment_amount" DOUBLE PRECISION,
    "last_payment_date" TIMESTAMP(3),
    "lifetime_value" TEXT,
    "next_payment_due_date" TIMESTAMP(3),
    "outstanding_commission" DOUBLE PRECISION,
    "payment_status" TEXT,
    "total_commission_earned" DOUBLE PRECISION,
    "total_commission_paid" DOUBLE PRECISION,
    "ytd_commission_earned" DOUBLE PRECISION,
    "ytd_commission_paid" DOUBLE PRECISION,

    CONSTRAINT "hs_b2b_partners_financial_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_b2b_partners_lead_attribution" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "lead_submission_method" TEXT,
    "lead_tracking_method" TEXT,
    "tracking_link" TEXT,
    "unique_referral_code" TEXT,
    "utm_source_assigned" TEXT,

    CONSTRAINT "hs_b2b_partners_lead_attribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_b2b_partners_marketing_and_promotion" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "brand_usage_guidelines" TEXT,
    "co_marketing_approval" TEXT,
    "content_collaboration" TEXT,
    "digital_presence_rating" DOUBLE PRECISION,
    "event_participation" TEXT,
    "marketing_materials_provided" TEXT,
    "promotional_activities" TEXT,
    "social_media_followers" DOUBLE PRECISION,

    CONSTRAINT "hs_b2b_partners_marketing_and_promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_b2b_partners_partnership_details" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "agreement_type" TEXT,
    "partnership_end_date" TIMESTAMP(3),
    "partnership_start_date" TIMESTAMP(3),
    "partnership_status" TEXT,

    CONSTRAINT "hs_b2b_partners_partnership_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_b2b_partners_performance_metrics" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "application_conversion_rate" DOUBLE PRECISION,
    "applications_approved" DOUBLE PRECISION,
    "approval_conversion_rate" DOUBLE PRECISION,
    "average_lead_quality_score" DOUBLE PRECISION,
    "average_loan_amount" DOUBLE PRECISION,
    "best_performing_month" TEXT,
    "last_lead_date" TIMESTAMP(3),
    "lead_conversion_rate" DOUBLE PRECISION,
    "leads_converted_to_applications" DOUBLE PRECISION,
    "loans_disbursed" DOUBLE PRECISION,
    "partner_rating" DOUBLE PRECISION,
    "qualified_leads_provided" DOUBLE PRECISION,
    "seasonal_performance_pattern" TEXT,
    "total_leads_provided" DOUBLE PRECISION,
    "total_loan_value_generated" DOUBLE PRECISION,

    CONSTRAINT "hs_b2b_partners_performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_b2b_partners_relationship_mgmt" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "assigned_account_manager" TEXT,
    "communication_frequency" TEXT,
    "escalation_history" TEXT,
    "feedback_comments" TEXT,
    "joint_marketing_activities" TEXT,
    "last_interaction_date" TIMESTAMP(3),
    "relationship_status" TEXT,
    "satisfaction_score" DOUBLE PRECISION,
    "training_completed" TEXT,

    CONSTRAINT "hs_b2b_partners_relationship_mgmt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_b2b_partners_system_tracking" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "partner_name" TEXT,
    "api_access_provided" "public"."api_access_status" NOT NULL,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3),
    "data_source" "public"."b2b_data_source" NOT NULL,
    "integration_status" "public"."b2b_integration_status" NOT NULL,
    "internal_tags" TEXT,
    "last_modified_by" TEXT,
    "last_modified_date" TIMESTAMP(3),
    "notes" TEXT,
    "partner_record_status" "public"."b2b_partners_record_status" NOT NULL,
    "portal_access_provided" "public"."b2b_portal_access_status" NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_b2b_partners_system_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."b2b_partners_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "b2b_partners_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."b2b_partners_userOtps" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "otp" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "b2b_partners_userOtps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."currency_conversion" (
    "id" SERIAL NOT NULL,
    "from_currency" VARCHAR(3) NOT NULL,
    "to_currency" VARCHAR(3) NOT NULL,
    "exchange_rate" DECIMAL(12,6) NOT NULL,
    "last_updated" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "currency_conversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."b2b_partners_users" (
    "id" SERIAL NOT NULL,
    "b2b_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "full_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "b2b_partners_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications" (
    "id" SERIAL NOT NULL,
    "application_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lead_reference_code" TEXT,
    "student_id" TEXT,
    "student_name" TEXT,
    "student_email" TEXT,
    "student_phone" TEXT,
    "application_source" "public"."ApplicationSource",
    "assigned_counselor_id" INTEGER,
    "b2b_partner_id" INTEGER,
    "is_deleted" BOOLEAN DEFAULT false,
    "user_id" INTEGER,
    "contact_id" INTEGER,
    "created_by_id" INTEGER,
    "last_modified_by_id" INTEGER,
    "deleted_by_id" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "hs_created_by_user_id" INTEGER,
    "hs_createdate" TIMESTAMP(3),
    "hs_lastmodifieddate" TIMESTAMP(3),
    "hs_object_id" TEXT,
    "hs_updated_by_user_id" INTEGER,
    "hubspot_owner_id" TEXT,

    CONSTRAINT "hs_loan_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_academic_details" (
    "id" SERIAL NOT NULL,
    "loan_application_id" INTEGER NOT NULL,
    "target_course" TEXT,
    "target_university" TEXT,
    "target_university_country" TEXT,
    "course_level" "public"."CourseLevel",
    "course_start_date" TIMESTAMP(3),
    "course_end_date" TIMESTAMP(3),
    "course_duration" INTEGER,
    "admission_status" "public"."admission_status",
    "visa_status" "public"."VisaStatus",
    "i20_cas_received" "public"."I20CasStatus",
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_applications_academic_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_financial_requirements" (
    "id" SERIAL NOT NULL,
    "loan_application_id" INTEGER NOT NULL,
    "loan_amount_requested" DECIMAL(12,2),
    "loan_amount_approved" DECIMAL(12,2),
    "loan_amount_disbursed" DECIMAL(12,2),
    "tuition_fee" DECIMAL(12,2),
    "living_expenses" DECIMAL(12,2),
    "travel_expenses" DECIMAL(12,2),
    "insurance_cost" DECIMAL(12,2),
    "other_expenses" DECIMAL(12,2),
    "total_funding_required" DECIMAL(12,2),
    "scholarship_amount" DECIMAL(12,2),
    "self_funding_amount" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_applications_financial_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_status" (
    "id" SERIAL NOT NULL,
    "loan_application_id" INTEGER NOT NULL,
    "status" "public"."ApplicationStatusEnum",
    "priority_level" "public"."PriorityLevel",
    "application_notes" TEXT,
    "internal_notes" TEXT,
    "record_status" "public"."RecordStatus",
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_applications_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_lender_information" (
    "id" SERIAL NOT NULL,
    "loan_application_id" INTEGER NOT NULL,
    "primary_lender_id" TEXT,
    "primary_lender_name" TEXT,
    "loan_product_id" TEXT,
    "loan_product_name" TEXT,
    "loan_product_type" "public"."LoanProductType",
    "interest_rate_offered" DECIMAL(10,2),
    "interest_rate_type" "public"."InterestRateType",
    "loan_tenure_years" INTEGER,
    "moratorium_period_months" INTEGER,
    "emi_amount" DECIMAL(12,2),
    "processing_fee" DECIMAL(12,2),
    "co_signer_required" BOOLEAN DEFAULT false,
    "collateral_required" BOOLEAN DEFAULT false,
    "collateral_type" TEXT,
    "collateral_value" DECIMAL(12,2),
    "guarantor_details" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_applications_lender_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_document_management" (
    "id" SERIAL NOT NULL,
    "loan_application_id" INTEGER NOT NULL,
    "documents_required_list" TEXT,
    "documents_submitted_list" TEXT,
    "documents_pending_list" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_applications_document_management_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_processing_timeline" (
    "id" SERIAL NOT NULL,
    "loan_application_id" INTEGER NOT NULL,
    "lender_submission_date" TIMESTAMP(3),
    "lender_acknowledgment_date" TIMESTAMP(3),
    "approval_date" TIMESTAMP(3),
    "sanction_letter_date" TIMESTAMP(3),
    "disbursement_request_date" TIMESTAMP(3),
    "disbursement_date" TIMESTAMP(3),
    "total_processing_days" INTEGER,
    "sla_breach" BOOLEAN DEFAULT false,
    "delay_reason" "public"."DelayReason",
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_applications_processing_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_rejection_details" (
    "id" SERIAL NOT NULL,
    "loan_application_id" INTEGER NOT NULL,
    "rejection_date" TIMESTAMP(3),
    "rejection_reason" "public"."rejection_reason",
    "rejection_details" TEXT,
    "appeal_submitted" BOOLEAN DEFAULT false,
    "appeal_outcome" "public"."AppealOutcome",
    "resolution_provided" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_applications_rejection_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_communication_preferences" (
    "id" SERIAL NOT NULL,
    "loan_application_id" INTEGER NOT NULL,
    "communication_preference" "public"."CommunicationChannel",
    "follow_up_frequency" "public"."FollowUpFrequency",
    "last_contact_date" TIMESTAMP(3),
    "next_follow_up_date" TIMESTAMP(3),
    "customer_satisfaction_rating" SMALLINT,
    "customer_feedback" TEXT,
    "complaint_raised" BOOLEAN DEFAULT false,
    "complaint_details" TEXT,
    "complaint_resolution_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_applications_communication_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_system_tracking" (
    "id" SERIAL NOT NULL,
    "loan_application_id" INTEGER NOT NULL,
    "application_source_system" "public"."ApplicationSourceSystem",
    "integration_status" "public"."IntegrationStatus",
    "audit_trail" TEXT,
    "hs_object_id" TEXT,
    "hs_merged_object_ids" TEXT,
    "hs_object_source_label" TEXT,
    "application_record_status" "public"."RecordStatus",
    "external_reference_id" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "last_modified_by" TEXT,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_applications_system_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_commission_records" (
    "id" SERIAL NOT NULL,
    "loan_application_id" INTEGER NOT NULL,
    "commission_amount" DECIMAL(12,2),
    "commission_rate" DECIMAL(10,2),
    "commission_calculation_base" "public"."CommissionBase",
    "commission_status" "public"."CommissionStatus",
    "commission_approval_date" TIMESTAMP(3),
    "commission_payment_date" TIMESTAMP(3),
    "partner_commission_applicable" BOOLEAN DEFAULT false,
    "settlement_id" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_applications_commission_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_additional_services" (
    "id" SERIAL NOT NULL,
    "loan_application_id" INTEGER NOT NULL,
    "additional_services_notes" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_applications_additional_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."file_uploads" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "file_data" JSONB NOT NULL,
    "total_records" INTEGER NOT NULL DEFAULT 0,
    "mime_type" TEXT,
    "entity_type_id" INTEGER NOT NULL,
    "processed_records" INTEGER NOT NULL DEFAULT 0,
    "failed_records" INTEGER NOT NULL DEFAULT 0,
    "uploaded_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "file_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."file_entities" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "file_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_types" (
    "id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "reciepient" TEXT NOT NULL,
    "cc" TEXT,
    "bcc" TEXT,
    "email_type_id" INTEGER NOT NULL,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_edumate_contacts_application_journey" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "assigned_counselor" TEXT,
    "counselor_notes" TEXT,
    "current_status_disposition" "public"."current_status_disposition",
    "current_status_disposition_reason" "public"."status_disposition_reason",
    "priority_level" "public"."PriorityLevel",
    "first_contact_date" TIMESTAMP(3),
    "last_contact_date" TIMESTAMP(3),
    "follow_up_date" TIMESTAMP(3),
    "next_follow_up_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_edumate_contacts_application_journey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_edumate_contacts_academic_profiles" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "admission_status" "public"."edumate_contact_admission_status",
    "current_education_level" "public"."current_education_level",
    "current_institution" TEXT,
    "current_course_major" TEXT,
    "current_cgpa_percentage" DOUBLE PRECISION,
    "current_graduation_year" INTEGER,
    "course_duration_months" INTEGER,
    "cat_score" INTEGER,
    "gre_score" INTEGER,
    "gmat_score" INTEGER,
    "toefl_score" INTEGER,
    "ielts_score" DOUBLE PRECISION,
    "sat_score" INTEGER,
    "duolingo_score" INTEGER,
    "nmat_score" INTEGER,
    "xat_score" INTEGER,
    "other_test_scores" TEXT,
    "target_degree_level" "public"."target_degree_level",
    "target_course_major" TEXT,
    "preferred_study_destination" "public"."preferred_study_destination",
    "target_universities" TEXT,
    "intended_start_term" "public"."intended_start_term",
    "intended_start_date" TIMESTAMP(3),
    "intake_month" TEXT,
    "intake_year" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_edumate_contacts_academic_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_edumate_contacts" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "deleted_by_id" INTEGER,
    "b2b_partner_id" INTEGER,
    "hs_created_by_user_id" INTEGER,
    "hs_createdate" TIMESTAMP(3),
    "hs_lastmodifieddate" TIMESTAMP(3),
    "hs_object_id" TEXT,
    "hs_updated_by_user_id" INTEGER,
    "hubspot_owner_id" TEXT,
    "base_currency" TEXT,
    "study_destination_currency" TEXT,
    "user_selected_currency" TEXT,
    "course_type" "public"."edumate_contact_course_type",
    "co_applicant_1_email" TEXT,
    "co_applicant_1_mobile_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "hs_edumate_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_edumate_contacts_system_tracking" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "created_by" INTEGER,
    "created_date" TIMESTAMP(3),
    "last_modified_by" TEXT,
    "last_modified_date" TIMESTAMP(3),
    "data_source" "public"."data_source",
    "student_record_status" "public"."student_record_status",
    "tags" TEXT,
    "gdpr_consent" "public"."gdpr_consent",
    "marketing_consent" "public"."marketing_consent",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_edumate_contacts_system_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_edumate_contacts_financial_info" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "annual_family_income" DECIMAL(15,2),
    "currency" "public"."financial_currency",
    "co_applicant_1_name" TEXT,
    "co_applicant_1_income" DECIMAL(15,2),
    "co_applicant_1_occupation" "public"."co_applicant_occupation",
    "co_applicant_1_relationship" "public"."co_applicant_relationship",
    "co_applicant_2_name" TEXT,
    "co_applicant_2_income" DECIMAL(15,2),
    "co_applicant_2_occupation" "public"."co_applicant_occupation",
    "co_applicant_2_relationship" "public"."co_applicant_relationship",
    "co_applicant_3_name" TEXT,
    "co_applicant_3_income" DECIMAL(15,2),
    "co_applicant_3_occupation" "public"."co_applicant_occupation",
    "co_applicant_3_relationship" "public"."co_applicant_relationship",
    "collateral_available" "public"."collateral_available",
    "collateral_type" "public"."edumate_contact_collateral_type",
    "collateral_value" DECIMAL(15,2),
    "collateral_2_available" "public"."collateral_available",
    "collateral_2_type" "public"."edumate_contact_collateral_type",
    "collateral_2_value" DECIMAL(15,2),
    "living_expenses" DECIMAL(15,2),
    "other_expenses" DECIMAL(15,2),
    "total_course_cost" DECIMAL(15,2),
    "tuition_fee" DECIMAL(15,2),
    "loan_amount_required" DECIMAL(15,2),
    "scholarship_amount" DECIMAL(15,2),
    "self_funding_amount" DECIMAL(15,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_edumate_contacts_financial_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_edumate_contacts_lead_attribution" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "lead_source" "public"."lead_source",
    "lead_source_detail" TEXT,
    "lead_quality_score" DOUBLE PRECISION,
    "lead_reference_code" TEXT,
    "b2b_partner_id" TEXT,
    "b2b_partner_name" TEXT,
    "partner_commission_applicable" "public"."partner_commission_applicable",
    "referral_person_name" TEXT,
    "referral_person_contact" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_term" TEXT,
    "utm_content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_edumate_contacts_lead_attribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_edumate_contacts_loan_preferences" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "loan_type_preference" "public"."loan_type_preference",
    "preferred_lenders" "public"."preferred_lenders"[],
    "repayment_type_preference" "public"."repayment_type_preference",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_edumate_contacts_loan_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_edumate_contacts_personal_information" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "phone_number" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "gender" "public"."gender",
    "nationality" "public"."nationality",
    "current_address" TEXT,
    "citycurrent_address" TEXT,
    "state_current_address" TEXT,
    "country_current_address" TEXT,
    "pincode_current_address" TEXT,
    "permanent_address" TEXT,
    "city_permanent_address" TEXT,
    "state_permanent_address" TEXT,
    "country_permanent_address" TEXT,
    "pincode_permanent_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_by_id" INTEGER,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "hs_edumate_contacts_personal_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_lenders" (
    "id" SERIAL NOT NULL,
    "external_id" TEXT,
    "lender_display_name" TEXT NOT NULL,
    "lender_name" TEXT NOT NULL,
    "legal_name" TEXT,
    "short_code" TEXT,
    "lender_logo_url" TEXT,
    "website_url" TEXT,
    "lender_category" "public"."hs_lenders_category",
    "lender_type" "public"."hs_lenders_type",
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_by" TEXT,
    "hs_created_by_user_id" INTEGER,
    "hs_createdate" TIMESTAMP(3),
    "hs_lastmodifieddate" TIMESTAMP(3),
    "hs_object_id" TEXT,
    "hs_updated_by_user_id" INTEGER,
    "hubspot_owner_id" TEXT,
    "is_deleted" BOOLEAN DEFAULT false,

    CONSTRAINT "hs_lenders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_lenders_system_tracking" (
    "id" SERIAL NOT NULL,
    "lender_id" INTEGER NOT NULL,
    "data_source" "public"."hs_lenders_data_source",
    "lender_record_status" "public"."hs_lenders_record_status",
    "notes" TEXT,
    "performance_rating" "public"."performance_rating",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified_by" TEXT,
    "last_modified_date" TIMESTAMP(3)
);

-- CreateTable
CREATE TABLE "public"."hs_lenders_contact_info" (
    "id" SERIAL NOT NULL,
    "lender_id" INTEGER NOT NULL,
    "primary_contact_email" TEXT,
    "primary_contact_phone" TEXT,
    "primary_contact_designation" TEXT,
    "primary_contact_person" TEXT,
    "relationship_manager_email" TEXT,
    "relationship_manager_name" TEXT,
    "relationship_manager_phone" TEXT,
    "escalation_hierarchy_1_designation" TEXT,
    "escalation_hierarchy_1_email" TEXT,
    "escalation_hierarchy_1_name" TEXT,
    "escalation_hierarchy_1_phone" TEXT,
    "customer_service_email" TEXT,
    "customer_service_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_lenders_contact_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_lenders_business_metrics" (
    "id" SERIAL NOT NULL,
    "lender_id" INTEGER NOT NULL,
    "average_approval_rate" INTEGER,
    "monthly_application_volume" INTEGER,
    "quarterly_application_volume" INTEGER,
    "yearly_application_volume" INTEGER,
    "average_processing_days" INTEGER,
    "average_disbursement_days" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_lenders_business_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_lenders_loan_offerings" (
    "id" SERIAL NOT NULL,
    "co_signer_requirements" "public"."co_signer_requirement",
    "collateral_requirements" "public"."LenderCollateralType",
    "interest_rate_range_max_secured" INTEGER,
    "interest_rate_range_max_unsecured" INTEGER,
    "interest_rate_range_min_secured" INTEGER,
    "interest_rate_range_min_unsecured" INTEGER,
    "margin_money_requirement" INTEGER,
    "maximum_loan_amount_secured" INTEGER,
    "maximum_loan_amount_unsecured" INTEGER,
    "minimum_loan_amount_secured" INTEGER,
    "minimum_loan_amount_unsecured" INTEGER,
    "not_supported_universities" TEXT,
    "processing_fee_range" TEXT,
    "special_programs" TEXT,
    "supported_course_types" "public"."SupportedCourseTypes",
    "supported_destinations" "public"."SupportedDestinations",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_lenders_loan_offerings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_lenders_operational_details" (
    "id" SERIAL NOT NULL,
    "lender_id" INTEGER NOT NULL,
    "api_connectivity_status" "public"."api_connectivity_status",
    "digital_integration_level" "public"."integration_level",
    "documentation_requirements" JSONB,
    "holiday_processing" "public"."HolidayProcessing",
    "late_payment_charges" TEXT,
    "prepayment_charges" TEXT,
    "repayment_options" "public"."repayment_options",
    "turnaround_time_commitment" INTEGER,
    "working_hours" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_lenders_operational_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_lenders_partnerships_details" (
    "id" SERIAL NOT NULL,
    "lender_id" INTEGER NOT NULL,
    "partnership_type" TEXT,
    "agreement_start_date" TIMESTAMP(3),
    "agreement_end_date" TIMESTAMP(3),
    "auto_renewal" BOOLEAN NOT NULL DEFAULT false,
    "renewal_notice_days" INTEGER,
    "commission_structure" TEXT,
    "commission_percentage" DECIMAL(10,2),
    "partnership_end_date" TIMESTAMP(3),
    "partnership_start_date" TIMESTAMP(3),
    "partnership_status" "public"."partnership_status",
    "payout_terms" "public"."payout_terms",
    "revenue_share_model" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_lenders_partnerships_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products" (
    "id" SERIAL NOT NULL,
    "deleted_by_id" INTEGER,
    "is_deleted" BOOLEAN DEFAULT false,
    "lender_id" INTEGER NOT NULL,
    "lender_name" TEXT,
    "partner_name" TEXT,
    "product_description" TEXT,
    "product_display_name" TEXT,
    "product_category" "public"."loan_category",
    "product_status" "public"."product_status",
    "product_type" "public"."product_type",
    "last_updated_date" TIMESTAMP(3),
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_by" TEXT,
    "hs_created_by_user_id" INTEGER,
    "hs_createdate" TIMESTAMP(3),
    "hs_lastmodifieddate" TIMESTAMP(3),
    "hs_object_id" TEXT,
    "hs_updated_by_user_id" INTEGER,
    "hubspot_owner_id" TEXT,

    CONSTRAINT "hs_loan_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_system_tracking" (
    "id" SERIAL NOT NULL,
    "loan_product_id" INTEGER NOT NULL,
    "change_log" TEXT,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3),
    "last_modified_by" TEXT,
    "last_modified_date" TIMESTAMP(3),
    "next_review_date" TIMESTAMP(3),
    "notes" TEXT,
    "product_record_status" "public"."product_record_status",
    "review_frequency" "public"."review_frequency",
    "version_number" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_products_system_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_competitive_analysis" (
    "id" SERIAL NOT NULL,
    "loan_product_id" INTEGER NOT NULL,
    "market_positioning" "public"."hs_loan_products_market_segment",
    "pricing_strategy" "public"."pricing_strategy",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_products_competitive_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_eligibility_criteria" (
    "id" SERIAL NOT NULL,
    "loan_product_id" INTEGER NOT NULL,
    "criteria_type" TEXT,
    "criteria_name" TEXT,
    "criteria_description" TEXT,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "validation_rule" JSONB,
    "min_age" INTEGER,
    "max_age" INTEGER,
    "max_age_at_maturity" INTEGER,
    "min_academic_percentage" DECIMAL(10,2),
    "entrance_exam_required" BOOLEAN NOT NULL DEFAULT false,
    "entrance_exam_list" JSONB,
    "minimum_percentage_required" DECIMAL(10,2),
    "nationality_restrictions" "public"."nationality_restrictions",
    "residency_requirements" "public"."residency_requirements",
    "target_segment" "public"."target_segment",
    "maximum_family_income" DECIMAL(10,2),
    "minimum_family_income" DECIMAL(10,2),
    "min_annual_income" DECIMAL(10,2),
    "min_co_applicant_income" DECIMAL(10,2),
    "employment_criteria" TEXT,
    "co_applicant_income_criteria" TEXT,
    "co_applicant_required" TEXT,
    "co_applicant_relationship" JSONB,
    "guarantor_required" BOOLEAN DEFAULT false,
    "min_credit_score" INTEGER,
    "credit_history_required" BOOLEAN DEFAULT false,
    "indian_citizen_only" BOOLEAN DEFAULT true,
    "nri_eligible" BOOLEAN DEFAULT false,
    "pio_oci_eligible" BOOLEAN DEFAULT false,
    "work_experience_required" BOOLEAN DEFAULT false,
    "min_work_experience_months" INTEGER,
    "admission_confirmation_required" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_products_eligibility_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_collateral_and_security" (
    "id" SERIAL NOT NULL,
    "loan_product_id" INTEGER NOT NULL,
    "collateral_margin" INTEGER,
    "collateral_required" "public"."collateral_requirement",
    "collateral_threshold_amount" DECIMAL(10,2),
    "collateral_types_accepted" "public"."collateral_type",
    "guarantor_required_security" "public"."guarantor_required",
    "insurance_coverage_percentage" INTEGER,
    "insurance_required" "public"."insurance_required",
    "third_party_guarantee_required" "public"."third_party_guarantee_required",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_products_collateral_and_security_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_repayment_terms" (
    "id" SERIAL NOT NULL,
    "loan_product_id" INTEGER NOT NULL,
    "moratorium_type" "public"."moratorium_type",
    "moratorium_period" INTEGER,
    "repayment_frequency" "public"."repayment_frequency",
    "repayment_period_maximum" INTEGER,
    "repayment_period_minimum" INTEGER,
    "prepayment_allowed" BOOLEAN DEFAULT true,
    "prepayment_charges" DECIMAL(10,2),
    "prepayment_lock_in_period" INTEGER,
    "foreclosure_allowed" BOOLEAN DEFAULT true,
    "foreclosure_charges" TEXT,
    "late_payment_charges" TEXT,
    "bounce_charges" DECIMAL(10,2),
    "part_payment_allowed" "public"."part_payment_allowed",
    "part_payment_minimum" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_products_repayment_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_application_and_processing" (
    "id" SERIAL NOT NULL,
    "loan_product_id" INTEGER NOT NULL,
    "application_mode" "public"."application_mode",
    "disbursement_process" "public"."disbursement_process",
    "disbursement_timeline" TEXT,
    "partial_disbursement_allowed" BOOLEAN DEFAULT false,
    "disbursement_stages" JSONB,
    "documentation_list" TEXT,
    "mandatory_documents" TEXT,
    "optional_documents" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_products_application_and_processing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_geographic_coverage" (
    "id" SERIAL NOT NULL,
    "loan_product_id" INTEGER NOT NULL,
    "course_restrictions" TEXT,
    "not_supported_universities" TEXT,
    "restricted_countries" TEXT,
    "course_duration_minimum" INTEGER,
    "course_duration_maximum" INTEGER,
    "supported_course_types" "public"."hs_loan_products_course_types",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_products_geographic_coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_special_features" (
    "id" SERIAL NOT NULL,
    "loan_product_id" INTEGER NOT NULL,
    "digital_features" "public"."digital_features",
    "customer_support_features" "public"."customer_support_features",
    "flexible_repayment_options" "public"."flexible_repayment_options",
    "tax_benefits_available" TEXT,
    "forex_tax_benefits" TEXT,
    "grace_period_benefits" TEXT,
    "insurance_coverage_included" BOOLEAN DEFAULT false,
    "loyalty_benefits" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_products_special_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_performance_metrics" (
    "id" SERIAL NOT NULL,
    "loan_product_id" INTEGER NOT NULL,
    "application_volume_monthly" INTEGER,
    "application_volume_quarterly" INTEGER,
    "application_volume_yearly" INTEGER,
    "approval_rate" DECIMAL(10,2),
    "average_loan_amount" DECIMAL(10,2),
    "average_processing_days" INTEGER,
    "customer_satisfaction_rating" INTEGER,
    "product_popularity_score" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_products_performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_system_integration" (
    "id" SERIAL NOT NULL,
    "loan_product_id" INTEGER NOT NULL,
    "api_availability" "public"."api_availability",
    "technical_documentation_url" TEXT,
    "integration_complexity" "public"."integration_complexity",
    "data_format" "public"."data_format",
    "sandbox_environment" "public"."sandbox_environment",
    "webhook_support" "public"."webhook_support",
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_products_system_integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_financial_terms" (
    "id" SERIAL NOT NULL,
    "loan_product_id" INTEGER NOT NULL,
    "interest_rate_type" "public"."InterestRateType",
    "interest_rate_range_min" DECIMAL(10,2),
    "interest_rate_range_max" DECIMAL(10,2),
    "legal_charges" DECIMAL(10,2),
    "loan_to_value_ratio" INTEGER,
    "rack_rate" DECIMAL(10,2),
    "valuation_charges" DECIMAL(10,2),
    "processing_fee_type" "public"."processing_fee_type",
    "processing_fee_percentage" DECIMAL(10,2),
    "processing_fee_amount" DECIMAL(10,2),
    "processing_fee_minimum" DECIMAL(10,2),
    "processing_fee_maximum" DECIMAL(10,2),
    "administrative_charges" DECIMAL(10,2),
    "margin_money_percentage" DECIMAL(10,2),
    "maximum_loan_amount_secured" DECIMAL(10,2),
    "maximum_loan_amount_unsecured" DECIMAL(10,2),
    "minimum_loan_amount_secured" DECIMAL(10,2),
    "minimum_loan_amount_unsecured" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_products_financial_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_documents" (
    "id" SERIAL NOT NULL,
    "document_category" "public"."hs_loan_documents_category",
    "document_description" TEXT,
    "document_display_name" TEXT,
    "document_id" TEXT,
    "document_name" TEXT,
    "document_priority" "public"."hs_loan_documents_priority",
    "document_stage" "public"."hs_loan_documents_stage",
    "document_sub_category" TEXT,
    "document_type" "public"."hs_loan_documents_type",
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_by" TEXT,
    "hs_created_by_user_id" INTEGER,
    "hs_createdate" TIMESTAMP(3),
    "hs_lastmodifieddate" TIMESTAMP(3),
    "hs_object_id" TEXT,
    "hs_updated_by_user_id" INTEGER,
    "hubspot_owner_id" TEXT,

    CONSTRAINT "hs_loan_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_documents_system_tracking" (
    "id" TEXT NOT NULL,
    "document_master_id" INTEGER NOT NULL,
    "change_history" TEXT,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3),
    "document_record_status" "public"."hs_loan_documents_record_status",
    "improvement_suggestions" TEXT,
    "last_modified_by" TEXT,
    "last_modified_date" TIMESTAMP(3),
    "next_review_date" TIMESTAMP(3),
    "notes" TEXT,
    "review_frequency" "public"."review_frequency",
    "version_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_documents_system_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_documents_processing_workflow" (
    "id" TEXT NOT NULL,
    "document_master_id" INTEGER NOT NULL,
    "auto_extraction_possible" "public"."auto_extraction_possible",
    "data_points_extractable" TEXT,
    "maximum_resubmission_attempts" INTEGER,
    "ocr_compatibility" "public"."ocr_compatibility",
    "parallel_processing_allowed" "public"."parallel_processing_allowed",
    "rejection_criteria" TEXT,
    "resubmission_allowed" "public"."resubmission_allowed",
    "validation_rules" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_documents_processing_workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_documents_specification" (
    "id" SERIAL NOT NULL,
    "document_master_id" INTEGER NOT NULL,
    "accepted_formats" "public"."accepted_formats",
    "color_requirements" "public"."color_requirements",
    "combined_document_allowed" "public"."combined_document_allowed",
    "language_requirements" "public"."language_requirements",
    "maximum_file_size_mb" DOUBLE PRECISION,
    "multiple_pages_allowed" "public"."multiple_pages_allowed",
    "quality_standards" "public"."quality_standards",
    "resolution_requirements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_documents_specification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_documents_applicability" (
    "id" SERIAL NOT NULL,
    "document_master_id" INTEGER NOT NULL,
    "applicable_for_student" "public"."applicability_status",
    "applicable_for_coapplicant1" "public"."applicability_status",
    "applicable_for_coapplicant2" "public"."applicability_status",
    "applicable_for_coapplicant3" "public"."applicability_status",
    "applicable_for_guarantor" "public"."applicability_status",
    "age_criteria" TEXT,
    "collateral_dependency" "public"."collateral_dependency",
    "income_criteria" TEXT,
    "loan_amount_threshold" TEXT,
    "required_for_countries" "public"."required_for_countries",
    "required_for_courses" "public"."required_for_courses",
    "required_for_lenders" JSONB,
    "required_for_loan_products" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_documents_applicability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_documents_compliance" (
    "id" SERIAL NOT NULL,
    "document_master_id" INTEGER NOT NULL,
    "data_retention_policy" TEXT,
    "data_sensitivity" "public"."data_sensitivity",
    "gdpr_relevance" "public"."gdpr_relevance",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_documents_compliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_documents_digital_configs" (
    "id" SERIAL NOT NULL,
    "document_master_id" INTEGER NOT NULL,
    "api_integration_available" "public"."hs_loan_documents_availability",
    "automated_processing" "public"."automated_processing",
    "blockchain_verification" "public"."blockchain_verification",
    "digital_signature_required" "public"."digital_signature_required",
    "e_signature_accepted" "public"."e_signature_accepted",
    "real_time_verification" "public"."real_time_verification",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_documents_digital_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_documents_alternative_documents" (
    "id" SERIAL NOT NULL,
    "primary_document_id" INTEGER NOT NULL,
    "alternative_documents_accepted" TEXT NOT NULL,
    "equivalent_documents" TEXT,
    "exemption_criteria" TEXT,
    "special_cases_handling" TEXT,
    "waiver_conditions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_documents_alternative_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_documents_performance_metrics" (
    "id" TEXT NOT NULL,
    "document_master_id" INTEGER NOT NULL,
    "acceptance_rate" DOUBLE PRECISION,
    "automation_level" DOUBLE PRECISION,
    "average_processing_time_hours" DOUBLE PRECISION,
    "bottleneck_score" DOUBLE PRECISION,
    "customer_satisfaction_score" DOUBLE PRECISION,
    "error_rate" DOUBLE PRECISION,
    "rejection_rate" DOUBLE PRECISION,
    "resubmission_rate" DOUBLE PRECISION,
    "submission_rate" DOUBLE PRECISION,
    "verification_success_rate" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_documents_performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_documents_customer_experience" (
    "id" SERIAL NOT NULL,
    "document_master_id" INTEGER NOT NULL,
    "customer_support_faq" JSONB,
    "sample_document_available" "public"."hs_loan_documents_availability",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_loan_documents_customer_experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements" (
    "id" SERIAL NOT NULL,
    "loan_application_id" INTEGER,
    "lead_reference_id" TEXT,
    "student_id" TEXT,
    "deleted_by_id" INTEGER,
    "partner_id" INTEGER,
    "partner_name" TEXT,
    "student_name" TEXT,
    "verified_by" TEXT,
    "settlement_period" "public"."settlement_period",
    "settlement_month" "public"."settlement_month",
    "settlement_year" INTEGER,
    "settlement_reference_number" TEXT,
    "is_deleted" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_by" TEXT,
    "hs_created_by_user_id" INTEGER,
    "hs_createdate" TIMESTAMP(3),
    "hs_lastmodifieddate" TIMESTAMP(3),
    "hs_object_id" TEXT,
    "hs_updated_by_user_id" INTEGER,
    "hubspot_owner_id" TEXT,

    CONSTRAINT "hs_commission_settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_settlement_status" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "calculated_by" TEXT,
    "calculation_date" TIMESTAMP(3),
    "settlement_status" "public"."settlement_status",
    "verification_date" TIMESTAMP(3),
    "verification_status" "public"."verification_status",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_commission_settlements_settlement_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_system_tracking" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "audit_trail" TEXT,
    "change_log" TEXT,
    "created_by" TEXT,
    "created_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "data_source" "public"."commission_data_source",
    "integration_status" "public"."IntegrationStatus",
    "internal_notes" TEXT,
    "last_modified_by" TEXT,
    "last_modified_date" TIMESTAMP(3),
    "notes" TEXT,
    "settlement_record_status" "public"."settlement_record_status",
    "system_generated" "public"."system_generated",
    "version_number" TEXT,
    "batch_payment_id" TEXT,
    "disbursement_trigger" "public"."disbursement_trigger",
    "original_transaction_id" TEXT,
    "related_settlement_id" TEXT,
    "transaction_sub_type" TEXT,
    "transaction_type" "public"."transaction_types",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_commission_settlements_system_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_transaction_details" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "batch_payment_id" TEXT,
    "disbursement_trigger" "public"."disbursement_trigger",
    "original_transaction_id" TEXT,
    "related_settlement_id" TEXT,
    "transaction_sub_type" TEXT,
    "transaction_type" "public"."transaction_types",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_commission_settlements_transaction_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_commission_calculations" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "commission_model" "public"."commission_model",
    "commission_rate_applied" DECIMAL(10,2),
    "commission_tier_applied" TEXT,
    "gross_commission_amount" DECIMAL(12,2),
    "bonus_amount" DECIMAL(12,2),
    "bonus_rate_applied" DECIMAL(10,2),
    "incentive_amount" DECIMAL(12,2),
    "adjustment_amount" DECIMAL(12,2),
    "adjustment_reason" TEXT,
    "penalty_amount" DECIMAL(12,2),
    "total_gross_amount" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_commission_settlements_commission_calculations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_communication" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "acknowledgment_date" TIMESTAMP(3),
    "acknowledgment_received" "public"."acknowledgment_status",
    "communication_log" TEXT,
    "email_sent_count" INTEGER,
    "last_communication_date" TIMESTAMP(3),
    "notification_date" TIMESTAMP(3),
    "notification_method" "public"."notification_method",
    "partner_notification_sent" "public"."partner_notification_sent",
    "sms_sent_count" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_commission_settlements_communication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_loan_details" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "course_name" TEXT,
    "lender_name" TEXT NOT NULL,
    "loan_amount_disbursed" DECIMAL(12,2),
    "loan_disbursement_date" TIMESTAMP(3),
    "loan_product_name" TEXT,
    "student_destination_country" TEXT,
    "university_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_commission_settlements_loan_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_payment_processing" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "beneficiary_name" TEXT,
    "beneficiary_account_number" TEXT,
    "beneficiary_bank_name" TEXT,
    "beneficiary_ifsc_code" TEXT,
    "last_retry_date" TIMESTAMP(3),
    "payment_completed_date" TIMESTAMP(3),
    "payment_failure_reason" TEXT,
    "payment_initiation_date" TIMESTAMP(3),
    "payment_method" "public"."payment_method",
    "payment_reference_number" TEXT,
    "payment_status" "public"."payment_status",
    "retry_attempt_count" INTEGER,
    "bank_transaction_id" TEXT,
    "payment_gateway_reference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_commission_settlements_payment_processing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_tax_and_deductions" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "gst_applicable" BOOLEAN DEFAULT true,
    "gst_rate_applied" DECIMAL(10,2),
    "gst_amount" DECIMAL(12,2),
    "net_payable_amount" DECIMAL(12,2),
    "service_tax_amount" INTEGER,
    "other_deductions" DECIMAL(12,2),
    "other_deductions_description" TEXT,
    "tds_applicable" BOOLEAN DEFAULT true,
    "tds_rate_applied" DECIMAL(10,2),
    "tds_amount" DECIMAL(12,2),
    "tds_certificate_number" INTEGER,
    "withholding_tax_applicable" BOOLEAN DEFAULT false,
    "withholding_tax_rate" DECIMAL(10,2),
    "withholding_tax_amount" DECIMAL(12,2),
    "total_deductions" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_commission_settlements_tax_and_deductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_documentation" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "agreement_reference" TEXT,
    "invoice_required" BOOLEAN DEFAULT true,
    "invoice_number" TEXT,
    "invoice_date" TIMESTAMP(3),
    "invoice_amount" DECIMAL(12,2),
    "invoice_status" "public"."invoice_status",
    "invoice_url" TEXT,
    "payment_terms_applied" TEXT,
    "supporting_documents" TEXT,
    "tax_certificate_required" "public"."tax_certificate_required",
    "tax_certificate_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_commission_settlements_documentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_hold_and_disputes" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "dispute_date" TIMESTAMP(3),
    "dispute_description" TEXT,
    "dispute_raised" BOOLEAN DEFAULT false,
    "dispute_raised_by" TEXT,
    "dispute_resolution" TEXT,
    "dispute_resolution_date" TIMESTAMP(3),
    "dispute_resolved_by" TEXT,
    "hold_date" TIMESTAMP(3),
    "hold_initiated_by" TEXT,
    "hold_reason" "public"."hold_reason",
    "hold_release_approved_by" TEXT,
    "hold_release_date" TIMESTAMP(3),
    "on_hold" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_commission_settlements_hold_and_disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_reconciliations" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "reconciliation_status" "public"."reconciliation_status",
    "reconciliation_date" TIMESTAMP(3),
    "reconciled_by" TEXT,
    "reconciliation_notes" TEXT,
    "bank_statement_reference" TEXT,
    "discrepancy_amount" DECIMAL(12,2),
    "discrepancy_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_commission_settlements_reconciliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_performance_analytics" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "sla_breach" BOOLEAN DEFAULT false,
    "sla_breach_reason" TEXT,
    "partner_satisfaction_rating" DECIMAL(3,2),
    "payment_delay_days" INTEGER,
    "processing_time_days" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hs_commission_settlements_performance_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mkt_eligibility_checker_leads" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mkt_eligibility_checker_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mkt_emi_calculator_leads" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mkt_emi_calculator_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."currency_configs" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(3) NOT NULL,
    "iso_code" VARCHAR(3) NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "countries" JSONB NOT NULL,
    "position" VARCHAR(10) NOT NULL,
    "thousands_separator" VARCHAR(1) NOT NULL DEFAULT ',',
    "decimal_separator" VARCHAR(1) NOT NULL DEFAULT '.',
    "min_loan_amount" DECIMAL(15,2) NOT NULL,
    "max_loan_amount" DECIMAL(15,2) NOT NULL,
    "formatting" JSONB NOT NULL,
    "quick_amounts" JSONB NOT NULL,
    "large_amount_units" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "currency_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" SERIAL NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "action" "public"."AuditAction",
    "old_values" JSONB,
    "new_values" JSONB,
    "changed_fields" TEXT[],
    "changed_by" INTEGER,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sync_outbox" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "operation" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "last_error" TEXT,
    "error_code" TEXT,
    "hubspot_id" TEXT,
    "batch_id" TEXT,
    "batch_size" INTEGER,
    "batch_position" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processing_at" TIMESTAMP(3),
    "processed_at" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "sync_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_HSCommissionSettlementsToHSLoanApplications" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_HSCommissionSettlementsToHSLoanApplications_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "public"."admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_roles_role_key" ON "public"."admin_roles"("role");

-- CreateIndex
CREATE UNIQUE INDEX "admin_user_roles_user_id_role_id_key" ON "public"."admin_user_roles"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_permissions_permission_key" ON "public"."admin_permissions"("permission");

-- CreateIndex
CREATE UNIQUE INDEX "admin_role_permissions_role_id_permission_id_key" ON "public"."admin_role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_id_key" ON "public"."admin_sessions"("id");

-- CreateIndex
CREATE INDEX "idx_amount_currency" ON "public"."loan_eligibility_matrix"("loan_amount", "loan_amount_currency");

-- CreateIndex
CREATE INDEX "idx_analytical_exam" ON "public"."loan_eligibility_matrix"("analytical_exam_name");

-- CreateIndex
CREATE INDEX "idx_country_education" ON "public"."loan_eligibility_matrix"("country_of_study", "level_of_education");

-- CreateIndex
CREATE INDEX "idx_country_study" ON "public"."loan_eligibility_matrix"("country_of_study");

-- CreateIndex
CREATE INDEX "idx_course_type" ON "public"."loan_eligibility_matrix"("course_type");

-- CreateIndex
CREATE INDEX "idx_currency" ON "public"."loan_eligibility_matrix"("loan_amount_currency");

-- CreateIndex
CREATE INDEX "idx_education_level" ON "public"."loan_eligibility_matrix"("level_of_education");

-- CreateIndex
CREATE INDEX "idx_language_exam" ON "public"."loan_eligibility_matrix"("language_exam_name");

-- CreateIndex
CREATE INDEX "idx_loan_amount" ON "public"."loan_eligibility_matrix"("loan_amount");

-- CreateIndex
CREATE INDEX "idx_preference" ON "public"."loan_eligibility_matrix"("preference");

-- CreateIndex
CREATE INDEX "idx_stem_designated" ON "public"."loan_eligibility_matrix"("is_stem_designated");

-- CreateIndex
CREATE INDEX "idx_stem_preference" ON "public"."loan_eligibility_matrix"("is_stem_designated", "preference");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_partners_roles_role_key" ON "public"."b2b_partners_roles"("role");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_partners_user_roles_user_id_role_id_key" ON "public"."b2b_partners_user_roles"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_partners_role_permissions_role_id_permission_id_key" ON "public"."b2b_partners_role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_b2b_partners_business_capabilities_partner_id_key" ON "public"."hs_b2b_partners_business_capabilities"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_b2b_partners_commission_structure_partner_id_key" ON "public"."hs_b2b_partners_commission_structure"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_b2b_partners_compliance_and_documentation_partner_id_key" ON "public"."hs_b2b_partners_compliance_and_documentation"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_b2b_partners_contact_info_partner_id_key" ON "public"."hs_b2b_partners_contact_info"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_b2b_partners_financial_tracking_partner_id_key" ON "public"."hs_b2b_partners_financial_tracking"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_b2b_partners_lead_attribution_partner_id_key" ON "public"."hs_b2b_partners_lead_attribution"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_b2b_partners_marketing_and_promotion_partner_id_key" ON "public"."hs_b2b_partners_marketing_and_promotion"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_b2b_partners_partnership_details_partner_id_key" ON "public"."hs_b2b_partners_partnership_details"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_b2b_partners_performance_metrics_partner_id_key" ON "public"."hs_b2b_partners_performance_metrics"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_b2b_partners_relationship_mgmt_partner_id_key" ON "public"."hs_b2b_partners_relationship_mgmt"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_b2b_partners_system_tracking_partner_id_key" ON "public"."hs_b2b_partners_system_tracking"("partner_id");

-- CreateIndex
CREATE INDEX "hs_b2b_partners_system_tracking_partner_name_idx" ON "public"."hs_b2b_partners_system_tracking"("partner_name");

-- CreateIndex
CREATE INDEX "hs_b2b_partners_system_tracking_partner_record_status_idx" ON "public"."hs_b2b_partners_system_tracking"("partner_record_status");

-- CreateIndex
CREATE INDEX "hs_b2b_partners_system_tracking_integration_status_idx" ON "public"."hs_b2b_partners_system_tracking"("integration_status");

-- CreateIndex
CREATE INDEX "hs_b2b_partners_system_tracking_data_source_idx" ON "public"."hs_b2b_partners_system_tracking"("data_source");

-- CreateIndex
CREATE INDEX "hs_b2b_partners_system_tracking_created_date_idx" ON "public"."hs_b2b_partners_system_tracking"("created_date");

-- CreateIndex
CREATE INDEX "hs_b2b_partners_system_tracking_last_modified_date_idx" ON "public"."hs_b2b_partners_system_tracking"("last_modified_date");

-- CreateIndex
CREATE UNIQUE INDEX "currency_conversion_from_currency_to_currency_key" ON "public"."currency_conversion"("from_currency", "to_currency");

-- CreateIndex
CREATE UNIQUE INDEX "b2b_partners_users_email_key" ON "public"."b2b_partners_users"("email");

-- CreateIndex
CREATE INDEX "hs_loan_applications_student_email_idx" ON "public"."hs_loan_applications"("student_email");

-- CreateIndex
CREATE INDEX "hs_loan_applications_application_date_idx" ON "public"."hs_loan_applications"("application_date");

-- CreateIndex
CREATE INDEX "hs_loan_applications_assigned_counselor_id_idx" ON "public"."hs_loan_applications"("assigned_counselor_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_academic_details_loan_application_id_key" ON "public"."hs_loan_applications_academic_details"("loan_application_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_financial_requirements_loan_applicatio_key" ON "public"."hs_loan_applications_financial_requirements"("loan_application_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_status_loan_application_id_key" ON "public"."hs_loan_applications_status"("loan_application_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_lender_information_loan_application_id_key" ON "public"."hs_loan_applications_lender_information"("loan_application_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_document_management_loan_application_i_key" ON "public"."hs_loan_applications_document_management"("loan_application_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_processing_timeline_loan_application_i_key" ON "public"."hs_loan_applications_processing_timeline"("loan_application_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_rejection_details_loan_application_id_key" ON "public"."hs_loan_applications_rejection_details"("loan_application_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_communication_preferences_loan_applica_key" ON "public"."hs_loan_applications_communication_preferences"("loan_application_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_system_tracking_loan_application_id_key" ON "public"."hs_loan_applications_system_tracking"("loan_application_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_commission_records_loan_application_id_key" ON "public"."hs_loan_applications_commission_records"("loan_application_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_additional_services_loan_application_i_key" ON "public"."hs_loan_applications_additional_services"("loan_application_id");

-- CreateIndex
CREATE INDEX "file_uploads_entity_type_id_idx" ON "public"."file_uploads"("entity_type_id");

-- CreateIndex
CREATE INDEX "file_uploads_created_at_idx" ON "public"."file_uploads"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "file_entities_type_key" ON "public"."file_entities"("type");

-- CreateIndex
CREATE INDEX "file_entities_type_idx" ON "public"."file_entities"("type");

-- CreateIndex
CREATE UNIQUE INDEX "email_types_subject_key" ON "public"."email_types"("subject");

-- CreateIndex
CREATE INDEX "email_types_subject_type_idx" ON "public"."email_types"("subject", "type");

-- CreateIndex
CREATE INDEX "email_history_user_id_idx" ON "public"."email_history"("user_id");

-- CreateIndex
CREATE INDEX "email_history_email_type_id_idx" ON "public"."email_history"("email_type_id");

-- CreateIndex
CREATE INDEX "email_history_sent_at_idx" ON "public"."email_history"("sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "hs_edumate_contacts_application_journey_contact_id_key" ON "public"."hs_edumate_contacts_application_journey"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_edumate_contacts_academic_profiles_contact_id_key" ON "public"."hs_edumate_contacts_academic_profiles"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_edumate_contacts_system_tracking_contact_id_key" ON "public"."hs_edumate_contacts_system_tracking"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_edumate_contacts_financial_info_contact_id_key" ON "public"."hs_edumate_contacts_financial_info"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_edumate_contacts_lead_attribution_contact_id_key" ON "public"."hs_edumate_contacts_lead_attribution"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_edumate_contacts_loan_preferences_contact_id_key" ON "public"."hs_edumate_contacts_loan_preferences"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_edumate_contacts_personal_information_contact_id_key" ON "public"."hs_edumate_contacts_personal_information"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_lenders_external_id_key" ON "public"."hs_lenders"("external_id");

-- CreateIndex
CREATE INDEX "hs_lenders_lender_category_idx" ON "public"."hs_lenders"("lender_category");

-- CreateIndex
CREATE INDEX "hs_lenders_lender_type_idx" ON "public"."hs_lenders"("lender_type");

-- CreateIndex
CREATE INDEX "hs_lenders_created_at_idx" ON "public"."hs_lenders"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "hs_lenders_system_tracking_lender_id_key" ON "public"."hs_lenders_system_tracking"("lender_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_lenders_contact_info_lender_id_key" ON "public"."hs_lenders_contact_info"("lender_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_lenders_business_metrics_lender_id_key" ON "public"."hs_lenders_business_metrics"("lender_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_lenders_operational_details_lender_id_key" ON "public"."hs_lenders_operational_details"("lender_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_lenders_partnerships_details_lender_id_key" ON "public"."hs_lenders_partnerships_details"("lender_id");

-- CreateIndex
CREATE INDEX "hs_loan_products_lender_id_idx" ON "public"."hs_loan_products"("lender_id");

-- CreateIndex
CREATE INDEX "hs_loan_products_is_active_idx" ON "public"."hs_loan_products"("is_active");

-- CreateIndex
CREATE INDEX "hs_loan_products_product_type_idx" ON "public"."hs_loan_products"("product_type");

-- CreateIndex
CREATE INDEX "hs_loan_products_product_category_idx" ON "public"."hs_loan_products"("product_category");

-- CreateIndex
CREATE INDEX "hs_loan_products_product_status_idx" ON "public"."hs_loan_products"("product_status");

-- CreateIndex
CREATE INDEX "hs_loan_products_created_at_idx" ON "public"."hs_loan_products"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_system_tracking_loan_product_id_key" ON "public"."hs_loan_products_system_tracking"("loan_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_competitive_analysis_loan_product_id_key" ON "public"."hs_loan_products_competitive_analysis"("loan_product_id");

-- CreateIndex
CREATE INDEX "hs_loan_products_eligibility_criteria_loan_product_id_idx" ON "public"."hs_loan_products_eligibility_criteria"("loan_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_collateral_and_security_loan_product_id_key" ON "public"."hs_loan_products_collateral_and_security"("loan_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_repayment_terms_loan_product_id_key" ON "public"."hs_loan_products_repayment_terms"("loan_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_application_and_processing_loan_product_id_key" ON "public"."hs_loan_products_application_and_processing"("loan_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_geographic_coverage_loan_product_id_key" ON "public"."hs_loan_products_geographic_coverage"("loan_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_special_features_loan_product_id_key" ON "public"."hs_loan_products_special_features"("loan_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_performance_metrics_loan_product_id_key" ON "public"."hs_loan_products_performance_metrics"("loan_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_system_integration_loan_product_id_key" ON "public"."hs_loan_products_system_integration"("loan_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_financial_terms_loan_product_id_key" ON "public"."hs_loan_products_financial_terms"("loan_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_documents_document_id_key" ON "public"."hs_loan_documents"("document_id");

-- CreateIndex
CREATE INDEX "hs_loan_documents_document_category_idx" ON "public"."hs_loan_documents"("document_category");

-- CreateIndex
CREATE INDEX "hs_loan_documents_document_type_idx" ON "public"."hs_loan_documents"("document_type");

-- CreateIndex
CREATE INDEX "hs_loan_documents_created_at_idx" ON "public"."hs_loan_documents"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_documents_system_tracking_document_master_id_key" ON "public"."hs_loan_documents_system_tracking"("document_master_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_documents_processing_workflow_document_master_id_key" ON "public"."hs_loan_documents_processing_workflow"("document_master_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_documents_specification_document_master_id_key" ON "public"."hs_loan_documents_specification"("document_master_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_documents_applicability_document_master_id_key" ON "public"."hs_loan_documents_applicability"("document_master_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_documents_compliance_document_master_id_key" ON "public"."hs_loan_documents_compliance"("document_master_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_documents_digital_configs_document_master_id_key" ON "public"."hs_loan_documents_digital_configs"("document_master_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_documents_alternative_documents_primary_document_id_key" ON "public"."hs_loan_documents_alternative_documents"("primary_document_id");

-- CreateIndex
CREATE INDEX "hs_loan_documents_alternative_documents_primary_document_id_idx" ON "public"."hs_loan_documents_alternative_documents"("primary_document_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_documents_performance_metrics_document_master_id_key" ON "public"."hs_loan_documents_performance_metrics"("document_master_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_documents_customer_experience_document_master_id_key" ON "public"."hs_loan_documents_customer_experience"("document_master_id");

-- CreateIndex
CREATE INDEX "hs_commission_settlements_partner_id_idx" ON "public"."hs_commission_settlements"("partner_id");

-- CreateIndex
CREATE INDEX "hs_commission_settlements_lead_reference_id_idx" ON "public"."hs_commission_settlements"("lead_reference_id");

-- CreateIndex
CREATE INDEX "hs_commission_settlements_student_id_idx" ON "public"."hs_commission_settlements"("student_id");

-- CreateIndex
CREATE INDEX "hs_commission_settlements_created_at_idx" ON "public"."hs_commission_settlements"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_settlement_status_settlement_id_key" ON "public"."hs_commission_settlements_settlement_status"("settlement_id");

-- CreateIndex
CREATE INDEX "hs_commission_settlements_settlement_status_settlement_id_idx" ON "public"."hs_commission_settlements_settlement_status"("settlement_id");

-- CreateIndex
CREATE INDEX "hs_commission_settlements_settlement_status_created_at_idx" ON "public"."hs_commission_settlements_settlement_status"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_system_tracking_settlement_id_key" ON "public"."hs_commission_settlements_system_tracking"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_transaction_details_settlement_id_key" ON "public"."hs_commission_settlements_transaction_details"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_commission_calculations_settlemen_key" ON "public"."hs_commission_settlements_commission_calculations"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_communication_settlement_id_key" ON "public"."hs_commission_settlements_communication"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_loan_details_settlement_id_key" ON "public"."hs_commission_settlements_loan_details"("settlement_id");

-- CreateIndex
CREATE INDEX "hs_commission_settlements_loan_details_settlement_id_idx" ON "public"."hs_commission_settlements_loan_details"("settlement_id");

-- CreateIndex
CREATE INDEX "hs_commission_settlements_loan_details_loan_disbursement_da_idx" ON "public"."hs_commission_settlements_loan_details"("loan_disbursement_date");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_payment_processing_settlement_id_key" ON "public"."hs_commission_settlements_payment_processing"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_payment_processing_bank_transacti_key" ON "public"."hs_commission_settlements_payment_processing"("bank_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_tax_and_deductions_settlement_id_key" ON "public"."hs_commission_settlements_tax_and_deductions"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_documentation_settlement_id_key" ON "public"."hs_commission_settlements_documentation"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_documentation_invoice_number_key" ON "public"."hs_commission_settlements_documentation"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_hold_and_disputes_settlement_id_key" ON "public"."hs_commission_settlements_hold_and_disputes"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_reconciliations_settlement_id_key" ON "public"."hs_commission_settlements_reconciliations"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_performance_analytics_settlement__key" ON "public"."hs_commission_settlements_performance_analytics"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "mkt_eligibility_checker_leads_contact_id_key" ON "public"."mkt_eligibility_checker_leads"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "mkt_emi_calculator_leads_contact_id_key" ON "public"."mkt_emi_calculator_leads"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "currency_configs_code_key" ON "public"."currency_configs"("code");

-- CreateIndex
CREATE INDEX "idx_currency_code" ON "public"."currency_configs"("code");

-- CreateIndex
CREATE INDEX "idx_currency_active" ON "public"."currency_configs"("is_active");

-- CreateIndex
CREATE INDEX "idx_currency_code_active" ON "public"."currency_configs"("code", "is_active");

-- CreateIndex
CREATE INDEX "audit_logs_table_name_record_id_idx" ON "public"."audit_logs"("table_name", "record_id");

-- CreateIndex
CREATE INDEX "audit_logs_changed_by_idx" ON "public"."audit_logs"("changed_by");

-- CreateIndex
CREATE INDEX "audit_logs_changed_at_idx" ON "public"."audit_logs"("changed_at");

-- CreateIndex
CREATE INDEX "sync_outbox_status_created_at_idx" ON "public"."sync_outbox"("status", "created_at");

-- CreateIndex
CREATE INDEX "sync_outbox_batch_id_batch_position_idx" ON "public"."sync_outbox"("batch_id", "batch_position");

-- CreateIndex
CREATE INDEX "sync_outbox_entity_type_entity_id_idx" ON "public"."sync_outbox"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "sync_outbox_priority_status_created_at_idx" ON "public"."sync_outbox"("priority", "status", "created_at");

-- CreateIndex
CREATE INDEX "_HSCommissionSettlementsToHSLoanApplications_B_index" ON "public"."_HSCommissionSettlementsToHSLoanApplications"("B");

-- AddForeignKey
ALTER TABLE "public"."admin_user_roles" ADD CONSTRAINT "admin_user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."admin_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_user_roles" ADD CONSTRAINT "admin_user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_role_permissions" ADD CONSTRAINT "admin_role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."admin_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_role_permissions" ADD CONSTRAINT "admin_role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."admin_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_sessions" ADD CONSTRAINT "admin_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_tokens" ADD CONSTRAINT "admin_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."b2b_partners_user_roles" ADD CONSTRAINT "b2b_partners_user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."b2b_partners_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."b2b_partners_user_roles" ADD CONSTRAINT "b2b_partners_user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."b2b_partners_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."b2b_partners_sessions" ADD CONSTRAINT "b2b_partners_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."b2b_partners_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."login_history" ADD CONSTRAINT "login_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."b2b_partners_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."b2b_partners_role_permissions" ADD CONSTRAINT "b2b_partners_role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."b2b_partners_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."b2b_partners_role_permissions" ADD CONSTRAINT "b2b_partners_role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."b2b_partners_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_b2b_partners" ADD CONSTRAINT "hs_b2b_partners_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."b2b_partners_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_b2b_partners_business_capabilities" ADD CONSTRAINT "hs_b2b_partners_business_capabilities_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."hs_b2b_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_b2b_partners_commission_structure" ADD CONSTRAINT "hs_b2b_partners_commission_structure_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."hs_b2b_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_b2b_partners_compliance_and_documentation" ADD CONSTRAINT "hs_b2b_partners_compliance_and_documentation_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."hs_b2b_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_b2b_partners_contact_info" ADD CONSTRAINT "hs_b2b_partners_contact_info_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."hs_b2b_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_b2b_partners_financial_tracking" ADD CONSTRAINT "hs_b2b_partners_financial_tracking_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."hs_b2b_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_b2b_partners_lead_attribution" ADD CONSTRAINT "hs_b2b_partners_lead_attribution_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."hs_b2b_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_b2b_partners_marketing_and_promotion" ADD CONSTRAINT "hs_b2b_partners_marketing_and_promotion_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."hs_b2b_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_b2b_partners_partnership_details" ADD CONSTRAINT "hs_b2b_partners_partnership_details_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."hs_b2b_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_b2b_partners_performance_metrics" ADD CONSTRAINT "hs_b2b_partners_performance_metrics_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."hs_b2b_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_b2b_partners_relationship_mgmt" ADD CONSTRAINT "hs_b2b_partners_relationship_mgmt_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."hs_b2b_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_b2b_partners_system_tracking" ADD CONSTRAINT "hs_b2b_partners_system_tracking_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."hs_b2b_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."b2b_partners_tokens" ADD CONSTRAINT "b2b_partners_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."b2b_partners_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."b2b_partners_users" ADD CONSTRAINT "b2b_partners_users_b2b_id_fkey" FOREIGN KEY ("b2b_id") REFERENCES "public"."hs_b2b_partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications" ADD CONSTRAINT "hs_loan_applications_assigned_counselor_id_fkey" FOREIGN KEY ("assigned_counselor_id") REFERENCES "public"."b2b_partners_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications" ADD CONSTRAINT "hs_loan_applications_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."hs_edumate_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications" ADD CONSTRAINT "hs_loan_applications_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."b2b_partners_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications" ADD CONSTRAINT "hs_loan_applications_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."b2b_partners_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications" ADD CONSTRAINT "hs_loan_applications_last_modified_by_id_fkey" FOREIGN KEY ("last_modified_by_id") REFERENCES "public"."b2b_partners_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications" ADD CONSTRAINT "hs_loan_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."b2b_partners_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_academic_details" ADD CONSTRAINT "hs_loan_applications_academic_details_loan_application_id_fkey" FOREIGN KEY ("loan_application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_financial_requirements" ADD CONSTRAINT "hs_loan_applications_financial_requirements_loan_applicati_fkey" FOREIGN KEY ("loan_application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_status" ADD CONSTRAINT "hs_loan_applications_status_loan_application_id_fkey" FOREIGN KEY ("loan_application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_lender_information" ADD CONSTRAINT "hs_loan_applications_lender_information_loan_application_i_fkey" FOREIGN KEY ("loan_application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_document_management" ADD CONSTRAINT "hs_loan_applications_document_management_loan_application__fkey" FOREIGN KEY ("loan_application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_processing_timeline" ADD CONSTRAINT "hs_loan_applications_processing_timeline_loan_application__fkey" FOREIGN KEY ("loan_application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_rejection_details" ADD CONSTRAINT "hs_loan_applications_rejection_details_loan_application_id_fkey" FOREIGN KEY ("loan_application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_communication_preferences" ADD CONSTRAINT "hs_loan_applications_communication_preferences_loan_applic_fkey" FOREIGN KEY ("loan_application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_system_tracking" ADD CONSTRAINT "hs_loan_applications_system_tracking_loan_application_id_fkey" FOREIGN KEY ("loan_application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_commission_records" ADD CONSTRAINT "hs_loan_applications_commission_records_loan_application_i_fkey" FOREIGN KEY ("loan_application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_additional_services" ADD CONSTRAINT "hs_loan_applications_additional_services_loan_application__fkey" FOREIGN KEY ("loan_application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_uploads" ADD CONSTRAINT "file_uploads_entity_type_id_fkey" FOREIGN KEY ("entity_type_id") REFERENCES "public"."file_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_uploads" ADD CONSTRAINT "file_uploads_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."b2b_partners_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_history" ADD CONSTRAINT "email_history_email_type_id_fkey" FOREIGN KEY ("email_type_id") REFERENCES "public"."email_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_history" ADD CONSTRAINT "email_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."b2b_partners_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_edumate_contacts_application_journey" ADD CONSTRAINT "hs_edumate_contacts_application_journey_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."hs_edumate_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_edumate_contacts_academic_profiles" ADD CONSTRAINT "hs_edumate_contacts_academic_profiles_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."hs_edumate_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_edumate_contacts" ADD CONSTRAINT "hs_edumate_contacts_b2b_partner_id_fkey" FOREIGN KEY ("b2b_partner_id") REFERENCES "public"."hs_b2b_partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_edumate_contacts" ADD CONSTRAINT "hs_edumate_contacts_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."b2b_partners_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_edumate_contacts_system_tracking" ADD CONSTRAINT "hs_edumate_contacts_system_tracking_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."hs_edumate_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_edumate_contacts_financial_info" ADD CONSTRAINT "hs_edumate_contacts_financial_info_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."hs_edumate_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_edumate_contacts_lead_attribution" ADD CONSTRAINT "hs_edumate_contacts_lead_attribution_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."hs_edumate_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_edumate_contacts_loan_preferences" ADD CONSTRAINT "hs_edumate_contacts_loan_preferences_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."hs_edumate_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_edumate_contacts_personal_information" ADD CONSTRAINT "hs_edumate_contacts_personal_information_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."hs_edumate_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_edumate_contacts_personal_information" ADD CONSTRAINT "hs_edumate_contacts_personal_information_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."b2b_partners_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_lenders_system_tracking" ADD CONSTRAINT "hs_lenders_system_tracking_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "public"."hs_lenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_lenders_contact_info" ADD CONSTRAINT "hs_lenders_contact_info_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "public"."hs_lenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_lenders_business_metrics" ADD CONSTRAINT "hs_lenders_business_metrics_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "public"."hs_lenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_lenders_operational_details" ADD CONSTRAINT "hs_lenders_operational_details_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "public"."hs_lenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_lenders_partnerships_details" ADD CONSTRAINT "hs_lenders_partnerships_details_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "public"."hs_lenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products" ADD CONSTRAINT "hs_loan_products_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."b2b_partners_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products" ADD CONSTRAINT "hs_loan_products_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "public"."hs_lenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_system_tracking" ADD CONSTRAINT "hs_loan_products_system_tracking_loan_product_id_fkey" FOREIGN KEY ("loan_product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_competitive_analysis" ADD CONSTRAINT "hs_loan_products_competitive_analysis_loan_product_id_fkey" FOREIGN KEY ("loan_product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_eligibility_criteria" ADD CONSTRAINT "hs_loan_products_eligibility_criteria_loan_product_id_fkey" FOREIGN KEY ("loan_product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_collateral_and_security" ADD CONSTRAINT "hs_loan_products_collateral_and_security_loan_product_id_fkey" FOREIGN KEY ("loan_product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_repayment_terms" ADD CONSTRAINT "hs_loan_products_repayment_terms_loan_product_id_fkey" FOREIGN KEY ("loan_product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_application_and_processing" ADD CONSTRAINT "hs_loan_products_application_and_processing_loan_product_i_fkey" FOREIGN KEY ("loan_product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_geographic_coverage" ADD CONSTRAINT "hs_loan_products_geographic_coverage_loan_product_id_fkey" FOREIGN KEY ("loan_product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_special_features" ADD CONSTRAINT "hs_loan_products_special_features_loan_product_id_fkey" FOREIGN KEY ("loan_product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_performance_metrics" ADD CONSTRAINT "hs_loan_products_performance_metrics_loan_product_id_fkey" FOREIGN KEY ("loan_product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_system_integration" ADD CONSTRAINT "hs_loan_products_system_integration_loan_product_id_fkey" FOREIGN KEY ("loan_product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_financial_terms" ADD CONSTRAINT "hs_loan_products_financial_terms_loan_product_id_fkey" FOREIGN KEY ("loan_product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_documents_system_tracking" ADD CONSTRAINT "hs_loan_documents_system_tracking_document_master_id_fkey" FOREIGN KEY ("document_master_id") REFERENCES "public"."hs_loan_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_documents_processing_workflow" ADD CONSTRAINT "hs_loan_documents_processing_workflow_document_master_id_fkey" FOREIGN KEY ("document_master_id") REFERENCES "public"."hs_loan_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_documents_specification" ADD CONSTRAINT "hs_loan_documents_specification_document_master_id_fkey" FOREIGN KEY ("document_master_id") REFERENCES "public"."hs_loan_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_documents_applicability" ADD CONSTRAINT "hs_loan_documents_applicability_document_master_id_fkey" FOREIGN KEY ("document_master_id") REFERENCES "public"."hs_loan_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_documents_compliance" ADD CONSTRAINT "hs_loan_documents_compliance_document_master_id_fkey" FOREIGN KEY ("document_master_id") REFERENCES "public"."hs_loan_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_documents_digital_configs" ADD CONSTRAINT "hs_loan_documents_digital_configs_document_master_id_fkey" FOREIGN KEY ("document_master_id") REFERENCES "public"."hs_loan_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_documents_alternative_documents" ADD CONSTRAINT "hs_loan_documents_alternative_documents_primary_document_i_fkey" FOREIGN KEY ("primary_document_id") REFERENCES "public"."hs_loan_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_documents_performance_metrics" ADD CONSTRAINT "hs_loan_documents_performance_metrics_document_master_id_fkey" FOREIGN KEY ("document_master_id") REFERENCES "public"."hs_loan_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_documents_customer_experience" ADD CONSTRAINT "hs_loan_documents_customer_experience_document_master_id_fkey" FOREIGN KEY ("document_master_id") REFERENCES "public"."hs_loan_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements" ADD CONSTRAINT "hs_commission_settlements_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."b2b_partners_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_settlement_status" ADD CONSTRAINT "hs_commission_settlements_settlement_status_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_system_tracking" ADD CONSTRAINT "hs_commission_settlements_system_tracking_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_transaction_details" ADD CONSTRAINT "hs_commission_settlements_transaction_details_settlement_i_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_commission_calculations" ADD CONSTRAINT "hs_commission_settlements_commission_calculations_settleme_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_communication" ADD CONSTRAINT "hs_commission_settlements_communication_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_loan_details" ADD CONSTRAINT "hs_commission_settlements_loan_details_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_payment_processing" ADD CONSTRAINT "hs_commission_settlements_payment_processing_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_tax_and_deductions" ADD CONSTRAINT "hs_commission_settlements_tax_and_deductions_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_documentation" ADD CONSTRAINT "hs_commission_settlements_documentation_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_hold_and_disputes" ADD CONSTRAINT "hs_commission_settlements_hold_and_disputes_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_reconciliations" ADD CONSTRAINT "hs_commission_settlements_reconciliations_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_performance_analytics" ADD CONSTRAINT "hs_commission_settlements_performance_analytics_settlement_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mkt_eligibility_checker_leads" ADD CONSTRAINT "mkt_eligibility_checker_leads_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."hs_edumate_contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mkt_emi_calculator_leads" ADD CONSTRAINT "mkt_emi_calculator_leads_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."hs_edumate_contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_HSCommissionSettlementsToHSLoanApplications" ADD CONSTRAINT "_HSCommissionSettlementsToHSLoanApplications_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_HSCommissionSettlementsToHSLoanApplications" ADD CONSTRAINT "_HSCommissionSettlementsToHSLoanApplications_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
  las.application_status,

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
LEFT JOIN public.hs_loan_applications_academic_details lad ON la.id = lad.application_id
LEFT JOIN public.hs_loan_applications_status las ON la.id = las.application_id
LEFT JOIN public.hs_loan_applications_system_tracking lst ON la.id = lst.application_id
LEFT JOIN public.hs_loan_applications_commission_records lcr ON la.id = lcr.application_id
LEFT JOIN public.hs_loan_applications_financial_requirements lfr ON la.id = lfr.application_id
LEFT JOIN public.hs_loan_applications_lender_information lli ON la.id = lli.application_id
WHERE c.is_deleted = FALSE;
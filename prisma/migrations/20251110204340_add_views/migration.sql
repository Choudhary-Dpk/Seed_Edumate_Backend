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
    "country_of_study" VARCHAR(255),
    "level_of_education" VARCHAR(50),
    "course_type" VARCHAR(255),
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
    "b2b_user_id" INTEGER,
    "admin_user_id" INTEGER,
    "user_type" TEXT,
    "ip_address" INET,
    "device_info" TEXT,
    "status" "public"."LoginStatus",
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
    "business_address" TEXT,
    "business_type" TEXT,
    "city" TEXT,
    "country" TEXT,
    "db_id" TEXT,
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
    "hs_created_by_user_id" INTEGER,
    "hs_createdate" TIMESTAMP(3),
    "hs_lastmodifieddate" TIMESTAMP(3),
    "hs_merged_object_ids" TEXT,
    "hs_object_id" TEXT,
    "hs_object_source_detail_1" TEXT,
    "hs_object_source_detail_2" TEXT,
    "hs_object_source_detail_3" TEXT,
    "hs_object_source_label" TEXT,
    "hs_shared_team_ids" TEXT,
    "hs_shared_user_ids" TEXT,
    "hs_updated_by_user_id" INTEGER,
    "hubspot_owner_assigneddate" TIMESTAMP(3),
    "hubspot_owner_id" TEXT,
    "hubspot_team_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_by" INTEGER,
    "deleted_on" TIMESTAMP(3),

    CONSTRAINT "hs_b2b_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_b2b_partners_business_capabilities" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "experience_years" INTEGER,
    "student_capacity_monthly" INTEGER,
    "student_capacity_yearly" INTEGER,
    "target_courses" TEXT,
    "target_destinations" TEXT,
    "target_universities" TEXT,
    "team_size" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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
    "commission_rate" DECIMAL(65,30),
    "commission_type" TEXT,
    "fixed_commission_amount" DECIMAL(65,30),
    "gst_applicable" TEXT,
    "ifsc_code" TEXT,
    "invoice_requirements" TEXT,
    "payment_frequency" TEXT,
    "payment_method" TEXT,
    "payment_terms" TEXT,
    "tds_applicable" TEXT,
    "tds_rate" DECIMAL(65,30),
    "tiered_commission_structure" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_b2b_partners_contact_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_b2b_partners_financial_tracking" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "average_monthly_commission" DECIMAL(65,30),
    "current_month_commission" DECIMAL(65,30),
    "last_payment_amount" DECIMAL(65,30),
    "last_payment_date" TIMESTAMP(3),
    "lifetime_value" TEXT,
    "next_payment_due_date" TIMESTAMP(3),
    "outstanding_commission" DECIMAL(65,30),
    "payment_status" TEXT,
    "total_commission_earned" DECIMAL(65,30),
    "total_commission_paid" DECIMAL(65,30),
    "ytd_commission_earned" DECIMAL(65,30),
    "ytd_commission_paid" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_b2b_partners_lead_attribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_b2b_partners_marketing_and_promotion" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "brand_usage_guidelines" TEXT,
    "co_marketing_approval" TEXT,
    "content_collaboration" TEXT,
    "digital_presence_rating" DECIMAL(65,30),
    "event_participation" TEXT,
    "marketing_materials_provided" TEXT,
    "promotional_activities" TEXT,
    "social_media_followers" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_b2b_partners_partnership_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_b2b_partners_performance_metrics" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "application_conversion_rate" DECIMAL(65,30),
    "applications_approved" INTEGER,
    "approval_conversion_rate" DECIMAL(65,30),
    "average_lead_quality_score" DECIMAL(65,30),
    "average_loan_amount" DECIMAL(65,30),
    "best_performing_month" TEXT,
    "last_lead_date" TIMESTAMP(3),
    "lead_conversion_rate" DECIMAL(65,30),
    "leads_converted_to_applications" INTEGER,
    "loans_disbursed" INTEGER,
    "partner_rating" DECIMAL(65,30),
    "qualified_leads_provided" INTEGER,
    "seasonal_performance_pattern" TEXT,
    "total_leads_provided" INTEGER,
    "total_loan_value_generated" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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
    "satisfaction_score" DECIMAL(65,30),
    "training_completed" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_b2b_partners_relationship_mgmt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_b2b_partners_system_tracking" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "api_access_provided" TEXT,
    "created_by_user" TEXT,
    "created_date" TIMESTAMP(3),
    "data_source" TEXT,
    "integration_status" TEXT,
    "internal_tags" TEXT,
    "last_modified_by_user" TEXT,
    "last_modified_date" TIMESTAMP(3),
    "notes" TEXT,
    "partner_record_status" TEXT,
    "portal_access_provided" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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
    "user_id" INTEGER,
    "deleted_by_id" INTEGER,
    "db_id" TEXT,
    "application_date" TIMESTAMP(3),
    "application_source" TEXT,
    "assigned_counselor" TEXT,
    "b2b_partner_id" INTEGER,
    "lead_reference_code" TEXT,
    "student_id" TEXT,
    "student_name" TEXT,
    "student_email" TEXT,
    "student_phone" TEXT,
    "hs_created_by_user_id" INTEGER,
    "hs_createdate" TIMESTAMP(3),
    "hs_lastmodifieddate" TIMESTAMP(3),
    "hs_merged_object_ids" TEXT,
    "hs_object_id" TEXT,
    "hs_object_source_detail_1" TEXT,
    "hs_object_source_detail_2" TEXT,
    "hs_object_source_detail_3" TEXT,
    "hs_object_source_label" TEXT,
    "hs_shared_team_ids" TEXT,
    "hs_shared_user_ids" TEXT,
    "hs_updated_by_user_id" INTEGER,
    "hubspot_owner_assigneddate" TIMESTAMP(3),
    "hubspot_owner_id" TEXT,
    "hubspot_team_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_by" TEXT,
    "deleted_on" TIMESTAMP(3),

    CONSTRAINT "hs_loan_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_academic_details" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "admission_status" TEXT,
    "course_duration" INTEGER,
    "course_end_date" TIMESTAMP(3),
    "course_level" TEXT,
    "course_start_date" TIMESTAMP(3),
    "i20_cas_received" TEXT,
    "target_course" TEXT,
    "target_university" TEXT,
    "target_university_country" TEXT,
    "visa_status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_applications_academic_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_additional_services" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "additional_services_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_applications_additional_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_status" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "application_status" TEXT,
    "application_notes" TEXT,
    "internal_notes" TEXT,
    "priority_level" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_applications_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_commission_records" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "commission_amount" DECIMAL(65,30),
    "commission_approval_date" TIMESTAMP(3),
    "commission_calculation_base" TEXT,
    "commission_payment_date" TIMESTAMP(3),
    "commission_rate" DECIMAL(65,30),
    "commission_status" TEXT,
    "partner_commission_applicable" TEXT,
    "settlement_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_applications_commission_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_communication_preferences" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "communication_preference" TEXT,
    "complaint_details" TEXT,
    "complaint_raised" TEXT,
    "complaint_resolution_date" TIMESTAMP(3),
    "customer_feedback" TEXT,
    "customer_satisfaction_rating" DECIMAL(65,30),
    "follow_up_frequency" TEXT,
    "last_contact_date" TIMESTAMP(3),
    "next_follow_up_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_applications_communication_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_document_management" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "documents_pending_list" TEXT,
    "documents_required_list" TEXT,
    "documents_submitted_list" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_applications_document_management_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_financial_requirements" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "insurance_cost" DECIMAL(65,30),
    "living_expenses" DECIMAL(65,30),
    "loan_amount_approved" DECIMAL(65,30),
    "loan_amount_disbursed" DECIMAL(65,30),
    "loan_amount_requested" DECIMAL(65,30),
    "other_expenses" DECIMAL(65,30),
    "scholarship_amount" DECIMAL(65,30),
    "self_funding_amount" DECIMAL(65,30),
    "total_funding_required" DECIMAL(65,30),
    "travel_expenses" DECIMAL(65,30),
    "tuition_fee" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_applications_financial_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_lender_information" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "co_signer_required" TEXT,
    "collateral_required" TEXT,
    "collateral_type" TEXT,
    "collateral_value" DECIMAL(65,30),
    "emi_amount" DECIMAL(65,30),
    "guarantor_details" TEXT,
    "interest_rate_offered" DECIMAL(65,30),
    "interest_rate_type" TEXT,
    "loan_product_id" TEXT,
    "loan_product_name" TEXT,
    "loan_product_type" TEXT,
    "loan_tenure_years" INTEGER,
    "moratorium_period_months" INTEGER,
    "primary_lender_id" TEXT,
    "primary_lender_name" TEXT,
    "processing_fee" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_applications_lender_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_processing_timeline" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "approval_date" TIMESTAMP(3),
    "delay_reason" TEXT,
    "disbursement_date" TIMESTAMP(3),
    "disbursement_request_date" TIMESTAMP(3),
    "lender_acknowledgment_date" TIMESTAMP(3),
    "lender_submission_date" TIMESTAMP(3),
    "sanction_letter_date" TIMESTAMP(3),
    "sla_breach" TEXT,
    "total_processing_days" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_applications_processing_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_rejection_details" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "appeal_outcome" TEXT,
    "appeal_submitted" TEXT,
    "rejection_date" TIMESTAMP(3),
    "rejection_details" TEXT,
    "rejection_reason" TEXT,
    "resolution_provided" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_applications_rejection_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_applications_system_tracking" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "application_record_status" TEXT,
    "application_source_system" TEXT,
    "audit_trail" TEXT,
    "created_by_user" TEXT,
    "created_date" TIMESTAMP(3),
    "external_reference_id" TEXT,
    "integration_status" TEXT,
    "last_modified_by" TEXT,
    "last_modified_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_applications_system_tracking_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "public"."hs_edumate_contacts" (
    "id" SERIAL NOT NULL,
    "b2b_partner_id" INTEGER,
    "deleted_by_id" INTEGER,
    "seed_contact" TEXT,
    "course_type" TEXT,
    "base_currency" TEXT,
    "study_destination_currency" TEXT,
    "user_selected_currency" TEXT,
    "co_applicant_1_email" TEXT,
    "co_applicant_1_mobile_number" INTEGER,
    "hs_created_by_user_id" INTEGER,
    "hs_createdate" TIMESTAMP(3),
    "hs_lastmodifieddate" TIMESTAMP(3),
    "hs_merged_object_ids" TEXT,
    "hs_object_id" TEXT,
    "hs_object_source_detail_1" TEXT,
    "hs_object_source_detail_2" TEXT,
    "hs_object_source_detail_3" TEXT,
    "hs_object_source_label" TEXT,
    "hs_shared_team_ids" TEXT,
    "hs_shared_user_ids" TEXT,
    "hs_updated_by_user_id" INTEGER,
    "hubspot_owner_assigneddate" TIMESTAMP(3),
    "hubspot_owner_id" TEXT,
    "hubspot_team_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_by" INTEGER,
    "deleted_on" TIMESTAMP(3),

    CONSTRAINT "hs_edumate_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_edumate_contacts_academic_profiles" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "current_education_level" TEXT,
    "current_institution" TEXT,
    "current_course_major" TEXT,
    "current_cgpa_percentage" DECIMAL(65,30),
    "current_graduation_year" INTEGER,
    "target_degree_level" TEXT,
    "target_course_major" TEXT,
    "target_universities" TEXT,
    "preferred_study_destination" TEXT,
    "intended_start_term" TEXT,
    "intended_start_date" TIMESTAMP(3),
    "intake_month" TEXT,
    "intake_year" TEXT,
    "course_duration_months" INTEGER,
    "admission_status" TEXT,
    "gre_score" DECIMAL(65,30),
    "gmat_score" DECIMAL(65,30),
    "toefl_score" DECIMAL(65,30),
    "ielts_score" DECIMAL(65,30),
    "sat_score" DECIMAL(65,30),
    "cat_score" DECIMAL(65,30),
    "xat_score" DECIMAL(65,30),
    "nmat_score" DECIMAL(65,30),
    "duolingo_score" DECIMAL(65,30),
    "other_test_scores" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_edumate_contacts_academic_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_edumate_contacts_application_journey" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "assigned_counselor" TEXT,
    "counselor_notes" TEXT,
    "priority_level" TEXT,
    "current_status_disposition" TEXT,
    "current_status_disposition_reason" TEXT,
    "first_contact_date" TIMESTAMP(3),
    "last_contact_date" TIMESTAMP(3),
    "next_follow_up_date" TIMESTAMP(3),
    "follow_up_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_edumate_contacts_application_journey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_edumate_contacts_financial_info" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "annual_family_income" DECIMAL(65,30),
    "currency" TEXT,
    "total_course_cost" DECIMAL(65,30),
    "tuition_fee" DECIMAL(65,30),
    "living_expenses" DECIMAL(65,30),
    "other_expenses" DECIMAL(65,30),
    "loan_amount_required" DECIMAL(65,30),
    "scholarship_amount" DECIMAL(65,30),
    "self_funding_amount" DECIMAL(65,30),
    "collateral_available" TEXT,
    "collateral_type" TEXT,
    "collateral_value" DECIMAL(65,30),
    "collateral_2_available" TEXT,
    "collateral_2_type" TEXT,
    "collateral_2_value" DECIMAL(65,30),
    "co_applicant_1_name" TEXT,
    "co_applicant_1_relationship" TEXT,
    "co_applicant_1_occupation" TEXT,
    "co_applicant_1_income" DECIMAL(65,30),
    "co_applicant_2_name" TEXT,
    "co_applicant_2_relationship" TEXT,
    "co_applicant_2_occupation" TEXT,
    "co_applicant_2_income" DECIMAL(65,30),
    "co_applicant_3_name" TEXT,
    "co_applicant_3_relationship" TEXT,
    "co_applicant_3_occupation" TEXT,
    "co_applicant_3_income" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_edumate_contacts_financial_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_edumate_contacts_lead_attribution" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "lead_reference_code" TEXT,
    "lead_source" TEXT,
    "lead_source_detail" TEXT,
    "lead_quality_score" DECIMAL(65,30),
    "b2b_partner_id" TEXT,
    "b2b_partner_name" TEXT,
    "partner_commission_applicable" TEXT,
    "referral_person_name" TEXT,
    "referral_person_contact" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_content" TEXT,
    "utm_term" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_edumate_contacts_lead_attribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_edumate_contacts_loan_preferences" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "loan_type_preference" TEXT,
    "preferred_lenders" TEXT,
    "repayment_type_preference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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
    "gender" TEXT,
    "nationality" TEXT,
    "current_address" TEXT,
    "city_current_address" TEXT,
    "state_current_address" TEXT,
    "country_current_address" TEXT,
    "pincode_current_address" TEXT,
    "permanent_address" TEXT,
    "city_permanent_address" TEXT,
    "state_permanent_address" TEXT,
    "country_permanent_address" TEXT,
    "pincode_permanent_address" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_edumate_contacts_personal_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_edumate_contacts_system_tracking" (
    "id" SERIAL NOT NULL,
    "created_by" INTEGER,
    "contact_id" INTEGER NOT NULL,
    "student_record_status" TEXT,
    "data_source" TEXT,
    "gdpr_consent" TEXT,
    "marketing_consent" TEXT,
    "tags" TEXT,
    "created_by_user" TEXT,
    "created_date" TIMESTAMP(3),
    "last_modified_by" TEXT,
    "last_modified_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_edumate_contacts_system_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_lenders" (
    "id" SERIAL NOT NULL,
    "db_id" TEXT,
    "lender_name" TEXT,
    "lender_display_name" TEXT,
    "lender_type" TEXT,
    "lender_category" TEXT,
    "lender_logo_url" TEXT,
    "website_url" TEXT,
    "hs_created_by_user_id" INTEGER,
    "hs_createdate" TIMESTAMP(3),
    "hs_lastmodifieddate" TIMESTAMP(3),
    "hs_merged_object_ids" TEXT,
    "hs_object_id" TEXT,
    "hs_object_source_detail_1" TEXT,
    "hs_object_source_detail_2" TEXT,
    "hs_object_source_detail_3" TEXT,
    "hs_object_source_label" TEXT,
    "hs_shared_team_ids" TEXT,
    "hs_shared_user_ids" TEXT,
    "hs_updated_by_user_id" INTEGER,
    "hubspot_owner_assigneddate" TIMESTAMP(3),
    "hubspot_owner_id" TEXT,
    "hubspot_team_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_by" TEXT,
    "deleted_on" TIMESTAMP(3),

    CONSTRAINT "hs_lenders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_lenders_business_metrics" (
    "id" SERIAL NOT NULL,
    "lender_id" INTEGER NOT NULL,
    "average_approval_rate" DECIMAL(65,30),
    "average_disbursement_days" INTEGER,
    "average_processing_days" INTEGER,
    "monthly_application_volume" INTEGER,
    "quarterly_application_volume" INTEGER,
    "yearly_application_volume" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_lenders_business_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_lenders_contact_info" (
    "id" SERIAL NOT NULL,
    "lender_id" INTEGER NOT NULL,
    "primary_contact_person" TEXT,
    "primary_contact_email" TEXT,
    "primary_contact_phone" TEXT,
    "primary_contact_designation" TEXT,
    "relationship_manager_name" TEXT,
    "relationship_manager_email" TEXT,
    "relationship_manager_phone" TEXT,
    "customer_service_email" TEXT,
    "customer_service_number" TEXT,
    "escalation_hierarchy_1_name" TEXT,
    "escalation_hierarchy_1_email" TEXT,
    "escalation_hierarchy_1_phone" TEXT,
    "escalation_hierarchy_1_designation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_lenders_contact_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_lenders_loan_offerings" (
    "id" SERIAL NOT NULL,
    "lender_id" INTEGER NOT NULL,
    "minimum_loan_amount_secured" DECIMAL(65,30),
    "maximum_loan_amount_secured" DECIMAL(65,30),
    "minimum_loan_amount_unsecured" DECIMAL(65,30),
    "maximum_loan_amount_unsecured" DECIMAL(65,30),
    "interest_rate_range_min_secured" DECIMAL(65,30),
    "interest_rate_range_max_secured" DECIMAL(65,30),
    "interest_rate_range_min_unsecured" DECIMAL(65,30),
    "interest_rate_range_max_unsecured" DECIMAL(65,30),
    "margin_money_requirement" DECIMAL(65,30),
    "processing_fee_range" TEXT,
    "collateral_requirements" TEXT,
    "co_signer_requirements" TEXT,
    "supported_course_types" TEXT,
    "supported_destinations" TEXT,
    "special_programs" TEXT,
    "not_supported_universities" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_lenders_loan_offerings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_lenders_operational_details" (
    "id" SERIAL NOT NULL,
    "lender_id" INTEGER NOT NULL,
    "turnaround_time_commitment" INTEGER,
    "working_hours" TEXT,
    "documentation_requirements" TEXT,
    "repayment_options" TEXT,
    "prepayment_charges" TEXT,
    "late_payment_charges" TEXT,
    "digital_integration_level" TEXT,
    "api_connectivity_status" TEXT,
    "holiday_processing" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_lenders_operational_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_lenders_partnerships_details" (
    "id" SERIAL NOT NULL,
    "lender_id" INTEGER NOT NULL,
    "partnership_status" TEXT,
    "partnership_start_date" TIMESTAMP(3),
    "partnership_end_date" TIMESTAMP(3),
    "commission_percentage" DECIMAL(65,30),
    "commission_structure" TEXT,
    "revenue_share_model" TEXT,
    "payout_terms" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_lenders_partnerships_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_lenders_system_tracking" (
    "id" SERIAL NOT NULL,
    "lender_id" INTEGER NOT NULL,
    "lender_record_status" TEXT,
    "data_source" TEXT,
    "performance_rating" TEXT,
    "notes" TEXT,
    "created_by_user" TEXT,
    "created_date" TIMESTAMP(3),
    "last_modified_by" TEXT,
    "last_modified_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_lenders_system_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products" (
    "id" SERIAL NOT NULL,
    "db_id" TEXT,
    "lender_id" INTEGER,
    "lender_db_id" TEXT,
    "lender_name" TEXT,
    "partner_name" TEXT,
    "product_name" TEXT,
    "product_display_name" TEXT,
    "product_description" TEXT,
    "product_type" TEXT,
    "product_category" TEXT,
    "product_status" TEXT,
    "last_updated_date" TIMESTAMP(3),
    "hs_created_by_user_id" INTEGER,
    "hs_createdate" TIMESTAMP(3),
    "hs_lastmodifieddate" TIMESTAMP(3),
    "hs_merged_object_ids" TEXT,
    "hs_object_id" TEXT,
    "hs_object_source_detail_1" TEXT,
    "hs_object_source_detail_2" TEXT,
    "hs_object_source_detail_3" TEXT,
    "hs_object_source_label" TEXT,
    "hs_shared_team_ids" TEXT,
    "hs_shared_user_ids" TEXT,
    "hs_updated_by_user_id" INTEGER,
    "hubspot_owner_assigneddate" TIMESTAMP(3),
    "hubspot_owner_id" TEXT,
    "hubspot_team_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_by" TEXT,
    "deleted_on" TIMESTAMP(3),

    CONSTRAINT "hs_loan_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_application_and_processing" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "application_mode" TEXT,
    "disbursement_process" TEXT,
    "disbursement_timeline" TEXT,
    "documentation_list" TEXT,
    "mandatory_documents" TEXT,
    "optional_documents" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_products_application_and_processing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_collateral_and_security" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "collateral_margin" DECIMAL(65,30),
    "collateral_required" TEXT,
    "collateral_threshold_amount" DECIMAL(65,30),
    "collateral_types_accepted" TEXT,
    "guarantor_required" TEXT,
    "insurance_coverage_percentage" DECIMAL(65,30),
    "insurance_required" TEXT,
    "third_party_guarantee_accepted" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_products_collateral_and_security_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_competitive_analysis" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "market_positioning" TEXT,
    "pricing_strategy" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_products_competitive_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_eligibility_criteria" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "co_applicant_income_criteria" TEXT,
    "co_applicant_relationship" TEXT,
    "co_applicant_required" TEXT,
    "employment_criteria" TEXT,
    "entrance_exam_required" TEXT,
    "maximum_age" INTEGER,
    "maximum_family_income" DECIMAL(65,30),
    "minimum_age" INTEGER,
    "minimum_family_income" DECIMAL(65,30),
    "minimum_percentage_required" DECIMAL(65,30),
    "nationality_restrictions" TEXT,
    "residency_requirements" TEXT,
    "target_segment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_products_eligibility_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_financial_terms" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "administrative_charges" DECIMAL(65,30),
    "interest_rate_range_max" DECIMAL(65,30),
    "interest_rate_range_min" DECIMAL(65,30),
    "interest_rate_type" TEXT,
    "legal_charges" DECIMAL(65,30),
    "loan_to_value_ratio" DECIMAL(65,30),
    "margin_money_percentage" DECIMAL(65,30),
    "maximum_loan_amount_secured" DECIMAL(65,30),
    "maximum_loan_amount_unsecured" DECIMAL(65,30),
    "minimum_loan_amount_secured" DECIMAL(65,30),
    "minimum_loan_amount_unsecured" DECIMAL(65,30),
    "processing_fee_amount" DECIMAL(65,30),
    "processing_fee_maximum" DECIMAL(65,30),
    "processing_fee_minimum" DECIMAL(65,30),
    "processing_fee_percentage" DECIMAL(65,30),
    "processing_fee_type" TEXT,
    "rack_rate" DECIMAL(65,30),
    "valuation_charges" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_products_financial_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_geographic_coverage" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "course_duration_maximum" INTEGER,
    "course_duration_minimum" INTEGER,
    "course_restrictions" TEXT,
    "not_supported_universities" TEXT,
    "restricted_countries" TEXT,
    "supported_course_types" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_products_geographic_coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_performance_metrics" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "application_volume_monthly" INTEGER,
    "application_volume_quarterly" INTEGER,
    "application_volume_yearly" INTEGER,
    "approval_rate" DECIMAL(65,30),
    "average_loan_amount" DECIMAL(65,30),
    "average_processing_days" INTEGER,
    "customer_satisfaction_rating" DECIMAL(65,30),
    "product_popularity_score" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_products_performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_repayment_terms" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "bounce_charges" DECIMAL(65,30),
    "foreclosure_charges" TEXT,
    "late_payment_charges" TEXT,
    "moratorium_period" INTEGER,
    "moratorium_type" TEXT,
    "part_payment_allowed" TEXT,
    "part_payment_minimum" DECIMAL(65,30),
    "prepayment_allowed" TEXT,
    "prepayment_charges" TEXT,
    "prepayment_lock_in_period" INTEGER,
    "repayment_frequency" TEXT,
    "repayment_period_maximum" INTEGER,
    "repayment_period_minimum" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_products_repayment_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_special_features" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "customer_support_features" TEXT,
    "digital_features" TEXT,
    "flexible_repayment_options" TEXT,
    "forex_tax_benefits" TEXT,
    "grace_period_benefits" TEXT,
    "loyalty_benefits" TEXT,
    "tax_benefits_available" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_products_special_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_system_integration" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "api_availability" TEXT,
    "data_format" TEXT,
    "integration_complexity" TEXT,
    "sandbox_environment" TEXT,
    "technical_documentation_url" TEXT,
    "webhook_support" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_products_system_integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_loan_products_system_tracking" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "change_log" TEXT,
    "created_by_user" TEXT,
    "created_date" TIMESTAMP(3),
    "last_modified_by" TEXT,
    "last_modified_date" TIMESTAMP(3),
    "next_review_date" TIMESTAMP(3),
    "notes" TEXT,
    "product_record_status" TEXT,
    "review_frequency" TEXT,
    "version_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_loan_products_system_tracking_pkey" PRIMARY KEY ("id")
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
    "db_id" TEXT,
    "settlement_id" TEXT,
    "settlement_reference_number" TEXT,
    "application_id" TEXT,
    "lead_reference_id" TEXT,
    "partner_id" TEXT,
    "partner_name" TEXT,
    "student_id" TEXT,
    "student_name" TEXT,
    "settlement_date" TIMESTAMP(3),
    "settlement_month" TEXT,
    "settlement_period" TEXT,
    "settlement_year" INTEGER,
    "verified_by" TEXT,
    "hs_created_by_user_id" INTEGER,
    "hs_createdate" TIMESTAMP(3),
    "hs_lastmodifieddate" TIMESTAMP(3),
    "hs_merged_object_ids" TEXT,
    "hs_object_id" TEXT,
    "hs_object_source_detail_1" TEXT,
    "hs_object_source_detail_2" TEXT,
    "hs_object_source_detail_3" TEXT,
    "hs_object_source_label" TEXT,
    "hs_shared_team_ids" TEXT,
    "hs_shared_user_ids" TEXT,
    "hs_updated_by_user_id" INTEGER,
    "hubspot_owner_assigneddate" TIMESTAMP(3),
    "hubspot_owner_id" TEXT,
    "hubspot_team_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_by" TEXT,
    "deleted_on" TIMESTAMP(3),

    CONSTRAINT "hs_commission_settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_commission_calculations" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "commission_model" TEXT,
    "commission_rate_applied" DECIMAL(65,30),
    "commission_tier_applied" TEXT,
    "gross_commission_amount" DECIMAL(65,30),
    "bonus_amount" DECIMAL(65,30),
    "bonus_rate_applied" DECIMAL(65,30),
    "incentive_amount" DECIMAL(65,30),
    "penalty_amount" DECIMAL(65,30),
    "adjustment_amount" DECIMAL(65,30),
    "adjustment_reason" TEXT,
    "total_gross_amount" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_commission_settlements_commission_calculations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_communication" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "notification_date" TIMESTAMP(3),
    "notification_method" TEXT,
    "partner_notification_sent" TEXT,
    "acknowledgment_received" TEXT,
    "acknowledgment_date" TIMESTAMP(3),
    "last_communication_date" TIMESTAMP(3),
    "communication_log" TEXT,
    "email_sent_count" INTEGER,
    "sms_sent_count" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_commission_settlements_communication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_tax_and_deductions" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "gst_applicable" TEXT,
    "gst_rate_applied" DECIMAL(65,30),
    "gst_amount" DECIMAL(65,30),
    "tds_applicable" TEXT,
    "tds_rate_applied" DECIMAL(65,30),
    "tds_amount" DECIMAL(65,30),
    "tds_certificate_number" TEXT,
    "service_tax_amount" DECIMAL(65,30),
    "other_deductions" DECIMAL(65,30),
    "other_deductions_description" TEXT,
    "total_deductions" DECIMAL(65,30),
    "net_payable_amount" DECIMAL(65,30),
    "withholding_tax_applicable" BOOLEAN DEFAULT false,
    "withholding_tax_rate" DECIMAL(65,30),
    "withholding_tax_amount" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_commission_settlements_tax_and_deductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_documentation" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "invoice_required" TEXT,
    "invoice_number" TEXT,
    "invoice_date" TIMESTAMP(3),
    "invoice_amount" DECIMAL(65,30),
    "invoice_status" TEXT,
    "invoice_url" TEXT,
    "tax_certificate_required" TEXT,
    "tax_certificate_url" TEXT,
    "agreement_reference" TEXT,
    "payment_terms_applied" TEXT,
    "supporting_documents" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_commission_settlements_documentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_hold_and_disputes" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "on_hold" TEXT,
    "hold_reason" TEXT,
    "hold_date" TIMESTAMP(3),
    "hold_initiated_by" TEXT,
    "hold_release_date" TIMESTAMP(3),
    "hold_release_approved_by" TEXT,
    "dispute_raised" TEXT,
    "dispute_date" TIMESTAMP(3),
    "dispute_raised_by" TEXT,
    "dispute_description" TEXT,
    "dispute_resolution" TEXT,
    "dispute_resolution_date" TIMESTAMP(3),
    "dispute_resolved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_commission_settlements_hold_and_disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_loan_details" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "lender_name" TEXT,
    "loan_product_name" TEXT,
    "loan_amount_disbursed" DECIMAL(65,30),
    "loan_disbursement_date" TIMESTAMP(3),
    "course_name" TEXT,
    "university_name" TEXT,
    "student_destination_country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_commission_settlements_loan_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_payment_processing" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "payment_method" TEXT,
    "payment_status" TEXT,
    "payment_initiation_date" TIMESTAMP(3),
    "payment_completion_date" TIMESTAMP(3),
    "payment_reference_number" TEXT,
    "payment_gateway_reference" TEXT,
    "bank_transaction_id" TEXT,
    "beneficiary_name" TEXT,
    "beneficiary_account_number" TEXT,
    "beneficiary_bank_name" TEXT,
    "beneficiary_ifsc_code" TEXT,
    "payment_failure_reason" TEXT,
    "retry_attempt_count" INTEGER,
    "last_retry_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_commission_settlements_payment_processing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_performance_analytics" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "processing_time_days" INTEGER,
    "payment_delay_days" INTEGER,
    "sla_breach" TEXT,
    "sla_breach_reason" TEXT,
    "partner_satisfaction_rating" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_commission_settlements_performance_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_reconciliations" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "reconciliation_status" TEXT,
    "reconciliation_date" TIMESTAMP(3),
    "reconciled_by" TEXT,
    "bank_statement_reference" TEXT,
    "discrepancy_amount" DECIMAL(65,30),
    "discrepancy_reason" TEXT,
    "reconciliation_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_commission_settlements_reconciliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_settlement_status" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "settlement_status" TEXT,
    "calculation_date" TIMESTAMP(3),
    "calculated_by" TEXT,
    "verification_status" TEXT,
    "verification_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_commission_settlements_settlement_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_system_tracking" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "settlement_record_status" TEXT,
    "data_source" TEXT,
    "integration_status" TEXT,
    "system_generated" TEXT,
    "created_by_user" TEXT,
    "created_date" TIMESTAMP(3),
    "last_modified_by" TEXT,
    "last_modified_date" TIMESTAMP(3),
    "version_number" TEXT,
    "audit_trail" TEXT,
    "change_log" TEXT,
    "notes" TEXT,
    "internal_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_commission_settlements_system_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hs_commission_settlements_transaction_details" (
    "id" SERIAL NOT NULL,
    "settlement_id" INTEGER NOT NULL,
    "transaction_type" TEXT,
    "transaction_sub_type" TEXT,
    "disbursement_trigger" TEXT,
    "batch_payment_id" TEXT,
    "original_transaction_id" TEXT,
    "related_settlement_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hs_commission_settlements_transaction_details_pkey" PRIMARY KEY ("id")
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
    "name" VARCHAR(255) NOT NULL,
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
CREATE TABLE "public"."enum_mappings" (
    "id" TEXT NOT NULL,
    "enumName" TEXT NOT NULL,
    "hubspotProperty" TEXT NOT NULL,
    "hubspotObjectType" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enum_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."enum_values" (
    "id" TEXT NOT NULL,
    "enumMappingId" TEXT NOT NULL,
    "sourceValue" TEXT NOT NULL,
    "hubspotValue" TEXT NOT NULL,
    "displayLabel" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enum_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."field_mappings" (
    "id" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "sourceEntity" TEXT,
    "sourceField" TEXT NOT NULL,
    "targetSystem" TEXT NOT NULL,
    "targetEntity" TEXT NOT NULL,
    "targetField" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "defaultValue" TEXT,
    "transformFunction" TEXT,
    "requiresEnumMap" BOOLEAN NOT NULL DEFAULT false,
    "enumMapId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_mappings_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "hs_b2b_partners_db_id_key" ON "public"."hs_b2b_partners"("db_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_b2b_partners_hs_object_id_key" ON "public"."hs_b2b_partners"("hs_object_id");

-- CreateIndex
CREATE INDEX "hs_b2b_partners_partner_name_idx" ON "public"."hs_b2b_partners"("partner_name");

-- CreateIndex
CREATE INDEX "hs_b2b_partners_partner_type_idx" ON "public"."hs_b2b_partners"("partner_type");

-- CreateIndex
CREATE INDEX "hs_b2b_partners_business_type_idx" ON "public"."hs_b2b_partners"("business_type");

-- CreateIndex
CREATE INDEX "hs_b2b_partners_is_deleted_idx" ON "public"."hs_b2b_partners"("is_deleted");

-- CreateIndex
CREATE INDEX "hs_b2b_partners_created_at_idx" ON "public"."hs_b2b_partners"("created_at");

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
CREATE UNIQUE INDEX "hs_b2b_partners_lead_attribution_unique_referral_code_key" ON "public"."hs_b2b_partners_lead_attribution"("unique_referral_code");

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
CREATE UNIQUE INDEX "hs_loan_applications_hs_object_id_key" ON "public"."hs_loan_applications"("hs_object_id");

-- CreateIndex
CREATE INDEX "hs_loan_applications_student_email_idx" ON "public"."hs_loan_applications"("student_email");

-- CreateIndex
CREATE INDEX "hs_loan_applications_application_date_idx" ON "public"."hs_loan_applications"("application_date");

-- CreateIndex
CREATE INDEX "hs_loan_applications_student_id_idx" ON "public"."hs_loan_applications"("student_id");

-- CreateIndex
CREATE INDEX "hs_loan_applications_b2b_partner_id_idx" ON "public"."hs_loan_applications"("b2b_partner_id");

-- CreateIndex
CREATE INDEX "hs_loan_applications_is_deleted_idx" ON "public"."hs_loan_applications"("is_deleted");

-- CreateIndex
CREATE INDEX "hs_loan_applications_created_at_idx" ON "public"."hs_loan_applications"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_academic_details_application_id_key" ON "public"."hs_loan_applications_academic_details"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_additional_services_application_id_key" ON "public"."hs_loan_applications_additional_services"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_status_application_id_key" ON "public"."hs_loan_applications_status"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_commission_records_application_id_key" ON "public"."hs_loan_applications_commission_records"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_communication_preferences_application__key" ON "public"."hs_loan_applications_communication_preferences"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_document_management_application_id_key" ON "public"."hs_loan_applications_document_management"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_financial_requirements_application_id_key" ON "public"."hs_loan_applications_financial_requirements"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_lender_information_application_id_key" ON "public"."hs_loan_applications_lender_information"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_processing_timeline_application_id_key" ON "public"."hs_loan_applications_processing_timeline"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_rejection_details_application_id_key" ON "public"."hs_loan_applications_rejection_details"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_applications_system_tracking_application_id_key" ON "public"."hs_loan_applications_system_tracking"("application_id");

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
CREATE UNIQUE INDEX "hs_edumate_contacts_hs_object_id_key" ON "public"."hs_edumate_contacts"("hs_object_id");

-- CreateIndex
CREATE INDEX "hs_edumate_contacts_hs_object_id_idx" ON "public"."hs_edumate_contacts"("hs_object_id");

-- CreateIndex
CREATE INDEX "hs_edumate_contacts_seed_contact_idx" ON "public"."hs_edumate_contacts"("seed_contact");

-- CreateIndex
CREATE INDEX "hs_edumate_contacts_is_deleted_idx" ON "public"."hs_edumate_contacts"("is_deleted");

-- CreateIndex
CREATE INDEX "hs_edumate_contacts_created_at_idx" ON "public"."hs_edumate_contacts"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "hs_edumate_contacts_academic_profiles_contact_id_key" ON "public"."hs_edumate_contacts_academic_profiles"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_edumate_contacts_application_journey_contact_id_key" ON "public"."hs_edumate_contacts_application_journey"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_edumate_contacts_financial_info_contact_id_key" ON "public"."hs_edumate_contacts_financial_info"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_edumate_contacts_lead_attribution_contact_id_key" ON "public"."hs_edumate_contacts_lead_attribution"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_edumate_contacts_loan_preferences_contact_id_key" ON "public"."hs_edumate_contacts_loan_preferences"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_edumate_contacts_personal_information_contact_id_key" ON "public"."hs_edumate_contacts_personal_information"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_edumate_contacts_system_tracking_contact_id_key" ON "public"."hs_edumate_contacts_system_tracking"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_lenders_db_id_key" ON "public"."hs_lenders"("db_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_lenders_hs_object_id_key" ON "public"."hs_lenders"("hs_object_id");

-- CreateIndex
CREATE INDEX "hs_lenders_lender_name_idx" ON "public"."hs_lenders"("lender_name");

-- CreateIndex
CREATE INDEX "hs_lenders_lender_type_idx" ON "public"."hs_lenders"("lender_type");

-- CreateIndex
CREATE INDEX "hs_lenders_is_deleted_idx" ON "public"."hs_lenders"("is_deleted");

-- CreateIndex
CREATE INDEX "hs_lenders_created_at_idx" ON "public"."hs_lenders"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "hs_lenders_business_metrics_lender_id_key" ON "public"."hs_lenders_business_metrics"("lender_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_lenders_contact_info_lender_id_key" ON "public"."hs_lenders_contact_info"("lender_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_lenders_loan_offerings_lender_id_key" ON "public"."hs_lenders_loan_offerings"("lender_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_lenders_operational_details_lender_id_key" ON "public"."hs_lenders_operational_details"("lender_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_lenders_partnerships_details_lender_id_key" ON "public"."hs_lenders_partnerships_details"("lender_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_lenders_system_tracking_lender_id_key" ON "public"."hs_lenders_system_tracking"("lender_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_db_id_key" ON "public"."hs_loan_products"("db_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_hs_object_id_key" ON "public"."hs_loan_products"("hs_object_id");

-- CreateIndex
CREATE INDEX "hs_loan_products_product_name_idx" ON "public"."hs_loan_products"("product_name");

-- CreateIndex
CREATE INDEX "hs_loan_products_lender_id_idx" ON "public"."hs_loan_products"("lender_id");

-- CreateIndex
CREATE INDEX "hs_loan_products_product_status_idx" ON "public"."hs_loan_products"("product_status");

-- CreateIndex
CREATE INDEX "hs_loan_products_is_deleted_idx" ON "public"."hs_loan_products"("is_deleted");

-- CreateIndex
CREATE INDEX "hs_loan_products_created_at_idx" ON "public"."hs_loan_products"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_application_and_processing_product_id_key" ON "public"."hs_loan_products_application_and_processing"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_collateral_and_security_product_id_key" ON "public"."hs_loan_products_collateral_and_security"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_competitive_analysis_product_id_key" ON "public"."hs_loan_products_competitive_analysis"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_eligibility_criteria_product_id_key" ON "public"."hs_loan_products_eligibility_criteria"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_financial_terms_product_id_key" ON "public"."hs_loan_products_financial_terms"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_geographic_coverage_product_id_key" ON "public"."hs_loan_products_geographic_coverage"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_performance_metrics_product_id_key" ON "public"."hs_loan_products_performance_metrics"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_repayment_terms_product_id_key" ON "public"."hs_loan_products_repayment_terms"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_special_features_product_id_key" ON "public"."hs_loan_products_special_features"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_system_integration_product_id_key" ON "public"."hs_loan_products_system_integration"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_loan_products_system_tracking_product_id_key" ON "public"."hs_loan_products_system_tracking"("product_id");

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
CREATE UNIQUE INDEX "hs_commission_settlements_db_id_key" ON "public"."hs_commission_settlements"("db_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_settlement_id_key" ON "public"."hs_commission_settlements"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_hs_object_id_key" ON "public"."hs_commission_settlements"("hs_object_id");

-- CreateIndex
CREATE INDEX "hs_commission_settlements_settlement_id_idx" ON "public"."hs_commission_settlements"("settlement_id");

-- CreateIndex
CREATE INDEX "hs_commission_settlements_partner_id_idx" ON "public"."hs_commission_settlements"("partner_id");

-- CreateIndex
CREATE INDEX "hs_commission_settlements_application_id_idx" ON "public"."hs_commission_settlements"("application_id");

-- CreateIndex
CREATE INDEX "hs_commission_settlements_settlement_date_idx" ON "public"."hs_commission_settlements"("settlement_date");

-- CreateIndex
CREATE INDEX "hs_commission_settlements_is_deleted_idx" ON "public"."hs_commission_settlements"("is_deleted");

-- CreateIndex
CREATE INDEX "hs_commission_settlements_created_at_idx" ON "public"."hs_commission_settlements"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_commission_calculations_settlemen_key" ON "public"."hs_commission_settlements_commission_calculations"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_communication_settlement_id_key" ON "public"."hs_commission_settlements_communication"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_tax_and_deductions_settlement_id_key" ON "public"."hs_commission_settlements_tax_and_deductions"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_documentation_settlement_id_key" ON "public"."hs_commission_settlements_documentation"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_hold_and_disputes_settlement_id_key" ON "public"."hs_commission_settlements_hold_and_disputes"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_loan_details_settlement_id_key" ON "public"."hs_commission_settlements_loan_details"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_payment_processing_settlement_id_key" ON "public"."hs_commission_settlements_payment_processing"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_performance_analytics_settlement__key" ON "public"."hs_commission_settlements_performance_analytics"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_reconciliations_settlement_id_key" ON "public"."hs_commission_settlements_reconciliations"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_settlement_status_settlement_id_key" ON "public"."hs_commission_settlements_settlement_status"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_system_tracking_settlement_id_key" ON "public"."hs_commission_settlements_system_tracking"("settlement_id");

-- CreateIndex
CREATE UNIQUE INDEX "hs_commission_settlements_transaction_details_settlement_id_key" ON "public"."hs_commission_settlements_transaction_details"("settlement_id");

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
CREATE INDEX "enum_mappings_hubspotProperty_isActive_idx" ON "public"."enum_mappings"("hubspotProperty", "isActive");

-- CreateIndex
CREATE INDEX "enum_mappings_enumName_isActive_idx" ON "public"."enum_mappings"("enumName", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "enum_mappings_enumName_version_key" ON "public"."enum_mappings"("enumName", "version");

-- CreateIndex
CREATE INDEX "enum_values_enumMappingId_isActive_idx" ON "public"."enum_values"("enumMappingId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "enum_values_enumMappingId_sourceValue_key" ON "public"."enum_values"("enumMappingId", "sourceValue");

-- CreateIndex
CREATE UNIQUE INDEX "enum_values_enumMappingId_hubspotValue_key" ON "public"."enum_values"("enumMappingId", "hubspotValue");

-- CreateIndex
CREATE INDEX "field_mappings_targetSystem_targetEntity_isActive_idx" ON "public"."field_mappings"("targetSystem", "targetEntity", "isActive");

-- CreateIndex
CREATE INDEX "field_mappings_sourceSystem_sourceEntity_isActive_idx" ON "public"."field_mappings"("sourceSystem", "sourceEntity", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "field_mappings_sourceSystem_sourceEntity_sourceField_target_key" ON "public"."field_mappings"("sourceSystem", "sourceEntity", "sourceField", "targetSystem", "version");

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
ALTER TABLE "public"."login_history" ADD CONSTRAINT "login_history_b2b_user_id_fkey" FOREIGN KEY ("b2b_user_id") REFERENCES "public"."b2b_partners_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."login_history" ADD CONSTRAINT "login_history_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."b2b_partners_role_permissions" ADD CONSTRAINT "b2b_partners_role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."b2b_partners_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."b2b_partners_role_permissions" ADD CONSTRAINT "b2b_partners_role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."b2b_partners_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_b2b_partners" ADD CONSTRAINT "hs_b2b_partners_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."b2b_partners_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "public"."hs_loan_applications" ADD CONSTRAINT "hs_loan_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_academic_details" ADD CONSTRAINT "hs_loan_applications_academic_details_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_additional_services" ADD CONSTRAINT "hs_loan_applications_additional_services_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_status" ADD CONSTRAINT "hs_loan_applications_status_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_commission_records" ADD CONSTRAINT "hs_loan_applications_commission_records_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_communication_preferences" ADD CONSTRAINT "hs_loan_applications_communication_preferences_application_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_document_management" ADD CONSTRAINT "hs_loan_applications_document_management_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_financial_requirements" ADD CONSTRAINT "hs_loan_applications_financial_requirements_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_lender_information" ADD CONSTRAINT "hs_loan_applications_lender_information_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_processing_timeline" ADD CONSTRAINT "hs_loan_applications_processing_timeline_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_rejection_details" ADD CONSTRAINT "hs_loan_applications_rejection_details_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_applications_system_tracking" ADD CONSTRAINT "hs_loan_applications_system_tracking_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."hs_loan_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_uploads" ADD CONSTRAINT "file_uploads_entity_type_id_fkey" FOREIGN KEY ("entity_type_id") REFERENCES "public"."file_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_uploads" ADD CONSTRAINT "file_uploads_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."b2b_partners_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_history" ADD CONSTRAINT "email_history_email_type_id_fkey" FOREIGN KEY ("email_type_id") REFERENCES "public"."email_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_history" ADD CONSTRAINT "email_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."b2b_partners_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_edumate_contacts" ADD CONSTRAINT "hs_edumate_contacts_b2b_partner_id_fkey" FOREIGN KEY ("b2b_partner_id") REFERENCES "public"."hs_b2b_partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_edumate_contacts_academic_profiles" ADD CONSTRAINT "hs_edumate_contacts_academic_profiles_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."hs_edumate_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_edumate_contacts_application_journey" ADD CONSTRAINT "hs_edumate_contacts_application_journey_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."hs_edumate_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_edumate_contacts_financial_info" ADD CONSTRAINT "hs_edumate_contacts_financial_info_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."hs_edumate_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_edumate_contacts_lead_attribution" ADD CONSTRAINT "hs_edumate_contacts_lead_attribution_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."hs_edumate_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_edumate_contacts_loan_preferences" ADD CONSTRAINT "hs_edumate_contacts_loan_preferences_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."hs_edumate_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_edumate_contacts_personal_information" ADD CONSTRAINT "hs_edumate_contacts_personal_information_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."hs_edumate_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_edumate_contacts_system_tracking" ADD CONSTRAINT "hs_edumate_contacts_system_tracking_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."hs_edumate_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_lenders_business_metrics" ADD CONSTRAINT "hs_lenders_business_metrics_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "public"."hs_lenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_lenders_contact_info" ADD CONSTRAINT "hs_lenders_contact_info_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "public"."hs_lenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_lenders_loan_offerings" ADD CONSTRAINT "hs_lenders_loan_offerings_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "public"."hs_lenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_lenders_operational_details" ADD CONSTRAINT "hs_lenders_operational_details_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "public"."hs_lenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_lenders_partnerships_details" ADD CONSTRAINT "hs_lenders_partnerships_details_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "public"."hs_lenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_lenders_system_tracking" ADD CONSTRAINT "hs_lenders_system_tracking_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "public"."hs_lenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products" ADD CONSTRAINT "hs_loan_products_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "public"."hs_lenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_application_and_processing" ADD CONSTRAINT "hs_loan_products_application_and_processing_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_collateral_and_security" ADD CONSTRAINT "hs_loan_products_collateral_and_security_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_competitive_analysis" ADD CONSTRAINT "hs_loan_products_competitive_analysis_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_eligibility_criteria" ADD CONSTRAINT "hs_loan_products_eligibility_criteria_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_financial_terms" ADD CONSTRAINT "hs_loan_products_financial_terms_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_geographic_coverage" ADD CONSTRAINT "hs_loan_products_geographic_coverage_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_performance_metrics" ADD CONSTRAINT "hs_loan_products_performance_metrics_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_repayment_terms" ADD CONSTRAINT "hs_loan_products_repayment_terms_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_special_features" ADD CONSTRAINT "hs_loan_products_special_features_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_system_integration" ADD CONSTRAINT "hs_loan_products_system_integration_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_loan_products_system_tracking" ADD CONSTRAINT "hs_loan_products_system_tracking_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."hs_loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "public"."hs_commission_settlements_commission_calculations" ADD CONSTRAINT "hs_commission_settlements_commission_calculations_settleme_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_communication" ADD CONSTRAINT "hs_commission_settlements_communication_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_tax_and_deductions" ADD CONSTRAINT "hs_commission_settlements_tax_and_deductions_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_documentation" ADD CONSTRAINT "hs_commission_settlements_documentation_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_hold_and_disputes" ADD CONSTRAINT "hs_commission_settlements_hold_and_disputes_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_loan_details" ADD CONSTRAINT "hs_commission_settlements_loan_details_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_payment_processing" ADD CONSTRAINT "hs_commission_settlements_payment_processing_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_performance_analytics" ADD CONSTRAINT "hs_commission_settlements_performance_analytics_settlement_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_reconciliations" ADD CONSTRAINT "hs_commission_settlements_reconciliations_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_settlement_status" ADD CONSTRAINT "hs_commission_settlements_settlement_status_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_system_tracking" ADD CONSTRAINT "hs_commission_settlements_system_tracking_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hs_commission_settlements_transaction_details" ADD CONSTRAINT "hs_commission_settlements_transaction_details_settlement_i_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."hs_commission_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mkt_eligibility_checker_leads" ADD CONSTRAINT "mkt_eligibility_checker_leads_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."hs_edumate_contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mkt_emi_calculator_leads" ADD CONSTRAINT "mkt_emi_calculator_leads_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."hs_edumate_contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."enum_values" ADD CONSTRAINT "enum_values_enumMappingId_fkey" FOREIGN KEY ("enumMappingId") REFERENCES "public"."enum_mappings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."field_mappings" ADD CONSTRAINT "field_mappings_enumMapId_fkey" FOREIGN KEY ("enumMapId") REFERENCES "public"."enum_mappings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

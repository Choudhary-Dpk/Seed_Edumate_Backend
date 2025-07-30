import { EMAIL_TEMPLATES } from "../config/email-config";
import { EligibilityResult, PersonalInfo, FormData, EmailData } from "../types/email.types";

/**
 * Creates a standardized info item for the application summary
 */
export const createInfoItem = (label: string, value: string | undefined | null): string => {
  if (!value) return '';
  return `
    <tr>
      <td style="background: #f8fafc; border-radius: 8px; padding: 12px; margin-bottom: 8px; display: block;">
        <div style="font-size: 11px; color: #64748b; margin-bottom: 4px; font-family: Arial, sans-serif;">
          ${label}
        </div>
        <div style="font-size: 14px; font-weight: 500; color: #1e293b; font-family: Arial, sans-serif;">
          ${value}
        </div>
      </td>
    </tr>
    <tr><td style="height: 8px;"></td></tr>
  `;
};

/**
 * Generates test scores section from exam data
 */
export const generateTestScores = (examData: { [key: string]: any } | undefined): string => {
  if (!examData || Object.keys(examData).length === 0) return '';
  
  let testScoresHTML = '';
  Object.entries(examData).forEach(([examName, examInfo]) => {
    if (examInfo?.score) {
      testScoresHTML += createInfoItem(examName, examInfo.score);
    }
  });
  return testScoresHTML;
};

/**
 * Generates the status banner section (eligible/non-eligible)
 */
export const generateStatusBanner = (eligibilityResult?: EligibilityResult): string => {
  if (!eligibilityResult) return '';

  const isEligible = eligibilityResult.isEligible;

  // Non-eligible user banner
  if (!isEligible) {
    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
        <tr>
          <td>
            <table width="100%" cellpadding="24" cellspacing="0" style="background: linear-gradient(135deg, #64748b 0%, #475569 100%); border-radius: 16px; box-shadow: 0 10px 25px rgba(100, 116, 139, 0.3); border: 1px solid #94a3b8;">
              <tr>
                <td>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align: top;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding-right: 16px; vertical-align: top;">
                              <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.15); border-radius: 12px; text-align: center; line-height: 48px; font-size: 24px; border: 1px solid rgba(255,255,255,0.2);">
                                ⚠️
                              </div>
                            </td>
                            <td style="vertical-align: top;">
                              <h2 style="margin: 0; font-size: 28px; font-weight: bold; color: white; font-family: Arial, sans-serif;">
                                Not Eligible at This Time
                              </h2>
                              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-family: Arial, sans-serif;">
                                Your application has been received, but you don't meet the current eligibility criteria
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="text-align: right; vertical-align: top;">
                        <div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 16px; text-align: center; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1);">
                          <div style="font-size: 18px; font-weight: bold; color: white; font-family: Arial, sans-serif;">
                            Application Received
                          </div>
                          <div style="font-size: 14px; color: rgba(255,255,255,0.8); margin-top: 4px; font-family: Arial, sans-serif;">
                            We'll review your case
                          </div>
                          <div style="margin-top: 8px;">
                            <span style="background: rgba(255,255,255,0.15); border-radius: 20px; padding: 4px 8px; font-size: 11px; color: white; font-family: Arial, sans-serif; border: 1px solid rgba(255,255,255,0.2);">
                              📋 Under Review
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  }

  // Eligible user banner
  const baseLoanAmount = eligibilityResult.data?.base_loan_amount;
  const destinationLoanAmount = eligibilityResult.data?.study_destination_loan_amount;

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td>
          <table width="100%" cellpadding="24" cellspacing="0" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);">
            <tr>
              <td>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align: top;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-right: 16px; vertical-align: top;">
                            <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; text-align: center; line-height: 48px; font-size: 24px;">
                              🏆
                            </div>
                          </td>
                          <td style="vertical-align: top;">
                            <h2 style="margin: 0; font-size: 28px; font-weight: bold; color: white; font-family: Arial, sans-serif;">
                              Congratulations!
                            </h2>
                            <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-family: Arial, sans-serif;">
                              Your education loan has been pre-approved
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                    ${(baseLoanAmount || destinationLoanAmount) ? `
                    <td style="text-align: right; vertical-align: top;">
                      <div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 16px; text-align: center; backdrop-filter: blur(10px);">
                        ${baseLoanAmount ? `
                          <div style="margin-bottom: 12px;">
                            <div style="font-size: 24px; font-weight: bold; color: white; font-family: Arial, sans-serif;">
                              ${baseLoanAmount}
                            </div>
                            <div style="font-size: 12px; color: rgba(255,255,255,0.8); font-family: Arial, sans-serif;">
                              Base Amount
                            </div>
                          </div>
                        ` : ''}
                        ${destinationLoanAmount && destinationLoanAmount !== baseLoanAmount ? `
                          <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 8px;">
                            <div style="font-size: 18px; font-weight: 600; color: white; font-family: Arial, sans-serif;">
                              ${destinationLoanAmount}
                            </div>
                            <div style="font-size: 11px; color: rgba(255,255,255,0.7); font-family: Arial, sans-serif;">
                              Study Destination Amount
                            </div>
                          </div>
                        ` : ''}
                        <div style="margin-top: 8px;">
                          <span style="background: rgba(255,255,255,0.2); border-radius: 20px; padding: 4px 8px; font-size: 11px; color: white; font-family: Arial, sans-serif;">
                            ✨ Ready to proceed
                          </span>
                        </div>
                      </div>
                    </td>
                    ` : ''}
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

/**
 * Generates the "What This Means" information section for non-eligible users
 */
export const generateWhatThisMeansSection = (): string => {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); padding: 16px; border-bottom: 1px solid #e2e8f0; border-radius: 16px 16px 0 0;">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right: 8px; vertical-align: middle;">
                      <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #64748b 0%, #475569 100%); border-radius: 6px; text-align: center; line-height: 24px; font-size: 12px;">
                        ⚠️
                      </div>
                    </td>
                    <td style="vertical-align: middle;">
                      <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #475569; font-family: Arial, sans-serif;">
                        What This Means
                      </h4>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding: 16px;">
                <div style="font-size: 14px; color: #374151; line-height: 1.6; font-family: Arial, sans-serif;">
                  <p style="margin: 0 0 12px 0; display: flex; align-items: flex-start;">
                    <span style="color: #64748b; margin-right: 8px; margin-top: 2px;">•</span>
                    <span>Your application has been successfully submitted and saved in our system.</span>
                  </p>
                  <p style="margin: 0 0 12px 0; display: flex; align-items: flex-start;">
                    <span style="color: #64748b; margin-right: 8px; margin-top: 2px;">•</span>
                    <span>Based on current criteria, you don't meet the immediate eligibility requirements.</span>
                  </p>
                  <p style="margin: 0 0 12px 0; display: flex; align-items: flex-start;">
                    <span style="color: #64748b; margin-right: 8px; margin-top: 2px;">•</span>
                    <span>Our team will review your application and may contact you with alternative options.</span>
                  </p>
                  <p style="margin: 0; display: flex; align-items: flex-start;">
                    <span style="color: #64748b; margin-right: 8px; margin-top: 2px;">•</span>
                    <span>Eligibility criteria can change, so feel free to reapply in the future.</span>
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

/**
 * Generates the quick actions section
 */
export const generateQuickActions = (): string => {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); padding: 16px; border-bottom: 1px solid #e2e8f0; border-radius: 16px 16px 0 0;">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right: 8px; vertical-align: middle;">
                      <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 6px; text-align: center; line-height: 24px; font-size: 12px;">
                        ✨
                      </div>
                    </td>
                    <td style="vertical-align: middle;">
                      <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #1e293b; font-family: Arial, sans-serif;">
                        Quick Actions
                      </h4>
                      <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b; font-family: Arial, sans-serif;">
                        Take the next step
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding: 16px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="48%" style="padding-right: 8px;">
                      <a href="${EMAIL_TEMPLATES.links.contactTeam}" style="display: block; text-decoration: none; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 12px 16px; border-radius: 12px; text-align: center; font-weight: 600; font-size: 14px; font-family: Arial, sans-serif; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);">
                        💬 Contact Our Team
                      </a>
                    </td>
                    <td width="48%" style="padding-left: 8px;">
                      <a href="${EMAIL_TEMPLATES.links.checkEligibility}" style="display: block; text-decoration: none; border: 2px solid #e2e8f0; color: #3b82f6; padding: 10px 16px; border-radius: 12px; text-align: center; font-weight: 600; font-size: 14px; font-family: Arial, sans-serif; background: white;">
                        🔄 Check Loan Eligibility Again
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

/**
 * Generates personal information section for application summary
 */
export const generatePersonalInfoSection = (personalInfo: PersonalInfo, formdata: FormData): string => {
  return `
    <td width="32%" style="vertical-align: top; padding-right: 16px;">
      <h4 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #3b82f6; font-family: Arial, sans-serif; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
        🔸 Personal Information
      </h4>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${createInfoItem('Full Name', personalInfo?.name)}
        ${createInfoItem('Email Address', personalInfo?.email)}
        ${createInfoItem('Phone Number', personalInfo?.phone)}
        ${createInfoItem('Study Destination', formdata?.countryOfStudy)}
      </table>
    </td>
  `;
};

/**
 * Generates education and loan details section for application summary
 */
export const generateEducationLoanSection = (formdata: FormData): string => {
  // Generate test scores
  const analyticalScores = generateTestScores(formdata?.analyticalExam);
  const languageScores = generateTestScores(formdata?.languageExam);

  return `
    <td width="32%" style="vertical-align: top; padding: 0 8px;">
      <h4 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #3b82f6; font-family: Arial, sans-serif; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
        🔸 Education & Loan Details
      </h4>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${createInfoItem('Education Level', formdata?.levelOfEducation)}
        ${createInfoItem('Course Type', formdata?.courseType)}
        ${createInfoItem('Requested Amount', formdata?.loanAmount)}
        ${createInfoItem('Loan Preference', formdata?.loanPreference)}
        ${createInfoItem('Intake Period', (formdata?.intakeMonth && formdata?.intakeYear) ? `${formdata.intakeMonth} ${formdata.intakeYear}` : undefined)}
        ${analyticalScores}
        ${languageScores}
      </table>
    </td>
  `;
};

/**
 * Generates co-applicant information section for application summary
 */
export const generateCoApplicantSection = (formdata: FormData): string => {
  const hasCoApplicantData = formdata?.coApplicant || 
                           formdata?.coApplicantIncomeType || 
                           formdata?.coApplicantAnnualIncome;

  const coApplicantContent = hasCoApplicantData ? `
    ${createInfoItem('Co-Applicant', formdata?.coApplicant)}
    ${createInfoItem('Income Type', formdata?.coApplicantIncomeType)}
    ${createInfoItem('Annual Income', formdata?.coApplicantAnnualIncome)}
  ` : `
    <tr>
      <td style="background: #f8fafc; border-radius: 8px; padding: 12px; text-align: center;">
        <span style="font-size: 11px; color: #64748b; font-family: Arial, sans-serif;">
          No co-applicant information provided
        </span>
      </td>
    </tr>
  `;

  return `
    <td width="32%" style="vertical-align: top; padding-left: 16px;">
      <h4 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #3b82f6; font-family: Arial, sans-serif; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
        🔸 Co-Applicant Information
      </h4>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${coApplicantContent}
      </table>
    </td>
  `;
};

/**
 * Generates the complete application summary section
 */
export const generateApplicationSummary = (personalInfo: PersonalInfo, formdata: FormData): string => {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); padding: 16px; border-bottom: 1px solid #e2e8f0; border-radius: 16px 16px 0 0;">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right: 12px; vertical-align: middle;">
                      <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">
                        👤
                      </div>
                    </td>
                    <td style="vertical-align: middle;">
                      <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b; font-family: Arial, sans-serif;">
                        Application Summary
                      </h3>
                      <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b; font-family: Arial, sans-serif;">
                        Complete details of your loan application
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    ${generatePersonalInfoSection(personalInfo, formdata)}
                    ${generateEducationLoanSection(formdata)}
                    ${generateCoApplicantSection(formdata)}
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

/**
 * Main function to generate complete email HTML
 */
export const generateLoanApplicationEmail = (data: EmailData): string => {
  const {
    personalInfo,
    formdata,
    eligibilityResult,
  } = data;

  const companyName = "Edumate"
  const isEligible = eligibilityResult?.isEligible || false;
  const isNotEligible = eligibilityResult && !eligibilityResult.isEligible;
  
  // Generate email sections
  const statusBanner = generateStatusBanner(eligibilityResult);
  const whatThisMeansSection = isNotEligible ? generateWhatThisMeansSection() : '';
  const quickActions = generateQuickActions();
  const applicationSummary = generateApplicationSummary(personalInfo, formdata);

  // Generate greeting message based on eligibility status
  const greetingMessage = isEligible 
    ? 'Great news! Your loan application has been processed and you\'re eligible for pre-approval.' 
    : isNotEligible 
      ? 'Thank you for submitting your loan application. While you don\'t meet the current eligibility criteria, we\'ve received your information and our team will review your case.'
      : 'Thank you for submitting your loan application. Here\'s a summary of the information we received.';

  // Generate closing message based on eligibility status
  const closingMessage = isEligible 
    ? 'Our team will contact you within 24 hours to proceed with the next steps.' 
    : isNotEligible
      ? 'Our team will review your application and may contact you with alternative options or if eligibility criteria change.'
      : 'Our team will review your application and get back to you soon with the next steps.';

  const closingSubMessage = isNotEligible 
    ? 'Eligibility criteria can change, so feel free to reapply in the future. If you have any questions, feel free to reach out to our support team.'
    : 'If you have any questions, feel free to reach out to our support team.';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Loan Application Update - ${companyName}</title>
      <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc; }
        .email-container { max-width: 800px; margin: 0 auto; background: white; }
        @media only screen and (max-width: 600px) {
          .email-container { width: 100% !important; }
          td[width="32%"] { width: 100% !important; display: block !important; padding: 0 0 16px 0 !important; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white;">
          <tr>
            <td style="padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; font-family: Arial, sans-serif;">
                ${companyName}
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9; font-family: Arial, sans-serif;">
                Education Loan Application Update
              </p>
            </td>
          </tr>
        </table>

        <!-- Main Content -->
        <table width="100%" cellpadding="24" cellspacing="0">
          <tr>
            <td>
              <!-- Greeting -->
              <div style="margin-bottom: 24px;">
                <h2 style="margin: 0 0 8px 0; font-size: 24px; color: #1e293b; font-family: Arial, sans-serif;">
                  Hello ${personalInfo?.name || 'Valued Customer'},
                </h2>
                <p style="margin: 0; font-size: 16px; color: #64748b; line-height: 1.6; font-family: Arial, sans-serif;">
                  ${greetingMessage}
                </p>
              </div>

              <!-- Status Banner -->
              ${statusBanner}

              <!-- What This Means Section (only for non-eligible users) -->
              ${whatThisMeansSection}

              <!-- Quick Actions -->
              ${quickActions}

              <!-- Application Summary -->
              ${applicationSummary}

              <!-- Closing Message -->
              <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 16px; color: #1e293b; font-family: Arial, sans-serif;">
                  ${closingMessage}
                </p>
                <p style="margin: 12px 0 0 0; font-size: 14px; color: #64748b; font-family: Arial, sans-serif;">
                  ${closingSubMessage}
                </p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="24" cellspacing="0" style="background: #1e293b; color: white;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; font-family: Arial, sans-serif;">
                © 2025 ${companyName}. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 12px; opacity: 0.8; font-family: Arial, sans-serif;">
                This email was sent regarding your loan application. Please do not reply to this email.
              </p>
              <div style="margin-top: 16px;">
                <a href="#" style="color: #60a5fa; text-decoration: none; font-size: 12px; margin: 0 8px; font-family: Arial, sans-serif;">Privacy Policy</a>
                <a href="#" style="color: #60a5fa; text-decoration: none; font-size: 12px; margin: 0 8px; font-family: Arial, sans-serif;">Terms of Service</a>
                <a href="#" style="color: #60a5fa; text-decoration: none; font-size: 12px; margin: 0 8px; font-family: Arial, sans-serif;">Contact Support</a>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;
};
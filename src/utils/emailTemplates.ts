import { config } from "../config/config";
import { EMAIL_TEMPLATES } from "../config/email-config";
import { EligibilityResult, PersonalInfo, FormData, EmailData } from "../types/email.types";

const edumateLogo = config?.edumate?.logo;

/**
 * Creates a standardized info item for the application summary (2-column layout within sections)
 */
export const createInfoItem = (label: string, value: string | undefined | null, isLeft: boolean = true): string => {
  if (!value) return '';
  return `
    <td width="48%" style="vertical-align: top; padding: ${isLeft ? '0 8px 0 0' : '0 0 0 8px'};">
      <div style="background: #ffffff; border-radius: 8px; padding: 16px; margin-bottom: 12px; border: 1px solid #e0f2fe; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div style="font-size: 11px; color: #64748b; margin-bottom: 6px; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
          ${label}
        </div>
        <div style="font-size: 15px; font-weight: 600; color: #0f172a; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.4; word-break: break-all;">
          ${value}
        </div>
      </div>
    </td>
  `;
};

/**
 * Creates a single column info item for odd items
 */
export const createSingleInfoItem = (label: string, value: string | undefined | null): string => {
  if (!value) return '';
  return `
    <tr>
      <td colspan="2" style="padding: 0;">
        <div style="background: #ffffff; border-radius: 8px; padding: 16px; margin-bottom: 12px; border: 1px solid #e0f2fe; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            ${label}
          </div>
          <div style="font-size: 15px; font-weight: 600; color: #0f172a; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.4; word-break: break-all;">
            ${value}
          </div>
        </div>
      </td>
    </tr>
  `;
};

/**
 * Generates test scores section from exam data (2-column layout)
 */
export const generateTestScores = (examData: { [key: string]: any } | undefined): string => {
  if (!examData || Object.keys(examData).length === 0) return '';
  
  const scores = Object.entries(examData).filter(([_, examInfo]) => examInfo?.score);
  let testScoresHTML = '';
  
  for (let i = 0; i < scores.length; i += 2) {
    const [examName1, examInfo1] = scores[i];
    const [examName2, examInfo2] = scores[i + 1] || [null, null];
    
    testScoresHTML += `
      <tr>
        ${createInfoItem(examName1, examInfo1.score, true)}
        ${examInfo2 ? createInfoItem(examName2, examInfo2.score, false) : '<td width="48%"></td>'}
      </tr>
    `;
  }
  
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
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
        <tr>
          <td>
            <div style="background: #ffffff; border-radius: 12px; border: 1px solid #e0f2fe; box-shadow: 0 4px 16px rgba(0,0,0,0.08); overflow: hidden;">
              <div style="background: linear-gradient(135deg, rgba(222, 156, 111, 0.12) 0%, rgba(102, 153, 220, 0.59) 100%); padding: 20px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <!-- <td style="width: 48px; vertical-align: top; padding-right: 16px;">
                      <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                    </td> -->
                    <td style="vertical-align: top;">
                      <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #b8601f; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.3;">
                        Application Under Review
                      </h2>
                      <p style="margin: 0 0 16px 0; color: #453c36ff; font-size: 15px; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.5; font-weight: 400;">
                        Your application doesn't meet current eligibility criteria, but we're reviewing your profile for alternative options.
                      </p>
                      <div style="display: inline-flex; align-items: center; background: rgba(255,255,255,0.2); color: #b8601f; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; backdrop-filter: blur(10px);">
                        UNDER REVIEW
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </td>
        </tr>
      </table>
    `;
  }

  // Eligible user banner
  const baseLoanAmount = eligibilityResult.data?.base_loan_amount;
  const destinationLoanAmount = eligibilityResult.data?.study_destination_loan_amount;

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px; box-shadow: 10px 10px 16px rgba(0, 0, 0, 0.08);">
      <tr>
        <td>
          <div style="background: #ffffff; border-radius: 12px; border: 1px solid #e0f2fe; box-shadow: 0 4px 16px rgba(0,0,0,0.08); overflow: hidden;">
            <div style="background: linear-gradient(135deg, rgba(222, 156, 111, 0.12) 0%, rgba(102, 153, 220, 0.59) 100%); padding: 20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                 <!-- <td style="width: 48px; vertical-align: top; padding-right: 16px;">
                    <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  </td>  -->
                  <td style="vertical-align: top;">
                    <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #b8601f; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.3;">
                      🎉 Pre-Approval Confirmed
                    </h2>
                    <p style="margin: 0 0 16px 0; color: #453c36ff; font-size: 15px; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.5; font-weight: 400;">
                      Your education loan has been pre-approved with competitive rates
                    </p>
                    <div style="display: inline-flex; background: rgba(255,255,255,0.2); color: #b8601f; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; backdrop-filter: blur(10px); align-items: center;">
                      ✅ PRE-APPROVED
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            ${(baseLoanAmount || destinationLoanAmount) ? `
            <div style="background: linear-gradient(135deg, #05966980 0%, #22c55e82 100% 100%); padding: 24px; border-top: 1px solid #e0f2fe;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  ${baseLoanAmount ? `
                  <td style="text-align: center; ${destinationLoanAmount && destinationLoanAmount !== baseLoanAmount ? 'border-right: 1px solid #e0f2fe; padding-right: 24px;' : ''}">
                    <div style="font-size: 28px; font-weight: 800; color: #0f172a; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;">
                      ${baseLoanAmount}
                    </div>
                    <div style="font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 2px; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;">
                      Base Amount
                    </div>
                  </td>
                  ` : ''}
                  ${destinationLoanAmount && destinationLoanAmount !== baseLoanAmount ? `
                  <td style="text-align: center; padding-left: 24px;">
                    <div style="font-size: 28px; font-weight: 800; color: #0f172a; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;">
                      ${destinationLoanAmount}
                    </div>
                    <div style="font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 2px; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;">
                      Study Destination
                    </div>
                  </td>
                  ` : ''}
                </tr>
              </table>
            </div>
            ` : ''}
          </div>
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
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
      <tr>
        <td>
          <div style="background: #ffffff; border-radius: 12px; border: 1px solid #e0f2fe; box-shadow: 0 4px 16px rgba(0,0,0,0.08); overflow: hidden;">
            <div style="background: linear-gradient(135deg, rgba(222, 156, 111, 0.12) 0%, rgba(102, 153, 220, 0.59) 100%); padding: 16px 20px;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #b8601f; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;">
                What happens next?
              </h3>
            </div>
            <div style="padding: 24px;">
              <div style="space-y: 16px;">
                <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                  <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; margin-top: 6px; margin-right: 12px; flex-shrink: 0;"></div>
                  <p style="margin: 0; font-size: 14px; color: #374151; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; font-weight: 500;">
                    Your application has been successfully received and documented in our system
                  </p>
                </div>
                <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                  <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; margin-top: 6px; margin-right: 12px; flex-shrink: 0;"></div>
                  <p style="margin: 0; font-size: 14px; color: #374151; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; font-weight: 500;">
                    Our underwriting team will review your profile for alternative loan products
                  </p>
                </div>
                <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                  <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; margin-top: 6px; margin-right: 12px; flex-shrink: 0;"></div>
                  <p style="margin: 0; font-size: 14px; color: #374151; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; font-weight: 500;">
                    We may contact you within 5-7 business days with additional options
                  </p>
                </div>
                <div style="display: flex; align-items: flex-start;">
                  <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; margin-top: 6px; margin-right: 12px; flex-shrink: 0;"></div>
                  <p style="margin: 0; font-size: 14px; color: #374151; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; font-weight: 500;">
                    You're welcome to reapply as eligibility criteria may change periodically
                  </p>
                </div>
              </div>
            </div>
          </div>
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
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
      <tr>
        <td>
          <div style="background: #ffffff; border-radius: 12px; border: 1px solid #e0f2fe; box-shadow: 0 4px 16px rgba(0,0,0,0.08); overflow: hidden;">
            <div style="background: linear-gradient(135deg, rgba(222, 156, 111, 0.12) 0%, rgba(102, 153, 220, 0.59) 100%); padding: 16px 20px;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #b8601f; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;">
                Quick Actions
              </h3>
            </div>
            <div style="padding: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="padding-right: 8px;">
                    <a href="${EMAIL_TEMPLATES.links.contactTeam}" style="display: block; text-align: center; background: #244780; color: #ffffff; padding: 14px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);">
                      💬 Contact Our Team
                    </a>
                  </td>
                  <td width="48%" style="padding-left: 8px;">
                    <a href="${EMAIL_TEMPLATES.links.checkEligibility}" style="display: block; text-align: center; background: #244780; color: #ffffff; padding: 14px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);">
                      🔄 Check Eligibility Again
                    </a>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </td>
      </tr>
    </table>
  `;
};

/**
 * Generates personal information section (2-column layout within the section)
 */
export const generatePersonalInfoSection = (personalInfo: PersonalInfo, formdata: FormData): string => {
  const items = [
    { label: 'Full Name', value: personalInfo?.name },
    { label: 'Email Address', value: personalInfo?.email },
    { label: 'Phone Number', value: personalInfo?.phone },
    { label: 'Study Destination', value: formdata?.countryOfStudy }
  ].filter(item => item.value);

  let itemsHTML = '';
  for (let i = 0; i < items.length; i += 2) {
    const item1 = items[i];
    const item2 = items[i + 1];
    
    itemsHTML += `
      <tr>
        ${createInfoItem(item1.label, item1.value, true)}
        ${item2 ? createInfoItem(item2.label, item2.value, false) : '<td width="48%"></td>'}
      </tr>
    `;
  }

  return `
    <div style="background: #ffffff; border-radius: 12px; border: 1px solid #e0f2fe; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; margin-bottom: 24px;">
      <div style="background: linear-gradient(135deg, rgba(222, 156, 111, 0.12) 0%, rgba(102, 153, 220, 0.59) 100%); padding: 16px 20px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 700; color: #b8601f; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;">
          Personal Information
        </h4>
      </div>
      <div style="padding: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${itemsHTML}
        </table>
      </div>
    </div>
  `;
};

/**
 * Generates education and loan details section (2-column layout within the section)
 */
export const generateEducationLoanSection = (formdata: FormData): string => {
  const basicItems = [
    { label: 'Education Level', value: formdata?.levelOfEducation },
    { label: 'Course Type', value: formdata?.courseType },
    { label: 'Requested Amount', value: formdata?.loanAmount },
    { label: 'Loan Preference', value: formdata?.loanPreference },
    { label: 'Intake Period', value: (formdata?.intakeMonth && formdata?.intakeYear) ? `${formdata.intakeMonth} ${formdata.intakeYear}` : undefined }
  ].filter(item => item.value);

  let basicItemsHTML = '';
  for (let i = 0; i < basicItems.length; i += 2) {
    const item1 = basicItems[i];
    const item2 = basicItems[i + 1];
    
    basicItemsHTML += `
      <tr>
        ${createInfoItem(item1.label, item1.value, true)}
        ${item2 ? createInfoItem(item2.label, item2.value, false) : '<td width="48%"></td>'}
      </tr>
    `;
  }

  // Generate test scores (2-column layout)
  const testScoresHTML = generateTestScores(formdata?.analyticalExam) + generateTestScores(formdata?.languageExam);

  return `
    <div style="background: #ffffff; border-radius: 12px; border: 1px solid #e0f2fe; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; margin-bottom: 24px;">
      <div style="background: linear-gradient(135deg, rgba(222, 156, 111, 0.12) 0%, rgba(102, 153, 220, 0.59) 100%); padding: 16px 20px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 700; color: #b8601f; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;">
          Education & Loan Details
        </h4>
      </div>
      <div style="padding: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${basicItemsHTML}
          ${testScoresHTML}
        </table>
      </div>
    </div>
  `;
};

/**
 * Generates co-applicant information section (2-column layout within the section)
 */
export const generateCoApplicantSection = (formdata: FormData): string => {
  const hasCoApplicantData = formdata?.coApplicant || 
                           formdata?.coApplicantIncomeType || 
                           formdata?.coApplicantAnnualIncome;

  let coApplicantContent = '';
  
  if (hasCoApplicantData) {
    const items = [
      { label: 'Co-Applicant', value: formdata?.coApplicant },
      { label: 'Income Type', value: formdata?.coApplicantIncomeType },
      { label: 'Annual Income', value: formdata?.coApplicantAnnualIncome }
    ].filter(item => item.value);

    for (let i = 0; i < items.length; i += 2) {
      const item1 = items[i];
      const item2 = items[i + 1];
      
      coApplicantContent += `
        <tr>
          ${createInfoItem(item1.label, item1.value, true)}
          ${item2 ? createInfoItem(item2.label, item2.value, false) : '<td width="48%"></td>'}
        </tr>
      `;
    }
  } else {
    coApplicantContent = `
      <tr>
        <td colspan="2" style="padding: 0;">
          <div style="background: #ffffff; border-radius: 8px; padding: 24px; text-align: center; border: 1px solid #e0f2fe;">
            <div style="color: #64748b; font-size: 14px; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-style: italic;">
              No co-applicant information provided
            </div>
          </div>
        </td>
      </tr>
    `;
  }

  return `
    <div style="background: #ffffff; border-radius: 12px; border: 1px solid #e0f2fe; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; margin-bottom: 24px;">
      <div style="background: linear-gradient(135deg, rgba(222, 156, 111, 0.12) 0%, rgba(102, 153, 220, 0.59) 100%); padding: 16px 20px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 700; color: #b8601f; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;">
          Co-Applicant Information
        </h4>
      </div>
      <div style="padding: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${coApplicantContent}
        </table>
      </div>
    </div>
  `;
};

/**
 * Generates the complete application summary section (vertical stacking)
 */
export const generateApplicationSummary = (personalInfo: PersonalInfo, formdata: FormData): string => {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
      <tr>
        <td>
          <div style="background: #ffffff; border-radius: 12px; border: 1px solid #e0f2fe; box-shadow: 0 4px 16px rgba(0,0,0,0.08); overflow: hidden;">
            <div style="background: linear-gradient(135deg, rgba(222, 156, 111, 0.12) 0%, rgba(102, 153, 220, 0.59) 100%); padding: 20px 24px; color: #ffffff;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <!-- <td style="padding-right: 12px; vertical-align: middle;">
                    <div style="width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                  </td>  -->
                  <td style="vertical-align: middle;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #b8601f; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;">
                      Application Summary
                    </h3>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #453c36ff; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 400;">
                      Complete details of your loan application
                    </p>
                  </td>
                </tr>
              </table>
            </div>
            <div style="padding: 24px; background: #f0f9ff;">
              <!-- Personal Information Section -->
              ${generatePersonalInfoSection(personalInfo, formdata)}
              
              <!-- Education & Loan Details Section -->
              ${generateEducationLoanSection(formdata)}
              
              <!-- Co-Applicant Information Section -->
              ${generateCoApplicantSection(formdata)}
            </div>
          </div>
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
  const currentYear = new Date().getFullYear();
  
  // Generate email sections
  const statusBanner = generateStatusBanner(eligibilityResult);
  const whatThisMeansSection = isNotEligible ? generateWhatThisMeansSection() : '';
  const quickActions = generateQuickActions();
  const applicationSummary = generateApplicationSummary(personalInfo, formdata);

  // Generate greeting message based on eligibility status
  const greetingMessage = isEligible 
    ? 'Your loan application has been processed and we have an update regarding your eligibility status.' 
    : isNotEligible 
      ? 'Thank you for submitting your loan application. We have completed our initial review and wanted to provide you with an update.'
      : 'Thank you for submitting your loan application. We have received all your information and wanted to provide you with a summary.';

  // Generate closing message based on eligibility status
  const closingMessage = isEligible 
    ? 'Our loan specialists will contact you within the next 24 hours to discuss your pre-approval and guide you through the next steps.' 
    : isNotEligible
      ? 'While you don\'t currently meet our standard eligibility criteria, our team will continue to review your application for alternative options.'
      : 'Our underwriting team will review your application and contact you with a decision within 3-5 business days.';

  const closingSubMessage = isNotEligible 
    ? 'We encourage you to stay in touch as our lending criteria and available products are regularly updated.'
    : 'If you have any questions about your application or need immediate assistance, please don\'t hesitate to contact our support team.';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Loan Application Update - ${companyName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        body { 
          margin: 0; 
          padding: 0; 
          font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; 
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .email-container { 
          max-width: 700px; 
          margin: 0 auto; 
          background: #ffffff; 
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e0f2fe;
        }
        
        @media only screen and (max-width: 640px) {
          .email-container { 
            width: 100% !important; 
            margin: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            border: none !important;
          }
          
          .mobile-padding { 
            padding: 20px !important; 
          }
          
          .mobile-text { 
            font-size: 16px !important; 
          }
          
          td[width="48%"] {
            width: 100% !important;
            display: block !important;
            padding: 0 0 12px 0 !important;
          }
        }
      </style>
    </head>
    <body>
      <div style="padding: 32px 16px; min-height: 100vh;">
        <div class="email-container">
          <!-- Header with Logo -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background: linear-gradient(135deg, rgba(222, 156, 111, 0.12) 0%, rgba(102, 153, 220, 0.59) 100%); padding: 32px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align: middle;">
                      <!-- Logo Image -->
                      <img src="${edumateLogo}" alt="${companyName}" style="height: 48px; width: auto; display: block; filter: brightness(1.1);" />
                    </td>
                    <td style="text-align: right; vertical-align: middle;">
                      <div style="font-size: 13px; color: #0f172a; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 600;">
                        Education Loan Services
                      </div>
                      <div style="font-size: 11px; color: #0f172aae; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; margin-top: 2px;">
                        Your pathway to educational excellence
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Main Content -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td class="mobile-padding" style="padding: 40px; background: #f0f9ff;">
                <!-- Greeting -->
                <div style="margin-bottom: 32px;">
                  <h2 style="margin: 0 0 12px 0; font-size: 22px; color: #0f172a; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 700;">
                    Dear ${personalInfo?.name || 'Applicant'},
                  </h2>
                  <p class="mobile-text" style="margin: 0; font-size: 16px; color: #64748b; line-height: 1.6; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 400;">
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
                <!-- <div style="background: #ffffff; border: 1px solid #e0f2fe; border-radius: 12px; padding: 32px; text-align: center; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
                  <p style="margin: 0 0 16px 0; font-size: 16px; color: #0f172a; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 600; line-height: 1.5;">
                    ${closingMessage}
                  </p>
                  <p style="margin: 0; font-size: 15px; color: #64748b; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; font-weight: 500;">
                    ${closingSubMessage}
                  </p>
                </div> -->
              </td>
            </tr>
          </table>

          <!-- Footer -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background: linear-gradient(135deg, rgba(222, 156, 111, 0.12) 0%, rgba(102, 153, 220, 0.59) 100%); padding: 32px 40px;">
                <p style="margin: 0 0 16px 0; font-size: 13px; color: #0f172a; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 500;">
                  © ${currentYear} ${companyName}. All rights reserved.
                </p>
                <p style="margin: 0 0 20px 0; font-size: 12px; color: #0f172aae; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.5;">
                  This email was sent regarding your loan application. Please do not reply directly to this email.
                </p>
                <!-- <div>
                  <a href="#" style="color: rgba(255,255,255,0.8); text-decoration: none; font-size: 12px; margin: 0 12px; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 500;">Privacy Policy</a>
                  <span style="color: rgba(255,255,255,0.4); margin: 0 4px;">•</span>
                  <a href="#" style="color: rgba(255,255,255,0.8); text-decoration: none; font-size: 12px; margin: 0 12px; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 500;">Terms of Service</a>
                  <span style="color: rgba(255,255,255,0.4); margin: 0 4px;">•</span>
                  <a href="#" style="color: rgba(255,255,255,0.8); text-decoration: none; font-size: 12px; margin: 0 12px; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 500;">Contact Support</a>
                </div>  -->
              </td>
            </tr>
          </table>
        </div>
      </div>
    </body>
    </html>
  `;
};
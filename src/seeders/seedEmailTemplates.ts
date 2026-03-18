import prisma from "../config/prisma";

/**
 * Seeds all existing email templates into the email_templates table.
 *
 * Run: npx ts-node src/seeders/seedEmailTemplates.ts
 *
 * Templates are upserted by slug — safe to re-run without duplicates.
 */

interface TemplateSeed {
  slug: string;
  name: string;
  subject: string;
  html_content: string;
  variables: { name: string; description: string }[];
  category: "TRANSACTIONAL" | "NOTIFICATION" | "MARKETING" | "COMMISSION" | "DASHBOARD" | "LOAN";
}

const templates: TemplateSeed[] = [
  // =========================================================================
  // 1. SET PASSWORD
  // =========================================================================
  {
    slug: "set-password",
    name: "Set Password",
    subject: "Set Your Password",
    category: "TRANSACTIONAL",
    variables: [
      { name: "name", description: "Recipient's name" },
      { name: "set-password-url", description: "URL to set password" },
      { name: "currentYear", description: "Current year (auto-replaced)" },
    ],
    html_content: `<!DOCTYPE html><html><head><title>Set Password Email</title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style type="text/css">body,p,table,td{margin:0;padding:0}table{border-collapse:collapse}img{border:0;display:block;max-width:100%;height:auto}a{text-decoration:none}@media screen and (max-width:600px){.container{width:100%!important;padding:0!important}.inner-table{width:100%!important}.stack-column{display:block!important;width:100%!important;text-align:center!important}.stack-column img{margin:0 auto!important}.stack-text{text-align:center!important;padding-top:8px!important}.content{padding:24px 20px!important;font-size:15px!important;line-height:1.6!important}.btn{font-size:14px!important;padding:10px 16px!important;display:inline-block!important}.footer-text{font-size:12px!important}}</style></head><body style="background-color:#f9f9f9;font-family:Arial,sans-serif"><table class="container" cellpadding="0" cellspacing="0" align="center" style="width:600px;max-width:600px;margin:auto;background-color:#fff;border:1px solid #eee"><tbody><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px"><table width="100%" cellpadding="0" cellspacing="0" class="inner-table"><tr><td class="stack-column" style="vertical-align:middle"><img src="https://edumateglobal.com/images/logos/edumate-logos/edumate_logo.png" alt="edumate" class="logo-img" style="height:48px;width:auto;filter:brightness(1.1)"></td><td class="stack-column stack-text" style="text-align:right;vertical-align:middle"><div style="font-size:13px;color:#0f172a;font-weight:600">Education Loan Services</div><div style="font-size:11px;color:#0f172aae;margin-top:2px">Your pathway to educational excellence</div></td></tr></table></td></tr><tr><td><table width="100%" style="background:#fff"><tbody><tr><td><table width="100%" align="center" class="content" style="max-width:540px;margin:auto;color:#474d6a;line-height:1.5;padding:32px 28px"><tbody><tr style="padding:0 16px;margin:0 10px"><td style="font-size:16px;color:#474d6a"><p style="margin:0">Hello {%name%},</p><br><p style="margin:0">We have received a request to set the password for your account. To complete the process, please follow the link below:</p><br><p><a href="{%set-password-url%}" class="btn" style="display: block; text-align: center; background: #244780; color: #ffffff; padding: 14px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);">Set Password</a></p><br><p style="margin:0">Thank you for using our service.</p></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px"><p class="footer-text" style="margin:0 0 12px 0;font-size:13px;color:#0f172a;font-weight:500">&copy; {%currentYear%} Edumate. All rights reserved.</p><p style="margin:0;font-size:12px;color:#0f172aae;line-height:1.5">This email was sent regarding your loan application. Please do not reply directly to this email.</p></td></tr></tbody></table></body></html>`,
  },

  // =========================================================================
  // 2. OTP
  // =========================================================================
  {
    slug: "otp",
    name: "OTP Verification",
    subject: "Your OTP Code",
    category: "TRANSACTIONAL",
    variables: [
      { name: "name", description: "Recipient's name" },
      { name: "otp", description: "One-time password code" },
      { name: "currentYear", description: "Current year (auto-replaced)" },
    ],
    html_content: `<!DOCTYPE html><html><head><title>OTP Verification Email</title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style type="text/css">body,p,table,td{margin:0;padding:0}table{border-collapse:collapse}img{border:0;display:block;max-width:100%;height:auto}a{text-decoration:none}@media screen and (max-width:600px){.container{width:100%!important;padding:0!important}.inner-table{width:100%!important}.stack-column{display:block!important;width:100%!important;text-align:center!important}.stack-column img{margin:0 auto!important}.stack-text{text-align:center!important;padding-top:8px!important}.content{padding:24px 20px!important;font-size:15px!important;line-height:1.6!important}.otp-code{font-size:20px!important;padding:12px!important}.footer-text{font-size:12px!important}}</style></head><body style="background-color:#f9f9f9;font-family:Arial,sans-serif"><table class="container" cellpadding="0" cellspacing="0" align="center" style="width:600px;max-width:600px;margin:auto;background-color:#fff;border:1px solid #eee"><tbody><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px"><table width="100%" cellpadding="0" cellspacing="0" class="inner-table"><tr><td class="stack-column" style="vertical-align:middle"><img src="https://edumateglobal.com/images/logos/edumate-logos/edumate_logo.png" alt="edumate" class="logo-img" style="height:48px;width:auto;filter:brightness(1.1)"></td><td class="stack-column stack-text" style="text-align:right;vertical-align:middle"><div style="font-size:13px;color:#0f172a;font-weight:600">Education Loan Services</div><div style="font-size:11px;color:#0f172aae;margin-top:2px">Your pathway to educational excellence</div></td></tr></table></td></tr><tr><td><table width="100%" style="background:#fff"><tbody><tr><td><table width="100%" align="center" class="content" style="max-width:540px;margin:auto;color:#474d6a;line-height:1.5;padding:32px 28px"><tbody><tr style="padding:0 16px;margin:0 10px"><td style="font-size:16px;color:#474d6a"><p style="margin:0">Hello {%name%},</p><br><p style="margin:0">Use this OTP to login:</p><br><div style="text-align:center;margin:20px 0"><span class="otp-code" style="display:inline-block;background:#f8fafc;border:2px solid #244780;color:#244780;font-size:24px;font-weight:700;padding:16px 24px;border-radius:8px;letter-spacing:4px;font-family:monospace">{%otp%}</span></div><br><p style="margin:0">Thank you for using our service.</p></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px"><p class="footer-text" style="margin:0 0 12px 0;font-size:13px;color:#0f172a;font-weight:500">&copy; {%currentYear%} Edumate. All rights reserved.</p><p style="margin:0;font-size:12px;color:#0f172aae;line-height:1.5">This email was sent regarding your loan application. Please do not reply directly to this email.</p></td></tr></tbody></table></body></html>`,
  },

  // =========================================================================
  // 3. FORGOT PASSWORD
  // =========================================================================
  {
    slug: "forgot-password",
    name: "Forgot Password",
    subject: "Reset Your Password",
    category: "TRANSACTIONAL",
    variables: [
      { name: "name", description: "Recipient's name" },
      { name: "reset-password-url", description: "URL to reset password" },
      { name: "currentYear", description: "Current year (auto-replaced)" },
    ],
    html_content: `<!DOCTYPE html><html><head><title>Reset Password Email</title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style type="text/css">body,p,table,td{margin:0;padding:0}table{border-collapse:collapse}img{border:0;display:block;max-width:100%;height:auto}a{text-decoration:none}@media screen and (max-width:600px){.container{width:100%!important;padding:0!important}.inner-table{width:100%!important}.stack-column{display:block!important;width:100%!important;text-align:center!important}.stack-column img{margin:0 auto!important}.stack-text{text-align:center!important;padding-top:8px!important}.content{padding:24px 20px!important;font-size:15px!important;line-height:1.6!important}.btn{font-size:14px!important;padding:10px 16px!important;display:inline-block!important}.footer-text{font-size:12px!important}}</style></head><body style="background-color:#f9f9f9;font-family:Arial,sans-serif"><table class="container" cellpadding="0" cellspacing="0" align="center" style="width:600px;max-width:600px;margin:auto;background-color:#fff;border:1px solid #eee"><tbody><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px"><table width="100%" cellpadding="0" cellspacing="0" class="inner-table"><tr><td class="stack-column" style="vertical-align:middle"><img src="https://edumateglobal.com/images/logos/edumate-logos/edumate_logo.png" alt="edumate" class="logo-img" style="height:48px;width:auto;filter:brightness(1.1)"></td><td class="stack-column stack-text" style="text-align:right;vertical-align:middle"><div style="font-size:13px;color:#0f172a;font-weight:600">Education Loan Services</div><div style="font-size:11px;color:#0f172aae;margin-top:2px">Your pathway to educational excellence</div></td></tr></table></td></tr><tr><td><table width="100%" style="background:#fff"><tbody><tr><td><table width="100%" align="center" class="content" style="max-width:540px;margin:auto;color:#474d6a;line-height:1.5;padding:32px 28px"><tbody><tr style="padding:0 16px;margin:0 10px"><td style="font-size:16px;color:#474d6a"><p style="margin:0">Hello {%name%},</p><br><p style="margin:0">We have received a request to reset the password for your account. To complete the process, please follow the link below:</p><br><p><a href="{%reset-password-url%}" class="btn" style="display:block;text-align:center;background:#244780;color:#fff;padding:14px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 2px 8px rgba(59,130,246,.2)">Reset Password</a></p><br><p style="margin:0">Thank you for using our service.</p></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px"><p class="footer-text" style="margin:0 0 12px 0;font-size:13px;color:#0f172a;font-weight:500">&copy; {%currentYear%} Edumate. All rights reserved.</p><p style="margin:0;font-size:12px;color:#0f172aae;line-height:1.5">This email was sent regarding your loan application. Please do not reply directly to this email.</p></td></tr></tbody></table></body></html>`,
  },

  // =========================================================================
  // 4. SHOW INTEREST
  // =========================================================================
  {
    slug: "show-interest",
    name: "Show Interest - Thank You",
    subject: "Thank You for Your Interest",
    category: "MARKETING",
    variables: [
      { name: "name", description: "Recipient's name" },
      { name: "currentYear", description: "Current year (auto-replaced)" },
    ],
    html_content: `<!Doctype html><html><head><title>Thank You for Your Interest</title><meta charset=utf-8><meta content="width=device-width,initial-scale=1"name=viewport><style>body,p,table,td{margin:0;padding:0}table{border-collapse:collapse}img{border:0;display:block;max-width:100%;height:auto}a{text-decoration:none}@media screen and (max-width:600px){.container{width:100%!important;padding:0!important}.inner-table{width:100%!important}.stack-column{display:block!important;width:100%!important;text-align:center!important}.stack-column img{margin:0 auto!important}.stack-text{text-align:center!important;padding-top:8px!important}.content{padding:20px 16px!important}.content-text{font-size:15px!important;line-height:1.6!important}.btn{font-size:14px!important;padding:12px 20px!important;display:block!important;margin:16px 0!important}.feature-box{display:block!important;margin:12px 0!important;padding:14px!important}.feature-icon{margin:0 auto 8px auto!important;text-align:center!important}.feature-content{text-align:center!important}.highlight-box{padding:14px 16px!important;margin:16px 0!important}.footer-text{font-size:11px!important}h2{font-size:18px!important}}</style></head><body style=background-color:#f9f9f9;font-family:Arial,sans-serif><table cellpadding=0 cellspacing=0 class=container style="width:600px;max-width:100%;margin:auto;background-color:#fff;border:1px solid #eee"align=center><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px"><table width=100% cellpadding=0 cellspacing=0 class=inner-table><tr><td style=vertical-align:middle;width:50% class=stack-column><img alt=edumate class=logo-img src=https://edumateglobal.com/images/logos/edumate-logos/edumate_logo.png style=height:48px;width:auto;filter:brightness(1.1)><td style=text-align:right;vertical-align:middle;width:50% class="stack-column stack-text"><div style=font-size:13px;color:#0f172a;font-weight:600>Education Loan Services</div><div style=font-size:11px;color:#0f172aae;margin-top:2px>Your pathway to educational excellence</div></table><tr><td><table width=100% style=background:#fff><tr><td><table width=100% style="max-width:540px;margin:auto;padding:32px 28px"class=content align=center><tr><td style=font-size:16px;color:#474d6a;line-height:1.6 class=content-text><p style=margin:0>Dear {%name%},</p><br><h2 style="margin:0 0 16px 0;font-size:20px;color:#1e293b;font-weight:600">Thank You for Your Interest!</h2><p style=margin:0>We truly appreciate you reaching out to us regarding education loan opportunities. Your aspiration to pursue higher education is commendable, and we're honored that you're considering Edumate to support your educational journey.</p><br><div style="background:linear-gradient(135deg,rgba(222,156,111,.08) 0,rgba(102,153,220,.35) 100%);border-left:4px solid #244780;padding:18px 20px;border-radius:8px;margin:20px 0"class=highlight-box><p style=margin:0;font-size:15px;color:#1e293b;font-weight:600;line-height:1.5>We're Here for You<p style="margin:10px 0 0 0;font-size:14px;color:#475569;line-height:1.6">We understand that financing your education is an important decision. Our dedicated team is committed to finding the best loan solution that fits your unique needs and circumstances.</div><h3 style="margin:24px 0 16px 0;font-size:17px;color:#1e293b;font-weight:600">Here's How We Can Help You:</h3><table width=100% cellpadding=0 cellspacing=0 style="margin:16px 0"><tr><td><table width=100% cellpadding=0 cellspacing=0 class=feature-box style="margin:12px 0;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0"><tr><td style=vertical-align:top;width:40px;padding-right:12px class=feature-icon><div style=width:32px;height:32px;background:#244780;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;line-height:32px;text-align:center>&#10003;</div><td style=vertical-align:top class=feature-content><p style=margin:0;font-weight:600;color:#1e293b;font-size:15px>Personalized Loan Guidance<p style="margin:6px 0 0 0;font-size:14px;color:#64748b;line-height:1.5">Our experts will understand your requirements and guide you to the most suitable loan options</table><table width=100% cellpadding=0 cellspacing=0 class=feature-box style="margin:12px 0;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0"><tr><td style=vertical-align:top;width:40px;padding-right:12px class=feature-icon><div style=width:32px;height:32px;background:#244780;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;line-height:32px;text-align:center>&#10003;</div><td style=vertical-align:top class=feature-content><p style=margin:0;font-weight:600;color:#1e293b;font-size:15px>Quick &amp; Hassle-Free Process<p style="margin:6px 0 0 0;font-size:14px;color:#64748b;line-height:1.5">Get your loan approved in as little as 48 hours with minimal documentation</table><table width=100% cellpadding=0 cellspacing=0 class=feature-box style="margin:12px 0;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0"><tr><td style=vertical-align:top;width:40px;padding-right:12px class=feature-icon><div style=width:32px;height:32px;background:#244780;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;line-height:32px;text-align:center>&#10003;</div><td style=vertical-align:top class=feature-content><p style=margin:0;font-weight:600;color:#1e293b;font-size:15px>Competitive Interest Rates<p style="margin:6px 0 0 0;font-size:14px;color:#64748b;line-height:1.5">Access attractive interest rates starting from 8.5% per annum with flexible repayment terms</table><table width=100% cellpadding=0 cellspacing=0 class=feature-box style="margin:12px 0;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0"><tr><td style=vertical-align:top;width:40px;padding-right:12px class=feature-icon><div style=width:32px;height:32px;background:#244780;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;line-height:32px;text-align:center>&#10003;</div><td style=vertical-align:top class=feature-content><p style=margin:0;font-weight:600;color:#1e293b;font-size:15px>End-to-End Support<p style="margin:6px 0 0 0;font-size:14px;color:#64748b;line-height:1.5">From application to disbursement, we'll be with you at every step of your loan journey</table></table><br><p style=margin:0>Thank you once again for choosing Edumate. We look forward to being part of your success story!</p><br><p style=margin:0>Warm regards,<p style="margin:8px 0 0 0"><b>Team Edumate</b><p style="margin:4px 0 0 0;font-size:14px;color:#64748b">Education Loan Services</table></table><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px"><p style="margin:0 0 12px 0;font-size:13px;color:#0f172a;font-weight:500"class=footer-text>&copy; {%currentYear%} Edumate. All rights reserved.<p style=margin:0;font-size:12px;color:#0f172aae;line-height:1.5>This email was sent regarding your loan inquiry. Please do not reply directly to this email. For assistance, please contact our support team.</table></body></html>`,
  },

  // =========================================================================
  // 5. PASSWORD RESET (inline from email.controller.ts)
  // =========================================================================
  {
    slug: "password-reset-simple",
    name: "Password Reset (Simple)",
    subject: "Password Reset Request",
    category: "TRANSACTIONAL",
    variables: [
      { name: "resetLink", description: "URL to reset password" },
    ],
    html_content: `<h1>Password Reset</h1><p>Click the link below to reset your password:</p><a href="{%resetLink%}">Reset Password</a><p>This link will expire in 1 hour.</p>`,
  },

  // =========================================================================
  // 6. DASHBOARD REPORT
  // =========================================================================
  {
    slug: "dashboard-report",
    name: "Partner Performance Dashboard Report",
    subject: "Your Performance Dashboard",
    category: "DASHBOARD",
    variables: [
      { name: "partnerName", description: "Partner's display name" },
      { name: "message", description: "Custom message from admin (optional)" },
      { name: "adminName", description: "Sender admin's name" },
      { name: "currentYear", description: "Current year (auto-replaced)" },
    ],
    html_content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Your Performance Dashboard</title></head><body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #f5f5f5;"><div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><div style="background: linear-gradient(135deg, #1e5fad 0%, #0f2744 100%); padding: 32px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Your Performance Dashboard</h1></div><div style="padding: 32px;"><p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 16px 0;">Dear <strong>{%partnerName%}</strong>,</p><div style="background: #f0f9ff; border-left: 4px solid #1e5fad; padding: 16px; margin: 24px 0; border-radius: 4px;"><p style="font-size: 15px; color: #0f2744; margin: 0; line-height: 1.6;">{%message%}</p></div><p style="font-size: 15px; color: #666; line-height: 1.6; margin: 16px 0;">Please find your performance dashboard report attached as a PDF. This report includes:</p><ul style="font-size: 15px; color: #666; line-height: 1.8; margin: 16px 0; padding-left: 24px;"><li>Key performance metrics</li><li>Application statistics</li><li>Conversion rates</li><li>Disbursement details</li></ul><p style="font-size: 15px; color: #666; line-height: 1.6; margin: 24px 0 16px 0;">If you have any questions about this report, please don't hesitate to reach out to our team.</p><p style="font-size: 14px; color: #999; margin: 24px 0 0 0; padding-top: 24px; border-top: 1px solid #eee;">Best regards,<br><strong style="color: #333;">{%adminName%}</strong><br>Edumate Global</p></div><div style="background: #f5f5f5; padding: 24px; text-align: center; border-top: 1px solid #e5e5e5;"><p style="font-size: 12px; color: #999; margin: 0 0 8px 0;">&copy; {%currentYear%} Edumate Global. All rights reserved.</p><p style="font-size: 12px; color: #999; margin: 0;">This is an automated report generated from your partner dashboard.</p></div></div></body></html>`,
  },

  // =========================================================================
  // 7. COMMISSION - FINANCE PARTNER ONBOARDED
  // =========================================================================
  {
    slug: "commission-finance-partner-onboarded",
    name: "Commission: New Partner Onboarded (Finance)",
    subject: "New Partner Onboarded - Action Required",
    category: "COMMISSION",
    variables: [
      { name: "partnerName", description: "Partner's name" },
      { name: "partnerType", description: "Partner type" },
      { name: "businessType", description: "Business type" },
      { name: "gstNumber", description: "GST number" },
      { name: "panNumber", description: "PAN number" },
      { name: "city", description: "City" },
      { name: "state", description: "State" },
      { name: "country", description: "Country" },
      { name: "isCommissionApplicable", description: "Commission applicable status" },
      { name: "contactEmail", description: "Contact email" },
      { name: "contactPhone", description: "Contact phone" },
      { name: "onboardedAt", description: "Onboarded date/time" },
    ],
    html_content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:30px 0;"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);"><tr><td style="background:linear-gradient(135deg,#1B4F72 0%,#2E86C1 100%);padding:28px 32px;"><h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">New Partner Onboarded</h1><p style="margin:6px 0 0;color:#D6EAF8;font-size:13px;">Action Required: Upload Bank Details in HubSpot</p></td></tr><tr><td style="padding:28px 32px;"><p style="margin:0 0 18px;color:#2C3E50;font-size:14px;line-height:1.6;">Hi Finance Team,</p><p style="margin:0 0 20px;color:#2C3E50;font-size:14px;line-height:1.6;">A new B2B partner has been onboarded. Please review their details and ensure bank information is uploaded in HubSpot for future commission payouts.</p><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F9FA;border:1px solid #E5E8EB;border-radius:8px;margin-bottom:20px;"><tr><td style="padding:18px 20px;"><h3 style="margin:0 0 14px;color:#1B4F72;font-size:15px;font-weight:600;border-bottom:1px solid #E5E8EB;padding-bottom:10px;">Partner Details</h3><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Partner Name</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-weight:600;">{%partnerName%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Partner Type</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%partnerType%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Business Type</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%businessType%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">GST Number</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%gstNumber%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">PAN Number</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%panNumber%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">City</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%city%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">State</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%state%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Country</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%country%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Commission Applicable</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%isCommissionApplicable%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Contact Email</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%contactEmail%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Contact Phone</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%contactPhone%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Onboarded At</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%onboardedAt%}</td></tr></table></td></tr></table></td></tr><tr><td style="background-color:#F8F9FA;padding:18px 32px;border-top:1px solid #E5E8EB;"><p style="margin:0;color:#7F8C8D;font-size:11px;text-align:center;">This is an automated notification from Edumate.<br/>Do not reply to this email. For queries, contact the team.<br/>&copy; {%currentYear%} Edumate. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`,
  },

  // =========================================================================
  // 8. COMMISSION - PARTNER COMMISSION CREATED
  // =========================================================================
  {
    slug: "commission-partner-created",
    name: "Commission: New Commission Entry (Partner)",
    subject: "New Commission Settlement Entry",
    category: "COMMISSION",
    variables: [
      { name: "recipientName", description: "Partner user's name" },
      { name: "settlementRefNumber", description: "Settlement reference number" },
      { name: "settlementMonth", description: "Settlement period month" },
      { name: "settlementYear", description: "Settlement period year" },
      { name: "studentName", description: "Student name" },
      { name: "studentId", description: "Student ID" },
      { name: "lenderName", description: "Lender name" },
      { name: "loanProductName", description: "Loan product name" },
      { name: "loanAmountDisbursed", description: "Disbursed amount (formatted)" },
      { name: "grossCommissionAmount", description: "Gross commission amount (formatted)" },
      { name: "commissionRate", description: "Commission rate %" },
      { name: "universityName", description: "University name" },
      { name: "courseName", description: "Course name" },
      { name: "destinationCountry", description: "Destination country" },
      { name: "currentYear", description: "Current year (auto-replaced)" },
    ],
    html_content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:30px 0;"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);"><tr><td style="background:linear-gradient(135deg,#27AE60 0%,#2ECC71 100%);padding:28px 32px;"><h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">New Commission Entry</h1><p style="margin:6px 0 0;color:#D5F5E3;font-size:13px;">A new disbursement entry is available for your review</p></td></tr><tr><td style="padding:28px 32px;"><p style="margin:0 0 18px;color:#2C3E50;font-size:14px;line-height:1.6;">Hi {%recipientName%},</p><p style="margin:0 0 20px;color:#2C3E50;font-size:14px;line-height:1.6;">A new commission settlement entry has been created for your review. Please log in to the partner portal to verify the details and proceed accordingly.</p><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0FFF4;border:1px solid #C6F6D5;border-radius:8px;margin-bottom:16px;"><tr><td style="padding:18px 20px;"><h3 style="margin:0 0 14px;color:#276749;font-size:15px;font-weight:600;border-bottom:1px solid #C6F6D5;padding-bottom:10px;">Settlement Summary</h3><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="180" style="padding:6px 0;color:#718096;font-size:13px;">Reference Number</td><td style="padding:6px 0;color:#2D3748;font-size:13px;font-family:monospace;">{%settlementRefNumber%}</td></tr><tr><td width="180" style="padding:6px 0;color:#718096;font-size:13px;">Settlement Period</td><td style="padding:6px 0;color:#2D3748;font-size:13px;">{%settlementMonth%} {%settlementYear%}</td></tr></table></td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F9FA;border:1px solid #E5E8EB;border-radius:8px;margin-bottom:16px;"><tr><td style="padding:18px 20px;"><h3 style="margin:0 0 14px;color:#1B4F72;font-size:15px;font-weight:600;border-bottom:1px solid #E5E8EB;padding-bottom:10px;">Disbursement Details</h3><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Student Name</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-weight:600;">{%studentName%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Student ID</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%studentId%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Lender</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%lenderName%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Loan Product</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%loanProductName%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Disbursed Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">{%loanAmountDisbursed%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">University</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%universityName%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Course</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%courseName%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Destination</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%destinationCountry%}</td></tr></table></td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#EBF8FF 0%,#DBEAFE 100%);border:1px solid #93C5FD;border-radius:8px;margin-bottom:20px;"><tr><td align="center" style="padding:20px;"><p style="margin:0 0 4px;color:#1E40AF;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Estimated Commission</p><p style="margin:0;color:#1E3A5F;font-size:28px;font-weight:700;">{%grossCommissionAmount%}</p><p style="margin:4px 0 0;color:#3B82F6;font-size:12px;">@ {%commissionRate%} commission rate</p></td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF7ED;border:1px solid #FDBA74;border-radius:8px;margin-bottom:20px;"><tr><td style="padding:16px 20px;"><h4 style="margin:0 0 8px;color:#9A3412;font-size:14px;">What to do next</h4><ol style="margin:0;padding:0 0 0 18px;color:#9A3412;font-size:13px;line-height:1.8;"><li>Log in to the partner portal</li><li>Review the disbursement entry (student name, amount, date)</li><li>Approve or raise an objection if any discrepancy found</li></ol></td></tr></table></td></tr><tr><td style="background-color:#F8F9FA;padding:18px 32px;border-top:1px solid #E5E8EB;"><p style="margin:0;color:#7F8C8D;font-size:11px;text-align:center;">This is an automated notification from Edumate.<br/>For support, reach out to your account manager.<br/>&copy; {%currentYear%} Edumate. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`,
  },

  // =========================================================================
  // 9. COMMISSION - OBJECTION RAISED
  // =========================================================================
  {
    slug: "commission-objection-raised",
    name: "Commission: Objection Raised",
    subject: "Objection Raised on Commission Settlement",
    category: "COMMISSION",
    variables: [
      { name: "settlementRefNumber", description: "Settlement reference" },
      { name: "partnerName", description: "Partner name" },
      { name: "studentName", description: "Student name" },
      { name: "lenderName", description: "Lender name" },
      { name: "loanAmountDisbursed", description: "Disbursed amount (formatted)" },
      { name: "grossCommissionAmount", description: "Commission amount (formatted)" },
      { name: "objectionReason", description: "Reason for objection" },
      { name: "triggeredByName", description: "User who raised objection" },
      { name: "currentYear", description: "Current year (auto-replaced)" },
    ],
    html_content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:30px 0;"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);"><tr><td style="background:linear-gradient(135deg,#DC2626 0%,#EF4444 100%);padding:28px 32px;"><h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">Objection Raised</h1><p style="margin:6px 0 0;color:#FEE2E2;font-size:13px;">A partner has disputed a commission settlement — Action Required</p></td></tr><tr><td style="padding:28px 32px;"><p style="margin:0 0 18px;color:#2C3E50;font-size:14px;line-height:1.6;">Hi Team,</p><p style="margin:0 0 20px;color:#2C3E50;font-size:14px;line-height:1.6;">A partner has raised an objection on a commission settlement. Please review the details and take appropriate action.</p><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FEF2F2;border:1px solid #FECACA;border-radius:8px;margin-bottom:16px;"><tr><td style="padding:18px 20px;"><h3 style="margin:0 0 14px;color:#991B1B;font-size:15px;font-weight:600;border-bottom:1px solid #FECACA;padding-bottom:10px;">Settlement Details</h3><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Reference</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-family:monospace;">{%settlementRefNumber%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Partner</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-weight:600;">{%partnerName%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Student</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%studentName%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Lender</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%lenderName%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Disbursed Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">{%loanAmountDisbursed%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Commission Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">{%grossCommissionAmount%}</td></tr></table></td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF7ED;border:1px solid #FDBA74;border-radius:8px;margin-bottom:16px;"><tr><td style="padding:18px 20px;"><h3 style="margin:0 0 10px;color:#9A3412;font-size:15px;font-weight:600;">Reason for Objection</h3><p style="margin:0;color:#2C3E50;font-size:14px;line-height:1.6;white-space:pre-wrap;">{%objectionReason%}</p><p style="margin:10px 0 0;color:#7F8C8D;font-size:12px;">Raised by: {%triggeredByName%}</p></td></tr></table></td></tr><tr><td style="background-color:#F8F9FA;padding:18px 32px;border-top:1px solid #E5E8EB;"><p style="margin:0;color:#7F8C8D;font-size:11px;text-align:center;">This is an automated notification from Edumate.<br/>Do not reply to this email. For queries, contact the team.<br/>&copy; {%currentYear%} Edumate. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`,
  },

  // =========================================================================
  // 10. COMMISSION - L1 APPROVED
  // =========================================================================
  {
    slug: "commission-l1-approved",
    name: "Commission: L1 Approved",
    subject: "Commission Settlement - L1 Approved",
    category: "COMMISSION",
    variables: [
      { name: "settlementRefNumber", description: "Settlement reference" },
      { name: "partnerName", description: "Partner name" },
      { name: "studentName", description: "Student name" },
      { name: "lenderName", description: "Lender name" },
      { name: "loanAmountDisbursed", description: "Disbursed amount (formatted)" },
      { name: "grossCommissionAmount", description: "Commission amount (formatted)" },
      { name: "approverName", description: "L1 approver name" },
      { name: "currentYear", description: "Current year (auto-replaced)" },
    ],
    html_content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:30px 0;"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);"><tr><td style="background:linear-gradient(135deg,#27AE60 0%,#2ECC71 100%);padding:28px 32px;"><h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">L1 Verification Complete — Awaiting Your Approval</h1><p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Approved by {%approverName%}</p></td></tr><tr><td style="padding:28px 32px;"><p style="margin:0 0 18px;color:#2C3E50;font-size:14px;line-height:1.6;">Hi Team,</p><p style="margin:0 0 20px;color:#2C3E50;font-size:14px;line-height:1.6;">This settlement has passed L1 verification and requires your final approval to proceed with payment.</p><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F9FA;border:1px solid #E5E8EB;border-radius:8px;margin-bottom:16px;"><tr><td style="padding:18px 20px;"><h3 style="margin:0 0 14px;color:#1B4F72;font-size:15px;font-weight:600;border-bottom:1px solid #E5E8EB;padding-bottom:10px;">Settlement Details</h3><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Reference</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-family:monospace;">{%settlementRefNumber%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Partner</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-weight:600;">{%partnerName%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Student</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%studentName%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Lender</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%lenderName%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Disbursed Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">{%loanAmountDisbursed%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Commission Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">{%grossCommissionAmount%}</td></tr></table></td></tr></table></td></tr><tr><td style="background-color:#F8F9FA;padding:18px 32px;border-top:1px solid #E5E8EB;"><p style="margin:0;color:#7F8C8D;font-size:11px;text-align:center;">This is an automated notification from Edumate.<br/>Do not reply to this email. For queries, contact the team.<br/>&copy; {%currentYear%} Edumate. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`,
  },

  // =========================================================================
  // 11. COMMISSION - L1 REJECTED
  // =========================================================================
  {
    slug: "commission-l1-rejected",
    name: "Commission: L1 Rejected",
    subject: "Commission Settlement - Rejected by L1",
    category: "COMMISSION",
    variables: [
      { name: "settlementRefNumber", description: "Settlement reference" },
      { name: "partnerName", description: "Partner name" },
      { name: "studentName", description: "Student name" },
      { name: "lenderName", description: "Lender name" },
      { name: "loanAmountDisbursed", description: "Disbursed amount (formatted)" },
      { name: "grossCommissionAmount", description: "Commission amount (formatted)" },
      { name: "rejectionReason", description: "Reason for rejection" },
      { name: "currentYear", description: "Current year (auto-replaced)" },
    ],
    html_content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:30px 0;"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);"><tr><td style="background:linear-gradient(135deg,#DC2626 0%,#EF4444 100%);padding:28px 32px;"><h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">Settlement Returned by L1 Reviewer</h1><p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Please review and resubmit</p></td></tr><tr><td style="padding:28px 32px;"><p style="margin:0 0 18px;color:#2C3E50;font-size:14px;line-height:1.6;">Hi Team,</p><p style="margin:0 0 20px;color:#2C3E50;font-size:14px;line-height:1.6;">Your commission settlement has been returned during L1 review. Please check the details and take corrective action.</p><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F9FA;border:1px solid #E5E8EB;border-radius:8px;margin-bottom:16px;"><tr><td style="padding:18px 20px;"><h3 style="margin:0 0 14px;color:#1B4F72;font-size:15px;font-weight:600;border-bottom:1px solid #E5E8EB;padding-bottom:10px;">Settlement Details</h3><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Reference</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-family:monospace;">{%settlementRefNumber%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Partner</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-weight:600;">{%partnerName%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Student</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%studentName%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Lender</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%lenderName%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Disbursed Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">{%loanAmountDisbursed%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Commission Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">{%grossCommissionAmount%}</td></tr></table></td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FEF2F2;border:1px solid #FECACA;border-radius:8px;margin-bottom:16px;"><tr><td style="padding:16px 20px;"><h4 style="margin:0 0 8px;color:#991B1B;font-size:14px;">Rejection Reason</h4><p style="margin:0;color:#2C3E50;font-size:14px;line-height:1.6;white-space:pre-wrap;">{%rejectionReason%}</p></td></tr></table></td></tr><tr><td style="background-color:#F8F9FA;padding:18px 32px;border-top:1px solid #E5E8EB;"><p style="margin:0;color:#7F8C8D;font-size:11px;text-align:center;">This is an automated notification from Edumate.<br/>Do not reply to this email. For queries, contact the team.<br/>&copy; {%currentYear%} Edumate. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`,
  },

  // =========================================================================
  // 12. COMMISSION - L2 APPROVED
  // =========================================================================
  {
    slug: "commission-l2-approved",
    name: "Commission: L2 Approved",
    subject: "Commission Settlement - L2 Approved",
    category: "COMMISSION",
    variables: [
      { name: "settlementRefNumber", description: "Settlement reference" },
      { name: "partnerName", description: "Partner name" },
      { name: "studentName", description: "Student name" },
      { name: "lenderName", description: "Lender name" },
      { name: "loanAmountDisbursed", description: "Disbursed amount (formatted)" },
      { name: "grossCommissionAmount", description: "Commission amount (formatted)" },
      { name: "approverName", description: "L2 approver / Business Head name" },
      { name: "currentYear", description: "Current year (auto-replaced)" },
    ],
    html_content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:30px 0;"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);"><tr><td style="background:linear-gradient(135deg,#059669 0%,#10B981 100%);padding:28px 32px;"><h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">Final Approval Complete — Ready for Payout</h1><p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Approved by {%approverName%}</p></td></tr><tr><td style="padding:28px 32px;"><p style="margin:0 0 18px;color:#2C3E50;font-size:14px;line-height:1.6;">Hi Team,</p><p style="margin:0 0 20px;color:#2C3E50;font-size:14px;line-height:1.6;">This settlement has received final business approval. Please proceed with payment initiation.</p><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F9FA;border:1px solid #E5E8EB;border-radius:8px;margin-bottom:16px;"><tr><td style="padding:18px 20px;"><h3 style="margin:0 0 14px;color:#1B4F72;font-size:15px;font-weight:600;border-bottom:1px solid #E5E8EB;padding-bottom:10px;">Settlement Details</h3><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Reference</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-family:monospace;">{%settlementRefNumber%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Partner</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-weight:600;">{%partnerName%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Student</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%studentName%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Lender</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%lenderName%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Disbursed Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">{%loanAmountDisbursed%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Commission Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">{%grossCommissionAmount%}</td></tr></table></td></tr></table></td></tr><tr><td style="background-color:#F8F9FA;padding:18px 32px;border-top:1px solid #E5E8EB;"><p style="margin:0;color:#7F8C8D;font-size:11px;text-align:center;">This is an automated notification from Edumate.<br/>Do not reply to this email. For queries, contact the team.<br/>&copy; {%currentYear%} Edumate. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`,
  },

  // =========================================================================
  // 13. COMMISSION - L2 REJECTED TO L1
  // =========================================================================
  {
    slug: "commission-l2-rejected-to-l1",
    name: "Commission: L2 Rejected (Back to L1)",
    subject: "Commission Settlement - Sent Back for Re-review",
    category: "COMMISSION",
    variables: [
      { name: "settlementRefNumber", description: "Settlement reference" },
      { name: "partnerName", description: "Partner name" },
      { name: "studentName", description: "Student name" },
      { name: "lenderName", description: "Lender name" },
      { name: "loanAmountDisbursed", description: "Disbursed amount (formatted)" },
      { name: "grossCommissionAmount", description: "Commission amount (formatted)" },
      { name: "rejectionReason", description: "Reason for sending back" },
      { name: "currentYear", description: "Current year (auto-replaced)" },
    ],
    html_content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:30px 0;"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);"><tr><td style="background:linear-gradient(135deg,#D97706 0%,#F59E0B 100%);padding:28px 32px;"><h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">Settlement Sent Back by Business Head</h1><p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Sent back for re-review</p></td></tr><tr><td style="padding:28px 32px;"><p style="margin:0 0 18px;color:#2C3E50;font-size:14px;line-height:1.6;">Hi Team,</p><p style="margin:0 0 20px;color:#2C3E50;font-size:14px;line-height:1.6;">This settlement was sent back during L2 business approval and requires your re-review before resubmission.</p><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F9FA;border:1px solid #E5E8EB;border-radius:8px;margin-bottom:16px;"><tr><td style="padding:18px 20px;"><h3 style="margin:0 0 14px;color:#1B4F72;font-size:15px;font-weight:600;border-bottom:1px solid #E5E8EB;padding-bottom:10px;">Settlement Details</h3><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Reference</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-family:monospace;">{%settlementRefNumber%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Partner</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-weight:600;">{%partnerName%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Student</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%studentName%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Lender</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%lenderName%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Disbursed Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">{%loanAmountDisbursed%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Commission Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">{%grossCommissionAmount%}</td></tr></table></td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FEF2F2;border:1px solid #FECACA;border-radius:8px;margin-bottom:16px;"><tr><td style="padding:16px 20px;"><h4 style="margin:0 0 8px;color:#991B1B;font-size:14px;">Rejection Reason</h4><p style="margin:0;color:#2C3E50;font-size:14px;line-height:1.6;white-space:pre-wrap;">{%rejectionReason%}</p></td></tr></table></td></tr><tr><td style="background-color:#F8F9FA;padding:18px 32px;border-top:1px solid #E5E8EB;"><p style="margin:0;color:#7F8C8D;font-size:11px;text-align:center;">This is an automated notification from Edumate.<br/>Do not reply to this email. For queries, contact the team.<br/>&copy; {%currentYear%} Edumate. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`,
  },

  // =========================================================================
  // 14. COMMISSION - L2 REJECTED TO PARTNER
  // =========================================================================
  {
    slug: "commission-l2-rejected-to-partner",
    name: "Commission: L2 Rejected (Back to Partner)",
    subject: "Commission Settlement - Invoice Rejected",
    category: "COMMISSION",
    variables: [
      { name: "settlementRefNumber", description: "Settlement reference" },
      { name: "partnerName", description: "Partner name" },
      { name: "studentName", description: "Student name" },
      { name: "lenderName", description: "Lender name" },
      { name: "loanAmountDisbursed", description: "Disbursed amount (formatted)" },
      { name: "grossCommissionAmount", description: "Commission amount (formatted)" },
      { name: "rejectionReason", description: "Reason for rejection" },
      { name: "currentYear", description: "Current year (auto-replaced)" },
    ],
    html_content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:30px 0;"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);"><tr><td style="background:linear-gradient(135deg,#DC2626 0%,#EF4444 100%);padding:28px 32px;"><h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">Settlement Rejected by Business Head</h1><p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Please re-upload your invoice</p></td></tr><tr><td style="padding:28px 32px;"><p style="margin:0 0 18px;color:#2C3E50;font-size:14px;line-height:1.6;">Hi Team,</p><p style="margin:0 0 20px;color:#2C3E50;font-size:14px;line-height:1.6;">Your commission settlement has been rejected during L2 review. Please check the details and re-upload your invoice.</p><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F9FA;border:1px solid #E5E8EB;border-radius:8px;margin-bottom:16px;"><tr><td style="padding:18px 20px;"><h3 style="margin:0 0 14px;color:#1B4F72;font-size:15px;font-weight:600;border-bottom:1px solid #E5E8EB;padding-bottom:10px;">Settlement Details</h3><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Reference</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-family:monospace;">{%settlementRefNumber%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Partner</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-weight:600;">{%partnerName%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Student</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%studentName%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Lender</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%lenderName%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Disbursed Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">{%loanAmountDisbursed%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Commission Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">{%grossCommissionAmount%}</td></tr></table></td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FEF2F2;border:1px solid #FECACA;border-radius:8px;margin-bottom:16px;"><tr><td style="padding:16px 20px;"><h4 style="margin:0 0 8px;color:#991B1B;font-size:14px;">Rejection Reason</h4><p style="margin:0;color:#2C3E50;font-size:14px;line-height:1.6;white-space:pre-wrap;">{%rejectionReason%}</p></td></tr></table></td></tr><tr><td style="background-color:#F8F9FA;padding:18px 32px;border-top:1px solid #E5E8EB;"><p style="margin:0;color:#7F8C8D;font-size:11px;text-align:center;">This is an automated notification from Edumate.<br/>Do not reply to this email. For queries, contact the team.<br/>&copy; {%currentYear%} Edumate. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`,
  },

  // =========================================================================
  // 15. COMMISSION - INVOICE SUBMITTED
  // =========================================================================
  {
    slug: "commission-invoice-submitted",
    name: "Commission: Invoice Submitted",
    subject: "Partner Invoice Submitted for Review",
    category: "COMMISSION",
    variables: [
      { name: "settlementRefNumber", description: "Settlement reference" },
      { name: "partnerName", description: "Partner name" },
      { name: "studentName", description: "Student name" },
      { name: "lenderName", description: "Lender name" },
      { name: "loanAmountDisbursed", description: "Disbursed amount (formatted)" },
      { name: "grossCommissionAmount", description: "Commission amount (formatted)" },
      { name: "invoiceNumber", description: "Invoice number" },
      { name: "invoiceAmount", description: "Invoice amount (formatted)" },
      { name: "currentYear", description: "Current year (auto-replaced)" },
    ],
    html_content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:30px 0;"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);"><tr><td style="background:linear-gradient(135deg,#1B4F72 0%,#2E86C1 100%);padding:28px 32px;"><h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">Invoice Submitted for Review</h1><p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">A partner has submitted an invoice for commission settlement</p></td></tr><tr><td style="padding:28px 32px;"><p style="margin:0 0 18px;color:#2C3E50;font-size:14px;line-height:1.6;">Hi Team,</p><p style="margin:0 0 20px;color:#2C3E50;font-size:14px;line-height:1.6;">Please review the invoice details and proceed with verification.</p><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F9FA;border:1px solid #E5E8EB;border-radius:8px;margin-bottom:16px;"><tr><td style="padding:18px 20px;"><h3 style="margin:0 0 14px;color:#1B4F72;font-size:15px;font-weight:600;border-bottom:1px solid #E5E8EB;padding-bottom:10px;">Settlement Details</h3><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Reference</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-family:monospace;">{%settlementRefNumber%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Partner</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-weight:600;">{%partnerName%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Student</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%studentName%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Lender</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%lenderName%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Disbursed Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">{%loanAmountDisbursed%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Commission Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">{%grossCommissionAmount%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Invoice #</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-family:monospace;">{%invoiceNumber%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Invoice Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">{%invoiceAmount%}</td></tr></table></td></tr></table></td></tr><tr><td style="background-color:#F8F9FA;padding:18px 32px;border-top:1px solid #E5E8EB;"><p style="margin:0;color:#7F8C8D;font-size:11px;text-align:center;">This is an automated notification from Edumate.<br/>Do not reply to this email. For queries, contact the team.<br/>&copy; {%currentYear%} Edumate. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`,
  },

  // =========================================================================
  // 16. COMMISSION - DISPUTE RESOLVED
  // =========================================================================
  {
    slug: "commission-dispute-resolved",
    name: "Commission: Dispute Resolved",
    subject: "Commission Settlement Dispute Resolved",
    category: "COMMISSION",
    variables: [
      { name: "settlementRefNumber", description: "Settlement reference" },
      { name: "partnerName", description: "Partner name" },
      { name: "studentName", description: "Student name" },
      { name: "lenderName", description: "Lender name" },
      { name: "loanAmountDisbursed", description: "Disbursed amount (formatted)" },
      { name: "grossCommissionAmount", description: "Commission amount (formatted)" },
      { name: "disputeResolution", description: "Resolution details" },
      { name: "disputeResolvedBy", description: "Resolver name" },
      { name: "currentYear", description: "Current year (auto-replaced)" },
    ],
    html_content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:30px 0;"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);"><tr><td style="background:linear-gradient(135deg,#059669 0%,#10B981 100%);padding:28px 32px;"><h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">Dispute Resolved</h1><p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Your objection has been reviewed and resolved</p></td></tr><tr><td style="padding:28px 32px;"><p style="margin:0 0 18px;color:#2C3E50;font-size:14px;line-height:1.6;">Hi Team,</p><p style="margin:0 0 20px;color:#2C3E50;font-size:14px;line-height:1.6;">The admin team has reviewed and resolved the dispute on your commission settlement. Please log in to the portal to check the updated status.</p><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F9FA;border:1px solid #E5E8EB;border-radius:8px;margin-bottom:16px;"><tr><td style="padding:18px 20px;"><h3 style="margin:0 0 14px;color:#1B4F72;font-size:15px;font-weight:600;border-bottom:1px solid #E5E8EB;padding-bottom:10px;">Settlement Details</h3><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Reference</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-family:monospace;">{%settlementRefNumber%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Partner</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-weight:600;">{%partnerName%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Student</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%studentName%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Lender</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%lenderName%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Disbursed Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">{%loanAmountDisbursed%}</td></tr><tr><td style="padding:6px 0;color:#7F8C8D;font-size:13px;">Commission Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:14px;font-weight:700;">{%grossCommissionAmount%}</td></tr></table></td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0FFF4;border:1px solid #C6F6D5;border-radius:8px;margin-bottom:16px;"><tr><td style="padding:16px 20px;"><h4 style="margin:0 0 8px;color:#276749;font-size:14px;">Resolution</h4><p style="margin:0;color:#2C3E50;font-size:14px;line-height:1.6;white-space:pre-wrap;">{%disputeResolution%}</p><p style="margin:10px 0 0;color:#7F8C8D;font-size:12px;">Resolved by: {%disputeResolvedBy%}</p></td></tr></table></td></tr><tr><td style="background-color:#F8F9FA;padding:18px 32px;border-top:1px solid #E5E8EB;"><p style="margin:0;color:#7F8C8D;font-size:11px;text-align:center;">This is an automated notification from Edumate.<br/>Do not reply to this email. For queries, contact the team.<br/>&copy; {%currentYear%} Edumate. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`,
  },

  // =========================================================================
  // 17. LOAN ELIGIBILITY RESULT
  // =========================================================================
  {
    slug: "loan-eligibility-result",
    name: "Loan Eligibility Result",
    subject: "Your Loan Eligibility Result",
    category: "LOAN",
    variables: [
      { name: "name", description: "Applicant name" },
      { name: "email", description: "Applicant email" },
      { name: "phone", description: "Applicant phone" },
      { name: "countryOfStudy", description: "Country of study" },
      { name: "levelOfEducation", description: "Level of education" },
      { name: "courseType", description: "Course type" },
      { name: "loanAmount", description: "Requested loan amount" },
      { name: "loanPreference", description: "Loan preference" },
      { name: "isEligible", description: "Eligibility status (Eligible/Not Eligible)" },
      { name: "baseLoanAmount", description: "Base eligible loan amount" },
      { name: "currentYear", description: "Current year (auto-replaced)" },
    ],
    html_content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Loan Eligibility Result</title></head><body style="margin:0;padding:0;background-color:#f9f9f9;font-family:Arial,sans-serif;"><table cellpadding="0" cellspacing="0" align="center" style="width:600px;max-width:600px;margin:auto;background-color:#fff;border:1px solid #eee;"><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:middle"><img src="https://edumateglobal.com/images/logos/edumate-logos/edumate_logo.png" alt="edumate" style="height:48px;width:auto;filter:brightness(1.1)"></td><td style="text-align:right;vertical-align:middle"><div style="font-size:13px;color:#0f172a;font-weight:600">Education Loan Services</div><div style="font-size:11px;color:#0f172aae;margin-top:2px">Your pathway to educational excellence</div></td></tr></table></td></tr><tr><td style="padding:32px 28px;"><p style="font-size:16px;color:#474d6a;margin:0;">Hello {%name%},</p><br><p style="font-size:15px;color:#474d6a;margin:0;">Thank you for checking your loan eligibility with Edumate. Here are your results:</p><br><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F9FA;border:1px solid #E5E8EB;border-radius:8px;margin-bottom:20px;"><tr><td style="padding:18px 20px;"><h3 style="margin:0 0 14px;color:#1B4F72;font-size:15px;font-weight:600;border-bottom:1px solid #E5E8EB;padding-bottom:10px;">Application Summary</h3><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Name</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-weight:600;">{%name%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Email</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%email%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Phone</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%phone%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Country of Study</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%countryOfStudy%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Level of Education</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%levelOfEducation%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Course Type</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%courseType%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Loan Amount</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;font-weight:600;">{%loanAmount%}</td></tr><tr><td width="180" style="padding:6px 0;color:#7F8C8D;font-size:13px;">Loan Preference</td><td style="padding:6px 0;color:#2C3E50;font-size:13px;">{%loanPreference%}</td></tr></table></td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#EBF8FF 0%,#DBEAFE 100%);border:1px solid #93C5FD;border-radius:8px;margin-bottom:20px;"><tr><td align="center" style="padding:20px;"><p style="margin:0 0 4px;color:#1E40AF;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Eligibility Status</p><p style="margin:0;color:#1E3A5F;font-size:22px;font-weight:700;">{%isEligible%}</p><p style="margin:8px 0 0;color:#3B82F6;font-size:13px;">Base Loan Amount: {%baseLoanAmount%}</p></td></tr></table><p style="font-size:14px;color:#474d6a;margin:0;">Our team will be in touch with you shortly to guide you through the next steps. If you have any questions, feel free to reach out.</p><br><p style="font-size:14px;color:#474d6a;margin:0;">Best regards,<br><strong>Team Edumate</strong></p></td></tr><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px;"><p style="margin:0 0 12px 0;font-size:13px;color:#0f172a;font-weight:500">&copy; {%currentYear%} Edumate. All rights reserved.</p><p style="margin:0;font-size:12px;color:#0f172aae;line-height:1.5">This email was sent regarding your loan application. Please do not reply directly to this email.</p></td></tr></table></body></html>`,
  },

  // =========================================================================
  // 18. EMI REPAYMENT SCHEDULE
  // =========================================================================
  {
    slug: "emi-repayment-schedule",
    name: "EMI Repayment Schedule",
    subject: "Your EMI Repayment Schedule",
    category: "LOAN",
    variables: [
      { name: "name", description: "Customer name" },
      { name: "contactEmail", description: "Support email" },
      { name: "contactPhone", description: "Support phone" },
      { name: "calendlyLink", description: "Consultation booking link" },
      { name: "currentYear", description: "Current year (auto-replaced)" },
    ],
    html_content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Your EMI Repayment Schedule</title></head><body style="margin:0;padding:0;background-color:#f9f9f9;font-family:Arial,sans-serif;"><table cellpadding="0" cellspacing="0" align="center" style="width:600px;max-width:600px;margin:auto;background-color:#fff;border:1px solid #eee;"><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:middle"><img src="https://edumateglobal.com/images/logos/edumate-logos/edumate_logo.png" alt="edumate" style="height:48px;width:auto;filter:brightness(1.1)"></td><td style="text-align:right;vertical-align:middle"><div style="font-size:13px;color:#0f172a;font-weight:600">Education Loan Services</div><div style="font-size:11px;color:#0f172aae;margin-top:2px">Your pathway to educational excellence</div></td></tr></table></td></tr><tr><td style="padding:32px 28px;"><p style="font-size:16px;color:#474d6a;margin:0;">Hello {%name%},</p><br><p style="font-size:15px;color:#474d6a;margin:0;line-height:1.6;">Thank you for using our EMI Calculator! Please find your personalized repayment schedule attached as a PDF.</p><br><div style="background:linear-gradient(135deg,rgba(222,156,111,.08) 0,rgba(102,153,220,.35) 100%);border-left:4px solid #244780;padding:18px 20px;border-radius:8px;margin:20px 0;"><p style="margin:0;font-size:15px;color:#1e293b;font-weight:600;line-height:1.5;">What's Included:</p><ul style="margin:10px 0 0;padding-left:20px;color:#475569;font-size:14px;line-height:1.8;"><li>Monthly EMI breakdown</li><li>Principal vs Interest split</li><li>Outstanding balance schedule</li><li>Total interest payable</li></ul></div><p style="font-size:15px;color:#474d6a;margin:16px 0;line-height:1.6;">If you have any questions or would like to discuss your loan options, our team is here to help:</p><table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;"><tr><td style="padding:8px 0;font-size:14px;color:#474d6a;">Email: <a href="mailto:{%contactEmail%}" style="color:#244780;text-decoration:none;font-weight:600;">{%contactEmail%}</a></td></tr><tr><td style="padding:8px 0;font-size:14px;color:#474d6a;">Phone: <strong>{%contactPhone%}</strong></td></tr><tr><td style="padding:8px 0;"><a href="{%calendlyLink%}" style="display:inline-block;background:#244780;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Book a Free Consultation</a></td></tr></table><br><p style="font-size:14px;color:#474d6a;margin:0;">Best regards,<br><strong>Team Edumate</strong><br><span style="color:#64748b;">Education Loan Services</span></p></td></tr><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px;"><p style="margin:0 0 12px 0;font-size:13px;color:#0f172a;font-weight:500">&copy; {%currentYear%} Edumate. All rights reserved.</p><p style="margin:0;font-size:12px;color:#0f172aae;line-height:1.5">This email was sent regarding your loan application. Please do not reply directly to this email.</p></td></tr></table></body></html>`,
  },
  // =========================================================================
  // 19. MONTHLY MIS REPORT (sent to partners with PDF attachment)
  // =========================================================================
  {
    slug: "monthly-mis-report",
    name: "Monthly MIS Performance Report",
    subject: "Your Monthly Performance Report",
    category: "DASHBOARD",
    variables: [
      { name: "partnerName", description: "Partner's display name" },
      { name: "message", description: "Custom message from admin (optional)" },
      { name: "adminName", description: "Sender admin's name" },
      { name: "reportMonth", description: "Report month name (e.g., March)" },
      { name: "reportYear", description: "Report year (e.g., 2026)" },
      { name: "totalLeads", description: "Total leads count" },
      { name: "applicationsInitiated", description: "Applications initiated count" },
      { name: "totalRequestedAmount", description: "Total requested amount (formatted)" },
      { name: "applicationsApproved", description: "Applications approved count" },
      { name: "totalApprovedAmount", description: "Total approved amount (formatted)" },
      { name: "disbursementsInitiated", description: "Disbursements initiated count" },
      { name: "totalDisbursementAmount", description: "Total disbursement amount (formatted)" },
      { name: "currentYear", description: "Current year (auto-replaced)" },
    ],
    html_content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Monthly Performance Report</title></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#f5f5f5;"><div style="max-width:600px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1);"><div style="background:linear-gradient(135deg,#1e5fad 0%,#0f2744 100%);padding:32px;text-align:center;"><h1 style="color:white;margin:0;font-size:24px;font-weight:600;">Monthly Performance Report</h1><p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">{%reportMonth%} {%reportYear%}</p></div><div style="padding:32px;"><p style="font-size:16px;color:#333;line-height:1.6;margin:0 0 16px 0;">Dear <strong>{%partnerName%}</strong>,</p><div style="background:#f0f9ff;border-left:4px solid #1e5fad;padding:16px;margin:24px 0;border-radius:4px;"><p style="font-size:15px;color:#0f2744;margin:0;line-height:1.6;">{%message%}</p></div><p style="font-size:15px;color:#666;line-height:1.6;margin:16px 0;">Here is a summary of your performance for <strong>{%reportMonth%} {%reportYear%}</strong>:</p><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F9FA;border:1px solid #E5E8EB;border-radius:8px;margin:20px 0;"><tr><td style="padding:18px 20px;"><h3 style="margin:0 0 14px;color:#1B4F72;font-size:15px;font-weight:600;border-bottom:1px solid #E5E8EB;padding-bottom:10px;">Key Metrics</h3><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="200" style="padding:8px 0;color:#7F8C8D;font-size:13px;">Total Leads</td><td style="padding:8px 0;color:#2C3E50;font-size:14px;font-weight:700;">{%totalLeads%}</td></tr><tr><td width="200" style="padding:8px 0;color:#7F8C8D;font-size:13px;">Applications Initiated</td><td style="padding:8px 0;color:#2C3E50;font-size:14px;font-weight:700;">{%applicationsInitiated%}</td></tr><tr><td width="200" style="padding:8px 0;color:#7F8C8D;font-size:13px;">Total Requested Amount</td><td style="padding:8px 0;color:#2C3E50;font-size:14px;font-weight:700;">{%totalRequestedAmount%}</td></tr><tr><td width="200" style="padding:8px 0;color:#7F8C8D;font-size:13px;">Applications Approved</td><td style="padding:8px 0;color:#27AE60;font-size:14px;font-weight:700;">{%applicationsApproved%}</td></tr><tr><td width="200" style="padding:8px 0;color:#7F8C8D;font-size:13px;">Total Approved Amount</td><td style="padding:8px 0;color:#27AE60;font-size:14px;font-weight:700;">{%totalApprovedAmount%}</td></tr><tr><td width="200" style="padding:8px 0;color:#7F8C8D;font-size:13px;">Disbursements Initiated</td><td style="padding:8px 0;color:#1e5fad;font-size:14px;font-weight:700;">{%disbursementsInitiated%}</td></tr><tr><td width="200" style="padding:8px 0;color:#7F8C8D;font-size:13px;">Total Disbursement Amount</td><td style="padding:8px 0;color:#1e5fad;font-size:14px;font-weight:700;">{%totalDisbursementAmount%}</td></tr></table></td></tr></table><p style="font-size:15px;color:#666;line-height:1.6;margin:16px 0;">The detailed report is attached as a PDF. If you have any questions, please don't hesitate to reach out.</p><p style="font-size:14px;color:#999;margin:24px 0 0 0;padding-top:24px;border-top:1px solid #eee;">Best regards,<br><strong style="color:#333;">{%adminName%}</strong><br>Edumate Global</p></div><div style="background:#f5f5f5;padding:24px;text-align:center;border-top:1px solid #e5e5e5;"><p style="font-size:12px;color:#999;margin:0 0 8px 0;">&copy; {%currentYear%} Edumate Global. All rights reserved.</p><p style="font-size:12px;color:#999;margin:0;">This is an automated monthly performance report.</p></div></div></body></html>`,
  },

  // =========================================================================
  // 20. CRON JOB NOTIFICATION (system alerts for cron success/failure)
  // =========================================================================
  {
    slug: "cron-job-notification",
    name: "Cron Job Notification",
    subject: "[Cron Job] {%taskName%} - {%status%}",
    category: "NOTIFICATION",
    variables: [
      { name: "taskName", description: "Cron task name" },
      { name: "status", description: "Success or Failed" },
      { name: "statusColor", description: "Header color (#4CAF50 for success, #f44336 for failure)" },
      { name: "statusMessage", description: "Completed Successfully or Failed" },
      { name: "duration", description: "Task duration in seconds" },
      { name: "timestamp", description: "Execution timestamp (ISO format)" },
      { name: "errorMessage", description: "Error message (if failed)" },
    ],
    html_content: `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Cron Job Notification</title></head><body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;"><div style="max-width:600px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1);"><div style="background:{%statusColor%};color:white;padding:24px 32px;border-radius:5px 5px 0 0;"><h2 style="margin:0;font-size:20px;">{%taskName%} - {%status%}</h2></div><div style="padding:28px 32px;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border:1px solid #e5e8eb;border-radius:8px;"><tr><td style="padding:18px 20px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td width="120" style="padding:8px 0;color:#7F8C8D;font-size:14px;font-weight:600;">Task</td><td style="padding:8px 0;color:#2C3E50;font-size:14px;">{%taskName%}</td></tr><tr><td width="120" style="padding:8px 0;color:#7F8C8D;font-size:14px;font-weight:600;">Status</td><td style="padding:8px 0;color:#2C3E50;font-size:14px;">{%statusMessage%}</td></tr><tr><td width="120" style="padding:8px 0;color:#7F8C8D;font-size:14px;font-weight:600;">Duration</td><td style="padding:8px 0;color:#2C3E50;font-size:14px;">{%duration%} seconds</td></tr><tr><td width="120" style="padding:8px 0;color:#7F8C8D;font-size:14px;font-weight:600;">Time</td><td style="padding:8px 0;color:#2C3E50;font-size:14px;">{%timestamp%}</td></tr><tr><td width="120" style="padding:8px 0;color:#7F8C8D;font-size:14px;font-weight:600;">Error</td><td style="padding:8px 0;color:#DC2626;font-size:14px;">{%errorMessage%}</td></tr></table></td></tr></table></div><div style="background:#f5f5f5;padding:16px 32px;text-align:center;border-top:1px solid #e5e5e5;"><p style="font-size:11px;color:#999;margin:0;">Automated system notification from Edumate Backend</p></div></div></body></html>`,
  },
];

async function seedEmailTemplates() {
  console.log("Seeding email templates...\n");

  let created = 0;
  let skipped = 0;

  for (const tpl of templates) {
    const existing = await prisma.emailTemplate.findUnique({
      where: { slug: tpl.slug },
    });

    if (existing) {
      console.log(`  SKIP: "${tpl.slug}" already exists (id: ${existing.id})`);
      skipped++;
      continue;
    }

    const result = await prisma.emailTemplate.create({
      data: {
        slug: tpl.slug,
        name: tpl.name,
        subject: tpl.subject,
        html_content: tpl.html_content,
        variables: tpl.variables,
        category: tpl.category,
      },
    });

    console.log(`  CREATED: "${tpl.slug}" (id: ${result.id})`);
    created++;
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}, Total: ${templates.length}`);
}

seedEmailTemplates()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

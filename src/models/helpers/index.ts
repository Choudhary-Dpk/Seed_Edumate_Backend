import prisma from "../../config/prisma";
import { Row } from "../../types/leads.types";

export const getEmailTemplate = async (title: string) => {
  // As of now keeping static but can be changed if we will get the template
  if (title === "Set Password") {
    return `<!DOCTYPE html><html><head><title>Set Password Email</title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style type="text/css">body,p,table,td{margin:0;padding:0}table{border-collapse:collapse}img{border:0;display:block;max-width:100%;height:auto}a{text-decoration:none}@media screen and (max-width:600px){.container{width:100%!important;padding:0!important}.inner-table{width:100%!important}.stack-column{display:block!important;width:100%!important;text-align:center!important}.stack-column img{margin:0 auto!important}.stack-text{text-align:center!important;padding-top:8px!important}.content{padding:24px 20px!important;font-size:15px!important;line-height:1.6!important}.btn{font-size:14px!important;padding:10px 16px!important;display:inline-block!important}.footer-text{font-size:12px!important}}</style></head><body style="background-color:#f9f9f9;font-family:Arial,sans-serif"><table class="container" cellpadding="0" cellspacing="0" align="center" style="width:600px;max-width:600px;margin:auto;background-color:#fff;border:1px solid #eee"><tbody><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px"><table width="100%" cellpadding="0" cellspacing="0" class="inner-table"><tr><td class="stack-column" style="vertical-align:middle"><img src="https://edumateglobal.com/images/logos/edumate-logos/edumate_logo.png" alt="edumate" class="logo-img" style="height:48px;width:auto;filter:brightness(1.1)"></td><td class="stack-column stack-text" style="text-align:right;vertical-align:middle"><div style="font-size:13px;color:#0f172a;font-weight:600">Education Loan Services</div><div style="font-size:11px;color:#0f172aae;margin-top:2px">Your pathway to educational excellence</div></td></tr></table></td></tr><tr><td><table width="100%" style="background:#fff"><tbody><tr><td><table width="100%" align="center" class="content" style="max-width:540px;margin:auto;color:#474d6a;line-height:1.5;padding:32px 28px"><tbody><tr style="padding:0 16px;margin:0 10px"><td style="font-size:16px;color:#474d6a"><p style="margin:0">Hello {%name%},</p><br><p style="margin:0">We have received a request to set the password for your account. To complete the process, please follow the link below:</p><br><p><a href="{%set-password-url%}" class="btn" style="display: block; text-align: center; background: #244780; color: #ffffff; padding: 14px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);">Set Password</a></p><br><p style="margin:0">Thank you for using our service.</p></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px"><p class="footer-text" style="margin:0 0 12px 0;font-size:13px;color:#0f172a;font-weight:500">© {%currentYear%} Edumate. All rights reserved.</p><p style="margin:0;font-size:12px;color:#0f172aae;line-height:1.5">This email was sent regarding your loan application. Please do not reply directly to this email.</p></td></tr></tbody></table></body></html>`;
  }

  if (title === "Otp") {
    return `<!DOCTYPE html><html><head><title>OTP Verification Email</title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style type="text/css">body,p,table,td{margin:0;padding:0}table{border-collapse:collapse}img{border:0;display:block;max-width:100%;height:auto}a{text-decoration:none}@media screen and (max-width:600px){.container{width:100%!important;padding:0!important}.inner-table{width:100%!important}.stack-column{display:block!important;width:100%!important;text-align:center!important}.stack-column img{margin:0 auto!important}.stack-text{text-align:center!important;padding-top:8px!important}.content{padding:24px 20px!important;font-size:15px!important;line-height:1.6!important}.otp-code{font-size:20px!important;padding:12px!important}.footer-text{font-size:12px!important}}</style></head><body style="background-color:#f9f9f9;font-family:Arial,sans-serif"><table class="container" cellpadding="0" cellspacing="0" align="center" style="width:600px;max-width:600px;margin:auto;background-color:#fff;border:1px solid #eee"><tbody><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px"><table width="100%" cellpadding="0" cellspacing="0" class="inner-table"><tr><td class="stack-column" style="vertical-align:middle"><img src="https://edumateglobal.com/images/logos/edumate-logos/edumate_logo.png" alt="edumate" class="logo-img" style="height:48px;width:auto;filter:brightness(1.1)"></td><td class="stack-column stack-text" style="text-align:right;vertical-align:middle"><div style="font-size:13px;color:#0f172a;font-weight:600">Education Loan Services</div><div style="font-size:11px;color:#0f172aae;margin-top:2px">Your pathway to educational excellence</div></td></tr></table></td></tr><tr><td><table width="100%" style="background:#fff"><tbody><tr><td><table width="100%" align="center" class="content" style="max-width:540px;margin:auto;color:#474d6a;line-height:1.5;padding:32px 28px"><tbody><tr style="padding:0 16px;margin:0 10px"><td style="font-size:16px;color:#474d6a"><p style="margin:0">Hello {%name%},</p><br><p style="margin:0">Use this OTP to login:</p><br><div style="text-align:center;margin:20px 0"><span class="otp-code" style="display:inline-block;background:#f8fafc;border:2px solid #244780;color:#244780;font-size:24px;font-weight:700;padding:16px 24px;border-radius:8px;letter-spacing:4px;font-family:monospace">{%otp%}</span></div><br><p style="margin:0">Thank you for using our service.</p></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px"><p class="footer-text" style="margin:0 0 12px 0;font-size:13px;color:#0f172a;font-weight:500">© {%currentYear%} Edumate. All rights reserved.</p><p style="margin:0;font-size:12px;color:#0f172aae;line-height:1.5">This email was sent regarding your loan application. Please do not reply directly to this email.</p></td></tr></tbody></table></body></html>`;
  }

  if (title === "Forgot Password") {
    return `<!DOCTYPE html><html><head><title>Reset Password Email</title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style type="text/css">body,p,table,td{margin:0;padding:0}table{border-collapse:collapse}img{border:0;display:block;max-width:100%;height:auto}a{text-decoration:none}@media screen and (max-width:600px){.container{width:100%!important;padding:0!important}.inner-table{width:100%!important}.stack-column{display:block!important;width:100%!important;text-align:center!important}.stack-column img{margin:0 auto!important}.stack-text{text-align:center!important;padding-top:8px!important}.content{padding:24px 20px!important;font-size:15px!important;line-height:1.6!important}.btn{font-size:14px!important;padding:10px 16px!important;display:inline-block!important}.footer-text{font-size:12px!important}}</style></head><body style="background-color:#f9f9f9;font-family:Arial,sans-serif"><table class="container" cellpadding="0" cellspacing="0" align="center" style="width:600px;max-width:600px;margin:auto;background-color:#fff;border:1px solid #eee"><tbody><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px"><table width="100%" cellpadding="0" cellspacing="0" class="inner-table"><tr><td class="stack-column" style="vertical-align:middle"><img src="https://edumateglobal.com/images/logos/edumate-logos/edumate_logo.png" alt="edumate" class="logo-img" style="height:48px;width:auto;filter:brightness(1.1)"></td><td class="stack-column stack-text" style="text-align:right;vertical-align:middle"><div style="font-size:13px;color:#0f172a;font-weight:600">Education Loan Services</div><div style="font-size:11px;color:#0f172aae;margin-top:2px">Your pathway to educational excellence</div></td></tr></table></td></tr><tr><td><table width="100%" style="background:#fff"><tbody><tr><td><table width="100%" align="center" class="content" style="max-width:540px;margin:auto;color:#474d6a;line-height:1.5;padding:32px 28px"><tbody><tr style="padding:0 16px;margin:0 10px"><td style="font-size:16px;color:#474d6a"><p style="margin:0">Hello {%name%},</p><br><p style="margin:0">We have received a request to reset the password for your account. To complete the process, please follow the link below:</p><br><p><a href="{%reset-password-url%}" class="btn" style="display:block;text-align:center;background:#244780;color:#fff;padding:14px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 2px 8px rgba(59,130,246,.2)">Reset Password</a></p><br><p style="margin:0">Thank you for using our service.</p></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px"><p class="footer-text" style="margin:0 0 12px 0;font-size:13px;color:#0f172a;font-weight:500">© {%currentYear%} Edumate. All rights reserved.</p><p style="margin:0;font-size:12px;color:#0f172aae;line-height:1.5">This email was sent regarding your loan application. Please do not reply directly to this email.</p></td></tr></tbody></table></body></html>`;
  }

  if (title === "Show Interest") {
    return `<!Doctype html><title>Thank You for Your Interest</title><meta charset=utf-8><meta content="width=device-width,initial-scale=1"name=viewport><style>body,p,table,td{margin:0;padding:0}table{border-collapse:collapse}img{border:0;display:block;max-width:100%;height:auto}a{text-decoration:none}@media screen and (max-width:600px){.container{width:100%!important;padding:0!important}.inner-table{width:100%!important}.stack-column{display:block!important;width:100%!important;text-align:center!important}.stack-column img{margin:0 auto!important}.stack-text{text-align:center!important;padding-top:8px!important}.content{padding:20px 16px!important}.content-text{font-size:15px!important;line-height:1.6!important}.btn{font-size:14px!important;padding:12px 20px!important;display:block!important;margin:16px 0!important}.feature-box{display:block!important;margin:12px 0!important;padding:14px!important}.feature-icon{margin:0 auto 8px auto!important;text-align:center!important}.feature-content{text-align:center!important}.highlight-box{padding:14px 16px!important;margin:16px 0!important}.footer-text{font-size:11px!important}h2{font-size:18px!important}}</style><body style=background-color:#f9f9f9;font-family:Arial,sans-serif><table cellpadding=0 cellspacing=0 class=container style="width:600px;max-width:100%;margin:auto;background-color:#fff;border:1px solid #eee"align=center><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px"><table width=100% cellpadding=0 cellspacing=0 class=inner-table><tr><td style=vertical-align:middle;width:50% class=stack-column><img alt=edumate class=logo-img src=https://edumateglobal.com/images/logos/edumate-logos/edumate_logo.png style=height:48px;width:auto;filter:brightness(1.1)><td style=text-align:right;vertical-align:middle;width:50% class="stack-column stack-text"><div style=font-size:13px;color:#0f172a;font-weight:600>Education Loan Services</div><div style=font-size:11px;color:#0f172aae;margin-top:2px>Your pathway to educational excellence</div></table><tr><td><table width=100% style=background:#fff><tr><td><table width=100% style="max-width:540px;margin:auto;padding:32px 28px"class=content align=center><tr><td style=font-size:16px;color:#474d6a;line-height:1.6 class=content-text><p style=margin:0>Dear {%name%},</p><br><h2 style="margin:0 0 16px 0;font-size:20px;color:#1e293b;font-weight:600">Thank You for Your Interest! 🎓</h2><p style=margin:0>We truly appreciate you reaching out to us regarding education loan opportunities. Your aspiration to pursue higher education is commendable, and we're honored that you're considering Edumate to support your educational journey.</p><br><div style="background:linear-gradient(135deg,rgba(222,156,111,.08) 0,rgba(102,153,220,.35) 100%);border-left:4px solid #244780;padding:18px 20px;border-radius:8px;margin:20px 0"class=highlight-box><p style=margin:0;font-size:15px;color:#1e293b;font-weight:600;line-height:1.5>💙 We're Here for You<p style="margin:10px 0 0 0;font-size:14px;color:#475569;line-height:1.6">We understand that financing your education is an important decision. Our dedicated team is committed to finding the best loan solution that fits your unique needs and circumstances.</div><h3 style="margin:24px 0 16px 0;font-size:17px;color:#1e293b;font-weight:600">Here's How We Can Help You:</h3><table width=100% cellpadding=0 cellspacing=0 style="margin:16px 0"><tr><td><table width=100% cellpadding=0 cellspacing=0 class=feature-box style="margin:12px 0;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0"><tr><td style=vertical-align:top;width:40px;padding-right:12px class=feature-icon><div style=width:32px;height:32px;background:#244780;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;line-height:32px;text-align:center>✓</div><td style=vertical-align:top class=feature-content><p style=margin:0;font-weight:600;color:#1e293b;font-size:15px>Personalized Loan Guidance<p style="margin:6px 0 0 0;font-size:14px;color:#64748b;line-height:1.5">Our experts will understand your requirements and guide you to the most suitable loan options</table><table width=100% cellpadding=0 cellspacing=0 class=feature-box style="margin:12px 0;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0"><tr><td style=vertical-align:top;width:40px;padding-right:12px class=feature-icon><div style=width:32px;height:32px;background:#244780;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;line-height:32px;text-align:center>✓</div><td style=vertical-align:top class=feature-content><p style=margin:0;font-weight:600;color:#1e293b;font-size:15px>Quick & Hassle-Free Process<p style="margin:6px 0 0 0;font-size:14px;color:#64748b;line-height:1.5">Get your loan approved in as little as 48 hours with minimal documentation</table><table width=100% cellpadding=0 cellspacing=0 class=feature-box style="margin:12px 0;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0"><tr><td style=vertical-align:top;width:40px;padding-right:12px class=feature-icon><div style=width:32px;height:32px;background:#244780;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;line-height:32px;text-align:center>✓</div><td style=vertical-align:top class=feature-content><p style=margin:0;font-weight:600;color:#1e293b;font-size:15px>Competitive Interest Rates<p style="margin:6px 0 0 0;font-size:14px;color:#64748b;line-height:1.5">Access attractive interest rates starting from 8.5% per annum with flexible repayment terms</table><table width=100% cellpadding=0 cellspacing=0 class=feature-box style="margin:12px 0;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0"><tr><td style=vertical-align:top;width:40px;padding-right:12px class=feature-icon><div style=width:32px;height:32px;background:#244780;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;line-height:32px;text-align:center>✓</div><td style=vertical-align:top class=feature-content><p style=margin:0;font-weight:600;color:#1e293b;font-size:15px>End-to-End Support<p style="margin:6px 0 0 0;font-size:14px;color:#64748b;line-height:1.5">From application to disbursement, we'll be with you at every step of your loan journey</table></table><br><p style=margin:0>Thank you once again for choosing Edumate. We look forward to being part of your success story!</p><br><p style=margin:0>Warm regards,<p style="margin:8px 0 0 0"><b>Team Edumate</b><p style="margin:4px 0 0 0;font-size:14px;color:#64748b">Education Loan Services</table></table><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px"><p style="margin:0 0 12px 0;font-size:13px;color:#0f172a;font-weight:500"class=footer-text>© {%currentYear%} Edumate. All rights reserved.<p style=margin:0;font-size:12px;color:#0f172aae;line-height:1.5>This email was sent regarding your loan inquiry. Please do not reply directly to this email. For assistance, please contact our support team.</table>`;
  }

  return "";
};

export const getUserDetailsByEmail = async (email: string) => {
  const userData = await prisma.b2BPartnersUsers.findFirst({
    where: {
      email,
      is_active: true,
    },
    select: {
      id: true,
      is_active: true,
      email: true,
      password_hash: true,
      updated_at: true,
      full_name: true,
    },
  });

  return userData;
};

export const getAdminDetailsByEmail = async (email: string) => {
  const adminData = await prisma.adminUsers.findFirst({
    where: {
      email,
      is_active: true,
    },
    select: {
      id: true,
      is_active: true,
      email: true,
      password_hash: true,
      updated_at: true,
      full_name: true,
    },
  });

  return adminData;
};

export const addFileType = async (fileName: string) => {
  const fileType = await prisma.fileEntities.upsert({
    where: { type: fileName },
    update: {},
    create: { type: fileName, description: `${fileName} files` },
  });

  return fileType;
};

export const addFileRecord = async (
  filename: string,
  mime_type: string,
  rows: Row,
  total_records: number,
  uploadedBy: number,
  fileId: number
) => {
  const fileUpload = await prisma.fileUploads.create({
    data: {
      filename,
      mime_type,
      file_data: rows,
      total_records,
      uploaded_by_id: uploadedBy,
      entity_type_id: fileId,
    },
    include: { entity_type: true },
  });

  return fileUpload;
};

export const updateFileRecord = async (
  fileId: number,
  processedRecords: number,
  failedRecords: number
) => {
  await prisma.fileUploads.update({
    where: { id: fileId },
    data: {
      processed_records: processedRecords,
      failed_records: failedRecords,
      processed_at: new Date(),
    },
  });
};

export const getModulePermissions = async (userId: number) => {
  const user = await prisma.b2BPartnersUsers.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return user?.roles ?? [];
};

export const fetchCurrencyConfigs = async () => {
  const currencyConfigs = await prisma.currencyConfigs.findMany({
    orderBy: {
      code: "asc",
    },
  });
  return currencyConfigs;
};

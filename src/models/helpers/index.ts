import prisma from "../../config/prisma";

export const getEmailTemplate = async (title: string) => {
  // As of now keeping static but can be changed if we will get the template
  if (title === "set-password") {
    return `<!DOCTYPE html><html><head><title>Set Password Email</title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style type="text/css">body,p,table,td{margin:0;padding:0}table{border-collapse:collapse}img{border:0;display:block;max-width:100%;height:auto}a{text-decoration:none}@media screen and (max-width:600px){.container{width:100%!important;padding:0!important}.inner-table{width:100%!important}.stack-column{display:block!important;width:100%!important;text-align:center!important}.stack-column img{margin:0 auto!important}.stack-text{text-align:center!important;padding-top:8px!important}.content{padding:24px 20px!important;font-size:15px!important;line-height:1.6!important}.btn{font-size:14px!important;padding:10px 16px!important;display:inline-block!important}.footer-text{font-size:12px!important}}</style></head><body style="background-color:#f9f9f9;font-family:Arial,sans-serif"><table class="container" cellpadding="0" cellspacing="0" align="center" style="width:600px;max-width:600px;margin:auto;background-color:#fff;border:1px solid #eee"><tbody><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px"><table width="100%" cellpadding="0" cellspacing="0" class="inner-table"><tr><td class="stack-column" style="vertical-align:middle"><img src="https://edumateglobal.com/images/logos/edumate-logos/edumate_logo.png" alt="edumate" class="logo-img" style="height:48px;width:auto;filter:brightness(1.1)"></td><td class="stack-column stack-text" style="text-align:right;vertical-align:middle"><div style="font-size:13px;color:#0f172a;font-weight:600">Education Loan Services</div><div style="font-size:11px;color:#0f172aae;margin-top:2px">Your pathway to educational excellence</div></td></tr></table></td></tr><tr><td><table width="100%" style="background:#fff"><tbody><tr><td><table width="100%" align="center" class="content" style="max-width:540px;margin:auto;color:#474d6a;line-height:1.5;padding:32px 28px"><tbody><tr style="padding:0 16px;margin:0 10px"><td style="font-size:16px;color:#474d6a"><p style="margin:0">Hello <b>{%name%}</b>,</p><br><p style="margin:0">We have received a request to set the password for your account. To complete the process, please follow the link below:</p><br><p><a href="{%set-password-url%}" class="btn" style="display: block; text-align: center; background: #244780; color: #ffffff; padding: 14px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);">Set Password</a></p><br><p style="margin:0">Thank you for using our service.</p></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style="background:linear-gradient(135deg,rgba(222,156,111,.12) 0,rgba(102,153,220,.59) 100%);padding:24px 32px"><p class="footer-text" style="margin:0 0 12px 0;font-size:13px;color:#0f172a;font-weight:500">© {%currentYear%} Edumate. All rights reserved.</p><p style="margin:0;font-size:12px;color:#0f172aae;line-height:1.5">This email was sent regarding your loan application. Please do not reply directly to this email.</p></td></tr></tbody></table></body></html>`;
  }

  if (title === "otp") {
    return `<html><head><title></title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style type="text/css">*{margin:0;padding:0}table,td,th{border:0}</style></head><body><table cellpadding="0" cellspacing="0" style="width:600px;margin:auto;border:1px solid #eee;font-family:arial"><tbody><tr><td><table style="width:100%;margin:auto;background:#8A3A34;padding:15px 0;text-align:center;font-family:arial"><tbody><tr><td><h1 style="color:#fff">Seed</h1></td></tr></tbody></table></td></tr><tr><td><table style="width:95%;margin:auto;background:#fff;padding:15px 0;font-family:Arial"><tbody><tr><td><table style="width:80%;margin:auto;padding-top:25px;color:#474d6a;padding-bottom:25px;line-height:1.5"><tbody><tr><td style="font-size:16px;font-family:arial;color:#474d6a;line-height:1.5"><p style="text-align:left;margin:0">Hello,</p><br><p style="margin:0">Use this OTP to login: {%otp%}</p><br><br><p style="margin:0">Thank you for using our service.</p><br><p style="margin:0">Best regards,</p><br><p>Seed</p></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style="padding:10px;background:#8A3A34"><table style="width:100%"><tbody><tr><td style="text-align:center;color:#fff;font-weight:400">&copy; Seed. All Rights Reserved</td></tr></tbody></table></td></tr></tbody></table></body></html>`;
  }

  if (title === "forgot-password") {
    return `<html><head><title></title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style type="text/css">*{margin:0;padding:0}table,td,th{border:0}</style></head><body><table cellpadding="0" cellspacing="0" style="width:600px;margin:auto;border:1px solid #eee;font-family:arial"><tbody><tr><td><table style="width:100%;margin:auto;background:#8A3A34;padding:15px 0;text-align:center;font-family:arial"><tbody><tr><td><h1 style="color:#fff">Seed</h1></td></tr></tbody></table></td></tr><tr><td><table style="width:95%;margin:auto;background:#fff;padding:15px 0;font-family:Arial"><tbody><tr><td><table style="width:80%;margin:auto;padding-top:25px;color:#474d6a;padding-bottom:25px;line-height:1.5"><tbody><tr><td style="font-size:16px;font-family:arial;color:#474d6a;line-height:1.5"><p style="text-align:left;margin:0">Hello,</p><br><p style="margin:0">We have received a request to reset the password for your account. To complete the process, please follow the link below:</p><br><p><a href="{%reset-password-url%}" style="background-color:#8A3A34;text-decoration:none;font-size:14px;border-radius:5px;padding:6px 8px;color:#fff;font-family:arial">Reset Password</a></p><br><p style="margin:0">Thank you for using our service.</p><br><p style="margin:0">Best regards,</p><br><p>Seed</p></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style="padding:10px;background:#8A3A34"><table style="width:100%"><tbody><tr><td style="text-align:center;color:#fff;font-weight:400">&copy; Seed. All Rights Reserved</td></tr></tbody></table></td></tr></tbody></table></body></html>`;
  }

  return "";
};

export const getUserDetailsByEmail = async (email: string, deleted: boolean) => {
  const userData = await prisma.user.findFirst({
    where: {
      email,
      isDeleted: deleted,
    },
    select: {
      id: true,
      activationStatus: true,
      email: true,
      passwordHash: true,
      passwordSetOn: true,
    },
  });

  return userData;
};

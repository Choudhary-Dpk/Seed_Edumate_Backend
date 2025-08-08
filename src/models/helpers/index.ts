import prisma from "../../config/prisma";

export const getEmailTemplate = async (title: string) => {
// As of now keeping static but can be changed if we will get the template
if (title === "set-password") {
  return `<html><head><title></title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style type="text/css">*{margin:0;padding:0}table,td,th{border:0}</style></head><body><table cellpadding="0" cellspacing="0" style="width:600px;margin:auto;border:1px solid #eee;font-family:arial"><tbody><tr><td><table style="width:100%;margin:auto;background:#8A3A34;padding:15px 0;text-align:center;font-family:arial"><tbody><tr><td><h1 style="color:#fff">Seed</h1></td></tr></tbody></table></td></tr><tr><td><table style="width:95%;margin:auto;background:#fff;padding:15px 0;font-family:Arial"><tbody><tr><td><table style="width:80%;margin:auto;padding-top:25px;color:#474d6a;padding-bottom:25px;line-height:1.5"><tbody><tr><td style="font-size:16px;font-family:arial;color:#474d6a;line-height:1.5"><p style="text-align:left;margin:0">Hello,</p><br><p style="margin:0">We have received a request to set the password for your account. To complete the process, please follow the link below:</p><br><p><a href="{%set-password-url%}" style="background-color:#8A3A34;text-decoration:none;font-size:14px;border-radius:5px;padding:6px 8px;color:#fff;font-family:arial">Set Password</a></p><br><p style="margin:0">Thank you for using our service.</p><br><p style="margin:0">Best regards,</p><br><p>Seed</p></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style="padding:10px;background:#8A3A34"><table style="width:100%"><tbody><tr><td style="text-align:center;color:#fff;font-weight:400">&copy; Seed. All Rights Reserved</td></tr></tbody></table></td></tr></tbody></table></body></html>`;
}

if(title==="otp"){
    return `<html><head><title></title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style type="text/css">*{margin:0;padding:0}table,td,th{border:0}</style></head><body><table cellpadding="0" cellspacing="0" style="width:600px;margin:auto;border:1px solid #eee;font-family:arial"><tbody><tr><td><table style="width:100%;margin:auto;background:#8A3A34;padding:15px 0;text-align:center;font-family:arial"><tbody><tr><td><h1 style="color:#fff">Seed</h1></td></tr></tbody></table></td></tr><tr><td><table style="width:95%;margin:auto;background:#fff;padding:15px 0;font-family:Arial"><tbody><tr><td><table style="width:80%;margin:auto;padding-top:25px;color:#474d6a;padding-bottom:25px;line-height:1.5"><tbody><tr><td style="font-size:16px;font-family:arial;color:#474d6a;line-height:1.5"><p style="text-align:left;margin:0">Hello,</p><br><p style="margin:0">Use this OTP to login: {%otp%}</p><br><br><p style="margin:0">Thank you for using our service.</p><br><p style="margin:0">Best regards,</p><br><p>Seed</p></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style="padding:10px;background:#8A3A34"><table style="width:100%"><tbody><tr><td style="text-align:center;color:#fff;font-weight:400">&copy; Seed. All Rights Reserved</td></tr></tbody></table></td></tr></tbody></table></body></html>`;
}

if(title==="forgot-password"){
    return `<html><head><title></title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style type="text/css">*{margin:0;padding:0}table,td,th{border:0}</style></head><body><table cellpadding="0" cellspacing="0" style="width:600px;margin:auto;border:1px solid #eee;font-family:arial"><tbody><tr><td><table style="width:100%;margin:auto;background:#8A3A34;padding:15px 0;text-align:center;font-family:arial"><tbody><tr><td><h1 style="color:#fff">Seed</h1></td></tr></tbody></table></td></tr><tr><td><table style="width:95%;margin:auto;background:#fff;padding:15px 0;font-family:Arial"><tbody><tr><td><table style="width:80%;margin:auto;padding-top:25px;color:#474d6a;padding-bottom:25px;line-height:1.5"><tbody><tr><td style="font-size:16px;font-family:arial;color:#474d6a;line-height:1.5"><p style="text-align:left;margin:0">Hello,</p><br><p style="margin:0">We have received a request to reset the password for your account. To complete the process, please follow the link below:</p><br><p><a href="{%reset-password-url%}" style="background-color:#8A3A34;text-decoration:none;font-size:14px;border-radius:5px;padding:6px 8px;color:#fff;font-family:arial">Reset Password</a></p><br><p style="margin:0">Thank you for using our service.</p><br><p style="margin:0">Best regards,</p><br><p>Seed</p></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style="padding:10px;background:#8A3A34"><table style="width:100%"><tbody><tr><td style="text-align:center;color:#fff;font-weight:400">&copy; Seed. All Rights Reserved</td></tr></tbody></table></td></tr></tbody></table></body></html>`;
}

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

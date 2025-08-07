import { createTransport } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { DEFAULT_FROM_EMAIL, EMAIL_PASS, EMAIL_USER, SMTP_HOST, SMTP_PORT } from "../setup/secrets";

const transporter = createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
} as SMTPTransport.Options);

const sendMail = async (toEmail: string, subject: string, html: string) => {
  const mailOptions = {
    from: DEFAULT_FROM_EMAIL,
    to: toEmail,
    subject: subject,
    html: html,
  };

  const info = await transporter.sendMail(mailOptions);
};

export default sendMail;

import { createTransport } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import {
  DEFAULT_FROM_EMAIL,
  EMAIL_PASS,
  EMAIL_USER,
  SMTP_HOST,
  SMTP_PORT,
} from "../setup/secrets";

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

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string,
  cc?: string;
  bcc?: string;
}

const sendMail = async (options: SendMailOptions) => {
  const { to, subject, html, from, cc, bcc } = options;

  const mailOptions = {
    from: from || DEFAULT_FROM_EMAIL,
    to: to,
    subject: subject,
    html: html,
    ...(cc && { cc }),
    ...(bcc && { bcc }),
  };

  console.log("Sending email with options:", {
    to,
    cc: cc || "none",
    bcc: bcc || "none",
    subject,
  });

  const info = await transporter.sendMail(mailOptions);

  console.log("Email sent successfully:", {
    messageId: info.messageId,
    response: info.response,
  });

  return info;
};

export default sendMail;

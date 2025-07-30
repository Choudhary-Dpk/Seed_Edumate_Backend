// src/services/emailService.ts
import nodemailer from 'nodemailer';
import { EmailConfig, gmailConfig } from '../config/email-config';
import { generateLoanApplicationEmail } from '../utils/emailTemplates';
import { EmailData } from '../types/email.types';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
  }>;
}

// Create transporter instance
const createTransporter = (config: EmailConfig) => {
  return nodemailer.createTransport(config);
};

// Default configuration and transporter
const defaultConfig = gmailConfig; // or sendGridConfig, smtpConfig
const defaultFrom = process.env.DEFAULT_FROM_EMAIL || 'info@edumateglobal.com';
const transporter = createTransporter(defaultConfig);

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: options.from || defaultFrom,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      cc: Array.isArray(options.cc) ? options.cc.join(', ') : options.cc,
      bcc: Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const verifyConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('Email server connection verified');
    return true;
  } catch (error) {
    console.error('Email server connection failed:', error);
    return false;
  }
};

// Utility functions for sending common email types
export const sendWelcomeEmail = async (
  to: string,
  applicationData: EmailData
): Promise<void> => {
  const emailHTML = generateLoanApplicationEmail(applicationData);
  await sendEmail({
    to,
    subject: "Welcome!",
    html: emailHTML,
    text: `Welcome, ${"userName"}! Thank you for joining our platform. We're excited to have you on board!`,
  });
};

export const sendPasswordResetEmail = async (to: string, resetLink: string): Promise<void> => {
  await sendEmail({
    to,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `,
    text: `Password Reset: ${resetLink} (expires in 1 hour)`,
  });
};

// Function to create a custom transporter if needed
export const createCustomEmailSender = (config: EmailConfig, customDefaultFrom?: string) => {
  const customTransporter = createTransporter(config);
  const fromEmail = customDefaultFrom || defaultFrom;
  
  return {
    sendEmail: async (options: EmailOptions): Promise<void> => {
      try {
        const mailOptions = {
          from: options.from || fromEmail,
          to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
          cc: Array.isArray(options.cc) ? options.cc.join(', ') : options.cc,
          bcc: Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc,
          subject: options.subject,
          text: options.text,
          html: options.html,
          attachments: options.attachments,
        };

        const info = await customTransporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
      } catch (error) {
        console.error('Error sending email:', error);
        throw error;
      }
    },
    
    verifyConnection: async (): Promise<boolean> => {
      try {
        await customTransporter.verify();
        console.log('Email server connection verified');
        return true;
      } catch (error) {
        console.error('Email server connection failed:', error);
        return false;
      }
    }
  };
};
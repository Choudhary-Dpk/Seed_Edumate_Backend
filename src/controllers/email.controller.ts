import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { 
  sendEmail, 
  sendWelcomeEmail, 
  sendPasswordResetEmail, 
  verifyConnection 
} from '../services/eamil.service';
import { EmailData } from '../types/email.types';

// Helper function to handle validation errors
const handleValidationErrors = (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  return null;
};

export const testConnection = async (req: Request, res: Response) => {
  try {
    const isConnected = await verifyConnection();
    
    res.status(200).json({
      success: true,
      connected: isConnected,
      message: isConnected 
        ? 'Email service connection verified' 
        : 'Email service connection failed'
    });
  } catch (error) {
    console.error('Email connection test failed:', error);
    res.status(500).json({
      success: false,
      connected: false,
      error: 'Email service connection test failed'
    });
  }
};

export const sendTestEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const testEmail = email || 'test@example.com';
    
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }
    
    await sendEmail({
      to: testEmail,
      subject: 'Test Email from Your App',
      text: `This is a test email sent at ${new Date().toISOString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Test Email</h1>
          <p>This is a test email to verify your email configuration is working!</p>
          <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated test email from your application.
          </p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${testEmail}`
    });
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test email'
    });
  }
};

export const sendBasicEmail = async (req: Request, res: Response) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const { to, subject, message, html, cc, bcc } = req.body;
    
    await sendEmail({
      to,
      subject,
      text: message,
      html: html || `<p>${message}</p>`,
      cc,
      bcc,
    });

    res.status(200).json({
      success: true,
      message: `Email sent successfully to ${to}`
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email'
    });
  }
};

export const sendWelcome = async (req: Request, res: Response) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const payload: EmailData = req.body;
    const recipientMail = payload?.personalInfo?.email
    
    await sendWelcomeEmail(recipientMail, payload);
    
    res.status(200).json({
      success: true,
      message: `Welcome email sent successfully to ${recipientMail}`
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send welcome email'
    });
  }
};

export const sendPasswordReset = async (req: Request, res: Response) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const { email, resetLink } = req.body;
    
    await sendPasswordResetEmail(email, resetLink);
    
    res.status(200).json({
      success: true,
      message: `Password reset email sent successfully to ${email}`
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send password reset email'
    });
  }
};

export const sendBulkEmails = async (req: Request, res: Response) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const { recipients, subject, message, html } = req.body;
    
    // Send emails in batches to avoid overwhelming the email service
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      batches.push(batch);
    }
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const batch of batches) {
      const emailPromises = batch.map(async (email: string) => {
        try {
          await sendEmail({
            to: email,
            subject,
            text: message,
            html: html || `<p>${message}</p>`,
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error);
          failureCount++;
        }
      });
      
      await Promise.all(emailPromises);
      
      // Small delay between batches to be respectful to email service
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Bulk email operation completed`,
      results: {
        total: recipients.length,
        successful: successCount,
        failed: failureCount
      }
    });
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send bulk emails'
    });
  }
};

export const sendEmailWithAttachment = async (req: Request, res: Response) => {
  try {
    const { to, subject, message, attachments } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'to, subject, and message are required'
      });
    }
    
    if (!/\S+@\S+\.\S+/.test(to)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }
    
    await sendEmail({
      to,
      subject,
      text: message,
      html: `<p>${message}</p>`,
      attachments: attachments || []
    });

    res.status(200).json({
      success: true,
      message: `Email with attachments sent successfully to ${to}`
    });
  } catch (error) {
    console.error('Error sending email with attachment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email with attachment'
    });
  }
};

export const sendTemplateEmail = async (req: Request, res: Response) => {
  try {
    const { to, templateData } = req.body;
    
    if (!to || !templateData) {
      return res.status(400).json({
        success: false,
        error: 'to and templateData are required'
      });
    }
    
    if (!/\S+@\S+\.\S+/.test(to)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }
    
    const { 
      subject, 
      userName, 
      orderNumber, 
      orderTotal, 
      templateType = 'order-confirmation' 
    } = templateData;
    
    let htmlTemplate = '';
    let textContent = '';
    
    switch (templateType) {
      case 'order-confirmation':
        htmlTemplate = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; }
              .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .footer { background-color: #f8f9fa; padding: 15px; text-align: center; color: #666; }
              .order-details { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Order Confirmation</h1>
              </div>
              <div class="content">
                <h2>Hello, ${userName}!</h2>
                <p>Thank you for your order. We're excited to get it prepared for you!</p>
                <div class="order-details">
                  <h3>Order Details:</h3>
                  <p><strong>Order Number:</strong> #${orderNumber}</p>
                  <p><strong>Total Amount:</strong> $${orderTotal}</p>
                  <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                <p>We'll send you another email with tracking information once your order ships.</p>
                <p>If you have any questions, feel free to contact our support team.</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 Your Company. All rights reserved.</p>
                <p>This is an automated email, please do not reply.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        textContent = `Hello ${userName}, your order #${orderNumber} for $${orderTotal} has been confirmed. We'll send tracking info once it ships.`;
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Unknown template type'
        });
    }

    await sendEmail({
      to,
      subject: subject || `Order Confirmation - #${orderNumber}`,
      html: htmlTemplate,
      text: textContent,
    });

    res.status(200).json({
      success: true,
      message: `Template email sent successfully to ${to}`
    });
  } catch (error) {
    console.error('Error sending template email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send template email'
    });
  }
};
import { createTransport } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import {
  DEFAULT_FROM_EMAIL,
  EMAIL_PASS,
  EMAIL_USER,
  SMTP_HOST,
  SMTP_PORT,
} from "../setup/secrets";
import logger from "../utils/logger";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface EmailAttachment {
  filename: string;
  path?: string;
  content?: Buffer | string;
  contentType?: string;
}

export interface UnifiedEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailAttachment[];
  metadata?: {
    type?: string;
    emailSource?: 'auto' | 'manual';
    partnerId?: number;
    emailLogId?: number;
    [key: string]: any;
  };
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  rejectedRecipients?: string[];
}

interface EmailValidation {
  valid: boolean;
  error?: string;
}

// ============================================================================
// EMAIL VALIDATION (Built-in - no external dependencies)
// ============================================================================

/**
 * Validate email format using RFC 5322 compliant regex
 * This is a simplified but robust email validator
 */
function isValidEmailFormat(email: string): boolean {
  // RFC 5322 compliant email regex (simplified version)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email);
}

// ============================================================================
// EMAIL TRANSPORTER (Reused from mail.ts)
// ============================================================================

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

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate single email address
 * Enhanced from dashboard-email.service.ts with better security
 */
export function validateSingleEmail(email: string): EmailValidation {
  // Check for null/undefined
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  // Trim whitespace
  email = email.trim();

  // Check length (RFC 5321)
  if (email.length === 0) {
    return { valid: false, error: 'Email cannot be empty' };
  }

  if (email.length > 254) {
    return { valid: false, error: 'Email exceeds maximum length (254 characters)' };
  }

  // Check for injection attempts (commas, semicolons, newlines)
  if (/[,;\n\r<>]/.test(email)) {
    return { valid: false, error: 'Email contains invalid characters' };
  }

  // Use built-in email validation
  if (!isValidEmailFormat(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

/**
 * Validate email options before sending
 */
export function validateEmailOptions(options: UnifiedEmailOptions): EmailValidation {
  // Validate recipient(s)
  const recipients = Array.isArray(options.to) ? options.to : [options.to];
  
  for (const email of recipients) {
    const validation = validateSingleEmail(email);
    if (!validation.valid) {
      return { valid: false, error: `Invalid recipient: ${validation.error}` };
    }
  }

  // Validate CC if present
  if (options.cc) {
    const ccList = Array.isArray(options.cc) ? options.cc : [options.cc];
    for (const email of ccList) {
      const validation = validateSingleEmail(email);
      if (!validation.valid) {
        return { valid: false, error: `Invalid CC: ${validation.error}` };
      }
    }
  }

  // Validate BCC if present
  if (options.bcc) {
    const bccList = Array.isArray(options.bcc) ? options.bcc : [options.bcc];
    for (const email of bccList) {
      const validation = validateSingleEmail(email);
      if (!validation.valid) {
        return { valid: false, error: `Invalid BCC: ${validation.error}` };
      }
    }
  }

  // Validate subject
  if (!options.subject || options.subject.trim().length === 0) {
    return { valid: false, error: 'Subject is required' };
  }

  // Validate content
  if (!options.html && !options.text) {
    return { valid: false, error: 'Either HTML or text content is required' };
  }

  // Validate attachments size if present
  if (options.attachments && options.attachments.length > 0) {
    const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB per attachment
    
    for (const attachment of options.attachments) {
      if (attachment.content) {
        const size = Buffer.isBuffer(attachment.content) 
          ? attachment.content.length 
          : Buffer.byteLength(attachment.content);
        
        if (size > MAX_ATTACHMENT_SIZE) {
          return { 
            valid: false, 
            error: `Attachment "${attachment.filename}" exceeds 10MB limit` 
          };
        }
      }
    }
  }

  return { valid: true };
}

// ============================================================================
// CORE EMAIL SENDING FUNCTION
// ============================================================================

/**
 * Send email using unified service
 * 
 * This is the ONLY function that actually sends emails
 * All other email functions should delegate to this
 * 
 * @param options - Email options
 * @returns Email result with success status and message ID
 */
export async function sendUnifiedEmail(
  options: UnifiedEmailOptions
): Promise<EmailResult> {
  try {
    // Validate email options
    const validation = validateEmailOptions(options);
    if (!validation.valid) {
      logger.error('Email validation failed', {
        error: validation.error,
        to: options.to,
        subject: options.subject
      });
      throw new Error(validation.error);
    }

    // Prepare recipients
    const to = Array.isArray(options.to) ? options.to.join(', ') : options.to;
    const cc = options.cc 
      ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc)
      : undefined;
    const bcc = options.bcc
      ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc)
      : undefined;

    // Prepare mail options
    const mailOptions = {
      from: options.from || DEFAULT_FROM_EMAIL,
      to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      ...(cc && { cc }),
      ...(bcc && { bcc }),
      ...(options.attachments && { attachments: options.attachments }),
    };

    // Log email send attempt
    logger.info('Sending email', {
      to,
      cc: cc || 'none',
      bcc: bcc || 'none',
      subject: options.subject,
      hasAttachments: !!(options.attachments && options.attachments.length > 0),
      metadata: options.metadata
    });

    // Send email via SMTP
    const info = await transporter.sendMail(mailOptions);

    // Log success
    logger.info('Email sent successfully', {
      messageId: info.messageId,
      response: info.response,
      to,
      subject: options.subject,
      metadata: options.metadata
    });

    return {
      success: true,
      messageId: info.messageId,
      rejectedRecipients: info.rejected as string[]
    };

  } catch (error: any) {
    // Log error
    logger.error('Email send failed', {
      error: error.message,
      stack: error.stack,
      to: options.to,
      subject: options.subject,
      metadata: options.metadata
    });

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verify email transporter connection
 * Used for health checks
 */
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    logger.info('Email server connection verified');
    return true;
  } catch (error: any) {
    logger.error('Email server connection failed', { error: error.message });
    return false;
  }
}

/**
 * Get email service status
 * For monitoring and health checks
 */
export async function getEmailServiceStatus(): Promise<{
  status: 'healthy' | 'unhealthy';
  lastChecked: string;
  error?: string;
}> {
  try {
    const isHealthy = await verifyEmailConnection();
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      lastChecked: new Date().toISOString()
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      lastChecked: new Date().toISOString(),
      error: error.message
    };
  }
}
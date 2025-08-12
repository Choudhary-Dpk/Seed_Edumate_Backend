import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { 
  sendLoanEligibilityResultEmail, 
  sendPasswordResetEmail, 
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

export const sendLoanEligibilityResult = async (req: Request, res: Response) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const payload: EmailData = req.body;
    const recipientMail = payload?.personalInfo?.email
    
    await sendLoanEligibilityResultEmail(recipientMail, payload);
    
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
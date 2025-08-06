import { Router } from 'express';
import { body } from 'express-validator';
import {
  testConnection,
  sendTestEmail,
  sendBasicEmail,
  sendWelcome,
  sendPasswordReset,
  sendBulkEmails,
  sendEmailWithAttachment,
  sendTemplateEmail
} from '../controllers/email.controller';

const router = Router();

// Validation middleware
const validateEmail = [
  body('to')
    .isEmail()
    .withMessage('Valid email address is required'),
  body('subject')
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject is required and must be less than 200 characters'),
  body('message')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Message must be less than 5000 characters'),
];

const validateBulkEmail = [
  body('recipients')
    .isArray({ min: 1, max: 100 })
    .withMessage('Recipients must be an array with 1-100 emails'),
  body('recipients.*')
    .isEmail()
    .withMessage('All recipients must be valid email addresses'),
  body('subject')
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject is required and must be less than 200 characters'),
  body('message')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message is required and must be less than 5000 characters'),
];

const validateWelcomeEmail = [
  body('email')
    .isEmail()
    .withMessage('Valid email address is required'),
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be less than 100 characters'),
];

const validatePasswordReset = [
  body('email')
    .isEmail()
    .withMessage('Valid email address is required'),
  body('resetLink')
    .isURL()
    .withMessage('Valid reset link URL is required'),
];

// Routes
router.get('/test-connection', testConnection);
router.post('/test', sendTestEmail);
router.post('/send', validateEmail, sendBasicEmail);
router.post('/loan-eligibility-info', sendWelcome);
router.post('/password-reset', validatePasswordReset, sendPasswordReset);
router.post('/bulk', validateBulkEmail, sendBulkEmails);
router.post('/with-attachment', sendEmailWithAttachment);
router.post('/template', sendTemplateEmail);

export {router as emailRouter};
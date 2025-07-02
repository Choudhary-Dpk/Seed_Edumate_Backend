import { body } from 'express-validator';

export const createUserValidator = [
  body('name')
    .notEmpty()
    .withMessage('Name is required'),

  body('email')
    .isEmail()
    .withMessage('Email must be valid'),
];

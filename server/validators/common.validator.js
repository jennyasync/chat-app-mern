import { param, query } from 'express-validator';
import { validate } from '../middlewares/validate.middleware.js';

export const validateObjectId = (name = 'id') => [
  param(name).isMongoId().withMessage(`${name} must be a valid id`),
  validate,
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('limit must be an integer between 1 and 50')
    .toInt(),
  validate,
];

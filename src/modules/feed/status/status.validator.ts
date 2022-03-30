import { body } from 'express-validator';

import { handleInputError } from '../../../utils/middlewares/errorHandler';

export class StatusValidator {
  static status = body('status').trim().isLength({ min: 5 }).withMessage('Type at least 5 characters!');

  static valid = [
    StatusValidator.status,
    handleInputError,
  ];
}

import { body } from 'express-validator';

import { handleInputError } from '../../../utils/middlewares/errorHandler';

export class FeedValidator {
  static title = body('title').isLength({ min: 5 }).withMessage('Type at least 5 characters to the product title!');
  static content = body('content').isLength({ min: 10 }).withMessage('Type at least 10 characters');

  static valid = (isEditing: boolean) => [
    FeedValidator.title,
    FeedValidator.content,
    handleInputError
  ];
}

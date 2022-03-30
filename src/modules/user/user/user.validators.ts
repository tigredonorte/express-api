import { body } from 'express-validator';

import { handleInputError } from '../../../utils/middlewares/errorHandler';
import { UsersModel } from './user.model';

export class UserValidator {
  static userModel = new UsersModel();
  static password = body('password')
    .isLength({ min: 8 })
    .withMessage('Type at least 8 characters')
    .matches(/\d/)
    .withMessage('must contain a number')
    .matches(/[a-z]/)
    .withMessage('must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('must contain at least one uppercase letter');
  static email = body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .custom(async(email) => {
      const user = await UserValidator.userModel.getByEmail(email);
      if (user) {
        throw new Error('Email already registered!');
      }
      return true;
    });
  static userName = body('name').isLength({ min: 1 }).withMessage('You must fill your name');
  static valid = [UserValidator.password, UserValidator.email, UserValidator.userName, handleInputError];
}

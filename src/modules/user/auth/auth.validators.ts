import { body } from 'express-validator';
import { isEmpty } from 'ramda';
import validator from 'validator';

import { handleInputError } from '../../../utils/middlewares/errorHandler';
import { UsersModel } from '../user/user.model';

const userModel = new UsersModel();

export class AuthValidator {
  static userName = body('name').isLength({ min: 1 }).withMessage('You must fill your name');
  static email = (isSignup: boolean) =>
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail({ gmail_remove_subaddress: false })
      .custom(async (email) => {
        const result = await userModel.getByEmail(email);
        if (isSignup) {
          if (result) {
            throw new Error(`Email already exists`);
          }
        } else if (!result) {
          throw new Error(`Email doesn't exist`);
        }
        return true;
      });

  static confirm = body('confirm_password').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error(`Passwords have to match`);
    }
    return true;
  });
  static password = body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Type at least 8 characters')
    .matches(/\d/)
    .withMessage('must contain a number')
    .matches(/[a-z]/)
    .withMessage('must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('must contain at least one uppercase letter');

  static signup = [
    AuthValidator.email(true),
    AuthValidator.password,
    AuthValidator.confirm,
    AuthValidator.userName,
    handleInputError,
  ];
  static login = [AuthValidator.password, AuthValidator.email(false), handleInputError];
  static reset = [AuthValidator.password, AuthValidator.confirm, handleInputError];
}

export class AuthValidatorModel {
  private isLogin = false;
  private errors: { [s: string]: any } = {};
  public getErrors() {
    return this.errors;
  }

  public async isValid(
    fields: ('email' | 'password' | 'name' | 'confirm_password')[],
    inputs: any,
    isLogin: boolean
  ): Promise<boolean> {
    this.isLogin = isLogin;
    await Promise.all(fields.map((field) => this[field](inputs[field], inputs)));
    return isEmpty(this.errors);
  }

  private async email(email: string, inputs: any): Promise<boolean> {
    if (!validator.isEmail(email)) {
      return this.setError('email', 'Please enter a valid email', email);
    }
    if (this.isLogin) {
      return true;
    }
    const user = await userModel.getByEmail(email);
    if (user) {
      return this.setError('email', 'Email already exists!', email);
    }
    return true;
  }

  private async password(password: string, inputs: any): Promise<boolean> {
    if (!validator.isLength(password, { min: 8 })) {
      return this.setError('password', 'Type at least 8 characters', password);
    }
    if (!validator.matches(password, /[a-z]/)) {
      return this.setError('password', 'must contain a number', password);
    }
    if (!validator.matches(password, /\d/)) {
      return this.setError('password', 'must contain at least one lowercase letter', password);
    }
    if (!validator.matches(password, /[A-Z]/)) {
      return this.setError('password', 'must contain at least one uppercase letter', password);
    }
    return true;
  }

  private async name(name: string, inputs: any): Promise<boolean> {
    return validator.isEmpty(name) ? this.setError('name', `must contain at least one uppercase letter`, name) : true;
  }

  private async confirm_password(confirm_password: string, inputs: any): Promise<boolean> {
    return !validator.equals(inputs.password, confirm_password)
      ? this.setError('confirm_password', `Password and confirm password must be equals`, confirm_password)
      : true;
  }

  private setError(field: string, message: string, value: any) {
    this.errors[field] = { message, value };
    return false;
  }
}

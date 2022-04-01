import { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import { isEmpty } from 'ramda';
import { v4 } from 'uuid';
import validator from 'validator';

import { handleInputError } from '../../../utils/middlewares/errorHandler';
import { isValidFile, moveFile } from '../../../utils/middlewares/fileUpload';

const allowedExtensions = ['jpg', 'png', 'jpeg', 'gif'];
const moveImg = async(req: Request, res: Response, next: NextFunction) => {
  if (!req.body.image) {
    delete req.body.image;
    return next();
  }
  const fileName = v4();
  const destinyFolder = 'public/images';
  const imgName = await moveFile(req.body.image, { fileName, allowedExtensions, destinyFolder });
  req.body.image = imgName;
  next();
}

export class FeedValidator {
  static title = body('title').trim().isLength({ min: 5 }).withMessage('Type at least 5 characters to title!');
  static content = body('content').trim().isLength({ min: 10 }).withMessage('Type at least 10 characters');
  static image = (isEditing: boolean) => body('image').custom((img) => {
    if (img) {
      return isValidFile(img, allowedExtensions);
    }
    if (!isEditing) {
      throw new Error("You must attach an image!");
    }
    return true;
  });

  static valid = (isEditing: boolean) => [
    FeedValidator.title,
    FeedValidator.content,
    FeedValidator.image(isEditing),
    handleInputError,
    moveImg
  ];
}

export class PostValidatorModel {
  private creating = false;
  private errors: { [s: string]: any } = {};
  public getErrors() {
    return this.errors;
  }

  public async isValid(
    fields: ('content' | 'title')[],
    inputs: any,
    creating: boolean
  ): Promise<boolean> {
    this.creating = creating;
    await Promise.all(fields.map((field) => this[field](inputs[field], inputs)));
    console.log(this.errors);
    return isEmpty(this.errors);
  }

  private async title(title: string, inputs: any): Promise<boolean> {
    title = validator.trim(title);
    return !validator.isLength(title, { min: 5 }) ? this.setError('title', `Type at least 5 characters`, title) : true;
  }

  private async content(content: string, inputs: any): Promise<boolean> {
    content = validator.trim(content);
    return !validator.isLength(content, { min: 10 }) ? this.setError('content', `Type at least 10 characters`, content) : true;
  }

  private setError(field: string, message: string, value: any) {
    this.errors[field] = { message, value };
    return false;
  }
}

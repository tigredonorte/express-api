import { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import { v4 } from 'uuid';

import { handleInputError } from '../../../utils/middlewares/errorHandler';
import { isValidFile, moveFile } from '../../../utils/middlewares/fileUpload';

const moveImg = async(req: Request, res: Response, next: NextFunction) => {
  if (!req.body.image) {
    return next();
  }
  const fileName = v4();
  const destinyFolder = 'public/images';
  const imgName = await moveFile(req.body.image, { fileName, allowedExtensions: ['jpg', 'png', 'jpeg'], destinyFolder });
  req.body.image = imgName;
  next();
}

export class FeedValidator {
  static title = body('title').trim().isLength({ min: 5 }).withMessage('Type at least 5 characters to the product title!');
  static content = body('content').trim().isLength({ min: 10 }).withMessage('Type at least 10 characters');
  static image = (isEditing: boolean) => body('image').custom((img) => {
    if (img) {
      return isValidFile(img, ['jpg', 'png', 'jpeg']);
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

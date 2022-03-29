import { NextFunction, Request, Response } from 'express';
import formidable, { File } from 'formidable';
import fs from 'fs/promises';
import mime from 'mime-types';

export function parseMultipart(req: Request, res: Response, next: NextFunction) {
  if (req.headers['content-type']?.indexOf('multipart/form-data') === -1) {
    return next();
  }
  var form = new formidable.IncomingForm();

  //@ts-ignore
  req.formidable = form;
  form.parse(req, function (err, fields, files) {
    if (err) {
      console.error(err);
      return next(err);
    }

    const appendFile: Record<string, File> = {};
    for (const i in files) {
      const file = files[i] as File;
      if (file.size > 0) {
        appendFile[i] = file;
      }
    }

    req.body = { ...fields, ...appendFile };
    next();
  });
}

export const isValidFile = function (file: File, allowedExtensions: string[]) {
  const ext = file.originalFilename?.split('.').pop() ?? '';
  const mimeExt = mime.extension(file.mimetype ?? '').toString();
  if (allowedExtensions.indexOf(ext) === -1 || allowedExtensions.indexOf(mimeExt) === -1) {
    throw new Error(`Invalid image type`);
  }
  return true;
};

export const moveFile = async function (
  file: File,
  options: {
    fileName: string;
    allowedExtensions: string[];
    destinyFolder: string;
  }
) {
  const ext = file.originalFilename?.split('.').pop() ?? '';
  isValidFile(file, options.allowedExtensions);
  await fs.rename(file.filepath, `${options.destinyFolder}/${options.fileName}.${ext}`);
  return `${options.fileName}.${ext}`;
};

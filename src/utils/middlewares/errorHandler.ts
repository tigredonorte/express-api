import { NextFunction, Request, Response } from 'express';

import { validationResult } from 'express-validator';

export const handleInputError = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  return res.status(422).json({ error: errors.mapped(), message: 'Input validation error' });
};


export const unhandledError = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const error = err.message ? err.message : null;
  res.status(500).json({ error });
};

export const notFoundError = (req: Request, res: Response) => res.status(404).json({ error: 'Page not found' });
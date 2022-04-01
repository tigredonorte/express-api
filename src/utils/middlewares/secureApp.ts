import { NextFunction, Request, Response } from "express";

export const allowedMethods = ['OPTIONS', 'HEAD', 'CONNECT', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
export const secureMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // NOTE: Exclude TRACE and TRACK methods to avoid XST attacks.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', allowedMethods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (!allowedMethods.includes(req.method)) {
    res.status(405).send(`${req.method} not allowed.`);
  }

  // required by graphQl
  if (req.method === 'OPTIONS') {
    return res.status(200).send('');
  }
  next();
};

import { NextFunction, Request, Response } from 'express';

import { Token } from '../token';

export const userGuard = async function (req: Request<any>, res: Response<any>, next: NextFunction) {
  // @ts-ignore
  req.user = req.headers.authorization ? Token.getToken(req.headers.authorization as string) : null;
  next();
};

export const auth = (req: Request) => {
  if (!req.user) {
    throw new Error(JSON.stringify({ message: 'You must send the authorization header', status: 401 }));
  }
  return req.user;
}

export const authRouteGuard = (req: Request<any>, res: Response<any>, next: NextFunction) => {
  // @ts-ignore
  if (!req.user && req.method !== 'OPTIONS') {
    return res.status(401).json({ msg: 'You must inform authorization header!' });
  }
  next();
}

export const errorGuard = (route: (req: any, res: any, next: any) => void) =>
  async function (req: Request<any>, res: Response<any>, next: NextFunction) {
    try {
      if (typeof route !== 'function') {
        throw new Error('route is not a function!');
      }
      await route(req, res, next);
    } catch (error) {
      next(error);
    }
  };

import { NextFunction, Request, Response } from 'express';

import { Token } from '../token';

export const userGuard = async function (req: Request<any>, res: Response<any>, next: NextFunction) {
  const rawUser = req.headers.token ? Token.getToken(req.headers.token as string) : null;
  res.locals.user = rawUser;
  next();
};

export const authRouteGuard = (req: Request<any>, res: Response<any>, next: NextFunction) => {
  if (!res.locals.user) {
    return res.status(401).json({ msg: 'You must inform user token!' });
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

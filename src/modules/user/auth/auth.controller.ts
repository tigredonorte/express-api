import { Request, Response } from 'express';

import { IUser } from '../user/user.model';
import { AuthModel } from './auth.model';

const model = new AuthModel();

export class AuthController {

  async login(req: Request<any, any, { email: string; password: string }>, res: Response<any>) {
    try {
      const token = await model.login(req.body);
      res.status(200).json({ token });
    } catch (error: any) {
      res.status(500).json({ message: 'Unable to login', error: error?.message ?? error});
    }
  }

  async signup(req: Request<any, any, IUser>, res: Response<any>) {
    try {
      await model.signup(req.body);
      const token = await model.login(req.body);
      model.signupEmail(req.body);
      res.status(201).json({ token });
    } catch (error: any) {
      res.status(500).json({ message: 'Unable to signup', error: error?.message ?? error });
    }
  }

  async reset(req: Request<any, any, { email: string }>, res: Response<any>) {
    try {
      await model.reset(req.body.email);
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error: any) {
      res.status(500).json({ message: 'Password reset error', error: error?.message ?? error });
    }
  }

  async resetPassword(req: Request<any, any, { password: string }>, res: Response<any>) {
    try {
      await model.resetPassword(req.params.hash, req.body);
      res.status(200).end();
    } catch (error: any) {
      res.status(500).json({ error: error?.message ?? error });
    }
  }

  async logout(req: Request<IUser>, res: Response<any>) {
    res.status(501).end();
  }
}

import { IUser } from '../modules/user/user/user.model';

declare global{
  namespace Express {
      interface Request {
        user: IUser & { _id: string; };
      }
  }
}

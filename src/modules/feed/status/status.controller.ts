import { Request, Response } from 'express';

import { ResponseError } from '../../../utils/middlewares/errorHandler';
import { IStatus, StatusModel } from './status.model';

export class StatusController {

  model = new StatusModel();
  async get(req: Request<any>, res: Response<IStatus | ResponseError>) {
    try {
      const status = await this.model.get(res.locals.user._id);
      res.status(200).json(status || {});
    } catch (error: any) {
      this.sendError(res, error, 'Unable to get status');
    }
  }

  async set(req: Request<any>, res: Response<IStatus | ResponseError>) {
    try {
      const status = await this.model.set(res.locals.user._id, req.body.status);
      res.status(200).json(status);
    } catch (error: any) {
      this.sendError(res, error, 'Unable to set status');
    }
  }

  sendError(res: Response<ResponseError>, error: any, message: string) {
    res.status(error.status ?? 500).json({ error: error?.message ?? error, message});
  }
}

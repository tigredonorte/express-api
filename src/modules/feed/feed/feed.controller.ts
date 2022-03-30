import { Request, Response } from 'express';

import { FeedModel, IFeed, PaginateType } from './feed.model';
interface FeedError {
  error: any;
  message: string;
}

export class FeedController {

  model = new FeedModel();
  async list(req: Request<any>, res: Response<PaginateType | FeedError>) {
    try {
      let page = Number(req.query.page ?? 1).valueOf();
      if(page < 1) {
        page = 1;
      }
      const data = await this.model.paginate(page);
      res.status(200).json(data);
    } catch (error: any) {
      this.sendError(res, error, 'Unable to fetch post');
    }
  }

  async get(req: Request<any>, res: Response<IFeed | FeedError>) {
    try {
      const post = await this.model.get(req.params.id);
      res.status(200).json(post);
    } catch (error: any) {
      this.sendError(res, error, 'Unable to get post');
    }
  }

  async add(req: Request<any>, res: Response<{ data: IFeed } | FeedError>) {
    try {
      const data = await this.model.add({ ...req.body, creator: res.locals.user._id });
      res.status(201).json({ data });
    } catch (error: any) {
      this.sendError(res, error, 'Unable to create post');
    }
  }

  async edit(req: Request<any>, res: Response<{ data: IFeed } | FeedError>) {
    try {
      const post = await this.isAuthorized(req, res);
      const data = await this.model.edit(post, req.body);
      res.status(200).json({ data });
    } catch (error: any) {
      this.sendError(res, error, 'Unable to alter post');
    }
  }

  async delete(req: Request<any>, res: Response<FeedError>) {
    try {
      const post = await this.isAuthorized(req, res);
      await this.model.delete(post);
      res.status(204).end();
    } catch (error: any) {
      this.sendError(res, error, 'Unable to delete post');
    }
  }

  async isAuthorized(req: Request<any>, res: Response<FeedError>): Promise<IFeed> {
    try {
      return await this.model.isAuthorized(req.params.id, res.locals.user._id);
    } catch (error: any) {
      error.status = 403;
      throw error;
    }
  }

  sendError(res: Response<FeedError>, error: any, message: string) {
    res.status(error.status ?? 500).json({ error: error?.message ?? error, message});
  }
}

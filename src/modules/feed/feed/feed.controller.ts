import { Request, Response } from 'express';

import { FeedModel, IFeedInput, PaginateType } from './feed.model';
interface FeedError {
  error: any;
  message: string;
}

export class FeedController {

  model = new FeedModel();
  async list(req: Request<any>, res: Response<PaginateType | FeedError>) {
    try {
      const page = Number(req.query.page ?? 1).valueOf();
      const data = await this.model.paginate(page);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error, message: 'Unable to fetch posts'});
    }
  }

  async get(req: Request<any>, res: Response<IFeedInput | FeedError>) {
    try {
      const posts = await this.model.get(req.params.id);
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ error, message: 'Unable to get post'});
    }
  }

  async add(req: Request<any>, res: Response<{ data: IFeedInput } | FeedError>) {
    try {
      const post = await this.model.add(req.body);
      res.status(201).json({ data: post });
    } catch (error) {
      res.status(500).json({ error, message: 'Unable to create post' });
    }
  }

  async edit(req: Request<any>, res: Response<FeedError>) {
    try {
      await this.model.edit(req.params.id, req.body);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error, message: 'Unable to alter post'});
    }
  }

  async delete(req: Request<any>, res: Response<FeedError>) {
    try {
      await this.model.delete(req.params.id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error, message: 'Unable to delete post'});
    }
  }
}

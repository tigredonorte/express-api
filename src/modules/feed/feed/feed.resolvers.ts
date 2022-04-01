import { Request } from 'express';
import { auth } from '../../../utils/middlewares/route-guard';
import { FeedModel, IFeed, IFeedInput } from './feed.model';
import { PostValidatorModel } from './feed.validator';

const postModel = new FeedModel();
const isAuthorized = async(id: string, req: Request<any>): Promise<IFeed> => {
  try {
    return await postModel.isAuthorized(id, req.user._id);
  } catch (error: any) {
    throw new Error(JSON.stringify({ message: error.message, status: 403, error: error }));
  }
}

export const postsResolver = {
  listPosts: async (args: { page: number }, req: Request) => {
    auth(req);
    if (args.page < 1) {
      args.page = 1;
    }
    return await postModel.paginate(args.page);
  },
  getPost: async (args: { postId: string }, req: Request) => {
    auth(req);
    return await postModel.get(args.postId);
  },
  createPost: async (args: { postData: IFeedInput }, req: Request) => {
    const user = auth(req);
    const validator = new PostValidatorModel();
    if (!(await validator.isValid(['title', 'content'], args.postData, true))) {
      throw new Error(JSON.stringify({ message: 'invalid input', status: 422, data: validator.getErrors() }));
    }

    const post = await postModel.add({ ...args.postData, creator: user._id, image: 'asdfsdf' });
    return await postModel.get(post._id);
  },
  
  editPost: async (args: { postId: string, postData: IFeedInput }, req: Request) => {
    auth(req);
    const validator = new PostValidatorModel();
    if (!(await validator.isValid(['title', 'content'], args.postData, true))) {
      throw new Error(JSON.stringify({ message: 'invalid input', status: 422, data: validator.getErrors() }));
    }

    const post = await isAuthorized(args.postId, req);
    const data = await postModel.edit(post, args.postData);
    return await postModel.get(data._id);
  },
  deletePost: async (args: { postId: string }, req: Request) => {
    auth(req);
    const post = await isAuthorized(args.postId, req);
    await postModel.delete(post);
    return true;
  },
};

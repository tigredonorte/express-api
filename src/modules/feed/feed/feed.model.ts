import mongoose, { Schema } from 'mongoose';

import { User } from '../../user/user/user.model';

export interface IFeedInput {
  title: string;
  content: string;
  creator: Schema.Types.ObjectId;
}

interface IFeed extends IFeedInput{
  _id: string;
  createdAt: string,
  updatedAt: string;
}

const feedSchema = new Schema<IFeed>({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: User.modelName,
    required: true,
  },
}, {
  timestamps: true,
});

export const Feed = mongoose.model('post', feedSchema);

export interface PaginateType {
  posts: IFeed[];
  total: number
};

export class FeedModel {
  
  itemsPerPage = 3;
  async paginate(page: number): Promise<PaginateType> {
    const where = {};
    const selectFields: (keyof IFeed)[] = ['title', 'content', 'createdAt'];
    const total = await Feed.countDocuments(where);
    const posts = await Feed.find(where)
      .skip((page - 1) * this.itemsPerPage)
      .limit(this.itemsPerPage)
      .select(selectFields)
      .populate('creator', ['name']);
    return { posts, total: Math.ceil(total / this.itemsPerPage) };
  }

  async add(post: IFeedInput): Promise<IFeed> {
    const p = new Feed(post);
    await p.save();
    return p;
  }

  async get(productId: string): Promise<IFeed> {
    return (await Feed.findById(productId)) as IFeed;
  }

  async edit(id: string, post: IFeedInput): Promise<void> {
    await Feed.updateOne({ _id: id }, { $set: post });
  }

  async delete(id: string): Promise<void> {
    await Feed.deleteOne({ _id: id });
  }
}

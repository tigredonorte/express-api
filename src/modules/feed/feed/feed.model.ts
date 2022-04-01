import fs from 'fs/promises';
import mongoose, { Schema } from 'mongoose';
import path from 'path';

import { User } from '../../user/user/user.model';

export interface IFeedInput {
  title: string;
  content: string;
  creator: Schema.Types.ObjectId | String;
  image?: string;
}

export interface IFeed extends IFeedInput {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

const feedSchema = new Schema<IFeed>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: User.modelName,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Feed = mongoose.model('post', feedSchema);

export interface PaginateType {
  posts: IFeed[];
  pageCount: number;
  total: number;
  itemsPerPage: number;
}

export class FeedModel {
  itemsPerPage = 2;
  async paginate(page: number): Promise<PaginateType> {
    const where = {};
    const selectFields: (keyof IFeed)[] = ['title', 'content', 'createdAt', 'image'];
    const total = await Feed.countDocuments(where);
    const posts = await Feed.find(where)
      .skip((page - 1) * this.itemsPerPage)
      .limit(this.itemsPerPage)
      .select(selectFields)
      .populate('creator', ['name'])
      .sort({ updatedAt: 'descending' });
    return { posts, total, pageCount: Math.ceil(total / this.itemsPerPage), itemsPerPage: this.itemsPerPage };
  }

  async add(post: IFeedInput): Promise<IFeed> {
    const p = new Feed(post);
    await p.save();
    return p;
  }

  async get(productId: string): Promise<IFeed> {
    return (await Feed.findById(productId).populate('creator', ['name'])) as IFeed;
  }

  async edit(oldPost: IFeed, post: IFeedInput): Promise<IFeed> {
    if (post.image) {
      this.deleteFile(oldPost);
    }
    return (await Feed.findByIdAndUpdate(oldPost._id, { $set: post }, { new: true }).populate('creator', [
      'name',
    ])) as IFeed;
  }

  async delete(oldPost: IFeed): Promise<void> {
    this.deleteFile(oldPost);
    await Feed.deleteOne({ _id: oldPost._id });
  }

  async deleteFile(oldPost: IFeed) {
    try {
      if (oldPost?.image) {
        await fs.unlink(path.resolve('public', 'images', oldPost.image));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async isAuthorized(postId: string, creator: string): Promise<IFeed> {
    const post = await Feed.findOne({ _id: postId, creator });
    if (!post) {
      throw new Error('Not Authorized!');
    }
    return post;
  }
}

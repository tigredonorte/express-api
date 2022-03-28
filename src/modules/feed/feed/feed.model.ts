import mongoose, { Schema } from 'mongoose';

export interface IFeed {
  _id?: string;
  title: string,
  content: string,
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
    const selectFields = ['title', 'content'];
    const total = await Feed.countDocuments(where);
    const posts = await Feed.find(where)
      .skip((page - 1) * this.itemsPerPage)
      .limit(this.itemsPerPage)
      .select(selectFields);
    return { posts, total: Math.ceil(total / this.itemsPerPage) };
  }

  async add(post: IFeed): Promise<IFeed> {
    const p = new Feed(post);
    await p.save();
    return p;
  }

  async get(productId: string): Promise<IFeed> {
    return (await Feed.findById(productId)) as IFeed;
  }

  async edit(id: string, post: IFeed): Promise<void> {
    await Feed.updateOne({ _id: id }, { $set: post });
  }

  async delete(id: string): Promise<void> {
    await Feed.deleteOne({ _id: id });
  }
}

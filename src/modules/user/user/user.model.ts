import bcrypt from 'bcrypt';
import mongoose, { Schema } from 'mongoose';

export interface IUserInput {
  email: string;
  password: string;
  name: string;
}

export interface IUser extends IUserInput{
  _id?: string;
  recoverDate?: Date,
  recoverHash?: string
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: [true, 'Email required'],
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  recoverDate: Date,
  recoverHash: String
}, {
  timestamps: true,
});

export const User = mongoose.model('user', userSchema);

export class UsersModel {
  async list(): Promise<IUser[]> {
    try {
      return await User.find();
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async get(id: string): Promise<IUser | null> {
    this.checkId(id);
    return (await User.findById({ _id: id })) as IUser;
  }

  async getByEmail(email: string): Promise<IUser | null> {
    return (await User.exists({ email })) as IUser;
  }

  async add(user: IUserInput): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(user.password as string, salt);
    const u = new User({
      ...user,
      password,
    });
    await u.save();
  }

  async edit(id: string, user: IUserInput): Promise<void> {
    this.checkId(id);
    if (user.password) {
      user.password = await this.encryptPassword(user.password);
    }
    await User.updateOne({ _id: id }, { $set: user });
  }

  async delete(id: string): Promise<void> {
    await User.deleteOne({ _id: id });
  }

  async encryptPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  checkId(productId: string) {
    if (!productId) {
      throw new Error('You must inform the product Id');
    }
  }
}

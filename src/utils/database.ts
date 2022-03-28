import mongoose from 'mongoose';

require('dotenv').config();

export class Database {

  static async init(callback: () => void) {
    await mongoose.connect(process.env.MONGO_URL || '');
    callback();
  }

}

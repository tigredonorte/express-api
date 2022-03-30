import mongoose, { Schema } from 'mongoose';

export interface IStatusInput {
  status: string;
}

export interface IStatus extends IStatusInput {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

const StatusSchema = new Schema<IStatus>(
  {
    status: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

export const Status = mongoose.model('status', StatusSchema);

export class StatusModel {

  async get(userId: string): Promise<IStatus> {
    return (await Status.findById(userId)) as IStatus;
  }

  async set(userId: string, status: string): Promise<IStatus> {
    return await Status.findOneAndUpdate({ _id: userId }, { status }) as IStatus;
  }

}

import { Document } from 'mongoose';

export interface TrainPlanModel extends Document {
    userId: string;
    title: string;
    date: Date;
    status: string;
  }
  
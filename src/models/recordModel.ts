import mongoose from 'mongoose';

export interface RecordModel {
  userId: string;
  activityId: number;
  name: string;
  source: 'apple_watch' | 'garmin' | 'wahoo' | 'manual' | 'other';
  type: 'Run' | 'Ride' | 'Swim' | 'WeightTraining' | 'other';
  distance: number; // km
  movingTime: number; // min
  elapsedTime: number;
  averageHeartrate?: number;
  totalElevationGain?: number;
  averageSpeed: number;
  calories?: number;
  startDate: Date;
  rawData?: any;
}


const recordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activityId: { type: Number, required: true },
    source: { type: String, enum: ['apple_watch', 'garmin', 'wahoo', 'manual', 'other'] },
    name: { type: String, required: true },
    distance: { type: Number, required: true },
    movingTime: { type: Number, required: true },
    elapsedTime: { type: Number, required: true },
    type: { type: String, required: true },
    averageHeartrate: { type: String },  
    totalElevationGain: { type: Number },
    calories: { type: Number },
    startDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// add index
recordSchema.index({ userId: 1 });
recordSchema.index({ category: 1 });
recordSchema.index({ source: 1 });
recordSchema.index({ date: -1 });
recordSchema.index({ userId: 1, category: 1 });
recordSchema.index({ userId: 1, date: -1 });

const Record = mongoose.model<RecordModel>('Record', recordSchema);

export default Record;

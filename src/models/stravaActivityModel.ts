import mongoose, { Document, Types } from 'mongoose';

export interface StravaActivityModel extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  activityId: number;
  name: string;
  source: 'apple_watch' | 'garmin' | 'wahoo' | 'manual' | 'other';
  type: string;
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

const stravaActivitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activityId: { type: Number, required: true, unique: true },
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

stravaActivitySchema.set('toJSON', {
  virtuals: true,        // 启用虚拟属性（例如 id）
  versionKey: false,     // 删除 __v
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    ret.userId = ret.userId.toString();
    delete ret._id;
  },
});

stravaActivitySchema.set('toObject', {
  virtuals: true,        // 启用虚拟属性（例如 id）
  versionKey: false,     // 删除 __v
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    ret.userId = ret.userId.toString();
    delete ret._id;
  },
});

// add index
stravaActivitySchema.index({ userId: 1 });
stravaActivitySchema.index({ category: 1 });
stravaActivitySchema.index({ source: 1 });
stravaActivitySchema.index({ date: -1 });
stravaActivitySchema.index({ userId: 1, category: 1 });
stravaActivitySchema.index({ userId: 1, date: -1 });

const StravaActivity = mongoose.model<StravaActivityModel>('StravaActivity', stravaActivitySchema);

export default StravaActivity;

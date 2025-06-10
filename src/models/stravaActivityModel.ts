import mongoose from 'mongoose';
import { StravaActivityModel } from '../interfaces/entity/stravaActivity';


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

// add index
stravaActivitySchema.index({ userId: 1 });
stravaActivitySchema.index({ category: 1 });
stravaActivitySchema.index({ source: 1 });
stravaActivitySchema.index({ date: -1 });
stravaActivitySchema.index({ userId: 1, category: 1 });
stravaActivitySchema.index({ userId: 1, date: -1 });

const StravaActivity = mongoose.model<StravaActivityModel>('StravaActivity', stravaActivitySchema);

export default StravaActivity;

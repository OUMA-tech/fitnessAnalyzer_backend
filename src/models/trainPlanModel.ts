import mongoose, { Types } from 'mongoose';
import { TrainPlanModel } from '../interfaces/entity/trainPlan';


const trainPlanSchema = new mongoose.Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String,   enum: ['draft', 'planned', 'completed'],
      default: 'draft' }
  },
  {
    timestamps: true,
  }
);

// add index
trainPlanSchema.index({ userId: 1 });
trainPlanSchema.index({ userId: 1, date: -1 });

const TrainPlan = mongoose.model<TrainPlanModel>('TrainPlan', trainPlanSchema);

export default TrainPlan;

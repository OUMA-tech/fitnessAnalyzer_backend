import mongoose from 'mongoose';

export interface TrainPlanModel {
  userId: string;
  title: string;
  date: Date;
  status: string;
}


const trainPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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

import mongoose from 'mongoose';

export interface SubTaskModel {
  trainPlanId: number;
  content: string;
  completed: boolean;
}

const subTaskSchema = new mongoose.Schema(
  {
    trainPlanId: { type: mongoose.Schema.Types.ObjectId, required: true },
    content: { type: String, },
    completed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// add index
subTaskSchema.index({ userId: 1 });
subTaskSchema.index({ date: -1 });
subTaskSchema.index({ userId: 1, date: -1 });

const SubTask = mongoose.model<SubTaskModel>('SubTask', subTaskSchema);

export default SubTask;
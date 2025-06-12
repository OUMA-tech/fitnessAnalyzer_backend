import mongoose, { Document, Types } from 'mongoose';

export interface SubTaskModel extends Document {
  _id: Types.ObjectId;
  trainPlanId: Types.ObjectId;
  content: string;
  completed: boolean;
}

const subTaskSchema = new mongoose.Schema(
  {
    trainPlanId: { type: Types.ObjectId, required: true },
    content: { type: String, },
    completed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

subTaskSchema.set('toJSON', {
  virtuals: true,        // 启用虚拟属性（例如 id）
  versionKey: false,     // 删除 __v
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    ret.trainPlanId = ret.trainPlanId.toString();
    delete ret._id;
  },
});

subTaskSchema.set('toObject', {
  virtuals: true,        // 启用虚拟属性（例如 id）
  versionKey: false,     // 删除 __v
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    ret.trainPlanId = ret.trainPlanId.toString();
    delete ret._id;
  },
});

// add index
subTaskSchema.index({ userId: 1 });
subTaskSchema.index({ date: -1 });
subTaskSchema.index({ userId: 1, date: -1 });

const SubTask = mongoose.model<SubTaskModel>('SubTask', subTaskSchema);

export default SubTask;
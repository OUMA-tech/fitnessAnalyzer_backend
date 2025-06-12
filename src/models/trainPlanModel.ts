import mongoose, { Document, Types } from 'mongoose';

export interface TrainPlanModel extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  date: Date;
  status: string;
}

const trainPlanSchema = new mongoose.Schema(
  {
    userId: { type: Types.ObjectId, required: true },
    title: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String,   enum: ['draft', 'planned', 'completed'],
      default: 'draft' }
  },
  {
    timestamps: true,
  }
);

trainPlanSchema.set('toJSON', {
  virtuals: true,        // 启用虚拟属性（例如 id）
  versionKey: false,     // 删除 __v
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    ret.userId = ret.userId.toString();
    delete ret._id;
  },
});

trainPlanSchema.set('toObject', {
  virtuals: true,        // 启用虚拟属性（例如 id）
  versionKey: false,     // 删除 __v
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    ret.userId = ret.userId.toString();
    delete ret._id;
  },
});

// add index
trainPlanSchema.index({ userId: 1 });
trainPlanSchema.index({ userId: 1, date: -1 });

const TrainPlan = mongoose.model<TrainPlanModel>('TrainPlan', trainPlanSchema);

export default TrainPlan;

import mongoose, { Document, Types } from 'mongoose';

export interface SubscriptionModel extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  planId: string|null;
  status: 'free'|'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true
  },
  stripeCustomerId: {
    type: String,
    required: true
  },
  stripeSubscriptionId: {
    type: String,
    required: true
  },
  planId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'unpaid'],
    default: 'active'
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

subscriptionSchema.set('toJSON', {
  virtuals: true,        // 启用虚拟属性（例如 id）
  versionKey: false,     // 删除 __v
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    ret.userId = ret.userId.toString();
    delete ret._id;
  },
});

subscriptionSchema.set('toObject', {
  virtuals: true,        // 启用虚拟属性（例如 id）
  versionKey: false,     // 删除 __v
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    ret.userId = ret.userId.toString();
    delete ret._id;
  },
});

export default mongoose.model<SubscriptionModel>('Subscription', subscriptionSchema); 
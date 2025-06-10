import mongoose, { Types } from 'mongoose';
import { SubscriptionModel } from '../interfaces/entity/subscription';

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

export default mongoose.model<SubscriptionModel>('Subscription', subscriptionSchema); 
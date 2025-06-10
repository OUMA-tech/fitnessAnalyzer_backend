import { Document, Types } from 'mongoose';

export interface SubscriptionModel extends Document {
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
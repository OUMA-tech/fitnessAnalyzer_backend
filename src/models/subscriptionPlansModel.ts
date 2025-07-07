import { Document, Schema, model } from 'mongoose';

export interface SubscriptionPlanModel extends Document {
  name: string;
  price: number;
  priceId: string;
  description: string;
  features: string[];
  interval: 'month' | 'year';
  isActive: boolean;
  displayOrder: number;
}

const subscriptionPlanSchema = new Schema<SubscriptionPlanModel>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    priceId: { type: String, required: true },
    description: { type: String, required: true },
    features: { type: [String], required: true },
    interval: { type: String, enum: ['month', 'year'], required: true },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const SubscriptionPlanModel = model<SubscriptionPlanModel>('SubscriptionPlan', subscriptionPlanSchema);

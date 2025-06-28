import { Model } from "mongoose";
import { SubscriptionModel } from "../../models/subscriptionModel";
import { SubscriptionDto } from "../../interfaces/entity/subscription";

function toSubscriptionDto(sub: SubscriptionModel): SubscriptionDto {
  return {
    ...sub,
    id: sub._id.toString(),
    userId: sub.userId.toString(),
  };
}

export const createMongoSubscriptionMapper = (SubscriptionModel: Model<SubscriptionModel>) => {
    return {
        findById: async (id: string) => {
          const res = await SubscriptionModel.findById(id).lean();
          return res? toSubscriptionDto(res) : null;
        },
        findByUserId: async (userId: string) => {
          const res = await SubscriptionModel.findOne({ userId }).lean();
          return res? toSubscriptionDto(res) : null;
        },
        create: async (subscription: SubscriptionDto) => {
          const res = await SubscriptionModel.create(subscription);
          return res? toSubscriptionDto(res) : null;
        },
        update: async (id: string, subscription: SubscriptionDto) => {
          const res = await SubscriptionModel.findByIdAndUpdate(id, subscription, { new: true });
          return res? toSubscriptionDto(res) : null;
        },
        deleteByStripeSubscriptionId: async (subscriptionId: string) => {
            const result = await SubscriptionModel.findOneAndDelete({ stripeSubscriptionId: subscriptionId })
            return result !== null;
        },
        updateByUserId: async (subscription: Partial<SubscriptionDto>) => {
          const res = await SubscriptionModel.findOneAndUpdate({ userId: subscription.userId }, subscription, { new: true });
          return res? toSubscriptionDto(res) : null;
        },
        cancelBySubscriptionId: async (subscriptionId: string) => {
            const result = await SubscriptionModel.findOneAndUpdate({ stripeSubscriptionId: subscriptionId }, { status: 'canceled' }, { new: true });
            return result !== null;
        },
        updateSubscription: (subscriptionId: string, subscription: Partial<SubscriptionDto>) => SubscriptionModel.findOneAndUpdate({ stripeSubscriptionId: subscriptionId }, subscription, { new: true }),
    }
}
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
        create: (subscription: SubscriptionDto) => SubscriptionModel.create(subscription),
        update: (id: string, subscription: SubscriptionModel) => SubscriptionModel.findByIdAndUpdate(id, subscription, { new: true }),
        deleteByStripeSubscriptionId: async (subscriptionId: string) => {
            const result = await SubscriptionModel.findOneAndDelete({ stripeSubscriptionId: subscriptionId })
            return result !== null;
        },
        updateByUserId: (subscription: Partial<SubscriptionDto>) => SubscriptionModel.findOneAndUpdate({ userId: subscription.userId }, subscription, { new: true }),
        cancelBySubscriptionId: async (subscriptionId: string) => {
            const result = await SubscriptionModel.findOneAndUpdate({ stripeSubscriptionId: subscriptionId }, { status: 'canceled' }, { new: true });
            return result !== null;
        }
    }
}
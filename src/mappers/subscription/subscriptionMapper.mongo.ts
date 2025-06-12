import { Model } from "mongoose";
import { SubscriptionModel } from "../../models/subscriptionModel";

export const createMongoSubscriptionMapper = (SubscriptionModel: Model<SubscriptionModel>) => {
    return {
        findById: (id: string) => SubscriptionModel.findById(id),
        findByUserId: (userId: string) => SubscriptionModel.findOne({ userId }),
        create: (userId: string) => SubscriptionModel.create({ userId }),
        update: (id: string, subscription: SubscriptionModel) => SubscriptionModel.findByIdAndUpdate(id, subscription, { new: true }),
        delete: async (id: string) => {
            const result = await SubscriptionModel.findByIdAndDelete(id);
            return result !== null;
        }
    }
}
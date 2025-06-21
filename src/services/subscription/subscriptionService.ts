import { SubscriptionModel } from "../../models/subscriptionModel";
import { SubscriptionService, SubscriptionServiceDependencies } from "./subscriptionService.interface";
import { SubscriptionDto } from "../../interfaces/entity/subscription";

export const createSubscriptionService = (dependencies: SubscriptionServiceDependencies): SubscriptionService => {
    const { subscriptionMapper } = dependencies;
    return {
        createSubscription: async (subscription: SubscriptionDto) => {
            const createdSubscription = await subscriptionMapper.create(subscription);
            return createdSubscription;
        },
        getUserSubscription: async (userId: string) => {
          console.log("11111111111111")
            const subscription = await subscriptionMapper.findByUserId(userId);
            return subscription;
        },
        updateSubscription: async (userId: string, subscription: SubscriptionModel) => {
            const updatedSubscription = await subscriptionMapper.update(userId, subscription);
            return updatedSubscription;
        },
        deleteSubscriptionByStripeSubscriptionId: async (subscriptionId: string) => {
            await subscriptionMapper.deleteByStripeSubscriptionId(subscriptionId);
        },
    }
}
import { SubscriptionModel } from "../../interfaces/entity/subscription";
import { SubscriptionService, SubscriptionServiceDependencies } from "./subscriptionService.interface";

export const createSubscriptionService = (dependencies: SubscriptionServiceDependencies): SubscriptionService => {
    const { subscriptionMapper } = dependencies;
    return {
        createSubscription: async (userId: string) => {
            const subscription = await subscriptionMapper.create(userId);
            return subscription;
        },
        getUserSubscription: async (userId: string) => {
            const subscription = await subscriptionMapper.findByUserId(userId);
            return subscription;
        },
        updateSubscription: async (userId: string, subscription: SubscriptionModel) => {
            const updatedSubscription = await subscriptionMapper.update(userId, subscription);
            return updatedSubscription;
        },
        deleteSubscription: async (userId: string) => {
            await subscriptionMapper.delete(userId);
        },
    }
}
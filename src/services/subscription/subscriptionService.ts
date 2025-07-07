import { SubscriptionDto } from "../../interfaces/entity/subscription";
import { SubscriptionService, SubscriptionServiceDependencies } from "./subscriptionService.interface";
import { toClient } from "../../utils/toClient";
export const createSubscriptionService = (dependencies: SubscriptionServiceDependencies): SubscriptionService => {
    const { subscriptionMapper, stripeService } = dependencies;
    return {
        createSubscription: async (subscription: SubscriptionDto) => {
            const createdSubscription = await subscriptionMapper.create(subscription);
            return createdSubscription;
        },
        getUserSubscription: async (userId: string) => {
            const subscription = await subscriptionMapper.findByUserId(userId);
            return subscription;
        },
        updateSubscription: async (userId: string, subscription: SubscriptionDto) => {
            const updatedSubscription = await subscriptionMapper.update(userId, subscription);
            return updatedSubscription;
        },
        deleteSubscriptionByStripeSubscriptionId: async (subscriptionId: string) => {
            await subscriptionMapper.deleteByStripeSubscriptionId(subscriptionId);
        },
        getSubscriptionHistory: async (userId: string) => {
            const subscriptionHistory = await subscriptionMapper.findByUserIdHistory(userId);
            return subscriptionHistory;
        },
        updateSubscriptionFromStripe: async (sessionId: string) => {
            const subscription = await stripeService.getSubscriptionFromSession(sessionId);
            if (!subscription) {
                return false;
            }
            await subscriptionMapper.updateSubscription(subscription.id, {
                stripeSubscriptionId: subscription.id,
                planId: subscription.items.data[0].plan.id,
            });
            return true;
        }
    }
}
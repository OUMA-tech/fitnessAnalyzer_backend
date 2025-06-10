import { SubscriptionModel } from "../../interfaces/entity/subscription";
import { SubscriptionMapper } from "../../mappers/subscription/subscriptionMapper";

export interface SubscriptionServiceDependencies {
    subscriptionMapper: SubscriptionMapper;
}

export interface SubscriptionService {
    createSubscription(userId: string): Promise<SubscriptionModel>;
    getUserSubscription(userId: string): Promise<SubscriptionModel>;
    updateSubscription(userId: string, subscription: SubscriptionModel): Promise<SubscriptionModel>;
    deleteSubscription(userId: string): Promise<void>;
}


import { SubscriptionModel } from "../../models/subscriptionModel";
import { SubscriptionMapper } from "../../mappers/subscription/subscriptionMapper";

export interface SubscriptionServiceDependencies {
    subscriptionMapper: SubscriptionMapper;
}

export interface SubscriptionService {
    createSubscription(userId: string): Promise<SubscriptionModel>;
    getUserSubscription(userId: string): Promise<SubscriptionModel | null>;
    updateSubscription(userId: string, subscription: SubscriptionModel): Promise<SubscriptionModel | null>;
    deleteSubscription(userId: string): Promise<void>;
}


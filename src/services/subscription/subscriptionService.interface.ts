import { SubscriptionModel } from "../../models/subscriptionModel";
import { SubscriptionMapper } from "../../mappers/subscription/subscriptionMapper";
import { SubscriptionDto } from "../../interfaces/entity/subscription";

export interface SubscriptionServiceDependencies {
    subscriptionMapper: SubscriptionMapper;
}

export interface SubscriptionService {
    createSubscription(subscription: Partial<SubscriptionDto>): Promise<SubscriptionDto | null>;
    getUserSubscription(userId: string): Promise<SubscriptionDto | null>;
    updateSubscription(userId: string, subscription: SubscriptionDto): Promise<SubscriptionDto | null>;
    deleteSubscriptionByStripeSubscriptionId(subscriptionId: string): Promise<void>;
}


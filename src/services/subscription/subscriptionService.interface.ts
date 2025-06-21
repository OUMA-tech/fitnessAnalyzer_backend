import { SubscriptionModel } from "../../models/subscriptionModel";
import { SubscriptionMapper } from "../../mappers/subscription/subscriptionMapper";
import { SubscriptionDto } from "../../interfaces/entity/subscription";

export interface SubscriptionServiceDependencies {
    subscriptionMapper: SubscriptionMapper;
}

export interface SubscriptionService {
    createSubscription(subscription: Partial<SubscriptionDto>): Promise<SubscriptionModel>;
    getUserSubscription(userId: string): Promise<SubscriptionDto | null>;
    updateSubscription(userId: string, subscription: SubscriptionModel): Promise<SubscriptionModel | null>;
    deleteSubscriptionByStripeSubscriptionId(subscriptionId: string): Promise<void>;
}


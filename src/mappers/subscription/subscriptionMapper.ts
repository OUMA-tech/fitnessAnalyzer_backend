import { SubscriptionDto } from "../../interfaces/entity/subscription";
import { SubscriptionModel } from "../../models/subscriptionModel";

export interface SubscriptionMapper {
    findById: (id: string) => Promise<SubscriptionDto | null>;
    findByUserId: (userId: string) => Promise<SubscriptionDto | null>;
    create: (subscription: SubscriptionDto) => Promise<SubscriptionDto | null>;
    update: (id: string, subscription: SubscriptionDto) => Promise<SubscriptionDto | null>;
    deleteByStripeSubscriptionId: (subscriptionId: string) => Promise<boolean>;
    updateByUserId: (subscription: Partial<SubscriptionDto>) => Promise<SubscriptionDto | null>;
    cancelBySubscriptionId: (subscriptionId: string) => Promise<boolean>;
    updateSubscription: (subscriptionId: string, subscription: Partial<SubscriptionDto>) => Promise<SubscriptionModel | null>;
    findByUserIdHistory: (userId: string) => Promise<SubscriptionDto[]>;
}
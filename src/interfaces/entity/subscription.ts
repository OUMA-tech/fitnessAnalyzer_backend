
export interface SubscriptionDto {
    id: string;
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    planId: string|null;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
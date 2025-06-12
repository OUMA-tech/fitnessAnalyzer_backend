
export interface SubscriptionDto {
    id: string;
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    planId: string|null;
    status: 'free'|'active' | 'canceled' | 'past_due' | 'unpaid';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
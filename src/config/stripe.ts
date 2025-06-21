import Stripe from 'stripe';
import { StripeConfig } from '.';

export const createStripeClient = (config: StripeConfig) => {
    const stripe = new Stripe(config.secretKey, {
        apiVersion: '2025-05-28.basil',
    });
    const SUBSCRIPTION_PLANS = {
        BASIC: {
        id: 'basic',
        name: 'Basic Plan',
        priceId: config.basicPriceId,
        features: ['Feature 1', 'Feature 2']
        },
        PRO: {
        id: 'pro',
        name: 'Pro Plan',
        priceId: config.proPriceId,
            features: ['Feature 1', 'Feature 2', 'Feature 3']
        }
    };
    const appUrl = config.appUrl;
    return { stripe, SUBSCRIPTION_PLANS, appUrl };
};


export interface StripePlan {
    id: string;
    name: string;
    priceId: string;
    features: string[];
  }
  
  export interface StripeSubscriptionPlans {
    BASIC: StripePlan;
    PRO: StripePlan;
  }

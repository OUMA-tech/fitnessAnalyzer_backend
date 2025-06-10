import Stripe from 'stripe';
import { UserModel } from '../models/userModel';
import Subscription from '../models/subscriptionModel';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
});
export const config = {
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
  },
  appUrl: process.env.APP_URL || 'http://localhost:5000',
};

export const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: 'basic',
    name: 'Basic Plan',
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    features: ['Feature 1', 'Feature 2']
  },
  PRO: {
    id: 'pro',
    name: 'Pro Plan',
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4']
  }
};

export const createCustomer = async (user: UserModel) => {
  const customer = await stripe.customers.create({
    email: user.email,
    metadata: {
      userId: (user._id as any).toString()
    }
  });
  return customer;
};

export const createSubscription = async (
  customerId: string,
  priceId: string,
  userId: string
) => {
  try {
    // 创建订阅
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // 保存订阅信息到数据库
    await Subscription.create({
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      planId: priceId,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.items.data[0].current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000)
    });

    return {
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any).payment_intent.client_secret
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscriptionId },
      { 
        cancelAtPeriodEnd: true,
        status: subscription.status
      }
    );

    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

export const updateSubscription = async (
  subscriptionId: string,
  newPriceId: string
) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
    });

    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscriptionId },
      { planId: newPriceId }
    );

    return subscription;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

export const createPaymentIntent = async (amount: number, customerId: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

interface CreateCheckoutSessionParams {
  priceId: string;
}

export const createCheckoutSession = async ({ priceId }: CreateCheckoutSessionParams) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${config.appUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.appUrl}/subscription/cancel`,
    customer_creation: 'always',
  });

  return { sessionUrl: session.url };
}; 
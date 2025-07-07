
import { UserDto } from "../../interfaces/entity/user";
import { StripeService, StripeServiceDependencies } from "./stripeService.interface";

export const createStripeService = (dependencies: StripeServiceDependencies): StripeService => {
    const { stripe, appUrl, subscriptionMapper, userMapper, stripeCustomerRedis } = dependencies;
    const createCustomer = async (user: UserDto) => {
        const customer = await stripe.customers.create({
            email: user.email,
            name: user.username,
        });
        await userMapper.updateUser({id: user.id, stripeCustomerId: customer.id });
        await stripeCustomerRedis.setUserId(customer.id, user.id, 60 * 60 * 24 * 30);
        return customer.id;
    };
    const createCheckoutSession = async (customerId: string, userId: string, priceId: string) => {
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: `${appUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/subscription/cancel`,
            metadata: {
                userId: userId,
                priceId: priceId,
            },
        });
        return session.url;
    };
    return {
        createCustomer,
        createCheckoutSession,
        createSubscription: async (userId: string, priceId: string) => {
            try {
                const existingSubscription = await subscriptionMapper.findByUserId(userId);
                if (existingSubscription) {
                    throw new Error('User already has a subscription');
                }
                const user = await userMapper.findById(userId);
                if (!user) {
                    throw new Error('User not found');
                }
                const customerId = await createCustomer(user);
                // 创建订阅
                const subscription = await stripe.subscriptions.create({
                    customer: customerId,
                    items: [{ price: priceId }],
                    payment_behavior: 'default_incomplete',
                    expand: ['latest_invoice.payment_intent'],
                });
                const checkoutSession = await createCheckoutSession(customerId, userId, priceId);
                if (!checkoutSession) {
                    throw new Error('Checkout session not created');
                }
                return checkoutSession;
            } catch (error) {
            console.error('Error creating subscription:', error);
            throw error;
            }
        },
          cancelSubscription: async (subscriptionId: string) => {
            const subscription = await stripe.subscriptions.cancel(subscriptionId);
            if (subscription.status === 'canceled') {
                await subscriptionMapper.cancelBySubscriptionId(subscriptionId);
                return true;
            }
            return false;
          },
          updateSubscription: async (userId: string, priceId: string) => {
            const subscription = await subscriptionMapper.findByUserId(userId);
            if (!subscription) {
                throw new Error('Subscription not found');
            }
            const updatedSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
                items: [{ price: priceId }],
                proration_behavior: 'create_prorations',
                payment_behavior: 'default_incomplete',
                expand: ['latest_invoice.payment_intent']
            });

            return updatedSubscription.id;
          },
          verifyCheckoutSession: async (sessionId: string) => {
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            return session;
          },
          getSubscriptionFromSession: async (sessionId: string) => {
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            if (session.subscription && session.payment_status === 'paid' && session.status === 'complete') {
              const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
              return subscription;
            }
            return null;
          }
    };
};

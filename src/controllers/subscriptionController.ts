import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth';
import { SubscriptionService } from '../services/subscription/subscriptionService.interface';
import { StripeService } from '../services/stripe/stripeService.interface';


export const createSubscriptionController = (subscriptionService: SubscriptionService, stripeService: StripeService) => {

  return {
    createSubscription: async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const priceId = req.body.priceId;
        const userId = req.user?.id as string;
    
    
        const subscription = await stripeService.createSubscription(userId, priceId);
    
        res.json(subscription);
      } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({
          message: 'Error creating subscription'
        });
      }
    },
    cancelSubscription: async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const { subscriptionId } = req.params;
        const canceledSubscription = await stripeService.cancelSubscription(subscriptionId);
        await subscriptionService.deleteSubscriptionByStripeSubscriptionId(subscriptionId);
        res.json(canceledSubscription);
      } catch (error) {
        console.error('Error canceling subscription:', error);
        res.status(500).json({
          message: 'Error canceling subscription'
        });
      }
    },
    updateSubscription: async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const { isPro } = req.body;
        const userId = req.user?.id as string;
        const updatedSubscription = await stripeService.updateSubscription(userId,isPro);
    
        res.json(updatedSubscription);
      } catch (error) {
        console.error('Error updating subscription:', error);
        res.status(500).json({
          message: 'Error updating subscription'
        });
      }
    },
    getSubscription: async (req: AuthRequest, res: Response) => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Unauthorized' });
          return;
        }
        const userId = req.user.id;
        if (!userId) {
          res.status(401).json({ message: 'Unauthorized' });
          return;
        }
        const subscription = await subscriptionService.getUserSubscription(userId);
    
        res.json(subscription);
      } catch (error) {
        console.error('Error fetching subscription status:', error);
        res.status(500).json({
          message: 'Error fetching subscription status'
        });
      }
    }, 
  }
}
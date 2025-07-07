import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth';
import { SubscriptionService } from '../services/subscription/subscriptionService.interface';
import { StripeService } from '../services/stripe/stripeService.interface';
import { SubscriptionPlansMapper } from '../mappers/subscriptionPlans/subscriptionPlansMapper';


export const createSubscriptionController = (subscriptionService: SubscriptionService, stripeService: StripeService, subscriptionPlansMapper: SubscriptionPlansMapper) => {

  return {
    createSubscription: async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const priceId = req.body.priceId;
        const userId = req.user?.id as string;
    
    
        const subscription = await stripeService.createSubscription(userId, priceId);
    
        res.json({sessionUrl: subscription});
      } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({
          message: 'Error creating subscription'
        });
      }
    },
    verifySubscription: async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const { sessionId } = req.body;
        const userId = req.user?.id as string;

        if (!sessionId) {
          res.status(400).json({
            message: 'Session ID is required'
          });
          return;
        }

        // Verify the session with Stripe
        const session = await stripeService.verifyCheckoutSession(sessionId);
        
        if (!session) {
          res.status(404).json({
            message: 'Session not found'
          });
          return;
        }

        // Get the subscription from the session
        const subscription = await stripeService.getSubscriptionFromSession(sessionId);
        
        if (!subscription) {
          res.status(404).json({
            message: 'Subscription not found'
          });
          return;
        }

        // Update the subscription in database
        const updatedSubscription = await subscriptionService.updateSubscriptionFromStripe(
          sessionId
        );

        res.json({
          subscription: updatedSubscription,
          message: 'Subscription verified successfully'
        });
      } catch (error) {
        console.error('Error verifying subscription:', error);
        res.status(500).json({
          message: 'Error verifying subscription'
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
    getSubscriptionPlans: async ( req: Request, res: Response) => {
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
        const allSubscriptionPlans = await subscriptionPlansMapper.findAll();
        res.json(allSubscriptionPlans);
      } catch (error) {
        console.error('Error fetching subscriptionPlan:', error);
        res.status(500).json({
          message: 'Error fetching subscriptionPlan'
        });
      }
    },
    getSubscriptionHistory: async ( req: Request, res: Response) => {
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
        const historySubscriptionPlans = await subscriptionService.getSubscriptionHistory(userId);
        res.json(historySubscriptionPlans);
      } catch (error) {
        console.error('Error fetching history subscriptionPlan:', error);
        res.status(500).json({
          message: 'Error fetching history subscriptionPlan'
        });
      }
    }
  }
}
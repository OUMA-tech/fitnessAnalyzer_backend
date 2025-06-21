import express from 'express';
import { createSubscriptionController } from '../controllers/subscriptionController';
import { extractToken } from '../middlewares/extractToken';
import { ApiContainer } from '../container/api.container';


export const createSubscriptionRoutes = (apiContainer: ApiContainer) => {
  const router = express.Router();
  const subscriptionController = createSubscriptionController(apiContainer.subscriptionService, apiContainer.stripeService);
  const authMiddleware = apiContainer.authMiddleware;




  // 需要认证的路由
  router.use(extractToken,authMiddleware.protect);
  router.post('/create', subscriptionController.createSubscription);
  router.post('/:subscriptionId/cancel', subscriptionController.cancelSubscription);
  router.post('/:subscriptionId/update', subscriptionController.updateSubscription);
  router.get('/status', subscriptionController.getSubscription);

  return router;
}

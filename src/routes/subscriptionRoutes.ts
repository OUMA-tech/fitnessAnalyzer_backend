import express from 'express';
import {
  getSubscriptionPlans,
  createSubscription,
  cancelSubscription,
  updateSubscription,
  getSubscriptionStatus
} from '../controllers/subscriptionController';
import { handleWebhook } from '../controllers/webhookController';
import { extractToken } from '../middlewares/extractToken';
import { protect } from '../middlewares/authMiddleware';
import bodyParser from 'body-parser';

const router = express.Router();

// 公开路由
router.get('/plans', getSubscriptionPlans);

// Stripe Webhook
router.post('/webhook',  bodyParser.raw({ type: 'application/json' }), handleWebhook);

// 需要认证的路由
router.use(extractToken,protect);
// router.post('/create', createSubscription);
// router.post('/:subscriptionId/cancel', cancelSubscription);
// router.post('/:subscriptionId/update', updateSubscription);
router.get('/status', getSubscriptionStatus);

export default router; 
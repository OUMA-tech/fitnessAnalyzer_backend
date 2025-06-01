import express from 'express';
import { protect } from '../middlewares/authMiddleware';
import { extractToken } from '../middlewares/extractToken';
import { stravaCallback, stravaWebHook, subscriptionValidation } from '../controllers/stravaController';

const router = express.Router();


router.get('/callback', extractToken, protect, stravaCallback);
router.get('/webHook', subscriptionValidation);
router.post('/webHook', stravaWebHook);

export default router;

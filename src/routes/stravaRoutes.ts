import express from 'express';
import { protect } from '../middlewares/authMiddleware';
import { extractToken } from '../middlewares/extractToken';
import { fetchStravaActivities, stravaCallback, stravaWebHook, subscriptionValidation } from '../controllers/stravaController';
import { verifyAccessToken } from '../middlewares/getStravaToken';

const router = express.Router();


router.get('/callback', extractToken, protect, stravaCallback);
router.get('/records', extractToken, protect,verifyAccessToken, fetchStravaActivities);
router.get('/webHook', subscriptionValidation);
router.post('/webHook', stravaWebHook);

export default router;

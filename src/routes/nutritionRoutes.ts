import express from 'express';
import { getWeeklyNutrition, getActivityNutrition } from '../controllers/nutritionController';
import { protect } from '../middlewares/auth';
import { extractToken } from '../middlewares/extractToken';

const router = express.Router();

router.get('/weekly', extractToken, protect, getWeeklyNutrition);
router.get('/activity/:activityId', extractToken, protect, getActivityNutrition);

export default router; 
import express from 'express';
import { protect } from '../middlewares/authMiddleware';
import { extractToken } from '../middlewares/extractToken';
import { fetchTodayPlan, insertTrainPlan } from '../controllers/trainPlanController';

const router = express.Router();

router.post('/', extractToken, protect, insertTrainPlan);
router.get('/today', extractToken, protect, fetchTodayPlan);

export default router;

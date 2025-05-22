import express from 'express';
import { protect } from '../middlewares/authMiddleware';
import { extractToken } from '../middlewares/extractToken';
import { fetchDurationPlan, insertTrainPlan, updatePlan } from '../controllers/trainPlanController';

const router = express.Router();

router.post('/', extractToken, protect, insertTrainPlan);
router.get('/today', extractToken, protect, fetchDurationPlan);
router.put('/today', extractToken, protect, updatePlan);

export default router;

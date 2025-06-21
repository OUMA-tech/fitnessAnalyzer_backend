import express from 'express';
import { extractToken } from '../middlewares/extractToken';
import { ApiContainer } from '../container/api.container';
import { createTrainPlanController } from '../controllers/trainPlanController';


export const createTrainPlanRoutes = (container: ApiContainer) => {
    const router = express.Router();
    const trainPlanController = createTrainPlanController(container.trainPlanService);
    const authMiddleware = container.authMiddleware;
    router.post('/', extractToken, authMiddleware.protect, trainPlanController.insertTrainPlan);
    router.get('/today', extractToken, authMiddleware.protect, trainPlanController.fetchDurationPlan);
    router.put('/today', extractToken, authMiddleware.protect, trainPlanController.updatePlan);

    return router;
}

import express from 'express';
import { createNutritionController } from '../controllers/nutritionController';
import { extractToken } from '../middlewares/extractToken';
import { ApiContainer } from '../container/api.container';

export const createNutritionRoutes = (apiContainer: ApiContainer) => {

    const router = express.Router();
    const nutritionController = createNutritionController(apiContainer.nutritionService);
    const authMiddleware = apiContainer.authMiddleware;
    router.get('/weekly', extractToken, authMiddleware.protect, nutritionController.getWeeklyNutrition);
    router.get('/activity/:activityId', extractToken, authMiddleware.protect, nutritionController.getActivityNutrition);

    return router;
}

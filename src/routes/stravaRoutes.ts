import express from 'express';
import { protect } from '../middlewares/authMiddleware';
import { extractToken } from '../middlewares/extractToken';
import { ApiContainer } from '../container/api.container';
import { createStravaController } from '../controllers/stravaController';


export const createStravaRoutes = (container: ApiContainer) => {
    const router = express.Router();
    const stravaController = createStravaController(container.stravaActivityService, container.userMapper);
    router.get('/', extractToken, protect, stravaController.getStravaActivities);
    router.get('/callback', extractToken, protect, stravaController.stravaCallback);
    router.get('/webHook', stravaController.subscriptionValidation);
    router.post('/webHook', stravaController.stravaWebHook);

    return router;
}

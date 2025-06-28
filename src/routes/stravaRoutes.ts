import express from 'express';
import { extractToken } from '../middlewares/extractToken';
import { ApiContainer } from '../container/api.container';
import { createStravaController } from '../controllers/stravaController';


export const createStravaRoutes = (container: ApiContainer) => {
    const router = express.Router();
    const stravaController = createStravaController(container.stravaService, container.userMapper);
    const authMiddleware = container.authMiddleware;
    router.get('/', extractToken, authMiddleware.protect, stravaController.getStravaActivities);
    router.get('/callback', extractToken, authMiddleware.protect, stravaController.stravaCallback);
    router.post('/webHook', stravaController.stravaWebHook);

    return router;
}

import express from 'express';
import { extractToken } from '../middlewares/extractToken';
import { createProfileController } from '../controllers/profileController';
import { ApiContainer } from '../container/api.container';

export const createProfileRoutes = (apiContainer: ApiContainer) => {
    const router = express.Router();

    const profileController = createProfileController(apiContainer.userMapper, apiContainer.s3);
    const authMiddleware = apiContainer.authMiddleware;
    router.post('/', extractToken, authMiddleware.protect, profileController.returnUploadUrl);
    router.put('/success', extractToken, authMiddleware.protect, profileController.saveAvatar);

    return router;
}


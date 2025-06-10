import express from 'express';
import { createAuthController } from '../controllers/authController';
import { ApiContainer } from '../container/api.container';


export const createAuthRoutes = (container: ApiContainer) => {
    const router = express.Router();
    const authController = createAuthController(container.authService);

    router.post('/register', authController.register);
    router.post('/login', authController.login);
    router.post('/send-verification', authController.sendEmailVerificationCode);

    return router;
};

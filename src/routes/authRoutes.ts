import express from 'express';
import { registerUser, loginUser, getCookies, getProfile } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';
import { extractToken } from '../middlewares/extractToken';
import { returnUploadUrl } from '../controllers/profileController';
import { register, sendEmailVerification } from '../controllers/userController';

const router = express.Router();

router.post('/register', register);
router.post('/login', loginUser);
router.get('/profile', extractToken, protect, getProfile);
router.post('/profile', extractToken, protect, returnUploadUrl);
router.get('/cookie', extractToken, protect, getCookies);
router.post('/send-verification', sendEmailVerification);

export default router;

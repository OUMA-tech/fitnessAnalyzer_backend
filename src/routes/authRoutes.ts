import express from 'express';
import { registerUser, loginUser, getCookies, getProfile } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';
import { extractToken } from '../middlewares/extractToken';
import { returnUploadUrl } from '../controllers/profileController';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', extractToken, protect, getProfile);
router.post('/profile', extractToken, protect, returnUploadUrl);
router.get('/cookie', extractToken, protect, getCookies);

export default router;

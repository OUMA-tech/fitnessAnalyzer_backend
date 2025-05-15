import express from 'express';
import { registerUser, loginUser, getProfile } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';
import { extractToken } from '../middlewares/extractToken';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', extractToken, protect, getProfile);

export default router;

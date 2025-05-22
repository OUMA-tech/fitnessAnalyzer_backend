import express from 'express';
import { protect } from '../middlewares/authMiddleware';
import { extractToken } from '../middlewares/extractToken';
import { returnUploadUrl, saveAvatar } from '../controllers/profileController';

const router = express.Router();

router.post('/', extractToken, protect, returnUploadUrl);
router.put('/success', extractToken, protect, saveAvatar);
export default router;

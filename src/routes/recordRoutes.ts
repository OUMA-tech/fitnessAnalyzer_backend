import express from 'express';
import { getRecords } from '../controllers/recordController';
import { protect } from '../middlewares/authMiddleware';
import { extractToken } from '../middlewares/extractToken';

const router = express.Router();


router.get('/', extractToken, protect, getRecords);

export default router;

import express from 'express';
import { getRecords } from '../controllers/recordController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();


router.get('/', protect, getRecords);

export default router;

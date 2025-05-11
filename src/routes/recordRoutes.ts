import express from 'express';
import { getRecords } from '../controllers/recordController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();


router.get('/records', getRecords);

export default router;

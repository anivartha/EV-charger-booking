/**
 * Admin Routes
 */
import { Router } from 'express';
import { getStats } from '../controllers/adminController';

const router = Router();

router.get('/stats', getStats);

export default router;


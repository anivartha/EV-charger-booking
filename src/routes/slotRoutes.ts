/**
 * Slot Routes
 */
import { Router } from 'express';
import { getSlots } from '../controllers/slotController';

const router = Router();

router.get('/', getSlots);

export default router;


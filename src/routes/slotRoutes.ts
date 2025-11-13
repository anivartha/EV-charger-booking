/**
 * Slot Routes
 */
import { Router } from 'express';
import { getSlots, getSlotsByParams } from '../controllers/slotController';

const router = Router();

// Query parameter route (for backward compatibility)
router.get('/', getSlots);

// Path parameter route: /slots/:chargerId/:date
router.get('/:chargerId/:date', getSlotsByParams);

export default router;


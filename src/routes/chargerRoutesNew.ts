/**
 * Charger Routes (New Schema)
 */
import { Router } from 'express';
import {
  createCharger,
  getChargers,
  deleteCharger
} from '../controllers/chargerController';

const router = Router();

router.get('/', getChargers);
router.post('/', createCharger);
router.delete('/:id', deleteCharger);

export default router;


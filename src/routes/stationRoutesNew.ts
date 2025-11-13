/**
 * Station Routes (New Schema)
 */
import { Router } from 'express';
import {
  createStation,
  getStations,
  deleteStation
} from '../controllers/stationController';

const router = Router();

router.get('/', getStations);
router.post('/', createStation);
router.delete('/:id', deleteStation);

export default router;


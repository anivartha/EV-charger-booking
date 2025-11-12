/**
 * Station Routes (Booths)
 * Returns list of charging booths with their chargers
 */
import express from 'express';
import { BoothModel } from '../models/Booth';
import { ChargerModel } from '../models/Charger';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const booths = await BoothModel.findAllActive();
    const chargers = await ChargerModel.findAllActive();
    
    // Group chargers by booth
    const out = booths.map(booth => ({
      ...booth,
      chargers: chargers.filter(charger => charger.booth_id === booth.id)
    }));
    
    res.json(out);
  } catch (err) {
    console.error('Error fetching stations:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;

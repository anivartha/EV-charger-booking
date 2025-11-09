import express from 'express';
import { query } from '../config/database';
const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const stations = (await query('SELECT * FROM stations ORDER BY station_id')).rows;
    const ports = (await query('SELECT * FROM ports ORDER BY port_id')).rows;
    const out = stations.map(s => ({ ...s, ports: ports.filter(p => p.station_id === s.station_id) }));
    res.json(out);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB error' });
  }
});
export default router;

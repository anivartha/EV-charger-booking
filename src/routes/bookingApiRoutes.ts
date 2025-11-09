import express from 'express';
import { query } from '../config/database';
const router = express.Router();

router.get('/', async (req,res) => {
  try {
    const userId = req.query.user_id ? Number(req.query.user_id) : null;
    let q = 'SELECT b.*, p.port_label, s.name as station_name FROM bookings b JOIN ports p ON b.port_id = p.port_id JOIN stations s ON p.station_id = s.station_id';
    const params:any[] = [];
    if (userId) { q += ' WHERE b.user_id = $1'; params.push(userId); }
    const r = await query(q, params);
    res.json(r.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'DB error' }); }
});

router.post('/', async (req,res) => {
  try {
    const { user_id, port_id, start_time, end_time } = req.body;
    const r = await query('SELECT make_booking($1,$2,$3,$4) AS booking_id', [user_id, port_id, start_time, end_time]);
    res.json({ booking_id: r.rows[0].booking_id });
  } catch (err:any) {
    console.error(err); res.status(400).json({ error: err.message || 'Booking failed' });
  }
});

export default router;

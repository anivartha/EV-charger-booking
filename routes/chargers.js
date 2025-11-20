// routes/chargers.js
const express = require('express');
const pool = require('../db/db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const station_id = req.query.station_id;
    if (station_id) {
      const [rows] = await pool.query('SELECT * FROM booth WHERE station_id = ?', [station_id]);
      return res.json(rows);
    }
    const [rows] = await pool.query('SELECT * FROM booth ORDER BY booth_id DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { station_id, booth_name, charger_type, price_per_hour } = req.body;
    const [result] = await pool.query(
      'INSERT INTO booth (station_id, booth_name, charger_type, price_per_hour) VALUES (?, ?, ?, ?)',
      [station_id, booth_name, charger_type, price_per_hour]
    );
    const [rows] = await pool.query('SELECT * FROM booth WHERE booth_id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

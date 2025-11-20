// routes/stations.js
const express = require('express');
const pool = require('../db/db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM charging_station ORDER BY station_id DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { owner_id = 1, station_name, location, latitude = null, longitude = null } = req.body;
    const [result] = await pool.query(
      'INSERT INTO charging_station (owner_id, station_name, location, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
      [owner_id, station_name, location, latitude, longitude]
    );
    const [stationRows] = await pool.query('SELECT * FROM charging_station WHERE station_id = ?', [result.insertId]);
    res.json(stationRows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

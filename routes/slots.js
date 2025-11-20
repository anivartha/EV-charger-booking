// routes/slots.js
const express = require('express');
const pool = require('../db/db');
const router = express.Router();

// ===================== GET SLOTS =====================
router.get('/', async (req, res) => {
  try {
    let { station_id, booth_id, date } = req.query;

    console.log("RAW DATE FROM FRONTEND:", date);

    // Convert ANY date format → YYYY-MM-DD
    if (date) {
      // DD-MM-YYYY
      if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
        const [dd, mm, yyyy] = date.split('-');
        date = `${yyyy}-${mm}-${dd}`;
      }
      // DD/MM/YYYY
      else if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
        const [dd, mm, yyyy] = date.split('/');
        date = `${yyyy}-${mm}-${dd}`;
      }
      // otherwise assume already correct
    }

    console.log("CONVERTED DATE FOR MYSQL:", date);

    // CASE 1 → Booth-based slots
    if (booth_id) {
      const sql =
        'SELECT * FROM slot WHERE booth_id = ?' +
        (date ? ' AND slot_date = ?' : '');

      const params = date ? [booth_id, date] : [booth_id];
      const [rows] = await pool.query(sql, params);
      return res.json(rows);
    }

    // CASE 2 → Station-based slots
    if (station_id) {
      const sql = `
        SELECT s.*
        FROM slot s
        JOIN booth b ON b.booth_id = s.booth_id
        WHERE b.station_id = ?
      `;
      const [rows] = await pool.query(sql, [station_id]);
      return res.json(rows);
    }

    // CASE 3 → All slots
    const [rows] = await pool.query(
      'SELECT * FROM slot ORDER BY slot_date, start_time'
    );
    res.json(rows);

  } catch (err) {
    console.error("SLOTS API ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===================== CREATE SLOT =====================
router.post('/', async (req, res) => {
  try {
    const { booth_id, slot_date, start_time, end_time } = req.body;

    await pool.query(
      'CALL add_slot(?, ?, ?, ?)',
      [booth_id, slot_date, start_time, end_time]
    );

    // Return newly created slots
    const [rows] = await pool.query(
      'SELECT * FROM slot WHERE booth_id = ? AND slot_date = ? ORDER BY start_time',
      [booth_id, slot_date]
    );

    res.json(rows);

  } catch (err) {
    console.error("SLOT CREATION ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

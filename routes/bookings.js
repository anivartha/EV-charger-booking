// routes/bookings.js
const express = require('express');
const pool = require('../db/db');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { slot_id, user_id } = req.body;
    const [result] = await pool.query('INSERT INTO booking (slot_id, user_id) VALUES (?, ?)', [slot_id, user_id]);
    const [rows] = await pool.query('SELECT * FROM booking WHERE booking_id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

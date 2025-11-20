// routes/auth.js
const express = require('express');
const pool = require('../db/db');
const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (role === 'admin') {
      const [rows] = await pool.query('SELECT * FROM admin WHERE email = ? AND password = ?', [email, password]);
      if (rows.length) return res.json({ ok: true, user: rows[0] });
      return res.json({ ok: false, message: 'Invalid admin credentials' });
    } else {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
      if (rows.length) return res.json({ ok: true, user: rows[0] });
      return res.json({ ok: false, message: 'Invalid user credentials' });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

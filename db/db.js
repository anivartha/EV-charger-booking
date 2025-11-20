// db/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'qwerty',   // <<---- change if your MySQL password is different
  database: 'ev_charger',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;

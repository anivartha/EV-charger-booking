// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const stationsRoute = require('./routes/stations');
const chargersRoute = require('./routes/chargers');
const slotsRoute = require('./routes/slots');
const bookingsRoute = require('./routes/bookings');
const authRoute = require('./routes/auth');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// serve public files (html/css/js)
app.use(express.static(__dirname + '/public'));

// HOME ROUTE — SHOW LOGIN PAGE
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

// API routes
app.use('/api/stations', stationsRoute);
app.use('/api/chargers', chargersRoute);
app.use('/api/slots', slotsRoute);
app.use('/api/bookings', bookingsRoute);
app.use('/api/auth', authRoute);

// start server
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);

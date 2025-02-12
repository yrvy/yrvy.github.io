const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3002;

// Explicitly configure CORS to allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Add more comprehensive logging
console.log('Server configuration started');

app.get('/api/rooms', (req, res) => {
  console.log('Rooms endpoint accessed');
  res.json({ message: 'Rooms endpoint works!' });
});

// Listen on 0.0.0.0 to allow external connections
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server listening on all network interfaces`);
});

// Add error handling
server.on('error', (error) => {
  console.error('Server error:', error);
});

module.exports = app;
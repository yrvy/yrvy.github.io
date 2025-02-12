const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Strict CORS configuration
const ALLOWED_ORIGINS = [
  'https://yrvy.github.io', 
  'http://localhost:3000', 
  'http://localhost:5173'
];

app.use(cors({
  origin: function(origin, callback){
    // Allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(ALLOWED_ORIGINS.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date().toISOString() });
});

app.get('/api/rooms', (req, res) => {
  console.log('Rooms endpoint accessed');
  res.json({ message: 'Rooms endpoint works!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Only start server if not being imported
if (require.main === module) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Server listening on all network interfaces`);
  });

  server.on('error', (error) => {
    console.error('Server error:', error);
  });
}

module.exports = app;
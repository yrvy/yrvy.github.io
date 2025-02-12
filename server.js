const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(bodyParser.json());

app.get('/api/rooms', (req, res) => {
  res.json({ message: 'Rooms endpoint works!' });
});

app.listen(PORT, 'localhost', () => {
  console.log(`Server running on port ${PORT}`);
});
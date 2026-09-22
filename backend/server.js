require('dotenv').config();
const express = require('express');
const cors = require('cors');

const weatherRoutes = require('./routes/weather');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', weatherRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'Weather API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;

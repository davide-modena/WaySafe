const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health.routes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.use('/api/v1/health', healthRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Risorsa non trovata' });
});

module.exports = app;

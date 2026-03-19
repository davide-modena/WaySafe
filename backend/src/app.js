const express = require('express');
const cors = require('cors');

const passport = require('./config/passport');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const heatmapRoutes = require('./routes/heatmap.routes');
const reportsRoutes = require('./routes/reports.routes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(passport.initialize());

app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/heatmap', heatmapRoutes);
app.use('/api/v1/reports', reportsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Risorsa non trovata' });
});

module.exports = app;

const express = require('express');
const { getStats } = require('../controllers/stats.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', requireAuth, requireRole('operatore', 'admin'), getStats);

module.exports = router;

const express = require('express');
const { listOperatorReports } = require('../controllers/reports.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/reports', requireAuth, requireRole('operatore', 'admin'), listOperatorReports);

module.exports = router;

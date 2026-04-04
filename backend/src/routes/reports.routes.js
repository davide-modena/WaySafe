const express = require('express');
const { createReport, listReports, updateReportStato } = require('../controllers/reports.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', listReports);
router.post('/', requireAuth, createReport);
router.patch('/:id', requireAuth, requireRole('operatore', 'admin'), updateReportStato);

module.exports = router;

const express = require('express');
const { createReport, listReports } = require('../controllers/reports.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', listReports);
router.post('/', requireAuth, createReport);

module.exports = router;

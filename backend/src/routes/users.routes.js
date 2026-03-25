const express = require('express');
const { getMe, updateMe } = require('../controllers/users.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateMe);

module.exports = router;

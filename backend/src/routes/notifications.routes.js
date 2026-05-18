const express = require('express');
const {
  listNotifications,
  markLetta,
  markTutteLette
} = require('../controllers/notifications.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', requireAuth, listNotifications);
router.patch('/lette', requireAuth, markTutteLette);
router.patch('/:id', requireAuth, markLetta);

module.exports = router;

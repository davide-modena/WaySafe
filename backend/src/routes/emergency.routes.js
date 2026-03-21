const express = require('express');
const { emergency } = require('../controllers/emergency.controller');

const router = express.Router();

router.post('/', emergency);

module.exports = router;

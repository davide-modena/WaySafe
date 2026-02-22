const express = require('express');
const passport = require('../config/passport');
const { register, login, signToken } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth`
  }),
  (req, res) => {
    const token = signToken(req.user);
    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);
  }
);

module.exports = router;

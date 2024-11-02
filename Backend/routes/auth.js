const express = require('express');
const { check, validationResult } = require('express-validator');
const { registerUser, loginUser, getUserProfile, searchUserByUsername } = require('../actions/auth');
const {authMiddleware, protect} = require('../middleware/auth');

const router = express.Router();

// Register a new user
router.post(
  '/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    registerUser(req, res);
  }
);

// Login user
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    loginUser(req, res);
  }
);

// Get user profile (Protected route)
router.get('/profile', authMiddleware, getUserProfile);
router.get('/search', searchUserByUsername);

module.exports = router;

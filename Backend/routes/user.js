const express = require('express');
const { protect } = require('../middleware/auth');
const { getUserFoldersAndFiles } = require('../actions/user');

const router = express.Router();

// Route to fetch all folders and files (public and private) of a user
router.get('/:userId/folders', protect, getUserFoldersAndFiles);

module.exports = router;

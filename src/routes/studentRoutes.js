const express = require('express');
const { registerStudent } = require('../controllers/studentController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authenticateToken, registerStudent);

module.exports = router;

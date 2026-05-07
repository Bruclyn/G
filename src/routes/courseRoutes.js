const express = require('express');
const { getCourses, registerForCourse } = require('../controllers/courseController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, getCourses);
router.post('/register', authenticateToken, registerForCourse);

module.exports = router;

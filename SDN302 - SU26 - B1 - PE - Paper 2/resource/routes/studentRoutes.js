const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Question 3: GET /api/students/:studentId/attendances
router.get('/:studentId/attendances', studentController.getAttendanceHistory);

module.exports = router;


const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');

// Question 1: GET /api/classes/:classId/students?status=enrolled
router.get('/:classId/students', classController.getStudentsByClass);

// Question 2: GET /api/classes/:classId/attendance-summary
router.get('/:classId/attendance-summary', classController.getAttendanceSummary);

// Question 4: POST /api/classes/:classId/attendances
router.post('/:classId/attendances', classController.bulkAttendanceUpsert);

module.exports = router;


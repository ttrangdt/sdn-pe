const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController");

// Question 1: GET /api/classes/:classId/students?status=enrolled
router.get("/:classId/students", classController.getStudentsByClass);
router.get(
  "/:classId/attendance-summary",
  classController.getAttendanceSummary,
);

module.exports = router;

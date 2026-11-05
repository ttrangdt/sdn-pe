const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.get("/:studentId/attendances", studentController.getAttendanceHistory);

module.exports = router;

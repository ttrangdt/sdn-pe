const express = require('express');
const router = express.Router();
const controller = require('../controllers/report.controller');

router.get('/projects/work-hours', controller.getProjectWorkHoursReport);


module.exports = router;

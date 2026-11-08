const express = require('express');
const router = express.Router();
const showtimeController = require('../controllers/showtime.controller');

// Question 3: GET /api/showtimes/:showtimeId/seats
router.get('/:showtimeId/seats', showtimeController.getSeatAvailability);

module.exports = router;

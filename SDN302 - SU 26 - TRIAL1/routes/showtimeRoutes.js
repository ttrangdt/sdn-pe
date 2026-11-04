const express = require('express');
const router = express.Router();
const showtimeController = require('../controllers/showtimeController');
const { verifyAdmin } = require('../middlewares/auth');

// Question 3: Create Showtime (Admin Only)
// POST /api/showtimes
router.post('/', verifyAdmin, showtimeController.createShowtime);

module.exports = router;

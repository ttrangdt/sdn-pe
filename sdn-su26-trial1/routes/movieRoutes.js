const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// Question 2: Retrieve Movie Details with Showtimes
// GET /api/movies/:movieId
router.get('/:movieId', movieController.getMovieWithShowtimes);

module.exports = router;

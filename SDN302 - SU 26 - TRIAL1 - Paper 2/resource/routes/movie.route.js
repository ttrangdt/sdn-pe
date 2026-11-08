const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movie.controller');

// Question 2: GET /api/movies/:movieId/showtimes
router.get('/:movieId/showtimes', movieController.getShowtimesByMovie);

// Question 1: GET /api/movies?status=NOW_SHOWING
router.get('/', movieController.getActiveMovies);

module.exports = router;

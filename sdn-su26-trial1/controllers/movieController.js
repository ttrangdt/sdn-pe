const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');

// Question 2: Retrieve Movie Details with Showtimes
// GET /api/movies/:movieId
const getMovieWithShowtimes = async (req, res) => {
  const { movieId } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(movieId)) {
    return res.status(400).json({ error: `Invalid movieId: ${movieId}` });
  }

  try {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: `Movie with id: ${movieId} not found` });
    }

    const showtimes = await Showtime.find({ movieId: movie._id }).populate('roomId');

    const formattedShowtimes = showtimes.map(st => ({
      roomName: st.roomId ? st.roomId.roomName : null,
      startTime: st.startTime ? st.startTime.toISOString() : null,
      price: st.price
    }));

    return res.status(200).json({
      title: movie.title,
      duration: movie.duration,
      description: movie.description,
      showtimes: formattedShowtimes
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMovieWithShowtimes
};


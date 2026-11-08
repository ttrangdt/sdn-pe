const mongoose = require('mongoose');
const Movie = require('../models/movie.model');
const Showtime = require('../models/showtime.model');

// Question 1: Retrieve Active Movies (GET /api/movies?status=NOW_SHOWING)
const getActiveMovies = async (req, res) => {
  try {
    const { status } = req.query;
    const validStatuses = ['NOW_SHOWING', 'STOPPED'];

    // 1. Kiem tra status hop le
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status: ${status}` });
    }

    // 2. Tim kiem bang find() don gian theo status
    const movies = await Movie.find({ status }).lean();

    // 3. Format lai output: doi _id thanh id va chi lay cac truong de bai yeu cau
    const result = movies.map(m => ({
      id: m._id,
      title: m.title,
      duration: m.duration,
      genre: m.genre
    }));

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Question 2: Retrieve Showtimes for a Movie (GET /api/movies/:movieId/showtimes)
const getShowtimesByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    // 1. Kiem tra ObjectId hop le
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ error: `Invalid movieId: ${movieId}` });
    }

    // 2. Kiem tra phim co ton tai hay khong
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: `Movie with id = ${movieId} not found` });
    }

    // 3. Tim tat ca showtimes cua phim nay va populate lay roomName tu roomId
    const showtimes = await Showtime.find({ movieId }).populate('roomId').lean();

    // 4. Format du lieu tra ve bang JavaScript map (khong dung aggregation phuc tap)
    const result = showtimes.map(st => ({
      id: st._id,
      roomName: st.roomId ? st.roomId.roomName : null,
      startTime: st.startTime,
      endTime: st.endTime,
      price: st.price
    }));

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getActiveMovies,
  getShowtimesByMovie
};

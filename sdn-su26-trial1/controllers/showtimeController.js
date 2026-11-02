const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Room = require('../models/Room');
const Showtime = require('../models/Showtime');

// Question 3: Create Showtime (Admin Only)
// POST /api/showtimes
const createShowtime = async (req, res) => {
  const { movieId, roomId, startTime, price } = req.body;

  // Validate required fields
  if (!movieId || !roomId || !startTime || price === undefined || price === null || price === '') {
    return res.status(400).json({ error: 'movieId, roomId, startTime, price required' });
  }

  try {
    // Validate movie
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ error: 'Invalid movieId' });
    }
    const movie = await Movie.findById(movieId);
    if (!movie || movie.status !== 'NOW_SHOWING') {
      return res.status(400).json({ error: 'Movie must exist and status = NOW_SHOWING' });
    }

    // Validate room
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ error: 'Invalid roomId' });
    }
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(400).json({ error: 'Room must exist' });
    }

    // Calculate endTime = startTime + movie.duration (minutes)
    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ error: 'Invalid startTime' });
    }
    const end = new Date(start.getTime() + movie.duration * 60 * 1000);

    // Overlap condition: existing.startTime < newEndTime AND existing.endTime > newStartTime
    const overlap = await Showtime.findOne({
      roomId: room._id,
      startTime: { $lt: end },
      endTime: { $gt: start }
    });

    if (overlap) {
      return res.status(409).json({ error: 'Showtime overlaps with existing' });
    }

    // Create showtime
    const newShowtime = await Showtime.create({
      movieId: movie._id,
      roomId: room._id,
      startTime: start,
      endTime: end,
      price: Number(price)
    });

    return res.status(201).json({
      _id: newShowtime._id.toString(),
      movieId: newShowtime.movieId.toString(),
      roomId: newShowtime.roomId.toString(),
      startTime: newShowtime.startTime.toISOString(),
      endTime: newShowtime.endTime.toISOString(),
      price: newShowtime.price
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createShowtime
};


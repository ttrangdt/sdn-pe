const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  price: { type: Number, required: true }
}, {
  versionKey: false
});

module.exports = mongoose.model('Showtime', showtimeSchema, 'showtimes');


const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: Number, required: true },
  status: { type: String, enum: ['NOW_SHOWING', 'STOPPED'], required: true },
  genre: [{ type: String }],
  description: { type: String }
}, {
  versionKey: false
});

module.exports = mongoose.model('Movie', movieSchema, 'movies');


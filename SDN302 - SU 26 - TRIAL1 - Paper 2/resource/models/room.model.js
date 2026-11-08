const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  _id: { type: String },
  type: { type: String }
}, { _id: false });

const roomSchema = new mongoose.Schema({
  roomName: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true
  },
  seats: [seatSchema]
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Room', roomSchema, 'rooms');

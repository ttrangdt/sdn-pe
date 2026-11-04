const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  showTimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  seatId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['paid', 'booked', 'canceled'], required: true },
  bookedAt: { type: Date, default: Date.now },
  paymentMethod: { type: String, default: null }
}, {
  versionKey: false
});

module.exports = mongoose.model('Ticket', ticketSchema, 'tickets');


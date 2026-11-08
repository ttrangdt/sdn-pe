const mongoose = require('mongoose');
const Showtime = require('../models/showtime.model');
const Ticket = require('../models/ticket.model');

// Question 3: Retrieve Seat Availability by Showtime (GET /api/showtimes/:showtimeId/seats)
const getSeatAvailability = async (req, res) => {
  try {
    const { showtimeId } = req.params;

    // 1. Kiem tra ObjectId hop le
    if (!mongoose.Types.ObjectId.isValid(showtimeId)) {
      return res.status(400).json({ error: `Invalid showtimeId: ${showtimeId}` });
    }

    // 2. Tim suat chieu va populate lay phong chieu (chua danh sach ghe)
    const showtime = await Showtime.findById(showtimeId).populate('roomId').lean();
    if (!showtime) {
      return res.status(404).json({ error: `Showtime with id: ${showtimeId} not found` });
    }

    // 3. Lay danh sach tat ca ve cua suat chieu nay
    const tickets = await Ticket.find({ showTimeId: showtimeId }).lean();

    // 4. Lay danh sach ghe tu phong chieu
    const roomSeats = (showtime.roomId && showtime.roomId.seats) || [];

    // 5. Dung JS map va some kiem tra trang thai tung ghe (khong dung aggregation)
    const result = roomSeats.map(seat => {
      // Co ve ton tai va status khac 'canceled' thi tinh la BOOKED
      const isBooked = tickets.some(
        t => String(t.seatId) === String(seat._id) && t.status !== 'canceled'
      );

      return {
        code: seat._id,
        type: seat.type,
        status: isBooked ? 'BOOKED' : 'AVAILABLE'
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSeatAvailability
};

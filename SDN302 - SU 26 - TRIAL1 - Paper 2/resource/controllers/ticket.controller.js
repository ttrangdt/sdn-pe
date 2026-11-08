const mongoose = require('mongoose');
const Ticket = require('../models/ticket.model');
const Showtime = require('../models/showtime.model');
const User = require('../models/user.model');

// Question 4: Create Tickets (Customer Only) - POST /api/tickets
const createTickets = async (req, res) => {
  try {
    // 1. Doc access_key tu request headers
    const access_key = req.headers['access_key'];
    if (!access_key) {
      return res.status(403).json({ error: 'No access key' });
    }

    // 2. Tim user bang access_key
    const user = await User.findOne({ access_key });
    if (!user) {
      return res.status(403).json({ error: 'Invalid or unauthorized access key' });
    }

    // 3. Kiem tra quyen: Role phai la 'customer'
    if (user.role !== 'customer') {
      return res.status(403).json({ error: 'Customer access required' });
    }

    // 4. Kiem tra cac truong bat buoc trong request body
    const { showtimeId, seats } = req.body;
    if (!showtimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ error: 'showtimeId and seats required' });
    }

    // 5. Validate ObjectId cua showtime
    if (!mongoose.Types.ObjectId.isValid(showtimeId)) {
      return res.status(400).json({ error: `Invalid showtimeId: ${showtimeId}` });
    }

    // 6. Tim suat chieu va phong chieu
    const showtime = await Showtime.findById(showtimeId).populate('roomId');
    if (!showtime) {
      return res.status(404).json({ error: `Showtime with id: ${showtimeId} not found` });
    }

    const roomSeats = (showtime.roomId && showtime.roomId.seats) || [];
    const validSeatCodes = roomSeats.map(s => s._id);

    // 7. Kiem tra cac ghe co thuoc phong chieu nay khong
    for (const seatCode of seats) {
      if (!validSeatCodes.includes(seatCode)) {
        return res.status(400).json({ error: `Seat ${seatCode} does not belong to the room` });
      }
    }

    // 8. Kiem tra ghe da duoc dat truoc do chua (status !== 'canceled')
    const existingTickets = await Ticket.find({
      showTimeId: showtimeId,
      status: { $ne: 'canceled' }
    }).lean();

    for (const seatCode of seats) {
      const alreadyBooked = existingTickets.some(t => String(t.seatId) === String(seatCode));
      if (alreadyBooked) {
        return res.status(409).json({ error: `Seat ${seatCode} already booked` });
      }
    }

    // 9. Tinh gia ve: Ghe VIP dat hon 20% so voi gia goc (showtime.price * 1.2)
    const basePrice = showtime.price;
    let totalAmount = 0;
    const ticketDocs = [];

    for (const seatCode of seats) {
      const seatObj = roomSeats.find(s => s._id === seatCode);
      const isVIP = seatObj && seatObj.type === 'VIP';
      const seatPrice = isVIP ? Math.round(basePrice * 1.2) : basePrice;

      totalAmount += seatPrice;

      ticketDocs.push({
        showTimeId: showtime._id,
        showtimeId: showtime._id,
        seatId: seatCode,
        userId: user._id,
        price: seatPrice,
        status: 'booked',
        bookedAt: new Date(),
        paymentMethod: null
      });
    }

    // 10. Tao ve trong database
    await Ticket.insertMany(ticketDocs);

    // 11. Tra ve ket qua 201 Created
    return res.status(201).json({
      message: 'Tickets created',
      count: seats.length,
      totalAmount: totalAmount
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTickets
};

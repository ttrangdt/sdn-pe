/**
 * ============================================================================
 * COMPONENT: TIME OVERLAP CHECKING & SCHEDULE CREATION
 * File: controllers/scheduleOverlapController.js
 * ============================================================================
 * Giải quyết bài toán trùng lịch chiếu, trùng phòng học, trùng lịch họp:
 * - Tự động tính endTime = startTime + duration (phút)
 * - Kiểm tra giao nhau giữa 2 khoảng thời gian:
 *     existing.startTime < newEndTime AND existing.endTime > newStartTime
 * - Trả về mã lỗi 409 Conflict nếu bị trùng lịch
 */

const mongoose = require('mongoose');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Room = require('../models/Room');

const createNonOverlappingSchedule = async (req, res) => {
  const { movieId, roomId, startTime, price } = req.body;

  // 1. Kiểm tra các trường bắt buộc
  if (!movieId || !roomId || !startTime || price === undefined) {
    return res.status(400).json({ error: 'movieId, roomId, startTime, price required' });
  }

  try {
    // 2. Kiểm tra tồn tại của các đối tượng liên quan
    if (!mongoose.Types.ObjectId.isValid(movieId) || !mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ error: 'Invalid movieId or roomId' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie || movie.status !== 'NOW_SHOWING') {
      return res.status(400).json({ error: 'Movie must exist and status = NOW_SHOWING' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(400).json({ error: 'Room must exist' });
    }

    // 3. Tính toán endTime = startTime + duration (theo phút)
    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ error: 'Invalid startTime' });
    }
    const end = new Date(start.getTime() + movie.duration * 60 * 1000);

    // 4. KIỂM TRA TRÙNG LỊCH TRONG CÙNG 1 PHÒNG (OVERLAP CONDITION)
    // Hai khoảng [startA, endA] và [startB, endB] giao nhau khi:
    // startA < endB && endA > startB
    const overlap = await Showtime.findOne({
      roomId: room._id,
      startTime: { $lt: end },
      endTime: { $gt: start }
    });

    if (overlap) {
      // Bắt buộc trả về đúng 409 Conflict
      return res.status(409).json({ error: 'Showtime overlaps with existing' });
    }

    // 5. Nếu không trùng lịch -> Lưu vào Database và trả về 201 Created
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
  createNonOverlappingSchedule
};


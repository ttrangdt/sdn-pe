const Room = require('../models/Room');

// Question 1: Retrieve All Rooms (Sorted)
// GET /api/rooms
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomName: -1 });

    const result = rooms.map(room => {
      const seats = room.seats || [];
      const vipCount = seats.filter(s => s.type === 'VIP').length;
      return {
        id: room._id.toString(),
        name: room.roomName,
        totalSeats: seats.length || room.capacity || 0,
        vipCount: vipCount
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllRooms
};


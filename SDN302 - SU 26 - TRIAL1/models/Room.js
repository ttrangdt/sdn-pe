const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    type: { type: String, enum: ["VIP", "NORMAL"], required: true },
  },
  { _id: false },
);

const roomSchema = new mongoose.Schema(
  {
    roomName: { type: String, required: true },
    capacity: { type: Number, required: true },
    seats: [seatSchema],
  },
  {
    versionKey: false,
  },
);

module.exports = mongoose.model("Room", roomSchema, "rooms");

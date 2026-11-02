const mongoose = require('mongoose');

const manufacturerSchema = new mongoose.Schema({
  manufacturer: { type: String, required: true, unique: true },
  isAsia: { type: Boolean, default: false }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Manufacturer', manufacturerSchema, 'manufacturers');


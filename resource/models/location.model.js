const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  locName: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Location', locationSchema, 'locations');

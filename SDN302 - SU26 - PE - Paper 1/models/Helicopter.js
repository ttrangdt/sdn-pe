const mongoose = require('mongoose');

const helicopterSchema = new mongoose.Schema({
  heliName: { type: String, required: true, unique: true },
  imgWrapper: { type: String, required: true },
  isAssembly: { type: Boolean, default: false },
  price: { type: Number, required: true },
  adult: { type: Boolean, default: false },
  manufacturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manufacturer',
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Helicopter', helicopterSchema, 'helicopters');


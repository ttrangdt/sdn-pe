const mongoose = require('mongoose');

const worksonSchema = new mongoose.Schema({
  empId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Emp',
    required: true
  },
  proId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pro',
    required: true
  },
  workHours: {
    type: Number,
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Workson', worksonSchema, 'worksons');

const mongoose = require('mongoose');

const worksonSchema = new mongoose.Schema({
  empId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  proId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
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

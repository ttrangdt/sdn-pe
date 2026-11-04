const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  credits: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Subject', subjectSchema, 'subjects');

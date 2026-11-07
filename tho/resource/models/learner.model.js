const mongoose = require('mongoose');

const learnerSchema = new mongoose.Schema({
  learnerCode: {
    type: String,
    required: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Learner', learnerSchema, 'learners');

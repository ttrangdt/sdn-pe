const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Learner', required: true },
  status: { type: String }
}, { _id: false });

const batchSchema = new mongoose.Schema({
  batchName: {
    type: String,
    required: true,
    trim: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  instructorName: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    trim: true
  },
  registrations: [registrationSchema]
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Batch', batchSchema, 'batches');

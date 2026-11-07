const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  locId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loc', required: true }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  proName: {
    type: String,
    required: true,
    trim: true
  },
  depId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dep',
    required: true
  },
  location: [locationSchema]
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Project', projectSchema, 'projects');

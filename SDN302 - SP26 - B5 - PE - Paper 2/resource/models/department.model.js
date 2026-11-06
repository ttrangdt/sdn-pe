const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  locId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true }
}, { _id: false });

const departmentSchema = new mongoose.Schema({
  depName: {
    type: String,
    required: true,
    trim: true
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  managerAssDate: {
    type: String,
    required: true,
    trim: true
  },
  location: [locationSchema]
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Department', departmentSchema, 'departments');

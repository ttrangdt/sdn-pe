const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  locId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loc', required: true }
}, { _id: false });

const departmentSchema = new mongoose.Schema({
  depName: {
    type: String,
    required: true,
    trim: true
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manager',
    required: true
  },
  managerAssDate: {
    type: String,
    enum: ['2024-01-01', '2024-03-01', '2024-05-01'],
    required: true
  },
  location: [locationSchema]
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Department', departmentSchema, 'departments');

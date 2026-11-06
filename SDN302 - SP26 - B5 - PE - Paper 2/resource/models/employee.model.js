const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  empName: {
    type: String,
    required: true,
    trim: true
  },
  empSalary: {
    type: Number,
    required: true
  },
  empSex: {
    type: Boolean,
    default: false
  },
  empBirthdate: {
    type: String,
    required: true,
    trim: true
  },
  depId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  supervisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  empStartdate: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Employee', employeeSchema, 'employees');

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin', 'staff'], required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String },
  access_key: { type: String }
}, {
  versionKey: false
});

module.exports = mongoose.model('User', userSchema, 'users');


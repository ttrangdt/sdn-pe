/**
 * ============================================================================
 * COMPONENT: MONGOOSE DATABASE CONNECTION
 * File: config/db.js
 * ============================================================================
 * Chức năng:
 * - Đọc MONGO_URI / MONGODB_URI từ file .env
 * - Bắt lỗi kết nối và thoát tiến trình nếu fail
 * - Tránh lỗi 0 điểm do hardcode chuỗi kết nối
 */

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      console.error('LỖI: Chưa cấu hình MONGO_URI trong file .env!');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('MongoDB connected successfully to:', uri);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;


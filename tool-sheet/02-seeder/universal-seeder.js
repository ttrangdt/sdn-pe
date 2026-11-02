/**
 * ============================================================================
 * COMPONENT: UNIVERSAL MONGODB SEEDER & MIGRATION SCRIPT
 * File: seed.js
 * ============================================================================
 * Chức năng:
 * - Đọc tự động các file JSON đề bài cung cấp (movies, rooms, showtimes, users, helicopters...)
 * - Tự động nhận diện và chuyển đổi BSON ObjectId: { "$oid": "..." } -> new ObjectId(...)
 * - Tự động parse Date string sang Date Object
 * - Tự động hash bcrypt mật khẩu nếu đề bài yêu cầu
 * - Xóa sạch dữ liệu cũ và insertMany vào MongoDB
 * 
 * Cách dùng:
 * Chạy lệnh: node seed.js
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

/**
 * Hàm đệ quy chuyển đổi toàn bộ { "$oid": "..." } thành Mongoose ObjectId
 */
function parseJsonWithOid(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw, (key, value) => {
    if (value && typeof value === 'object' && value.$oid) {
      return new mongoose.Types.ObjectId(value.$oid);
    }
    return value;
  });
}

// Khai báo models (Nhập các model của bài thi vào đây)
// const Movie = require('./models/Movie');
// const Room = require('./models/Room');
// const Showtime = require('./models/Showtime');
// const Ticket = require('./models/Ticket');
// const User = require('./models/User');

async function seed() {
  if (!MONGO_URI) {
    console.error('LỖI: Chưa cấu hình MONGO_URI trong .env!');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB at:', MONGO_URI);

    // ========================================================================
    // BƯỚC 1: ĐỌC DỮ LIỆU TỪ CÁC FILE JSON
    // ========================================================================
    // const moviesData = parseJsonWithOid(path.join(__dirname, 'movies.json'));
    // const roomsData = parseJsonWithOid(path.join(__dirname, 'rooms.json'));
    
    // Nếu có trường ngày tháng, map sang Date object:
    // const showtimesData = parseJsonWithOid(path.join(__dirname, 'showtimes.json')).map(item => ({
    //   ...item,
    //   startTime: new Date(item.startTime),
    //   endTime: new Date(item.endTime)
    // }));

    // Nếu có mật khẩu cần băm bcrypt:
    // const membersData = parseJsonWithOid(path.join(__dirname, 'members.json')).map(user => {
    //   if (user.pass && !user.pass.startsWith('$2b$')) {
    //     user.pass = bcrypt.hashSync(user.pass, 10);
    //   }
    //   return user;
    // });

    // ========================================================================
    // BƯỚC 2: XÓA DỮ LIỆU CŨ VÀ INSERT DỮ LIỆU MỚI
    // ========================================================================
    // await Movie.deleteMany({});
    // await Room.deleteMany({});
    // await Showtime.deleteMany({});
    
    // await Movie.insertMany(moviesData);
    // await Room.insertMany(roomsData);
    // await Showtime.insertMany(showtimesData);

    console.log('Seeding completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();


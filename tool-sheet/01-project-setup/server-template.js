/**
 * ============================================================================
 * COMPONENT: UNIVERSAL EXPRESS SERVER (REST API + EJS MVC)
 * File: server.js
 * ============================================================================
 * Tích hợp đầy đủ:
 * - Dotenv cấu hình môi trường (.env)
 * - Kết nối MongoDB qua config/db.js
 * - CORS (Cross-Origin Resource Sharing)
 * - Morgan (Logging HTTP requests)
 * - Body parsers (JSON & Urlencoded Form Data)
 * - Express Session (cho giao diện Web EJS)
 * - Cấu hình View Engine EJS
 * - Mount các router API và router Web
 * - Middleware bắt lỗi 404 và Global Error Handler
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
require('dotenv').config();

const connectDB = require('./config/db');

// Khởi tạo app
const app = express();
const PORT = process.env.PORT || 9999; // hoặc 5000 tùy theo đề bài yêu cầu

// 1. Kết nối cơ sở dữ liệu MongoDB
connectDB();

// 2. Cấu hình View Engine (Nếu đề bài yêu cầu làm giao diện EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 3. Middlewares toàn cục
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Session cho Web Client (chỉ cần khi làm giao diện đăng nhập bằng EJS)
app.use(session({
  secret: process.env.SESSION_SECRET || 'fptu_exam_session_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 ngày
}));

// 5. Root Endpoint: http://localhost:PORT
app.get('/', (req, res) => {
  // Với bài thi chỉ có REST API:
  res.status(200).json({ message: 'RESTful API Server is running on port ' + PORT });

  // Hoặc với bài thi có giao diện EJS:
  // if (req.session && req.session.user) return res.redirect('/management');
  // return res.redirect('/auth/access');
});

// 6. Mount các Router (Đăng ký routes)
// app.use('/api/example', require('./routes/exampleRoutes'));
// app.use('/auth', require('./routes/authRoutes'));
// app.use('/', require('./routes/webRoutes'));

// 7. Xử lý Route không tồn tại (404 Handler)
app.use((req, res) => {
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.status(404).json({ error: 'Route not found' });
  }
  return res.status(404).send('Page Not Found');
});

// 8. Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  return res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// 9. Lắng nghe tại cổng PORT
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`Server is running at: http://localhost:${PORT}`);
  console.log(`Environment PORT: ${PORT}`);
  console.log(`=================================================`);
});

module.exports = app;


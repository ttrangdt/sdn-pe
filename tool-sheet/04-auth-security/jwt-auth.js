/**
 * ============================================================================
 * COMPONENT: JWT TOKEN GENERATION & VERIFICATION (REST API)
 * File: middlewares/jwtAuth.js & controllers/authController.js
 * ============================================================================
 * Thường gặp trong các đề thi yêu cầu xác thực REST API bằng JSON Web Token:
 * 1. Endpoint /auth/tokens: Kiểm tra username/password (hoặc name/pass) bằng bcrypt, sinh JWT
 * 2. Middleware verifyJWT: Đọc Bearer token từ Header 'Authorization'
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Member = require('../models/Member'); // Hoặc User model

// ============================================================================
// 1. CONTROLLER SINH MÃ JWT (POST hoặc GET /auth/tokens)
// ============================================================================
const generateToken = async (req, res) => {
  const name = req.body.name || req.body.username || req.query.name || req.query.username;
  const pass = req.body.pass || req.body.password || req.query.pass || req.query.password;

  if (!name || !pass) {
    return res.status(400).json({ message: 'Name and password are required' });
  }

  try {
    // Tìm user theo tên
    const user = await Member.findOne({ name: name });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials: User not found' });
    }

    // So khớp mật khẩu đã mã hóa bằng bcrypt
    const isMatch = bcrypt.compareSync(pass, user.pass);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials: Wrong password' });
    }

    // Tạo payload và ký mã token
    const payload = {
      id: user._id,
      name: user.name,
      role: user.role || 'member'
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'se181234@', // Lấy từ .env
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      token: token,
      message: 'Token generated successfully'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// 2. MIDDLEWARE XÁC THỰC MÃ JWT CHO CÁC API PROTECTED
// ============================================================================
const verifyJWT = (req, res, next) => {
  const authHeader = req.header('Authorization') || req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Tách chuỗi Bearer <token>
  const token = authHeader.replace(/^Bearer\s+/i, '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'se181234@');
    req.user = decoded; // Lưu thông tin người dùng giải mã được
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = {
  generateToken,
  verifyJWT
};


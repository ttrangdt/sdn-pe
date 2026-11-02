/**
 * ============================================================================
 * COMPONENT: HEADER ACCESS KEY & ROLE-BASED AUTHORIZATION MIDDLEWARE
 * File: middlewares/headerKeyAuth.js
 * ============================================================================
 * Thường gặp trong các đề thi yêu cầu xác thực bằng header tùy biến:
 * - Đọc `access_key` từ Request Headers
 * - Tra cứu User trong Database theo key
 * - Kiểm tra quyền (Role): admin / staff / customer
 * - Trả về đúng các mã lỗi 403 Forbidden theo đề bài
 */

const User = require('../models/User'); // Model chứa trường access_key và role

const verifyAdminByKey = async (req, res, next) => {
  // Lấy access_key từ header (Express tự chuyển hoa/thường)
  const accessKey = req.headers['access_key'] || req.headers['access-key'];

  // 1. Kiểm tra header có tồn tại không
  if (!accessKey) {
    return res.status(403).json({ error: 'No access key' });
  }

  try {
    // 2. Tìm user trong collection users
    const user = await User.findOne({ access_key: accessKey });
    if (!user) {
      return res.status(403).json({ error: 'Invalid or unauthorized access key' });
    }

    // 3. Kiểm tra vai trò quyền hạn (Role check)
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Gắn thông tin user vào request để các handler sau sử dụng nếu cần
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  verifyAdminByKey
};


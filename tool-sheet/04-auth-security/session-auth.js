/**
 * ============================================================================
 * COMPONENT: SESSION-BASED AUTHENTICATION (FOR EJS WEB VIEWS)
 * File: middlewares/sessionAuth.js & controllers/webAuthController.js
 * ============================================================================
 * Dùng cho các bài thi có giao diện EJS:
 * - /auth/access: Đăng nhập giao diện Web
 * - req.session.user: Lưu thông tin phiên đăng nhập
 * - requireWebAuth: Bảo vệ các trang quản lý
 */

const bcrypt = require('bcryptjs');
const Member = require('../models/Member');

// ============================================================================
// 1. MIDDLEWARE BẢO VỆ CÁC ROUTE WEB VIEWS
// ============================================================================
const requireWebAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  // Nếu chưa đăng nhập, chuyển hướng về trang login
  return res.redirect('/auth/access');
};

// ============================================================================
// 2. CONTROLLER XỬ LÝ ĐĂNG NHẬP / ĐĂNG XUẤT CHO WEB
// ============================================================================
const renderLoginPage = (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/management');
  }
  const errorMsg = req.session.errorMsg || null;
  req.session.errorMsg = null; // Xóa flash error sau khi đọc
  res.render('login', { errorMsg });
};

const handleLogin = async (req, res) => {
  const { name, pass } = req.body;

  if (!name || !pass) {
    req.session.errorMsg = 'Please enter both username and password';
    return res.redirect('/auth/access');
  }

  try {
    const member = await Member.findOne({ name: name.trim() });
    if (!member) {
      req.session.errorMsg = 'Invalid username or password';
      return res.redirect('/auth/access');
    }

    const isMatch = bcrypt.compareSync(pass, member.pass);
    if (!isMatch) {
      req.session.errorMsg = 'Invalid username or password';
      return res.redirect('/auth/access');
    }

    // Đăng nhập thành công -> Lưu vào session
    req.session.user = {
      id: member._id,
      name: member.name
    };

    return res.redirect('/management');
  } catch (error) {
    req.session.errorMsg = error.message;
    return res.redirect('/auth/access');
  }
};

const handleLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/access');
  });
};

module.exports = {
  requireWebAuth,
  renderLoginPage,
  handleLogin,
  handleLogout
};


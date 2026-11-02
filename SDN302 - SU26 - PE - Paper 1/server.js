const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const connectDB = require('./config/db');
const authApiRoutes = require('./routes/authApiRoutes');
const manufacturerApiRoutes = require('./routes/manufacturerApiRoutes');
const webRoutes = require('./routes/webRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// View Engine Configuration (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration for Web Client
app.use(session({
  secret: process.env.SESSION_SECRET || 'se181234_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// Root Route
app.get('/', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/management/helicopters');
  }
  return res.redirect('/auth/access');
});

// REST API Routes
app.use('/auth', authApiRoutes);                 // POST & GET /auth/tokens
app.use('/api/manufacturers', manufacturerApiRoutes); // GET, POST, PUT, DELETE /api/manufacturers

// Web Client Routes (EJS Views)
app.use('/', webRoutes);                         // GET & POST /auth/access, /management/helicopters

// 404 Handler
app.use((req, res) => {
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.status(404).json({ message: 'Route not found' });
  }
  return res.status(404).send('Page not found');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`- Web Client: http://localhost:${PORT}/auth/access`);
  console.log(`- API Tokens: http://localhost:${PORT}/auth/tokens`);
  console.log(`- Manufacturers API: http://localhost:${PORT}/api/manufacturers`);
});

module.exports = app;

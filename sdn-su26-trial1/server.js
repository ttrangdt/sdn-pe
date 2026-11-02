const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const roomRoutes = require('./routes/roomRoutes');
const movieRoutes = require('./routes/movieRoutes');
const showtimeRoutes = require('./routes/showtimeRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 9999;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint: http://localhost:9999
app.get('/', async (req, res) => {
  try {
    res.status(200).json({ message: 'Welcome to Practical Exam!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/reports', reportRoutes);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`- Root URL: http://localhost:${PORT}`);
  console.log(`- Rooms API: http://localhost:${PORT}/api/rooms`);
  console.log(`- Movies API: http://localhost:${PORT}/api/movies/:movieId`);
  console.log(`- Showtimes API: http://localhost:${PORT}/api/showtimes`);
  console.log(`- Revenue Report API: http://localhost:${PORT}/api/reports/revenue`);
});

module.exports = app;

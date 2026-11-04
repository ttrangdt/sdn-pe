const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const classRoutes = require('./routes/classRoutes');
const studentRoutes = require('./routes/studentRoutes');

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
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Student Attendance API is running at http://localhost:' + PORT
  });
});

// API Routes
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`- Root API: http://localhost:${PORT}`);
  console.log(`- Classes API: http://localhost:${PORT}/api/classes`);
  console.log(`- Students API: http://localhost:${PORT}/api/students`);
});

module.exports = app;

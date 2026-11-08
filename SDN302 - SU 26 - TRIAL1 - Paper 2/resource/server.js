const express = require('express');
const morgan = require('morgan');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const { connectDb } = require('./dal/database');

const movieRoute = require('./routes/movie.route');
const roomRoute = require('./routes/room.route');
const showtimeRoute = require('./routes/showtime.route');
const ticketRoute = require('./routes/ticket.route');
const userRoute = require('./routes/user.route');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

try {
  const cors = require('cors');
  app.use(cors());
} catch (e) {}

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'SDN302 Exam API Server is ready',
    endpoints: [
      '/api/movies',
      '/api/rooms',
      '/api/showtimes',
      '/api/tickets',
      '/api/users'
    ]
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Welcome to SDN302 RESTful API Server' });
});

app.use('/api/movies', movieRoute);
app.use('/api/rooms', roomRoute);
app.use('/api/showtimes', showtimeRoute);
app.use('/api/tickets', ticketRoute);
app.use('/api/users', userRoute);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 9999;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/databaseName';

(async () => {
  try {
    await connectDb(MONGO_URI);
    app.listen(PORT, () => {
      console.log('\n====================================================');
      console.log(`  Server running at: http://localhost:${PORT}`);
      console.log('====================================================');
      console.log('Available API Endpoints:');
      console.log(' - http://localhost:' + PORT + '/api/movies');
      console.log(' - http://localhost:' + PORT + '/api/rooms');
      console.log(' - http://localhost:' + PORT + '/api/showtimes');
      console.log(' - http://localhost:' + PORT + '/api/tickets');
      console.log(' - http://localhost:' + PORT + '/api/users');
      console.log('====================================================\n');
    });
  } catch (error) {
    console.error('[ERROR] Cannot start server:', error.message);
    process.exit(1);
  }
})();

module.exports = app;

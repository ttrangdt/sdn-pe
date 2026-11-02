const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Movie = require('./models/Movie');
const Room = require('./models/Room');
const Showtime = require('./models/Showtime');
const Ticket = require('./models/Ticket');
const User = require('./models/User');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/SDN_Trial';

function parseJsonWithOid(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw, (key, value) => {
    if (value && typeof value === 'object' && value.$oid) {
      return new mongoose.Types.ObjectId(value.$oid);
    }
    return value;
  });
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB at:', MONGO_URI);

    const moviesData = parseJsonWithOid(path.join(__dirname, 'movies.json'));
    const roomsData = parseJsonWithOid(path.join(__dirname, 'rooms.json'));
    const showtimesData = parseJsonWithOid(path.join(__dirname, 'showtimes.json')).map(item => ({
      ...item,
      startTime: new Date(item.startTime),
      endTime: new Date(item.endTime)
    }));
    const ticketsData = parseJsonWithOid(path.join(__dirname, 'tickets.json')).map(item => ({
      ...item,
      bookedAt: item.bookedAt ? new Date(item.bookedAt) : new Date()
    }));
    const usersData = parseJsonWithOid(path.join(__dirname, 'users.json'));

    await Movie.deleteMany({});
    await Room.deleteMany({});
    await Showtime.deleteMany({});
    await Ticket.deleteMany({});
    await User.deleteMany({});

    await Movie.insertMany(moviesData);
    await Room.insertMany(roomsData);
    await Showtime.insertMany(showtimesData);
    await Ticket.insertMany(ticketsData);
    await User.insertMany(usersData);

    console.log('Successfully seeded database SDN_Trial!');
    console.log(`- Movies: ${moviesData.length}`);
    console.log(`- Rooms: ${roomsData.length}`);
    console.log(`- Showtimes: ${showtimesData.length}`);
    console.log(`- Tickets: ${ticketsData.length}`);
    console.log(`- Users: ${usersData.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();


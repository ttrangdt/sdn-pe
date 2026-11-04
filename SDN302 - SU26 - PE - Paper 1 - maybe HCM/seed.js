const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Manufacturer = require('./models/Manufacturer');
const Helicopter = require('./models/Helicopter');
const Member = require('./models/Member');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sdn302-pe-su26-se181234-db';

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
    console.log('Connected to MongoDB:', MONGO_URI);

    const manufacturersData = parseJsonWithOid(path.join(__dirname, 'manufacturers.json'));
    const helicoptersData = parseJsonWithOid(path.join(__dirname, 'helicopters.json'));
    const membersData = parseJsonWithOid(path.join(__dirname, 'members.json'));

    // Ensure soldier / solider with password '123456789' exists
    const hasSoldier = membersData.some(m => m.name === 'soldier');
    if (!hasSoldier) {
      const hash = bcrypt.hashSync('123456789', 10);
      membersData.push({
        _id: new mongoose.Types.ObjectId(),
        name: 'soldier',
        pass: hash
      });
    }

    await Manufacturer.deleteMany({});
    await Helicopter.deleteMany({});
    await Member.deleteMany({});

    await Manufacturer.insertMany(manufacturersData);
    await Helicopter.insertMany(helicoptersData);
    await Member.insertMany(membersData);

    console.log('Seeded database successfully:');
    console.log(`- Manufacturers: ${manufacturersData.length}`);
    console.log(`- Helicopters: ${helicoptersData.length}`);
    console.log(`- Members: ${membersData.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();


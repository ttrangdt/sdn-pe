const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/su26db';

function transformBson(val) {
  if (val === null || val === undefined) return val;
  if (Array.isArray(val)) return val.map(item => transformBson(item));
  if (typeof val === 'object') {
    if (val.$oid) return new mongoose.Types.ObjectId(val.$oid);
    if (val.$date) return new Date(val.$date);
    const result = {};
    for (const [k, v] of Object.entries(val)) {
      result[k] = transformBson(v);
    }
    return result;
  }
  return val;
}

function parseJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return transformBson(JSON.parse(raw));
}

async function importData() {
  console.log('Connecting to MongoDB:', MONGO_URI);
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully!');

    const possibleDirs = [
      process.argv[2],
      path.join(__dirname, '..', 'material_0'),
      path.join(__dirname, 'material_0')
    ].filter(Boolean);

    let targetDir = null;
    for (const d of possibleDirs) {
      if (fs.existsSync(d) && fs.readdirSync(d).some(f => f.endsWith('.json'))) {
        targetDir = d;
        break;
      }
    }

    if (!targetDir) {
      console.error('Không tìm thấy folder chứa các file .json!');
      process.exit(1);
    }

    console.log('Đọc dữ liệu từ folder:', targetDir);
    const jsonFiles = fs.readdirSync(targetDir).filter(f => f.endsWith('.json'));
    const db = mongoose.connection.db;
    const summary = [];

    for (const file of jsonFiles) {
      const collName = file.replace(/\.json$/i, '');
      const filePath = path.join(targetDir, file);
      const docs = parseJsonFile(filePath);

      const collection = db.collection(collName);
      await collection.deleteMany({});
      if (docs.length > 0) {
        await collection.insertMany(docs);
      }

      summary.push({
        Collection: collName,
        Documents: docs.length,
        Status: 'Success'
      });
    }

    console.log('\n--- KẾT QUẢ IMPORT DỮ LIỆU ---');
    console.table(summary);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Import thất bại:', error);
    process.exit(1);
  }
}

importData();


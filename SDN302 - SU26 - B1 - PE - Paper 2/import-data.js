/**
 * ============================================================================
 * FAST MONGODB DATA IMPORTER
 * File: import-data.js
 * ============================================================================
 * Tác dụng:
 * - Bạn chỉ cần tạo sẵn Database trên MongoDB (ví dụ: su26db)
 * - File này sẽ tự động đọc toàn bộ các file JSON (attendances, classes, students, subjects...)
 * - Tự động convert BSON { "$oid": "..." } -> ObjectId, { "$date": "..." } -> Date
 * - Xóa sạch dữ liệu cũ và import dữ liệu mới vào đúng tên collection tương ứng trong < 1 giây!
 *
 * Cách sử dụng:
 *   node import-data.js [folderChuaJson]
 * Ví dụ:
 *   node import-data.js material_0
 *   (hoặc nếu đứng ở thư mục resource: node import-data.js ../material_0)
 */

const fs = require('fs');
const path = require('path');

// Tự động tìm mongoose và dotenv từ node_modules gần nhất
let mongoose, dotenv;
try {
  mongoose = require('mongoose');
  dotenv = require('dotenv');
} catch (e) {
  const resourceModules = path.join(__dirname, 'resource', 'node_modules');
  if (fs.existsSync(resourceModules)) {
    mongoose = require(path.join(resourceModules, 'mongoose'));
    dotenv = require(path.join(resourceModules, 'dotenv'));
  } else {
    throw e;
  }
}

// Tìm đường dẫn file .env
const envPaths = [
  path.join(__dirname, '.env'),
  path.join(__dirname, 'resource', '.env')
];
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/su26db';

// Hàm đệ quy convert BSON ($oid, $date) thành JavaScript BSON Types
function transformBson(val) {
  if (val === null || val === undefined) return val;

  if (Array.isArray(val)) {
    return val.map(item => transformBson(item));
  }

  if (typeof val === 'object') {
    if (val.$oid) {
      return new mongoose.Types.ObjectId(val.$oid);
    }
    if (val.$date) {
      return new Date(val.$date);
    }
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
  const data = JSON.parse(raw);
  return transformBson(data);
}

async function importData() {
  console.log('==================================================');
  console.log('       MONGODB FAST DATA IMPORTER (FPTU EXAM)     ');
  console.log('==================================================');
  console.log('Connecting to MongoDB:', MONGO_URI);

  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully!');

    // Xác định thư mục chứa các file json
    const possibleDirs = [
      process.argv[2],
      path.join(__dirname, 'material_0'),
      path.join(__dirname, '..', 'material_0'),
      __dirname
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
      // Xóa dữ liệu cũ
      await collection.deleteMany({});
      // Chèn dữ liệu mới nếu có
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
    console.log('Toàn bộ dữ liệu đã được nạp thành công vào database!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Import thất bại:', error);
    process.exit(1);
  }
}

importData();

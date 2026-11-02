/**
 * ============================================================================
 * COMPONENT: MONGOOSE MODEL & SCHEMA PATTERNS
 * Directory: models/
 * ============================================================================
 */

const mongoose = require('mongoose');

// ============================================================================
// 1. MẪU MODEL ĐƠN GIẢN (Basic Model: Chuỗi, Số, Boolean, Enum, Timestamps)
// ============================================================================
const basicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true, // Không trùng lặp
    uppercase: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be positive']
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'PENDING'],
    default: 'ACTIVE'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  tags: [{ type: String }] // Mảng chuỗi
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
  versionKey: false // Bỏ trường __v của mongoose
});

// Xuất model với collection name rõ ràng (tham số thứ 3)
const BasicModel = mongoose.model('Basic', basicSchema, 'basics');


// ============================================================================
// 2. MẪU MODEL CÓ KHÓA NGOẠI (Foreign Key Reference - Dùng cho Population)
// ============================================================================
const itemWithRefSchema = new mongoose.Schema({
  name: { type: String, required: true },
  
  // Khóa ngoại trỏ đến Model khác (VD: Manufacturer, Category, Movie...)
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Tên model được tham chiếu đến
    required: true
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

const ItemWithRef = mongoose.model('ItemWithRef', itemWithRefSchema, 'items');


// ============================================================================
// 3. MẪU MODEL CÓ SUB-DOCUMENT (Mảng đối tượng con - VD: Ghế trong Phòng chiếu)
// ============================================================================
const seatSubSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // VD: "A1", "B2"
  type: { type: String, enum: ['VIP', 'NORMAL'], default: 'NORMAL' }
}, { _id: false }); // _id: false nếu muốn dùng id tự định nghĩa

const roomWithSeatsSchema = new mongoose.Schema({
  roomName: { type: String, required: true },
  capacity: { type: Number, required: true },
  seats: [seatSubSchema] // Mảng các document con
}, {
  versionKey: false
});

const RoomModel = mongoose.model('Room', roomWithSeatsSchema, 'rooms');


// ============================================================================
// 4. MẪU TRƯỜNG ẢO (VIRTUALS) - Tự động tính toán khi gọi toJSON/toObject
// ============================================================================
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  priceVND: { type: Number, required: true }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Tính giá USD = VND / 26000 làm tròn 1 chữ số
productSchema.virtual('priceUSD').get(function() {
  return (this.priceVND / 26000).toFixed(1);
});

module.exports = {
  BasicModel,
  ItemWithRef,
  RoomModel
};


/**
 * ============================================================================
 * COMPONENT: UNIVERSAL CRUD CONTROLLER TEMPLATE
 * File: controllers/crudController.js
 * ============================================================================
 * Bao gồm đầy đủ các kịch bản chấm điểm của FPTU:
 * 1. GET ALL: Sắp xếp (sort), chuyển đổi định dạng (transform response)
 * 2. GET BY ID: Kiểm tra ObjectId hợp lệ (400), tìm không thấy (404), thành công (200)
 * 3. CREATE: Kiểm tra các trường bắt buộc (400), trùng lặp unique (400), thành công (201)
 * 4. UPDATE: Cập nhật dữ liệu với runValidators
 * 5. DELETE: KIỂM TRA RÀNG BUỘC KHÓA NGOẠI (Foreign Key Constraint Check)
 *    Không cho phép xóa nếu bản ghi đang được tham chiếu bởi collection khác!
 */

const mongoose = require('mongoose');

// Thay đổi Model tương ứng với bài thi
const PrimaryModel = require('../models/PrimaryModel'); 
const DependentModel = require('../models/DependentModel'); // Model phụ thuộc (VD: Helicopter phụ thuộc Manufacturer)

// ============================================================================
// 1. LẤY TẤT CẢ (Kèm sắp xếp & Biến đổi dữ liệu)
// ============================================================================
const getAll = async (req, res) => {
  try {
    // Sắp xếp giảm dần: { fieldName: -1 } hoặc tăng dần: { fieldName: 1 }
    const items = await PrimaryModel.find().sort({ name: -1 });

    // Biến đổi cấu trúc nếu đề bài yêu cầu tên trường khác trong DB
    const transformed = items.map(item => ({
      id: item._id.toString(),
      name: item.name,
      totalCount: item.list ? item.list.length : 0,
      vipCount: item.list ? item.list.filter(x => x.type === 'VIP').length : 0
    }));

    return res.status(200).json(transformed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// 2. LẤY CHI TIẾT THEO ID (Kèm ObjectId Validation)
// ============================================================================
const getById = async (req, res) => {
  const { id } = req.params;

  // 1. Kiểm tra định dạng ObjectId (Bắt buộc phải có để lấy điểm 400 Bad Request)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: `Invalid ID: ${id}` });
  }

  try {
    // Populate lấy thông tin từ collection liên kết nếu cần
    const item = await PrimaryModel.findById(id).populate('referenceField');
    if (!item) {
      return res.status(404).json({ error: `Item with id: ${id} not found` });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// 3. TẠO MỚI (Validation trường bắt buộc & Unique Check)
// ============================================================================
const create = async (req, res) => {
  const { name, code, price } = req.body;

  // Kiểm tra thiếu trường bắt buộc
  if (!name || !code || price === undefined) {
    return res.status(400).json({ error: 'name, code, price required' });
  }

  try {
    // Kiểm tra trùng lặp trường unique
    const existing = await PrimaryModel.findOne({ code });
    if (existing) {
      return res.status(400).json({ error: `Item with code ${code} already exists` });
    }

    const newItem = await PrimaryModel.create({
      name: name.trim(),
      code: code.trim(),
      price: Number(price)
    });

    return res.status(201).json(newItem);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// 4. CẬP NHẬT THEO ID
// ============================================================================
const update = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: `Invalid ID: ${id}` });
  }

  try {
    const updated = await PrimaryModel.findByIdAndUpdate(id, req.body, {
      new: true, // Trả về document sau khi update
      runValidators: true // Kích hoạt validation của schema
    });

    if (!updated) {
      return res.status(404).json({ error: `Item with id: ${id} not found` });
    }

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// 5. XÓA CÓ KIỂM TRA RÀNG BUỘC LIÊN KẾT (Foreign Key Constraint Check)
// ============================================================================
const remove = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: `Invalid ID: ${id}` });
  }

  try {
    const item = await PrimaryModel.findById(id);
    if (!item) {
      return res.status(404).json({ error: `Item with id: ${id} not found` });
    }

    // KIỂM TRA: Có bản ghi con nào đang trỏ đến bản ghi này không?
    // VD: Không cho xóa Manufacturer nếu đang có Helicopter liên kết
    const dependentCount = await DependentModel.countDocuments({ primaryId: id });
    if (dependentCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete item because it has associated dependent records'
      });
    }

    await PrimaryModel.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};


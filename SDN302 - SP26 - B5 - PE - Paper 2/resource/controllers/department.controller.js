const mongoose = require('mongoose');
const Department = require('../models/department.model');

const getAll = async (req, res) => {
  try {
    const list = await Department.find(req.query)
      .populate('managerId')
      .populate('location.locId');
    return res.status(200).json(list);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid Department ID: ${id}` });
    }

    const item = await Department.findById(id)
      .populate('managerId')
      .populate('location.locId');
    if (!item) {
      return res.status(404).json({ error: `Department with id = ${id} not found` });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const newItem = await Department.create(req.body);
    return res.status(201).json(newItem);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid Department ID: ${id}` });
    }

    const updated = await Department.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ error: `Department with id = ${id} not found` });
    }

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid Department ID: ${id}` });
    }

    const deleted = await Department.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: `Department with id = ${id} not found` });
    }

    return res.status(200).json({ message: `Department deleted successfully` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteItem
};

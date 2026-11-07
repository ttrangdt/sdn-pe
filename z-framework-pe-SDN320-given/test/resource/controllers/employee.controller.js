const mongoose = require('mongoose');
const Employee = require('../models/employee.model');

const getAll = async (req, res) => {
  try {
    const list = await Employee.find(req.query)
      .populate('depId')
      .populate('supervisorId');
    return res.status(200).json(list);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid Employee ID: ${id}` });
    }

    const item = await Employee.findById(id)
      .populate('depId')
      .populate('supervisorId');
    if (!item) {
      return res.status(404).json({ error: `Employee with id = ${id} not found` });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const newItem = await Employee.create(req.body);
    return res.status(201).json(newItem);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid Employee ID: ${id}` });
    }

    const updated = await Employee.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ error: `Employee with id = ${id} not found` });
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
      return res.status(400).json({ error: `Invalid Employee ID: ${id}` });
    }

    const deleted = await Employee.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: `Employee with id = ${id} not found` });
    }

    return res.status(200).json({ message: `Employee deleted successfully` });
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

const mongoose = require('mongoose');
const Workson = require('../models/workson.model');

const getAll = async (req, res) => {
  try {
    const list = await Workson.find(req.query)
      .populate('empId')
      .populate('proId');
    return res.status(200).json(list);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid Workson ID: ${id}` });
    }

    const item = await Workson.findById(id)
      .populate('empId')
      .populate('proId');
    if (!item) {
      return res.status(404).json({ error: `Workson with id = ${id} not found` });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const newItem = await Workson.create(req.body);
    return res.status(201).json(newItem);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid Workson ID: ${id}` });
    }

    const updated = await Workson.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ error: `Workson with id = ${id} not found` });
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
      return res.status(400).json({ error: `Invalid Workson ID: ${id}` });
    }

    const deleted = await Workson.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: `Workson with id = ${id} not found` });
    }

    return res.status(200).json({ message: `Workson deleted successfully` });
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

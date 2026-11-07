const mongoose = require('mongoose');
const Checkin = require('../models/checkin.model');

const getAll = async (req, res) => {
  try {
    const list = await Checkin.find(req.query)
      .populate('learnerId')
      .populate('batchId');
    return res.status(200).json(list);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid Checkin ID: ${id}` });
    }

    const item = await Checkin.findById(id)
      .populate('learnerId')
      .populate('batchId');
    if (!item) {
      return res.status(404).json({ error: `Checkin with id = ${id} not found` });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const newItem = await Checkin.create(req.body);
    return res.status(201).json(newItem);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid Checkin ID: ${id}` });
    }

    const updated = await Checkin.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ error: `Checkin with id = ${id} not found` });
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
      return res.status(400).json({ error: `Invalid Checkin ID: ${id}` });
    }

    const deleted = await Checkin.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: `Checkin with id = ${id} not found` });
    }

    return res.status(200).json({ message: `Checkin deleted successfully` });
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

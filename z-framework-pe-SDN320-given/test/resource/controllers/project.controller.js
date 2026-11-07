const mongoose = require('mongoose');
const Project = require('../models/project.model');

const getAll = async (req, res) => {
  try {
    const list = await Project.find(req.query)
      .populate('depId')
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
      return res.status(400).json({ error: `Invalid Project ID: ${id}` });
    }

    const item = await Project.findById(id)
      .populate('depId')
      .populate('location.locId');
    if (!item) {
      return res.status(404).json({ error: `Project with id = ${id} not found` });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const newItem = await Project.create(req.body);
    return res.status(201).json(newItem);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid Project ID: ${id}` });
    }

    const updated = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ error: `Project with id = ${id} not found` });
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
      return res.status(400).json({ error: `Invalid Project ID: ${id}` });
    }

    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: `Project with id = ${id} not found` });
    }

    return res.status(200).json({ message: `Project deleted successfully` });
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

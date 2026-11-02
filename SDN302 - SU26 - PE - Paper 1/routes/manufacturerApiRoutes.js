const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Manufacturer = require('../models/Manufacturer');
const Helicopter = require('../models/Helicopter');
const { verifyJWT } = require('../middlewares/auth');

// All routes in this router require JWT authentication
router.use(verifyJWT);

// GET /api/manufacturers - List all manufacturers
router.get('/', async (req, res) => {
  try {
    const manufacturers = await Manufacturer.find();
    return res.status(200).json(manufacturers);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/manufacturers/:id - Get manufacturer by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid manufacturer ID' });
  }

  try {
    const manufacturer = await Manufacturer.findById(id);
    if (!manufacturer) {
      return res.status(404).json({ message: 'Manufacturer not found' });
    }
    return res.status(200).json(manufacturer);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/manufacturers - Create a new manufacturer
router.post('/', async (req, res) => {
  const { manufacturer, isAsia } = req.body;
  if (!manufacturer || manufacturer.trim() === '') {
    return res.status(400).json({ message: 'Manufacturer name is required' });
  }

  try {
    const existing = await Manufacturer.findOne({ manufacturer: manufacturer.trim() });
    if (existing) {
      return res.status(400).json({ message: 'Manufacturer already exists' });
    }

    const newManufacturer = await Manufacturer.create({
      manufacturer: manufacturer.trim(),
      isAsia: isAsia === true || isAsia === 'true'
    });

    return res.status(201).json(newManufacturer);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/manufacturers/:id - Update a manufacturer
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid manufacturer ID' });
  }

  const { manufacturer, isAsia } = req.body;
  try {
    const updateData = {};
    if (manufacturer !== undefined) updateData.manufacturer = manufacturer.trim();
    if (isAsia !== undefined) updateData.isAsia = isAsia === true || isAsia === 'true';

    const updated = await Manufacturer.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ message: 'Manufacturer not found' });
    }
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/manufacturers/:id - Delete a manufacturer
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid manufacturer ID' });
  }

  try {
    const manufacturer = await Manufacturer.findById(id);
    if (!manufacturer) {
      return res.status(404).json({ message: 'Manufacturer not found' });
    }

    // Business rule: check if any helicopters are associated with this manufacturer
    const associatedHelicopters = await Helicopter.countDocuments({ manufacturer: id });
    if (associatedHelicopters > 0) {
      return res.status(400).json({
        message: 'Cannot delete manufacturer because it has associated Helicopters'
      });
    }

    await Manufacturer.findByIdAndDelete(id);
    return res.status(200).json({
      message: 'Manufacturer deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;


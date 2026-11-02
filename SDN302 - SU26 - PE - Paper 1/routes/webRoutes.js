const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Helicopter = require('../models/Helicopter');
const Manufacturer = require('../models/Manufacturer');
const Member = require('../models/Member');
const { requireWebAuth } = require('../middlewares/auth');

// Helper to validate Helicopter input fields
function validateHelicopter(data) {
  const { heliName, imgWrapper, price, manufacturer } = data;
  const errors = [];

  if (!heliName || heliName.trim() === '') {
    errors.push('Helicopter name is required.');
  } else {
    const words = heliName.trim().split(/\s+/);
    if (words.length < 2) {
      errors.push('Helicopter name must contain at least two words.');
    } else {
      const isCapitalized = words.every(w => /^[A-Z]/.test(w));
      if (!isCapitalized) {
        errors.push('The first letter of each word must be capitalized.');
      }
    }
  }

  if (!imgWrapper || imgWrapper.trim() === '') {
    errors.push('Image wrapper URL is required.');
  } else {
    try {
      new URL(imgWrapper.trim());
    } catch (e) {
      errors.push('Image wrapper must be a valid URL.');
    }
  }

  const numPrice = Number(price);
  if (isNaN(numPrice) || numPrice < 100000) {
    errors.push('Price must be a number with a minimum of 6 digits.');
  }

  if (!manufacturer || !mongoose.Types.ObjectId.isValid(manufacturer)) {
    errors.push('Valid manufacturer is required.');
  }

  return errors;
}

// ==========================================
// 1. Authentication Views
// ==========================================

// GET /auth/access - Login page
router.get('/auth/access', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/management/helicopters');
  }
  const errorMsg = req.session.errorMsg || null;
  req.session.errorMsg = null;
  res.render('login', { errorMsg });
});

// POST /auth/access - Handle login
router.post('/auth/access', async (req, res) => {
  const { name, pass } = req.body;

  if (!name || !pass) {
    req.session.errorMsg = 'Please enter both account name and password.';
    return res.redirect('/auth/access');
  }

  try {
    const member = await Member.findOne({
      $or: [
        { name: name.trim() },
        { name: name.trim() === 'soldier' ? 'solider' : (name.trim() === 'solider' ? 'soldier' : name.trim()) }
      ]
    });

    if (!member) {
      req.session.errorMsg = 'Invalid account name or password.';
      return res.redirect('/auth/access');
    }

    const isMatch = bcrypt.compareSync(pass, member.pass);
    if (!isMatch) {
      req.session.errorMsg = 'Invalid account name or password.';
      return res.redirect('/auth/access');
    }

    // Set session user
    req.session.user = {
      id: member._id,
      name: member.name
    };

    return res.redirect('/management/helicopters');
  } catch (err) {
    req.session.errorMsg = 'Login failed: ' + err.message;
    return res.redirect('/auth/access');
  }
});

// GET /auth/logout - Logout
router.get('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/access');
  });
});

// ==========================================
// 2. Helicopter Management Views (Protected)
// ==========================================

// GET /management/helicopters - Display all helicopters in card view
router.get('/management/helicopters', requireWebAuth, async (req, res) => {
  try {
    const helicopters = await Helicopter.find().populate('manufacturer');
    const manufacturers = await Manufacturer.find();

    const notification = req.session.notification || null;
    const errorMsg = req.session.errorMsg || null;
    req.session.notification = null;
    req.session.errorMsg = null;

    // Transform price to USD: price / 26000 rounded to 1 decimal place
    const cardHelicopters = helicopters.map(h => {
      const usdPrice = (h.price / 26000).toFixed(1);
      return {
        _id: h._id,
        heliName: h.heliName,
        imgWrapper: h.imgWrapper,
        priceVND: h.price,
        priceUSD: usdPrice,
        isAssembly: h.isAssembly,
        adult: h.adult,
        manufacturerName: h.manufacturer ? h.manufacturer.manufacturer : 'Unknown',
        manufacturerId: h.manufacturer ? h.manufacturer._id : null
      };
    });

    res.render('helicopters', {
      user: req.session.user,
      helicopters: cardHelicopters,
      manufacturers,
      notification,
      errorMsg
    });
  } catch (err) {
    res.status(500).send('Error loading helicopters: ' + err.message);
  }
});

// POST /management/helicopters - Add new helicopter
router.post('/management/helicopters', requireWebAuth, async (req, res) => {
  const { heliName, imgWrapper, price, adult, isAssembly, manufacturer } = req.body;

  const errors = validateHelicopter(req.body);
  if (errors.length > 0) {
    req.session.errorMsg = errors.join(' ');
    return res.redirect('/management/helicopters');
  }

  try {
    const isAdult = (adult === true || adult === 'true' || adult === 'on');
    let assembly = (isAssembly === true || isAssembly === 'true' || isAssembly === 'on');

    // Rule: "If adult is true, then isAssembly must always be true."
    if (isAdult) {
      assembly = true;
    }

    await Helicopter.create({
      heliName: heliName.trim(),
      imgWrapper: imgWrapper.trim(),
      price: Number(price),
      adult: isAdult,
      isAssembly: assembly,
      manufacturer: manufacturer
    });

    req.session.notification = `Helicopter "${heliName.trim()}" added successfully!`;
    return res.redirect('/management/helicopters');
  } catch (err) {
    req.session.errorMsg = 'Failed to add helicopter: ' + err.message;
    return res.redirect('/management/helicopters');
  }
});

// GET /management/helicopters/:id - View detail and edit helicopter
router.get('/management/helicopters/:id', requireWebAuth, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.session.errorMsg = 'Invalid helicopter ID';
    return res.redirect('/management/helicopters');
  }

  try {
    const helicopter = await Helicopter.findById(id).populate('manufacturer');
    if (!helicopter) {
      req.session.errorMsg = 'Helicopter not found';
      return res.redirect('/management/helicopters');
    }

    const manufacturers = await Manufacturer.find();
    const errorMsg = req.session.errorMsg || null;
    req.session.errorMsg = null;

    res.render('editHelicopter', {
      user: req.session.user,
      helicopter,
      manufacturers,
      errorMsg
    });
  } catch (err) {
    req.session.errorMsg = err.message;
    return res.redirect('/management/helicopters');
  }
});

// POST /management/helicopters/:id - Update helicopter
router.post('/management/helicopters/:id', requireWebAuth, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.session.errorMsg = 'Invalid helicopter ID';
    return res.redirect('/management/helicopters');
  }

  const { heliName, imgWrapper, price, adult, isAssembly, manufacturer } = req.body;
  const errors = validateHelicopter(req.body);
  if (errors.length > 0) {
    req.session.errorMsg = errors.join(' ');
    return res.redirect(`/management/helicopters/${id}`);
  }

  try {
    const isAdult = (adult === true || adult === 'true' || adult === 'on');
    let assembly = (isAssembly === true || isAssembly === 'true' || isAssembly === 'on');

    if (isAdult) {
      assembly = true;
    }

    await Helicopter.findByIdAndUpdate(id, {
      heliName: heliName.trim(),
      imgWrapper: imgWrapper.trim(),
      price: Number(price),
      adult: isAdult,
      isAssembly: assembly,
      manufacturer: manufacturer
    }, { runValidators: true });

    req.session.notification = `Helicopter "${heliName.trim()}" updated successfully!`;
    return res.redirect('/management/helicopters');
  } catch (err) {
    req.session.errorMsg = 'Failed to update helicopter: ' + err.message;
    return res.redirect(`/management/helicopters/${id}`);
  }
});

// POST /management/helicopters/:id/delete - Delete helicopter with confirmation
router.post('/management/helicopters/:id/delete', requireWebAuth, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.session.errorMsg = 'Invalid helicopter ID';
    return res.redirect('/management/helicopters');
  }

  try {
    const heli = await Helicopter.findByIdAndDelete(id);
    if (!heli) {
      req.session.errorMsg = 'Helicopter not found';
    } else {
      req.session.notification = `Helicopter "${heli.heliName}" deleted successfully!`;
    }
    return res.redirect('/management/helicopters');
  } catch (err) {
    req.session.errorMsg = 'Delete failed: ' + err.message;
    return res.redirect('/management/helicopters');
  }
});

module.exports = router;


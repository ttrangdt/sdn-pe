const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Member = require('../models/Member');

// POST /auth/tokens (or GET /auth/tokens) to generate JWT
const handleTokenGeneration = async (req, res) => {
  const name = req.body.name || req.body.username || req.query.name || req.query.username;
  const pass = req.body.pass || req.body.password || req.query.pass || req.query.password;

  if (!name || !pass) {
    return res.status(400).json({ message: 'Name and pass are required' });
  }

  try {
    // Find member by name (case-insensitive or alias soldier/solider)
    let member = await Member.findOne({
      $or: [
        { name: name },
        { name: name.toLowerCase() },
        { name: name === 'soldier' ? 'solider' : (name === 'solider' ? 'soldier' : name) }
      ]
    });

    if (!member) {
      return res.status(401).json({ message: 'Invalid credentials: user not found' });
    }

    const isMatch = bcrypt.compareSync(pass, member.pass);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials: wrong password' });
    }

    const payload = {
      id: member._id,
      name: member.name
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'se181234@', {
      expiresIn: '24h'
    });

    return res.status(200).json({
      token: token,
      message: 'JWT generated successfully'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

router.post('/tokens', handleTokenGeneration);
router.get('/tokens', handleTokenGeneration);

module.exports = router;


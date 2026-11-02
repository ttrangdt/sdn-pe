const User = require('../models/User');

const verifyAdmin = async (req, res, next) => {
  const accessKey = req.headers['access_key'] || req.headers['access-key'];

  if (!accessKey) {
    return res.status(403).json({ error: 'No access key' });
  }

  try {
    const user = await User.findOne({ access_key: accessKey });
    if (!user) {
      return res.status(403).json({ error: 'Invalid or unauthorized access key' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { verifyAdmin };


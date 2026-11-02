const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyAdmin } = require('../middlewares/auth');

// Question 4: Revenue Report (Admin Only)
// GET /api/reports/revenue
router.get('/revenue', verifyAdmin, reportController.getRevenueReport);

module.exports = router;

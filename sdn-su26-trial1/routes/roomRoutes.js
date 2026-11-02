const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// Question 1: Retrieve All Rooms (Sorted)
// GET /api/rooms
router.get('/', roomController.getAllRooms);

module.exports = router;

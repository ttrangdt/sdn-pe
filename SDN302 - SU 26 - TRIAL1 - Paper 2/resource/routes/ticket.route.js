const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');

// Question 4: POST /api/tickets
router.post('/', ticketController.createTickets);

module.exports = router;

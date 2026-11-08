const express = require('express');
const router = express.Router();
const controller = require('../controllers/room.controller');

// Mac dinh comment san cac route CRUD de tranh bi de hoac trung lap voi de thi PE.
// Khi can su dung route nao, hay bo comment o route do:
// router.get('/', controller.getAll);
// router.get('/:id', controller.getById);
// router.post('/', controller.create);
// router.put('/:id', controller.update);
// router.delete('/:id', controller.deleteItem);

module.exports = router;

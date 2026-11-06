const express = require('express');
const router = express.Router();
const controller = require('../controllers/project.controller');

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.deleteItem);

router.get('/department/:depId', controller.RetrieveProjectsByDepartment);
// router.get('/:proid/employees', controller.RetrieveEmployeesByProject);


module.exports = router;

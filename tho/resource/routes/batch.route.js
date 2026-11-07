const express = require("express");
const router = express.Router();
const controller = require("../controllers/batch.controller");

// router.get('/', controller.getAll);
// router.get('/:id', controller.getById);
// router.post('/', controller.create);
// router.put('/:id', controller.update);
// router.delete('/:id', controller.deleteItem);

router.get("/", controller.retrieveBatchesMyMini);
router.patch("/:batchId/registrations/:learnerId", controller.updateALearner);
router.get("/workload-summary", controller.intructorSummary);

module.exports = router;

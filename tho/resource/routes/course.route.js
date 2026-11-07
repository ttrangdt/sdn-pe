const express = require("express");
const router = express.Router();
const controller = require("../controllers/course.controller");

// router.get("/", controller.getAll);
// router.get("/:id", controller.getById);
// router.post("/", controller.create);
// router.put("/:id", controller.update);
// router.delete("/:id", controller.deleteItem);

router.get(
  "/:courseId/registration-summary",
  controller.registrationRetensionSummary,
);
router.get("/", controller.retrieveCourse);

module.exports = router;

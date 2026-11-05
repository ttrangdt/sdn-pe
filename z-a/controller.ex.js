const mongoose = require("mongoose");
const Class = require("../models/Class");
const Student = require("../models/Student");

const getStudentsByClass = async (req, res) => {
  const { classId } = req.params;
  const { status } = req.query;

  // 1. Validate classId format
  if (!mongoose.Types.ObjectId.isValid(classId)) {
    return res.status(400).json({ error: `Invalid classId: ${classId}` });
  }

  try {
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getStudentsByClass,
};

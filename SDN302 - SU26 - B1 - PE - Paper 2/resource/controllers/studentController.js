const mongoose = require('mongoose');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const Subject = require('../models/Subject');

// ============================================================================
// Question 3 (2.5 points): Retrieve Attendance History of a Student
// GET /api/students/:studentId/attendances
// ============================================================================
const getAttendanceHistory = async (req, res) => {
  const { studentId } = req.params;

  // 1. Validate studentId format
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ error: `Invalid studentId: ${studentId}` });
  }

  try {
    // 2. Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: `Student with id = ${studentId} not found` });
    }

    // 3. Query attendances and populate class and subject
    const attendances = await Attendance.find({ studentId: student._id })
      .populate({
        path: 'classId',
        populate: {
          path: 'subjectId',
          model: 'Subject'
        }
      })
      .sort({ date: -1 });

    // 4. Format output: id (renamed from _id), className, subjectName, date, status
    const result = attendances.map(att => {
      const cls = att.classId;
      const sub = cls ? cls.subjectId : null;

      return {
        id: att._id.toString(),
        className: cls ? cls.className : null,
        subjectName: sub ? sub.name : null,
        date: att.date ? att.date.toISOString() : null,
        status: att.status
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAttendanceHistory
};


const mongoose = require('mongoose');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
require('../models/Class');
require('../models/Subject');

// ============================================================================
// Question 3 (2.5 điểm): Lấy lịch sử điểm danh của sinh viên
// GET /api/students/:studentId/attendances
// ============================================================================
const getAttendanceHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1. Kiểm tra định dạng ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ error: `Invalid studentId: ${studentId}` });
    }

    // 2. Kiểm tra sinh viên có tồn tại không
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: `Student with id = ${studentId} not found` });
    }

    // 3. Tìm các bản ghi điểm danh và populate lồng nhau (nested populate)
    // Attendance -> classId (Class) -> subjectId (Subject)
    const attendances = await Attendance.find({ studentId })
      .populate({
        path: 'classId',
        populate: { path: 'subjectId' },
      })
      .sort({ date: -1 });

    // 4. Định dạng dữ liệu trả về theo đúng yêu cầu đề thi
    const result = attendances.map((a) => ({
      id: a._id.toString(),
      className: a.classId?.className || null,
      subjectName: a.classId?.subjectId?.name || null,
      date: a.date ? a.date.toISOString() : null,
      status: a.status,
    }));

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAttendanceHistory,
};

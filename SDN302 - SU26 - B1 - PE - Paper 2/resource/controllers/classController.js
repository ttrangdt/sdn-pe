const mongoose = require('mongoose');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');

// ============================================================================
// Question 1 (1.5 điểm): Lấy danh sách sinh viên theo lớp học
// GET /api/classes/:classId/students?status=enrolled
// ============================================================================
const getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { status } = req.query;

    // 1. Kiểm tra định dạng ID
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ error: `Invalid classId: ${classId}` });
    }

    // 2. Kiểm tra status query
    if (!status || (status !== 'enrolled' && status !== 'dropped')) {
      return res.status(400).json({ error: `Invalid status: ${status}` });
    }

    // 3. Tìm lớp học kèm populate thông tin sinh viên
    const classObj = await Class.findById(classId).populate('enrollments.studentId');
    if (!classObj) {
      return res.status(404).json({ error: `Class with id = ${classId} not found` });
    }

    // 4. Lọc theo trạng thái và định dạng dữ liệu trả về
    const result = classObj.enrollments
      .filter((e) => e.status === status && e.studentId)
      .map((e) => ({
        id: e.studentId._id.toString(),
        studentCode: e.studentId.studentCode,
        fullName: e.studentId.fullName,
        email: e.studentId.email,
      }));

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// Question 2 (2.5 điểm): Thống kê điểm danh theo lớp học
// GET /api/classes/:classId/attendance-summary
// ============================================================================
const getAttendanceSummary = async (req, res) => {
  try {
    const { classId } = req.params;

    // 1. Kiểm tra định dạng ID
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ error: `Invalid classId: ${classId}` });
    }

    // 2. Tìm lớp học kèm populate thông tin sinh viên
    const classObj = await Class.findById(classId).populate('enrollments.studentId');
    if (!classObj) {
      return res.status(404).json({ error: `Class with id = ${classId} not found` });
    }

    // 3. Lấy toàn bộ điểm danh của lớp
    const attendances = await Attendance.find({ classId });

    // 4. Lọc danh sách sinh viên đang theo học (enrolled)
    const enrolledStudents = classObj.enrollments.filter(
      (e) => e.status === 'enrolled' && e.studentId
    );

    // 5. Tính toán thống kê cho từng sinh viên
    const summary = enrolledStudents.map((e) => {
      const student = e.studentId;
      const records = attendances.filter(
        (a) => a.studentId.toString() === student._id.toString()
      );

      const totalSessions = records.length;
      const present = records.filter((a) => a.status === 'PRESENT').length;
      const absent = records.filter((a) => a.status === 'ABSENT').length;
      const attendanceRate = totalSessions
        ? Number(((present / totalSessions) * 100).toFixed(1))
        : 0;

      return {
        studentCode: student.studentCode,
        fullName: student.fullName,
        totalSessions,
        present,
        absent,
        attendanceRate,
        warning: attendanceRate < 80,
      };
    });

    return res.status(200).json(summary);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// Question 4 (3.5 điểm): Điểm danh hàng loạt kèm ghi đè (Bulk Upsert)
// POST /api/classes/:classId/attendances
// ============================================================================
const bulkAttendanceUpsert = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date, records } = req.body;

    // 1. Kiểm tra định dạng ID
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ error: `Invalid classId: ${classId}` });
    }

    // 2. Tìm lớp kèm thông tin sinh viên
    const classObj = await Class.findById(classId).populate('enrollments.studentId');
    if (!classObj) {
      return res.status(404).json({ error: `Class with id = ${classId} not found` });
    }

    // 3. Kiểm tra ngày: không được để trống và không được ở tương lai
    if (!date || new Date(date) > new Date()) {
      return res.status(400).json({ error: 'Date cannot be in the future' });
    }

    // 4. Kiểm tra records mảng không được rỗng
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Records must be a non-empty array' });
    }

    // 5. Kiểm tra phải nộp đủ cho tất cả sinh viên đang 'enrolled'
    const enrolledList = classObj.enrollments.filter((e) => e.status === 'enrolled');
    for (const e of enrolledList) {
      const hasSubmitted = records.some((r) => r.studentId === e.studentId._id.toString());
      if (!hasSubmitted) {
        return res.status(400).json({
          error: `Missing attendance for student ${e.studentId.studentCode} (${e.studentId.fullName})`,
        });
      }
    }

    // 6. Kiểm tra từng sinh viên nộp phải thuộc về lớp và status hợp lệ
    const allMemberIds = classObj.enrollments.map((e) => e.studentId._id.toString());
    for (const r of records) {
      if (!allMemberIds.includes(r.studentId)) {
        return res.status(400).json({
          error: `Student ${r.studentId} does not belong to class`,
        });
      }
      if (r.status !== 'PRESENT' && r.status !== 'ABSENT') {
        return res.status(400).json({ error: `Invalid status: ${r.status}` });
      }
    }

    // 7. Thực hiện Upsert (nếu đã có thì ghi đè, chưa có thì tạo mới)
    const sessionDate = new Date(date);
    let updatedCount = 0;

    for (const r of records) {
      const existing = await Attendance.findOne({
        classId,
        studentId: r.studentId,
        date: sessionDate,
      });

      if (existing) {
        existing.status = r.status;
        await existing.save();
        updatedCount++;
      } else {
        await Attendance.create({
          classId,
          studentId: r.studentId,
          date: sessionDate,
          status: r.status,
        });
      }
    }

    // 8. Trả về kết quả tổng kết
    return res.status(201).json({
      message: 'Attendance recorded successfully',
      totalRecords: records.length,
      present: records.filter((r) => r.status === 'PRESENT').length,
      absent: records.filter((r) => r.status === 'ABSENT').length,
      updatedCount,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getStudentsByClass,
  getAttendanceSummary,
  bulkAttendanceUpsert,
};

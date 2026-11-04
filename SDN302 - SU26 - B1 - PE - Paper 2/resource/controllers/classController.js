const mongoose = require('mongoose');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

// ============================================================================
// Question 1 (1.5 points): Retrieve Students by Class
// GET /api/classes/:classId/students?status=enrolled
// ============================================================================
const getStudentsByClass = async (req, res) => {
  const { classId } = req.params;
  const { status } = req.query;

  // 1. Validate classId format
  if (!mongoose.Types.ObjectId.isValid(classId)) {
    return res.status(400).json({ error: `Invalid classId: ${classId}` });
  }

  try {
    // 2. Check if class exists
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ error: `Class with id = ${classId} not found` });
    }

    // 3. Only accept valid status values: enrolled or dropped
    if (!status || (status !== 'enrolled' && status !== 'dropped')) {
      return res.status(400).json({ error: `Invalid status: ${status}` });
    }

    // 4. Filter enrollments by status
    const matchingEnrollments = (classObj.enrollments || []).filter(e => e.status === status);
    const studentIds = matchingEnrollments.map(e => e.studentId);

    // 5. Query student details
    const students = await Student.find({ _id: { $in: studentIds } });
    const studentMap = new Map(students.map(s => [s._id.toString(), s]));

    // Format output: id (renamed from _id), studentCode, fullName, email
    const result = studentIds.map(id => {
      const s = studentMap.get(id.toString());
      if (!s) return null;
      return {
        id: s._id.toString(),
        studentCode: s.studentCode,
        fullName: s.fullName,
        email: s.email
      };
    }).filter(Boolean);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// Question 2 (2.5 points): Retrieve Attendance Statistics by Class
// GET /api/classes/:classId/attendance-summary
// ============================================================================
const getAttendanceSummary = async (req, res) => {
  const { classId } = req.params;

  // 1. Validate classId format
  if (!mongoose.Types.ObjectId.isValid(classId)) {
    return res.status(400).json({ error: `Invalid classId: ${classId}` });
  }

  try {
    // 2. Check if class exists
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ error: `Class with id = ${classId} not found` });
    }

    // 3. For each student enrolled in the class
    const enrolledEnrollments = (classObj.enrollments || []).filter(e => e.status === 'enrolled');
    const studentIds = enrolledEnrollments.map(e => e.studentId);

    const students = await Student.find({ _id: { $in: studentIds } });
    const studentMap = new Map(students.map(s => [s._id.toString(), s]));

    // Fetch all attendance records for this class
    const allClassAttendances = await Attendance.find({ classId: classObj._id });

    const summary = studentIds.map(sId => {
      const s = studentMap.get(sId.toString());
      if (!s) return null;

      const studentAttendances = allClassAttendances.filter(
        a => a.studentId.toString() === s._id.toString()
      );

      const totalSessions = studentAttendances.length;
      const present = studentAttendances.filter(a => a.status === 'PRESENT').length;
      const absent = studentAttendances.filter(a => a.status === 'ABSENT').length;
      const attendanceRate = totalSessions > 0
        ? Number(((present / totalSessions) * 100).toFixed(1))
        : 0;
      const warning = attendanceRate < 80;

      return {
        studentCode: s.studentCode,
        fullName: s.fullName,
        totalSessions,
        present,
        absent,
        attendanceRate,
        warning
      };
    }).filter(Boolean);

    return res.status(200).json(summary);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// Question 4 (3.5 points): Bulk Attendance Entry with Upsert
// POST /api/classes/:classId/attendances
// ============================================================================
const bulkAttendanceUpsert = async (req, res) => {
  const { classId } = req.params;
  const { date, records } = req.body;

  // 1. Validate classId format
  if (!mongoose.Types.ObjectId.isValid(classId)) {
    return res.status(400).json({ error: `Invalid classId: ${classId}` });
  }

  try {
    // 2. Check if class exists
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ error: `Class with id = ${classId} not found` });
    }

    // 3. Return 400 if date is missing or is a future date
    if (!date) {
      return res.status(400).json({ error: 'Date cannot be in the future' });
    }
    const sessionDate = new Date(date);
    if (isNaN(sessionDate.getTime()) || sessionDate > new Date()) {
      return res.status(400).json({ error: 'Date cannot be in the future' });
    }

    // 4. Return 400 if records is missing or empty
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Records must be a non-empty array' });
    }

    // 5. Must include ALL students enrolled in the class
    const enrolledEnrollments = (classObj.enrollments || []).filter(e => e.status === 'enrolled');
    const enrolledStudentIds = enrolledEnrollments.map(e => e.studentId.toString());

    const enrolledStudents = await Student.find({ _id: { $in: enrolledStudentIds } });
    const studentInfoMap = new Map(enrolledStudents.map(s => [s._id.toString(), s]));

    const submittedStudentIds = new Set(records.map(r => r.studentId));

    for (const enrolledId of enrolledStudentIds) {
      if (!submittedStudentIds.has(enrolledId)) {
        const student = studentInfoMap.get(enrolledId);
        const code = student ? student.studentCode : enrolledId;
        const name = student ? student.fullName : '';
        return res.status(400).json({
          error: `Missing attendance for student ${code} (${name})`
        });
      }
    }

    // 6. Each studentId must belong to the class
    const allClassMemberIds = new Set((classObj.enrollments || []).map(e => e.studentId.toString()));
    for (const r of records) {
      if (!allClassMemberIds.has(r.studentId)) {
        return res.status(400).json({
          error: `Student ${r.studentId} does not belong to class`
        });
      }
    }

    // 7. Only accept status values: PRESENT or ABSENT
    for (const r of records) {
      if (r.status !== 'PRESENT' && r.status !== 'ABSENT') {
        return res.status(400).json({ error: `Invalid status: ${r.status}` });
      }
    }

    // 8. Upsert logic: overwrite existing for the given date
    const recordDate = new Date(date);
    recordDate.setUTCHours(0, 0, 0, 0);

    const startOfDay = new Date(recordDate);
    const endOfDay = new Date(recordDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    let updatedCount = 0;

    for (const r of records) {
      const existing = await Attendance.findOne({
        classId: classObj._id,
        studentId: r.studentId,
        date: { $gte: startOfDay, $lte: endOfDay }
      });

      if (existing) {
        existing.status = r.status;
        await existing.save();
        updatedCount++;
      } else {
        await Attendance.create({
          classId: classObj._id,
          studentId: r.studentId,
          date: recordDate,
          status: r.status
        });
      }
    }

    const totalRecords = records.length;
    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;

    return res.status(201).json({
      message: 'Attendance recorded successfully',
      totalRecords,
      present,
      absent,
      updatedCount
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getStudentsByClass,
  getAttendanceSummary,
  bulkAttendanceUpsert
};


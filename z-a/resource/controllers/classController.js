const mongoose = require("mongoose");
const Class = require("../models/Class");
const Student = require("../models/Student");
const Subject = require("../models/Subject");
const Attendance = require("../models/Attendance");

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
    if (!status || (status !== "enrolled" && status !== "dropped")) {
      return res.status(400).json({ error: `Invalid status: ${status}` });
    }

    // 3. Tìm lớp học kèm populate thông tin sinh viên
    const classObj = await Class.findById(classId).populate(
      "enrollments.studentId subjectId",
    );

    if (!classObj) {
      return res
        .status(404)
        .json({ error: `Class with id = ${classId} not found` });
    }

    // 4. Lọc theo trạng thái và định dạng dữ liệu trả về
    const result = classObj.enrollments
      .filter((e) => e.status === status)
      .map((e) => ({
        subject_name: classObj.subjectId.name,
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

const getAttendanceSummary = async (req, res) => {
  const { classId } = req.params;

  // 1. Validate classId format
  if (!mongoose.Types.ObjectId.isValid(classId)) {
    return res.status(400).json({ error: `Invalid classId: ${classId}` });
  }

  // 3. Tìm lớp học kèm populate thông tin sinh viên
  const classObj = await Class.findById(classId).populate(
    "enrollments.studentId",
  );

  if (!classObj) {
    return res
      .status(404)
      .json({ error: `Class with id = ${classId} not found` });
  }

  const attendanceObjects = await Attendance.find({
    classId: classId,
  });

  // 4. Lọc theo trạng thái và định dạng dữ liệu trả về
  const result = classObj.enrollments
    .filter((e) => e.status === "enrolled")
    .map((e) => {
      const totalSessions = attendanceObjects.filter(
        (a) => a.studentId.toString() === e.studentId._id.toString(),
      ).length;

      const present = attendanceObjects.filter(
        (a) =>
          a.studentId.toString() === e.studentId._id.toString() &&
          a.status === "PRESENT",
      ).length;

      const absent = attendanceObjects.filter(
        (a) =>
          a.studentId.toString() === e.studentId._id.toString() &&
          a.status === "ABSENT",
      ).length;

      const rawRate = totalSessions > 0 ? (present / totalSessions) * 100 : 0;
      const attendanceRateStr = rawRate.toFixed(1); // Cho ra chuỗi "90.0"

      const warning =
        (attendanceObjects.filter(
          (a) =>
            a.studentId.toString() === e.studentId._id.toString() &&
            a.status === "PRESENT",
        ).length /
          attendanceObjects.filter(
            (a) => a.studentId.toString() === e.studentId._id.toString(),
          ).length) *
          100 <
        80;

      return {
        studentCode: e.studentId.studentCode,
        fullName: e.studentId.fullName,
        totalSessions,
        present,
        absent,
        attendanceRate: attendanceRateStr,
        warning,
      };
    });

  try {
    // 1. Chuyển object sang JSON string
    // 2. Bỏ dấu ngoặc kép riêng cho trường attendanceRate: "attendanceRate":"90.0" -> "attendanceRate":90.0
    const rawJson = JSON.stringify(result).replace(
      /"attendanceRate":"(\d+\.\d+)"/g,
      '"attendanceRate":$1',
    );

    // Gửi raw JSON với Header application/json
    return res.type("application/json").send(rawJson);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// const getAttendanceSummary = async (req, res) => {
//   try {
//     const { classId } = req.params;

//     // 1. Kiểm tra định dạng ID
//     if (!mongoose.Types.ObjectId.isValid(classId)) {
//       return res.status(400).json({ error: `Invalid classId: ${classId}` });
//     }

//     // 2. Tìm lớp học kèm populate thông tin sinh viên
//     const classObj = await Class.findById(classId).populate(
//       "enrollments.studentId",
//     );
//     if (!classObj) {
//       return res
//         .status(404)
//         .json({ error: `Class with id = ${classId} not found` });
//     }

//     // 3. Lấy toàn bộ điểm danh của lớp
//     const attendances = await Attendance.find({ classId });

//     // 4. Lọc danh sách sinh viên đang theo học (enrolled)
//     const enrolledStudents = classObj.enrollments.filter(
//       (e) => e.status === "enrolled" && e.studentId,
//     );

//     // 5. Tính toán thống kê cho từng sinh viên
//     const summary = enrolledStudents.map((e) => {
//       const student = e.studentId;
//       const records = attendances.filter(
//         (a) => a.studentId.toString() === student._id.toString(),
//       );

//       const totalSessions = records.length;
//       const present = records.filter((a) => a.status === "PRESENT").length;
//       const absent = records.filter((a) => a.status === "ABSENT").length;
//       const attendanceRate = totalSessions
//         ? Number(((present / totalSessions) * 100).toFixed(1))
//         : 0;

//       return {
//         studentCode: student.studentCode,
//         fullName: student.fullName,
//         totalSessions,
//         present,
//         absent,
//         attendanceRate,
//         warning: attendanceRate < 80,
//       };
//     });

//     return res.status(200).json(summary);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

module.exports = {
  getStudentsByClass,
  getAttendanceSummary,
};

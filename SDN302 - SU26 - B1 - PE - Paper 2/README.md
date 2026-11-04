# SDN302 - SU26 - B1 - PE - PAPER 2 (ĐỀ THI MỚI NHẤT)

## 📌 Tổng Quan Đề Thi
- **Chủ đề**: Hệ thống Quản lý Điểm danh Sinh viên (Student Attendance Management System).
- **Công nghệ**: Node.js, Express, MongoDB (Mongoose), RESTful API.
- **Database**: `su26db` (Cổng mặc định: `9999`).
- **Collections**:
  - `students`: Quản lý thông tin sinh viên (`studentCode`, `fullName`, `email`, `status: ACTIVE | INACTIVE`).
  - `classes`: Quản lý lớp học (`className`, `subjectId`, `semester`, `status: OPEN | CLOSED`, mảng `students: [{ studentId, status: enrolled | dropped }]`).
  - `subjects`: Quản lý môn học (`code`, `name`, `credits`).
  - `attendances`: Quản lý điểm danh (`classId`, `studentId`, `date`, `status: PRESENT | ABSENT`).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### 1. Nạp dữ liệu vào MongoDB
Chạy file script seeder tự động:
```bash
cd resource
node import-data.js ../material_0
# Hoặc: npm run seed
```

### 2. Sinh Models Mongoose tự động
```bash
node generate-models.js ../material_0 ./models
# Hoặc: npm run gen-models
```

### 3. Cài đặt dependencies & Khởi động Server
```bash
npm install
npm start
# Server sẽ chạy tại: http://localhost:9999
```

### 4. Chạy Test Suite tự động (Kiểm tra 100% các câu)
```bash
node run-tests.js
# Hoặc: npm test
```

---

## 📋 Danh Sách Các Endpoint & Yêu Cầu

### Q1 (1.5 điểm): Lấy danh sách sinh viên theo lớp học
- **Method & URL**: `GET /api/classes/:classId/students?status=enrolled`
- **Mã phản hồi**:
  - `200 OK`: Danh sách sinh viên theo đúng trạng thái (`id`, `studentCode`, `fullName`, `email`).
  - `400 Bad Request`: `Invalid class ID format` hoặc `Invalid status. Must be enrolled or dropped`.
  - `404 Not Found`: `Class not found`.

### Q2 (2.5 điểm): Thống kê điểm danh theo lớp học
- **Method & URL**: `GET /api/classes/:classId/attendance-summary`
- **Mã phản hồi**:
  - `200 OK`: Mảng thống kê từng sinh viên enrolled (`studentCode`, `fullName`, `totalSessions`, `present`, `absent`, `attendanceRate`, `warning`). Gắn `warning: true` nếu `attendanceRate < 80%`.
  - `400 Bad Request`: `Invalid class ID format`.
  - `404 Not Found`: `Class not found`.

### Q3 (2.5 điểm): Lịch sử điểm danh của sinh viên
- **Method & URL**: `GET /api/students/:studentId/attendances`
- **Mã phản hồi**:
  - `200 OK`: Danh sách điểm danh sắp xếp giảm dần theo ngày (`id`, `className`, `subjectName`, `date`, `status`).
  - `400 Bad Request`: `Invalid student ID format`.
  - `404 Not Found`: `Student not found`.

### Q4 (3.5 điểm): Điểm danh hàng loạt kèm ghi đè (Bulk Upsert)
- **Method & URL**: `POST /api/classes/:classId/attendances`
- **Body JSON**:
  ```json
  {
    "date": "2026-03-01",
    "records": [
      { "studentId": "65dd00000000000000000001", "status": "PRESENT" },
      { "studentId": "65dd00000000000000000002", "status": "ABSENT" }
    ]
  }
  ```
- **Mã phản hồi**:
  - `201 Created`: Trả về `{ message: "Attendance recorded successfully", totalRecords, present, absent, updatedCount }`.
  - `400 Bad Request`:
    - Ngày trong tương lai: `Date cannot be in the future`.
    - Thiếu sinh viên trong lớp: `Missing attendance for student <Code> (<Name>)`.
    - Sinh viên không thuộc lớp: `Student <Id> does not belong to class`.
    - Trạng thái không hợp lệ: `Status must be PRESENT or ABSENT`.
  - `404 Not Found`: `Class not found`.

1: Retrieve Batches by Minimum Enrolled Learners
Objective: Lấy danh sách các lớp học (batches) có ít nhất một số lượng học viên đang theo học (status = 'enrolled') đạt ngưỡng quy định.
Endpoint: GET /api/batches?minEnrolled=3
Business Rules:

1. Sử dụng query parameter 'minEnrolled' để lọc dữ liệu.
2. minEnrolled phải là số nguyên không âm. Trả về 400 Bad Request nếu thiếu hoặc không hợp lệ.
3. enrolledCount chỉ đếm các bản ghi đăng ký có status = 'enrolled' (bỏ qua các bản ghi 'dropped').
4. Cấu trúc JSON trả về đổi tên '\_id' thành 'id': id, batchName, instructorName, status, enrolledCount.

- 400 (Bad Request):
  {
  "error": "Invalid minEnrolled: abc"
  }
- 200 (OK): Test với minEnrolled = "3"
  [
  {
  "id": "65bb00000000000000000001",
  "batchName": "K24-IELTS-01",
  "instructorName": "Mr. David Harrison",
  "status": "OPEN",
  "enrolledCount": 3
  },
  {
  "id": "65bb00000000000000000002",
  "batchName": "K24-IELTS-02",
  "instructorName": "Ms. Sarah Jenkins",
  "status": "OPEN",
  "enrolledCount": 3
  }
  ]

2: Retrieve Registration Retention Summary by Course
Objective: Thống kê cho mỗi lớp học thuộc một khóa học (course) về số lượng học viên duy trì (enrolled), bỏ học (dropped) và tỷ lệ giữ chân học viên (retentionRate).
Endpoint: GET /api/courses/:courseId/registration-summary
Business Rules:

1. Kiểm tra format courseId là ObjectId hợp lệ. Trả về 400 Bad Request nếu sai định dạng.
2. Trả về 404 Not Found nếu không tìm thấy khóa học trong DB.
3. Đối với mỗi lớp (batch) thuộc khóa học, tính toán:
   • enrolledCount: Số học viên có status = 'enrolled'.
   • droppedCount: Số học viên có status = 'dropped'.
   • retentionRate (%): (enrolledCount / (enrolledCount + droppedCount)) \* 100.
   • warning: true nếu retentionRate < 80%, ngược lại false.

- 400 (Bad Request):
  {
  "error": "Invalid courseId: 65aa0000000000000000000100"
  }
- 404 (Not Found):
  {
  "error": "Course with id = 65aa00000000000000000009 not found"
  }
- 200 (OK): Test với courseId = "65aa00000000000000000001"
  [
  {
  "batchId": "65bb00000000000000000001",
  "batchName": "K24-IELTS-01",
  "enrolledCount": 3,
  "droppedCount": 1,
  "retentionRate": 75,
  "warning": true
  },
  {
  "batchId": "65bb00000000000000000002",
  "batchName": "K24-IELTS-02",
  "enrolledCount": 3,
  "droppedCount": 0,
  "retentionRate": 100,
  "warning": false
  }
  ]

3: Update a Learner's Registration Status in a Batch
Objective: Cập nhật trạng thái tham gia ('enrolled' hoặc 'dropped') của một học viên đã có bản ghi trong lớp học.
Endpoint: PATCH /api/batches/:batchId/registrations/:learnerId
Request Body:
{
"status": "dropped"
}
Business Rules (Thực hiện kiểm tra theo đúng thứ tự nghiêm ngặt):

1. Validate batchId là ObjectId hợp lệ → Trả về 400 nếu lỗi.
2. Validate learnerId là ObjectId hợp lệ → Trả về 400 nếu lỗi.
3. Kiểm tra sự tồn tại của lớp học → Trả về 404 nếu không tìm thấy.
4. Kiểm tra sự tồn tại bản ghi đăng ký của học viên trong lớp → Trả về 404 nếu không có.
5. Validate giá trị status (chỉ chấp nhận 'enrolled' hoặc 'dropped') → Trả về 400 nếu sai.
6. Kiểm tra trạng thái lớp học → Trả về 400 nếu lớp đã đóng (status == 'CLOSED').
7. Kiểm tra trạng thái hiện tại → Trả về 400 nếu trạng thái gửi lên trùng với trạng thái hiện tại.

- 400 (Bad Request) - Invalid batchId:
  {
  "error": "Invalid batchId: 65bb0000000000000000000100"
  }
- 400 (Bad Request) - Invalid learnerId:
  {
  "error": "Invalid learnerId: 65dd0000000000000000000100"
  }
- 404 (Not Found) - Batch not found:
  {
  "error": "Batch with id = 65bb00000000000000000099 not found"
  }
- 404 (Not Found) - Learner not in batch:
  {
  "error": "Learner 65dd00000000000000000006 has no registration record in batch K24-IELTS-01"
  }
- 400 (Bad Request) - Invalid status value:
  {
  "error": "Invalid status: LATE"
  }
- 400 (Bad Request) - Batch closed:
  {
  "error": "Batch K23-BUS-01 is closed and cannot be modified"
  }
- 400 (Bad Request) - Already in target status:
  {
  "error": "Learner HV-004 is already dropped in this batch"
  }
- 200 (OK): Test với batchId = "65bb00000000000000000001", learnerId = "65dd00000000000000000001"
  {
  "batchId": "65bb00000000000000000001",
  "learnerId": "65dd00000000000000000001",
  "learnerCode": "HV-001",
  "fullName": "Phạm Minh Anh",
  "status": "dropped"
  }

4: Retrieve Courses by Duration Range
Objective: Lấy danh sách các khóa học (courses) có thời lượng số tuần (durationWeeks) nằm trong khoảng từ minWeeks đến maxWeeks.
Endpoint: GET /api/courses?minWeeks=8&maxWeeks=12
Business Rules:

1. Yêu cầu bắt buộc cả 2 tham số query: minWeeks và maxWeeks.
2. Cả 2 tham số phải là số nguyên dương (> 0). Trả về 400 Bad Request nếu thiếu hoặc không hợp lệ.
3. minWeeks phải nhỏ hơn hoặc bằng maxWeeks. Trả về 400 Bad Request nếu minWeeks > maxWeeks.
4. Cấu trúc dữ liệu trả về (đổi \_id thành id): id, code, name, durationWeeks, status.

- 400 (Bad Request) - Missing query params:
  {
  "error": "minWeeks and maxWeeks are required and must be positive integers"
  }
- 400 (Bad Request) - min > max:
  {
  "error": "minWeeks must be less than or equal to maxWeeks"
  }
- 200 (OK): Test với minWeeks=8&maxWeeks=12
  [
  {
  "id": "65aa00000000000000000001",
  "code": "ENG-IELTS-7.0",
  "name": "Luyện thi IELTS Chuyên sâu 7.0+",
  "durationWeeks": 12,
  "status": "ACTIVE"
  },
  {
  "id": "65aa00000000000000000002",
  "code": "ENG-COM-ADV",
  "name": "Tiếng Anh Giao tiếp Nâng cao",
  "durationWeeks": 8,
  "status": "ACTIVE"
  }
  ]

5: Instructor Workload Summary
Objective: Thống kê tổng hợp khối lượng giảng dạy và số lượng học viên đảm nhận của một giảng viên (instructor).
Endpoint: GET /api/batches/workload-summary?instructor=Mr. David Harrison
Business Rules:

1. Query param 'instructor' là bắt buộc. Trả về 400 Bad Request nếu thiếu.
2. Tìm kiếm tên giảng viên không phân biệt hoa/thường (case-insensitive) và tự động cắt bỏ khoảng trắng thừa hai đầu (trim).
3. Trả về 404 Not Found nếu không tìm thấy lớp học nào phân công cho giảng viên này.
4. Thống kê tổng hợp các chỉ số: totalBatches, totalDurationWeeks (tổng số tuần của các khóa giảng dạy), totalEnrolledLearners (tổng số học viên enrolled), kèm danh sách chi tiết các lớp (batches).

- 400 (Bad Request):
  {
  "error": "Query param instructor is required"
  }
- 404 (Not Found):
  {
  "error": "No batches found for instructor Mr. Nobody"
  }
- 200 (OK): Test với instructor = "%20%20mr.%20david%20harrison%20%20"
  {
  "instructorName": "Mr. David Harrison",
  "totalBatches": 1,
  "totalDurationWeeks": 12,
  "totalEnrolledLearners": 3,
  "batches": [
  {
  "batchName": "K24-IELTS-01",
  "courseName": "Luyện thi IELTS Chuyên sâu 7.0+",
  "courseDurationWeeks": 12,
  "enrolledCount": 3,
  "status": "OPEN"
  }
  ]
  }

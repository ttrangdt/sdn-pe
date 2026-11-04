# 🎓 TỔNG HỢP ĐỀ THI THỬ & TÀI LIỆU ÔN THI THỰC HÀNH SDN302
> **Môn học**: SDN302 – Server-side JavaScript (Node.js, Express, MongoDB, Mongoose)  
> **Trường**: Đại học FPT (FPT University)  
> **Mục tiêu**: Nắm chắc kiến trúc MVC, xử lý RESTful API, SSR Views, chiến lược làm bài đạt điểm tối đa khi Giảng viên chấm trực tiếp.

---

## 📂 CẤU TRÚC KHO LƯU TRỮ

```text
thi-thu/
├── 📁 SDN302 - SU26 - B1 - PE - Paper 2/     # [ĐỀ MỚI NHẤT] Quản lý Điểm danh Sinh viên (REST API)
│   ├── paper.pdf                              # Đề thi gốc Paper 2
│   ├── material_0/                            # Dữ liệu JSON mẫu (attendances, classes, students, subjects)
│   ├── generate-models.js                     # Tool tự sinh Mongoose Models (scan enum & ref tự động)
│   ├── import-data.js                         # Tool tự nạp JSON vào MongoDB siêu tốc
│   └── resource/                              # Source code giải hoàn chỉnh (100% Pass 47/47 tests)
│
├── 📁 SDN302 - SU 26 - TRIAL1/                # [ĐỀ THI RẠP CHIẾU PHIM] Movie, Showtime, Ticket, Room, User
│   ├── paper.pdf                              # Đề thi gốc Trial 1
│   ├── controllers/, models/, routes/         # Code MVC đầy đủ: Đặt vé, Doanh thu, Phân quyền
│   └── seed.js, test-api.js                   # Seeder & Bộ test tự động
│
├── 📁 SDN302 - SU26 - PE - Paper 1 - maybe HCM/# [ĐỀ THI TRỰC THĂNG - HCM] Helicopter, Manufacturer, Member
│   ├── paper (1).pdf, docx                    # Đề thi kết hợp SSR (EJS) và REST API
│   ├── views/                                 # Giao diện Web EJS (login, list, edit)
│   └── controllers/, routes/, middlewares/    # REST API & Session Auth
│
├── 📁 chien-luoc-thi/                         # [CẨM NANG PHÒNG THI] Chiến lược đạt >= 4.0 đến 10.0 điểm
│   ├── CHIEN_LUOC_THI_SDN302.md               # Phân tích tâm lý giảng viên, 85 phút thi, checklist chống liệt
│   └── README.md
│
├── 📁 tool-sheet/                             # [VŨ KHÍ PHÒNG THI] Code mẫu dùng ngay
│   ├── 01-server/                             # Template server.js, db.js, package.json
│   ├── 02-seeder/                             # Script import-data.js tự động nạp database
│   ├── 03-models/                             # Script generate-models.js tự động sinh Schema & Enum
│   ├── 04-auth/                               # Template JWT & Session Authentication
│   └── 05-crud-templates/                     # Template Controller & Route CRUD chuẩn
│
├── 📁 Slide/                                  # Toàn bộ Slide bài giảng chính khóa SDN302
└── 📄 .gitignore                              # Đã cấu hình chặn toàn bộ node_modules & .env
```

---

## 📝 GIẢI THÍCH CHI TIẾT TỪNG ĐỀ THI

### 1. [SDN302 - SU26 - B1 - PE - Paper 2](./SDN302%20-%20SU26%20-%20B1%20-%20PE%20-%20Paper%202/) (Đề Quản lý Điểm danh - Khu vực Hà Nội / Toàn quốc)
- **Đặc trưng**: Đề thi thuần **RESTful API**, chuẩn cấu trúc thực tế, không dùng view EJS.
- **Database**: `su26db` trên cổng `9999`.
- **4 Câu hỏi**:
  - **Q1 (1.5đ)**: `GET /api/classes/:classId/students?status=enrolled` -> Lọc sinh viên theo lớp.
  - **Q2 (2.5đ)**: `GET /api/classes/:classId/attendance-summary` -> Thống kê tỷ lệ đi học, gắn cờ cảnh báo `warning: rate < 80%`.
  - **Q3 (2.5đ)**: `GET /api/students/:studentId/attendances` -> Lịch sử điểm danh kèm Nested Populate (`className`, `subjectName`), sắp xếp ngày giảm dần.
  - **Q4 (3.5đ)**: `POST /api/classes/:classId/attendances` -> Điểm danh hàng loạt (Bulk Upsert), validate ngày không ở tương lai, bắt buộc đủ sinh viên của lớp, ghi đè bản ghi trùng ngày và đếm `updatedCount`.
- **Cách test**: Chạy `node run-tests.js` trong thư mục `resource` (Đã pass 47/47 tests).

---

### 2. [SDN302 - SU 26 - TRIAL1](./SDN302%20-%20SU%2026%20-%20TRIAL1/) (Đề Quản lý Rạp Chiếu Phim)
- **Đặc trưng**: Nghiệp vụ rạp chiếu phim (Movies, Showtimes, Tickets, Rooms, Users).
- **Trọng tâm kỹ năng**:
  - Xác thực Basic Auth / JWT Auth cho người dùng và quản trị viên.
  - Nghiệp vụ đặt vé (`POST /api/tickets`): Kiểm tra ghế trống, tính giá tiền, chống trùng ghế.
  - Báo cáo doanh thu (`GET /api/reports/revenue`): Gom nhóm theo phim và phòng chiếu bằng MongoDB Aggregation.

---

### 3. [SDN302 - SU26 - PE - Paper 1 - maybe HCM](./SDN302%20-%20SU26%20-%20PE%20-%20Paper%201%20-%20maybe%20HCM/) (Đề Trực thăng & Nhà sản xuất)
- **Đặc trưng**: Kết hợp cả **Web SSR (EJS Views)** và **RESTful API** (Mô hình đề thi khu vực TP. Hồ Chí Minh).
- **Trọng tâm kỹ năng**:
  - Giao diện SSR (`/login`, `/helicopters`, `/helicopters/edit/:id`) sử dụng session và middleware xác thực.
  - REST API cho đối tượng `Manufacturer` (`GET`, `POST`, `PUT`, `DELETE`).
  - Phân quyền theo vai trò (`Admin` mới được thêm/sửa/xóa, sinh viên thường chỉ được xem).

---

## ⚡ BỘ CÔNG CỤ TỰ ĐỘNG HÓA KHI ĐI THI (`tool-sheet`)

1. **`import-data.js`**: Tự động đọc tất cả file `.json` trong folder đề thi, tự convert `_id` thành `ObjectId`, convert chuỗi thời gian thành `Date`, drop và nạp vào MongoDB trong **1 giây**.
   ```bash
   node import-data.js <đường_dẫn_folder_json>
   ```
2. **`generate-models.js`**: Tự động phân tích các file JSON, nhận diện quan hệ tham chiếu `ref` qua đuôi `Id`, **tự động quét toàn bộ dữ liệu mẫu để sinh ra mảng enum đầy đủ** (ví dụ `['PRESENT', 'ABSENT']`), loại trừ các trường text thông thường.
   ```bash
   node generate-models.js <folder_json> ./models
   ```

---

## 🎯 CẨM NANG CHIẾN LƯỢC THI ĐẠT ĐIỂM CAO

Chi tiết xem tại [`chien-luoc-thi/CHIEN_LUOC_THI_SDN302.md`](./chien-luoc-thi/CHIEN_LUOC_THI_SDN302.md):
- **10 phút đầu**: Setup `.env`, nạp DB bằng script seeder, sinh model bằng generator.
- **20 phút tiếp theo**: Làm 2 câu GET dễ nhất $\rightarrow$ **Ăn chắc $\ge 4.0$ điểm (chắc chắn qua môn)**.
- **35 phút tiếp theo**: Chinh phục câu thống kê và bulk upsert $\rightarrow$ **Lên điểm 8.0 - 10.0**.
- **20 phút cuối**: Test ID rác chống crash server, **xóa `node_modules`**, nén zip và nộp lên PEA Client.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY CHUNG KHI CLONE REPO

```bash
# 1. Clone repository
git clone https://github.com/ttrangdt/sdn-pe.git
cd sdn-pe

# 2. Chọn đề thi muốn thực hành, ví dụ Paper 2:
cd "SDN302 - SU26 - B1 - PE - Paper 2/resource"

# 3. Copy file môi trường từ mẫu
cp .env.example .env

# 4. Cài thư viện & Nạp database
npm install
node import-data.js ../material_0

# 5. Chạy server hoặc chạy test
npm start
# Hoặc chạy test tự động:
node run-tests.js
```

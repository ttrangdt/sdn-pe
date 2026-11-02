# SDN302 - Practical Exam: Helicopter Management System (Paper 1)

Dự án hoàn chỉnh được triển khai theo đúng chuẩn yêu cầu của đề thi trong [paper (1).pdf](file:///d:/SEM_7/SDN302/thi-thu/SDN302%20-%20SU26%20-%20PE%20-%20Paper%201/paper%20(1).pdf), tài liệu ghi chú [SDN302_SU26_PE_20060701_Note.docx](file:///d:/SEM_7/SDN302/thi-thu/SDN302%20-%20SU26%20-%20PE%20-%20Paper%201/SDN302_SU26_PE_20060701_Note.docx) và kiến thức trong hệ thống bài giảng [Slide](file:///d:/SEM_7/SDN302/thi-thu/Slide).

---

## 1. Cấu trúc thư mục dự án

```text
SDN302 - SU26 - PE - Paper 1/
├── config/
│   └── db.js                 # Kết nối MongoDB sử dụng MONGO_URI
├── middlewares/
│   └── auth.js               # Middleware verifyJWT (REST API) & requireWebAuth (Session)
├── models/
│   ├── Manufacturer.js       # Model manufacturers (manufacturer, isAsia, timestamps)
│   ├── Helicopter.js         # Model helicopters (heliName, imgWrapper, isAssembly, price, adult, manufacturer)
│   └── Member.js             # Model members (name, pass)
├── routes/
│   ├── authApiRoutes.js      # Task 02: POST & GET /auth/tokens (JWT generation)
│   ├── manufacturerApiRoutes.js # Task 02: REST API CRUD /api/manufacturers (JWT protected)
│   └── webRoutes.js          # Task 03: Web Client Controller (/auth/access, /management/helicopters)
├── views/
│   ├── login.ejs             # Giao diện đăng nhập thành viên (/auth/access)
│   ├── helicopters.ejs       # Giao diện Card View quản lý máy bay trực thăng + Modal thêm mới
│   └── editHelicopter.ejs    # Giao diện xem chi tiết & cập nhật máy bay trực thăng
├── .env                      # Cấu hình PORT=5000, MONGO_URI, JWT_SECRET
├── package.json              # Khai báo dependencies & scripts
├── server.js                 # Entry point Express application
├── seed.js                   # Script nạp dữ liệu từ manufacturers, helicopters, members.json
├── test-paper1.js            # Bộ test tự động 28/28 test cases
├── helicopters.json          # Dữ liệu trực thăng
├── manufacturers.json        # Dữ liệu nhà sản xuất
├── members.json              # Dữ liệu tài khoản thành viên
├── paper (1).pdf             # Đề thi gốc
└── SDN302_SU26_PE_20060701_Note.docx # Tài liệu hướng dẫn & gợi ý
```

---

## 2. Cấu hình biến môi trường (.env)

```env
PORT=5000
STUDENT_CODE=se181234
MONGO_URI=mongodb://127.0.0.1:27017/sdn302-pe-su26-se181234-db
JWT_SECRET=se181234@
SESSION_SECRET=se181234_session_secret_key
```

---

## 3. Các bước chạy và kiểm thử

Mở terminal tại thư mục `SDN302 - SU26 - PE - Paper 1`:

```bash
cd "d:\SEM_7\SDN302\thi-thu\SDN302 - SU26 - PE - Paper 1"

# 1. Cài đặt các thư viện (nếu chưa cài)
npm install

# 2. Nạp dữ liệu vào MongoDB database sdn302-pe-su26-se181234-db
npm run seed

# 3. Khởi động server
npm start
# Ứng dụng chạy tại: http://localhost:5000
# - Giao diện Web: http://localhost:5000/auth/access
# - Lấy mã JWT: http://localhost:5000/auth/tokens
# - REST API: http://localhost:5000/api/manufacturers

# 4. Chạy kiểm thử tự động toàn bộ đề thi (trong một terminal khác)
npm test
```

---

## 4. Chi tiết thực hiện các Task

### Task 01: Setup & Data Migration (1.0 điểm)
- Tạo database MongoDB `sdn302-pe-su26-se181234-db`.
- Tự động di chuyển dữ liệu 3 file `manufacturers.json`, `helicopters.json`, `members.json` vào MongoDB qua script `seed.js`.

### Task 02: REST API Manufacturer với JWT (5.0 điểm)
1. **Lấy mã JWT Token**:
   - `POST /auth/tokens` (hoặc `GET /auth/tokens?name=soldier&pass=123456789`).
   - Body: `{ "name": "soldier", "pass": "123456789" }`.
   - Trả về mã JWT được ký bằng `JWT_SECRET` (`se181234@`).
2. **REST API CRUD /api/manufacturers (Yêu cầu Header `Authorization: Bearer <token>`)**:
   - `GET /api/manufacturers`: Danh sách nhà sản xuất.
   - `GET /api/manufacturers/:id`: Chi tiết 1 nhà sản xuất.
   - `POST /api/manufacturers`: Thêm mới nhà sản xuất (yêu cầu tên unique).
   - `PUT /api/manufacturers/:id`: Cập nhật nhà sản xuất.
   - `DELETE /api/manufacturers/:id`: Xóa nhà sản xuất.
     - **Ràng buộc nghiệp vụ quan trọng**: Nếu nhà sản xuất đang có trực thăng liên kết trong collection `helicopters` $\to$ Từ chối xóa và trả về mã lỗi 400 kèm câu thông báo: `"Cannot delete manufacturer because it has associated Helicopters"`.
     - Nếu không có trực thăng nào liên kết $\to$ Xóa thành công (mã 200).

### Task 03: Client Web Application bằng EJS (4.0 điểm)
1. **Đăng nhập & Xác thực**:
   - Truy cập: `http://localhost:5000/auth/access`.
   - Nhập tài khoản `soldier` / mật khẩu `123456789`.
   - Mật khẩu được mã hóa bcrypt và kiểm tra với collection `members`.
   - Đăng nhập thành công chuyển hướng đến `/management/helicopters`.
   - Tất cả các thao tác quản lý trực thăng đều yêu cầu đăng nhập (middleware `requireWebAuth`).
2. **Hiển thị danh sách trực thăng (Card View)**:
   - Truy cập: `http://localhost:5000/management/helicopters`.
   - Hiển thị dạng **thẻ (Card View)**, không dùng dạng bảng table.
   - Hiển thị đầy đủ: ảnh (`imgWrapper`), tên (`heliName`), giá quy đổi sang USD (`price / 26000` làm tròn 1 chữ số thập phân, ví dụ `65.8 USD`), icon đối tượng (`Adult Male` hoặc `Child`), nhãn lắp ráp (`Assembly`), và tên nhà sản xuất.
3. **Thêm mới trực thăng (Modal Form)**:
   - Nhấn nút "Add New Helicopter" để mở form dạng modal.
   - Validate nghiệp vụ:
     - Tên trực thăng (`heliName`) phải có ít nhất 2 từ và chữ cái đầu mỗi từ phải viết hoa.
     - Ảnh (`imgWrapper`) phải là URL hợp lệ.
     - Giá (`price`) phải là số có tối thiểu 6 chữ số ($\ge 100,000$).
     - Đối tượng (`adult`): dạng toggle switch.
     - Yêu cầu lắp ráp (`isAssembly`): dạng toggle switch.
       - **Quy tắc**: Nếu `adult` bật `true`, thì `isAssembly` **bắt buộc luôn là `true`** (được xử lý đồng bộ cả trên giao diện và backend).
     - Nhà sản xuất: dạng thẻ `<select>` chứa danh sách các nhà sản xuất từ DB.
4. **Xóa trực thăng**:
   - Có hộp thoại xác nhận (Confirmation modal) trước khi xóa.
   - Hiển thị thông báo kết quả sau khi xóa thành công.
5. **Cập nhật trực thăng**:
   - Truy cập: `/management/helicopters/:id` để xem chi tiết và cập nhật với đầy đủ các ràng buộc như khi thêm mới.


# 🛠️ SDN302 TOOL-SHEET: BỘ CÔNG CỤ & KHUNG CODE MẪU PHÒNG THI FPTU

> **Dành cho sinh viên thi thực hành môn SDN302 (Node.js - Express - MongoDB - Mongoose - EJS)**
> Được thiết kế dạng **Component / Framework Module** giúp bạn tra cứu và sao chép mã nguồn nhanh nhất trong phòng thi.

---

## 📑 BẢNG TRA CỨU NHANH THEO YÊU CẦU ĐỀ BÀI (CHEAT-SHEET)

| Khi đề bài yêu cầu... | Mở Component | File chứa code tương ứng | Đoạn code / Kỹ thuật cần dùng |
| :--- | :--- | :--- | :--- |
| **Khởi tạo Server & Kết nối DB** | `01-project-setup` | `server-template.js`<br>`db-connection.js`<br>`env-template.env` | Cấu hình PORT, MONGO_URI, `app.use(cors())`, `express.json()`, `morgan` |
| **Nạp dữ liệu từ các file JSON** | `02-seeder` | `universal-seeder.js` | Hàm `parseJsonWithOid()` tự parse `$oid`, `$date`, hash bcrypt mật khẩu |
| **Tạo Schema & Mongoose Model** | `03-models` | `model-templates.js` | `timestamps: true`, `ref: 'OtherModel'`, Sub-document mảng ghế, Virtuals |
| **Bảo vệ API bằng Header Key (`access_key`)** | `04-auth-security` | `header-key-auth.js` | Đọc `req.headers['access_key']`, tìm User trong DB, check `role === 'admin'` |
| **Bảo vệ API bằng JWT Token** | `04-auth-security` | `jwt-auth.js` | `POST /auth/tokens` sinh mã token, Middleware `verifyJWT` đọc Bearer token |
| **Đăng nhập Web EJS (Session)** | `04-auth-security` | `session-auth.js` | `req.session.user`, `requireWebAuth`, so khớp mật khẩu bằng `bcryptjs` |
| **CRUD API chuẩn & Kiểm tra ObjectId** | `05-api-controllers` | `crud-controller-template.js` | `isValid(id)` (400), `findById` (404), `findByIdAndUpdate` (200) |
| **Xóa có ràng buộc (Không cho xóa nếu có liên kết)** | `05-api-controllers` | `crud-controller-template.js` | `DependentModel.countDocuments({ parentId: id }) > 0` $\to$ trả về mã 400 |
| **Kiểm tra trùng lịch (Overlap Checking)** | `05-api-controllers` | `time-overlap-check.js` | `existing.start < newEnd && existing.end > newStart` $\to$ trả về 409 Conflict |
| **Báo cáo doanh thu / Thống kê (Aggregation)** | `05-api-controllers` | `aggregation-pipeline.js` | `$match` $\to$ `$lookup` $\to$ `$unwind` $\to$ `$group` $\to$ `$sort` $\to$ `$project` |
| **Giao diện dạng thẻ (Card View) + Tính giá USD** | `06-web-views` | `card-view.ejs` | Lưới thẻ responsive, tính `price / 26000`, hiển thị icon Nam/Trẻ em |
| **Modal Form thêm mới có ràng buộc Switch** | `06-web-views` | `modal-add-form.ejs` | Bật Switch Adult $\to$ tự động bật Assembly, tên 2 từ viết hoa chữ đầu |
| **Kiểm thử tự động API trong 3 giây** | `07-test-suite` | `test-runner-template.js` | Script chạy độc lập không cần thư viện ngoài, kiểm tra status 200, 400, 401, 403, 404, 409 |

---

## 📂 CHI TIẾT CÁC THÀNH PHẦN (COMPONENTS)

### Component 1: `01-project-setup/`
- **`env-template.env`**: File mẫu biến môi trường. Lưu ý: Đề thi FPTU sẽ **cho 0 điểm** nếu hardcode connection string vào file JS. Luôn đọc từ `process.env.MONGO_URI`.
- **`db-connection.js`**: Hàm `connectDB()` chuẩn kết nối MongoDB với Mongoose, xử lý bắt lỗi và ngắt chương trình nếu sai DB name.
- **`server-template.js`**: Khung Server Express universal, tích hợp cả REST API và EJS Template Engine, CORS, Morgan, Error Handler.
- **`package-template.json`**: Danh sách đầy đủ toàn bộ thư viện hay gặp trong đề thi FPTU (`express`, `mongoose`, `dotenv`, `cors`, `morgan`, `ejs`, `bcryptjs`, `jsonwebtoken`, `express-session`, `nodemon`).

### Component 2: `02-seeder/`
- **`universal-seeder.js`**: Giải quyết bài toán nạp dữ liệu.
  - Tự động nhận diện và chuyển đổi mọi `{ "$oid": "..." }` thành `new mongoose.Types.ObjectId(...)`.
  - Parse ngày tháng ISO Date.
  - Tự động băm mật khẩu `bcrypt.hashSync()` cho các tài khoản test nếu cần.
  - Xóa dữ liệu cũ và chèn dữ liệu mới nguyên vẹn chỉ với lệnh `node seed.js`.

### Component 3: `03-models/`
- **`model-templates.js`**: 4 mẫu Schema chuẩn:
  1. *Basic Schema*: Khai báo kiểu, `required`, `unique`, `enum`, `default`, `timestamps: true`, `versionKey: false`.
  2. *Ref Schema*: Khóa ngoại `mongoose.Schema.Types.ObjectId` kèm `ref: 'OtherModel'` phục vụ cho `.populate()`.
  3. *Sub-document Schema*: Mảng đối tượng con (như mảng ghế `seats: [{ _id, type }]` trong phòng chiếu).
  4. *Virtuals*: Tự động tính toán giá tiền (VND $\to$ USD) khi serialize dữ liệu.

### Component 4: `04-auth-security/`
- **`header-key-auth.js`**: Middleware kiểm tra `access_key` từ headers, tra cứu database và kiểm tra quyền admin. Trả về đúng các mã 403:
  - `403`: `{ "error": "No access key" }`
  - `403`: `{ "error": "Invalid or unauthorized access key" }`
  - `403`: `{ "error": "Admin access required" }`
- **`jwt-auth.js`**: 
  - Controller `generateToken`: Đọc `name` và `pass`, so khớp bcrypt, ký mã JWT với `JWT_SECRET` từ `.env`.
  - Middleware `verifyJWT`: Đọc Header `Authorization: Bearer <token>`, giải mã và bảo vệ các route REST API.
- **`session-auth.js`**: 
  - Quản lý phiên đăng nhập Web Client bằng `express-session`.
  - Middleware `requireWebAuth`: Tự động redirect về `/auth/access` nếu người dùng chưa đăng nhập.

### Component 5: `05-api-controllers/`
- **`crud-controller-template.js`**: Controller CRUD chuẩn chỉ:
  - Check `mongoose.Types.ObjectId.isValid(id)` $\to$ `400 Bad Request`.
  - Tìm không thấy $\to$ `404 Not Found`.
  - Tạo mới thiếu trường $\to$ `400 Bad Request`.
  - **Đặc biệt: Xóa có ràng buộc**: Đếm số bản ghi ở collection khác đang trỏ tới ID này trước khi xóa, nếu còn liên kết thì trả về lỗi 400.
- **`time-overlap-check.js`**: Công thức kiểm tra trùng lịch chiếu / lịch họp trong cùng 1 phòng:
  $$\text{existing.startTime} < \text{newEndTime} \quad \text{AND} \quad \text{existing.endTime} > \text{newStartTime}$$
  Phát hiện trùng $\to$ trả về `409 Conflict`.
- **`aggregation-pipeline.js`**: Mẫu Aggregation gom nhóm và tính toán: `$match` $\to$ `$lookup` $\to$ `$unwind` $\to$ `$group` $\to$ `$sort` $\to$ `$project`.

### Component 6: `06-web-views/`
- **`card-view.ejs`**: Giao diện danh sách dạng thẻ (Card View), tự động tính giá tiền USD = `(price / 26000).toFixed(1)`, icon giới tính/đối tượng, nút sửa và nút xóa có modal xác nhận.
- **`modal-add-form.ejs`**: Form modal thêm mới có đầy đủ các ràng buộc Javascript:
  - Tên tối thiểu 2 từ, chữ cái đầu mỗi từ viết hoa.
  - Image URL hợp lệ.
  - Giá tối thiểu 6 chữ số.
  - Toggle Switch liên thuộc: Bật Adult $\to$ tự động bật Assembly và khóa không cho tắt.

### Component 7: `07-test-suite/`
- **`test-runner-template.js`**: File kiểm thử tự động viết hoàn toàn bằng module `http` có sẵn của Node.js, không cần cài thư viện ngoài. Chạy `node test-api.js` để tự động test toàn bộ các endpoint, in kết quả `[PASS]` hoặc `[FAIL]`.

---

## ⚡ CHECKLIST 10 PHÚT ĐẦU GIỜ PHÒNG THI

1. **Đọc kỹ đề bài**:
   - Xác định cổng PORT: `9999` hay `5000`?
   - Xác định tên Database MongoDB: `SDN_Trial` hay `sdn302-pe-su26-...`?
   - Xác định đề là **REST API thuần** (JSON) hay có cả **Giao diện Web EJS**?
2. **Tạo file `.env` đầu tiên**:
   - Khai báo đúng `PORT`, `MONGO_URI`, `JWT_SECRET`. Tránh bị 0 điểm oan.
3. **Cài đặt thư viện**:
   - Chạy `npm install` từ thư mục có `package.json`.
4. **Nạp dữ liệu (Seed DB)**:
   - Copy file `universal-seeder.js` vào bài thi, đổi tên các file JSON và chạy `node seed.js`. Mở MongoDB Compass kiểm tra dữ liệu đã vào đủ chưa.
5. **Dựng Models $\to$ Controllers $\to$ Routes**:
   - Copy các component tương ứng từ `tool-sheet` vào thư mục bài thi.
6. **Chạy thử và Kiểm thử**:
   - Chạy `node server.js`.
   - Dùng Postman hoặc chạy file `test-api.js` kiểm tra các mã lỗi `400`, `401`, `403`, `404`, `409` và thành công `200`, `201`.
7. **CHUẨN BỊ NỘP BÀI (QUAN TRỌNG NHẤT)**:
   - Tắt Server (`Ctrl + C`).
   - **XÓA THƯ MỤC `node_modules`** trước khi duyệt thư mục vào phần mềm PEA_Client để nộp.


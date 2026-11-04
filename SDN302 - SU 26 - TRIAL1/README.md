# SDN302 - Cinema Booking RESTful API (Practical Exam - Trial 1)

Dự án hoàn chỉnh được kế thừa và xây dựng dựa trên mẫu tài nguyên gốc `resource` được cung cấp trước khi thi, kèm theo toàn bộ dữ liệu đề bài (`movies.json`, `rooms.json`, `showtimes.json`, `tickets.json`, `users.json`, `paper.pdf`).

---

## 1. Cấu trúc thư mục dự án `sdn-su26-trial1`

```text
sdn-su26-trial1/
├── config/
│   └── db.js             # Kết nối MongoDB sử dụng biến môi trường MONGO_URI
├── middlewares/
│   └── auth.js           # Middleware xác thực access_key và role admin
├── models/
│   ├── Movie.js          # Mongoose model: movies
│   ├── Room.js           # Mongoose model: rooms
│   ├── Showtime.js       # Mongoose model: showtimes
│   ├── Ticket.js         # Mongoose model: tickets
│   └── User.js           # Mongoose model: users
├── routes/
│   ├── roomRoutes.js     # Question 1: GET /api/rooms
│   ├── movieRoutes.js    # Question 2: GET /api/movies/:movieId
│   ├── showtimeRoutes.js # Question 3: POST /api/showtimes
│   └── reportRoutes.js   # Question 4: GET /api/reports/revenue
├── .env                  # Cấu hình PORT=9999, MONGO_URI
├── package.json          # Dependencies chuẩn FPTU từ resource + scripts
├── server.js             # Khởi tạo Express, gọi connectDB(), mount routes, listen 9999
├── seed.js               # Script nạp 5 file JSON vào CSDL MongoDB SDN_Trial
├── test-api.js           # Bộ test tự động 41/41 test cases cho 4 câu hỏi
├── movies.json           # Dữ liệu phim
├── rooms.json            # Dữ liệu phòng chiếu
├── showtimes.json        # Dữ liệu lịch chiếu
├── tickets.json          # Dữ liệu vé
├── users.json            # Dữ liệu người dùng
└── paper.pdf             # Đề thi gốc
```

---

## 2. Cấu hình môi trường (.env)

```env
PORT=9999
MONGO_URI=mongodb://127.0.0.1:27017/SDN_Trial
MONGODB_URI=mongodb://127.0.0.1:27017/SDN_Trial
JWT_SECRET=your_secret_key
```

---

## 3. Các lệnh thực thi

```bash
# 1. Cài đặt dependencies (nếu chưa cài)
npm install

# 2. Nạp dữ liệu vào MongoDB database SDN_Trial
npm run seed

# 3. Khởi động server (chạy tại http://localhost:9999)
npm start

# 4. Chạy kiểm thử tự động toàn bộ 4 câu hỏi
npm test
```

---

## 4. Chi tiết các API Endpoints

### Question 1 (1.5 điểm): Retrieve All Rooms (Sorted)
- **Endpoint**: `GET /api/rooms`
- **Chức năng**: Lấy danh sách các phòng chiếu, sắp xếp giảm dần theo `roomName`.
- **Response `200 OK`**:
  ```json
  [
    {
      "id": "65fb00000000000000000005",
      "name": "Room E",
      "totalSeats": 6,
      "vipCount": 3
    },
    ...
  ]
  ```

---

### Question 2 (2.5 điểm): Retrieve Movie Details with Showtimes
- **Endpoint**: `GET /api/movies/:movieId`
- **Chức năng**:
  - `400 Bad Request` nếu `movieId` sai định dạng ObjectId:
    `{ "error": "Invalid movieId: <movieId>" }`
  - `404 Not Found` nếu không tìm thấy phim:
    `{ "error": "Movie with id: <movieId> not found" }`
  - `200 OK` nếu thành công:
    ```json
    {
      "title": "Avengers",
      "duration": 180,
      "description": "Superheroes assemble to save the world.",
      "showtimes": [
        {
          "roomName": "Room A",
          "startTime": "2026-03-10T18:30:00.000Z",
          "price": 90000
        }
      ]
    }
    ```

---

### Question 3 (3.5 điểm): Create Showtime (Admin Only)
- **Endpoint**: `POST /api/showtimes`
- **Header**: `access_key`: `admin_key_1` (hoặc `admin_key_2`)
- **Body**:
  ```json
  {
    "movieId": "65fa00000000000000000001",
    "roomId": "65fb00000000000000000001",
    "startTime": "2026-06-10T19:00:00.000Z",
    "price": 95000
  }
  ```
- **Xử lý**:
  - `403`: Thiếu header $\to$ `{"error": "No access key"}`
  - `403`: Key không đúng $\to$ `{"error": "Invalid or unauthorized access key"}`
  - `403`: Không phải admin $\to$ `{"error": "Admin access required"}`
  - `400`: Thiếu trường body $\to$ `{"error": "movieId, roomId, startTime, price required"}`
  - `409`: Trùng lịch trong phòng $\to$ `{"error": "Showtime overlaps with existing"}`
  - `201 Created`: Tạo thành công, tự tính `endTime = startTime + duration`.

---

### Question 4 (2.5 điểm): Revenue Report (Admin Only)
- **Endpoint**: `GET /api/reports/revenue`
- **Header**: `access_key`: `admin_key_1`
- **Chức năng**: Lọc vé `status = "paid"`, gom nhóm theo từng phim, tính tổng số vé (`ticketCount`) và tổng doanh thu (`revenue`).
- **Response `200 OK`**:
  ```json
  [
    {
      "movieTitle": "Avengers",
      "ticketCount": 3,
      "revenue": 270000
    },
    {
      "movieTitle": "Avatar",
      "ticketCount": 1,
      "revenue": 100000
    },
    {
      "movieTitle": "Inception",
      "ticketCount": 1,
      "revenue": 95000
    }
  ]
  ```

---

## 5. Lưu ý trước khi nộp bài PEA_Client
Trước khi nộp thư mục `sdn-su26-trial1` vào phần mềm PEA_Client:
1. Nhấn `Ctrl + C` để tắt server nếu đang chạy.
2. Xóa thư mục `node_modules` bên trong `sdn-su26-trial1` để giảm dung lượng file nộp bài.


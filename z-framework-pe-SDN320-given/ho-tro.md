# SO TAY HO TRO LAP TRINH SDN302 (NODE.JS, EXPRESS, MONGOOSE)

Tai lieu tra cuu nhanh cac cu phap JavaScript, phuong thuc Model Mongoose, Aggregation Pipeline va xu ly du lieu thuong gap trong bai thi Practical Exam (PE).

---

## MUC LUC

1. [Xu ly Mang (Array Methods)](#1-xu-ly-mang-array-methods)
2. [Xu ly So va Chuyen doi kieu (Number &amp; Type Casting)](#2-xu-ly-so-va-chuyen-doi-kieu-number--type-casting)
3. [Xu ly Chuoi (String Operations)](#3-xu-ly-chuoi-string-operations)
4. [Xu ly va Format Ngay thang (Date Operations)](#4-xu-ly-va-format-ngay-thang-date-operations)
5. [Mongoose Model &amp; CRUD Methods (Phuong thuc, Cu phap, Options)](#5-mongoose-model--crud-methods-phuong-thuc-cu-phap-options)
   - 5.1. [Phuong thuc Tim kiem (Read / Queries)](#51-phuong-thuc-tim-kiem-read--queries)
   - 5.2. [Chuoi phuong thuc bo tro (Query Chain Helpers)](#52-chuoi-phuong-thuc-bo-tro-query-chain-helpers)
   - 5.3. [Toan tu so sanh &amp; Logic trong Mongoose Query](#53-toan-tu-so-sanh--logic-trong-mongoose-query)
   - 5.4. [Phuong thuc Them moi (Create / Insert)](#54-phuong-thuc-them-moi-create--insert)
   - 5.5. [Phuong thuc Cap nhat (Update)](#55-phuong-thuc-cap-nhat-update)
   - 5.6. [Cac toan tu cap nhat (Update Operators: $set, $inc, $push, $pull)](#56-cac-toan-tu-cap-nhat-update-operators)
   - 5.7. [Phuong thuc Xoa (Delete / Remove)](#57-phuong-thuc-xoa-delete--remove)
   - 5.8. [Thao tac voi Mang Sub-document (Mang nhung: $push, $pull, toan tu $)](#58-thao-tac-voi-mang-sub-document-mang-nhung)
   - 5.9. [Bo khung Controller CRUD mau chuan chi (Full Template)](#59-bo-khung-controller-crud-mau-chuan-chi-full-template)
6. [Mongoose Populate (Truy van khoa ngoai)](#6-mongoose-populate-truy-van-khoa-ngoai)
7. [Mongoose Aggregation Pipeline (Thong ke &amp; Gom nhom)](#7-mongoose-aggregation-pipeline-thong-ke--gom-nhom)
8. [Cac loi thuong gap trong phong thi va cach xu ly](#8-cac-loi-thuong-gap-trong-phong-thi-va-cach-xu-ly)

---

## 1. XU LY MANG (ARRAY METHODS)

### 1.1. filter (Loc phan tu thoa dieu kien)

```javascript
// Loc danh sach theo dieu kien
const passedStudents = students.filter((s) => s.score >= 5);

// Loc ket hop nhieu dieu kien (AND / OR)
const activeAdmins = users.filter(
  (u) => u.role === "ADMIN" && u.isActive === true,
);

// Loc phan tu ton tai trong mot danh sach khac
const targetIds = ["id1", "id2", "id3"];
const matched = list.filter((item) => targetIds.includes(String(item._id)));
```

### 1.2. map (Bien doi mang / Trich xuat field)

```javascript
// Trich xuat danh sach ID
const studentIds = enrollments.map((e) => e.studentId);

// Tao mang object moi voi cac truong can thiet
const summaryList = products.map((p) => ({
  id: p._id,
  name: p.name,
  finalPrice: p.price * (1 - p.discount),
}));

// Them truong tinh toan vao tung ban ghi Mongoose
// Luu y: Phai dung .toObject() hoac .lean() khi truy van Mongoose truoc khi map
const formattedList = classes.map((c) => {
  const item = c.toObject ? c.toObject() : { ...c };
  item.totalEnrolled = item.enrollments ? item.enrollments.length : 0;
  return item;
});
```

### 1.3. reduce (Tinh tong, trung binh, gom nhom)

```javascript
// Tinh tong (Sum)
const totalAmount = orders.reduce(
  (sum, order) => sum + Number(order.amount),
  0,
);

// Tinh trung binh cong (Average)
const avgScore =
  students.length > 0
    ? students.reduce((sum, s) => sum + s.score, 0) / students.length
    : 0;

// Tim phan tu lon nhat / nho nhat
const maxScoreStudent = students.reduce(
  (max, s) => (s.score > max.score ? s : max),
  students[0],
);

// Gom nhom mang thanh Object theo key (GroupBy)
const groupedByRole = users.reduce((acc, user) => {
  const role = user.role || "OTHER";
  if (!acc[role]) acc[role] = [];
  acc[role].push(user);
  return acc;
}, {});

// Dem so luong xuat hien cua tung gia tri
const countByStatus = tasks.reduce((acc, t) => {
  acc[t.status] = (acc[t.status] || 0) + 1;
  return acc;
}, {});
```

### 1.4. find va findIndex (Tim kiem phan tu)

```javascript
// Tim phan tu dau tien khop dieu kien (tra ve undefined neu khong thay)
const foundClass = classes.find((c) => String(c._id) === String(targetId));

// Tim vi tri phan tu (tra ve -1 neu khong thay)
const index = classes.findIndex((c) => String(c._id) === String(targetId));
```

### 1.5. some va every (Kiem tra dieu kien logic)

```javascript
// some: It nhat mot phan tu thoa man (tra ve true/false)
const hasFailed = examResults.some((r) => r.score < 5);

// every: Tat ca phan tu phai thoa man (tra ve true/false)
const allPassed = examResults.every((r) => r.score >= 5);
```

### 1.6. sort (Sap xep mang)

```javascript
// Sap xep so tang dan
numbers.sort((a, b) => a - b);

// Sap xep so giam dan
numbers.sort((a, b) => b - a);

// Sap xep object theo field so
products.sort((a, b) => b.price - a.price);

// Sap xep object theo chuoi (String A-Z)
students.sort((a, b) => a.fullName.localeCompare(b.fullName));

// Sap xep theo thoi gian (Date gan nhat len dau)
events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

// Sap xep da tieu chi (Uu tien role truoc, neu trung role thi theo ten)
users.sort((a, b) => {
  const roleCompare = a.role.localeCompare(b.role);
  if (roleCompare !== 0) return roleCompare;
  return a.username.localeCompare(b.username);
});
```

### 1.7. slice (Cat mang va Phan trang thu cong)

```javascript
// Phan trang tren mang co san (in-memory pagination)
const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 10;
const startIndex = (page - 1) * limit;
const paginatedData = allItems.slice(startIndex, startIndex + limit);
```

### 1.8. flatMap va Khu trung lap (Unique values)

```javascript
// Lay tat ca sub-document tu mang cac object (vi du enrollments trong cac lop)
const allEnrollments = classes.flatMap((c) => c.enrollments || []);

// Khu trung lap danh sach chuoi / so
const uniqueCategories = Array.from(new Set(products.map((p) => p.category)));

// Khu trung lap mang Object theo _id
const uniqueStudents = Object.values(
  students.reduce((acc, s) => {
    acc[String(s._id)] = s;
    return acc;
  }, {}),
);
```

---

## 2. XU LY SO VA CHUYEN DOI KIEU (NUMBER & TYPE CASTING)

### 2.1. Chuyen doi chuoi sang so an toan

```javascript
// 1. Dung Number() (Khuyen dung cho so thuc va so nguyen)
const n1 = Number(req.query.price); // "12.5" -> 12.5; "abc" -> NaN

// 2. Dung parseInt (So nguyen, luon truyen radix 10)
const page = parseInt(req.query.page, 10) || 1;

// 3. Dung parseFloat (So thuc)
const rate = parseFloat(req.query.rate) || 0.0;

// 4. Fallback gia tri mac dinh khi gia tri loi hoac NaN
const safeNumber = isNaN(Number(input)) ? 0 : Number(input);
```

### 2.2. Lam tron va co dinh so chu so thap phan

```javascript
const value = 12.34567;

// 1. toFixed(n): Tra ve STRING co dung n chu so thap phan
const strFixed = value.toFixed(2); // "12.35" (kieu String)

// 2. Chuyen toFixed nguoc lai thanh Number
const numFixed = Number(value.toFixed(2)); // 12.35 (kieu Number)
// Hoac dung toan tu unary plus:
const numFixed2 = +value.toFixed(2); // 12.35

// 3. Math.round (Lam tron den so nguyen gan nhat)
Math.round(4.7); // 5
Math.round(4.4); // 4

// 4. Lam tron chuan 2 chu so thap phan khong bi sai so so hoc
const preciseTwoDecimals = Math.round((value + Number.EPSILON) * 100) / 100;

// 5. Math.floor (Lam tron xuong) va Math.ceil (Lam tron len)
Math.floor(4.9); // 4
Math.ceil(4.1); // 5 (Thuong dung tinh tong so trang: Math.ceil(total / limit))
const totalPages = Math.ceil(totalDocs / limit);
```

---

## 3. XU LY CHUOI (STRING OPERATIONS)

### 3.1. Chuan hoa chuoi tim kiem

```javascript
// Cat khoang trang thua 2 dau
const cleanStr = input.trim();

// Chuyen chu thuong / chu hoa
const lower = input.toLowerCase();
const upper = input.toUpperCase();

// Tim kiem khong phan biet hoa thuong trong mang JS
const keyword = req.query.keyword ? req.query.keyword.trim().toLowerCase() : "";
const matched = items.filter((i) =>
  (i.name || "").toLowerCase().includes(keyword),
);
```

### 3.2. Tim kiem chuoi Regex trong Mongoose

```javascript
// Tim gan dung khong phan biet hoa thuong
const query = {};
if (req.query.search) {
  query.name = { $regex: req.query.search.trim(), $options: "i" };
}
const results = await Product.find(query);
```

### 3.3. Cat, tach va ghep chuoi

```javascript
// split va join
const words = "SDN302 Nodejs Mongoose".split(" "); // ["SDN302", "Nodejs", "Mongoose"]
const slug = words.join("-").toLowerCase(); // "sdn302-nodejs-mongoose"

// Thay the chuoi (replace / replaceAll)
const sanitized = text.replace(/-/g, " "); // Thay the toan bo dau '-' bang khoang trang
```

### 3.4. Dinh dang ma so tu tang (Padding)

```javascript
// Chen so 0 vao truoc chuoi (vi du tao ma: SV0001, SV0012)
const idNumber = 12;
const studentCode = `SV${String(idNumber).padStart(4, "0")}`; // "SV0012"
```

### 3.5. Loai bo dau tieng Viet (khi de thi yeu cau)

```javascript
function removeVietnameseTones(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}
```

---

## 4. XU LY VA FORMAT NGAY THANG (DATE OPERATIONS)

### 4.1. Khoi tao va trich xuat Date

```javascript
const now = new Date();
const customDate = new Date("2026-11-20T08:30:00.000Z");

// Lay cac thanh phan thoi gian
const year = now.getFullYear(); // 2026
const month = now.getMonth() + 1; // 1 - 12 (Luu y: getMonth() tra ve 0 - 11!)
const date = now.getDate(); // 1 - 31 (Ngay trong thang)
const dayOfWeek = now.getDay(); // 0: Chu nhat, 1: Thu 2, ...
const hours = now.getHours(); // 0 - 23
const minutes = now.getMinutes(); // 0 - 59
```

### 4.2. Dinh dang Date thanh chuoi (YYYY-MM-DD va DD/MM/YYYY)

```javascript
// 1. Format ra YYYY-MM-DD
function formatDateISO(dateObj) {
  const d = new Date(dateObj);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// 2. Format ra DD/MM/YYYY
function formatDateVN(dateObj) {
  const d = new Date(dateObj);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
```

### 4.3. Truy van khoang thoi gian (Date Range) trong Mongoose

```javascript
// 1. Loc giua 2 ngay (startDate <= date <= endDate)
const filter = {};
if (req.query.startDate || req.query.endDate) {
  filter.date = {};
  if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
  if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
}

// 2. Loc tron ven trong mot ngay cu the (tu 00:00:00 den 23:59:59.999)
const targetDay = new Date(req.query.day);
const startOfDay = new Date(targetDay.setHours(0, 0, 0, 0));
const endOfDay = new Date(targetDay.setHours(23, 59, 59, 999));

const attendanceList = await Attendance.find({
  date: { $gte: startOfDay, $lte: endOfDay },
});
```

---

## 5. MONGOOSE MODEL & CRUD METHODS (PHUONG THUC, CU PHAP, OPTIONS)

### 5.1. Phuong thuc Tim kiem (Read / Queries)

```javascript
const mongoose = require("mongoose");

// 1. Model.find(filter) - Tim danh sach ban ghi thoa man dieu kien
const allProducts = await Product.find(); // Lay tat ca
const activeProducts = await Product.find({ status: "ACTIVE" }); // Loc theo field

// 2. Model.findById(id) - Tim theo _id
// Luon kiem tra isValid truoc khi query de tranh CastError
if (!mongoose.Types.ObjectId.isValid(id)) {
  return res.status(400).json({ error: `Invalid ID: ${id}` });
}
const item = await Product.findById(id);
if (!item) {
  return res.status(404).json({ error: `Product with id = ${id} not found` });
}

// 3. Model.findOne(filter) - Tim ban ghi dau tien khop dieu kien
const user = await User.findOne({ email: req.body.email });
const subject = await Subject.findOne({ code: "SDN302" });

// 4. Model.exists(filter) - Kiem tra ton tai sieu nhanh (tra ve { _id: ... } hoac null)
// Khong can doc toan bo du lieu ban ghi vao bo nho
const isCodeTaken = await Subject.exists({ code: req.body.code });
if (isCodeTaken) {
  return res.status(400).json({ error: "Code is already taken" });
}

// 5. Model.countDocuments(filter) - Dem so luong ban ghi khop dieu kien (dung cho phan trang)
const totalDocs = await Product.countDocuments({ status: "ACTIVE" });

// 6. Model.distinct(field, filter) - Lay danh sach cac gia tri duy nhat khong trung lap
const categories = await Product.distinct("category"); // ['Books', 'Electronics', 'Fashion']
const distinctRoles = await User.distinct("role", { isActive: true });
```

---

### 5.2. Chuoi phuong thuc bo tro (Query Chain Helpers)

```javascript
// Ket hop chuoi: select -> sort -> skip -> limit -> populate -> lean
const result = await Product.find({ status: "ACTIVE" })
  // 1. .select(): Chi lay cac truong can thiet (hoac bo qua bang dau tru '-')
  .select("name price category -_id")

  // 2. .sort(): Sap xep (1 la tang dan ASC, -1 la giam dan DESC)
  .sort({ price: -1, createdAt: 1 })

  // 3. .skip(n): Bo qua n ban ghi dau tien (dung cho phan trang)
  .skip((page - 1) * limit)

  // 4. .limit(n): Lay toi da n ban ghi
  .limit(Number(limit))

  // 5. .lean(): Tra ve Plain JavaScript Object thay vi Mongoose Document
  // Tang toc do truy van gap 3 - 5 lan, thich hop cho API chi doc (Read-only)
  .lean();
```

---

### 5.3. Toan tu so sanh & Logic trong Mongoose Query

```javascript
// 1. So sanh so / thoi gian: $gt (>), $gte (>=), $lt (<), $lte (<=), $ne (!=)
const products = await Product.find({
  price: { $gte: 100, $lte: 500 },
  status: { $ne: "DELETED" },
});

// 2. Nam trong mang ($in) va khong nam trong mang ($nin)
const users = await User.find({
  role: { $in: ["ADMIN", "MANAGER"] },
  status: { $nin: ["BANNED", "LOCKED"] },
});

// 3. Logic HOAC ($or) - Mang chua cac dieu kien
// Tim kiem theo ten HOAC ma san pham
const searchRegex = new RegExp(req.query.keyword, "i");
const matched = await Product.find({
  $or: [
    { name: searchRegex },
    { code: searchRegex },
    { description: searchRegex },
  ],
});

// 4. Logic VA ($and)
const filtered = await Product.find({
  $and: [{ price: { $gt: 50 } }, { price: { $lt: 200 } }],
});

// 5. Kiem tra ton tai cua field ($exists)
const withDiscount = await Product.find({
  discount: { $exists: true, $ne: null },
});

// 6. Kiem tra do dai cua mang ($size)
const emptyClasses = await Class.find({ enrollments: { $size: 0 } });
```

---

### 5.4. Phuong thuc Them moi (Create / Insert)

```javascript
// Cach 1: Model.create(data) - Nhanh, tu dong chay validation va save
const newSubject = await Subject.create({
  code: "SDN302",
  name: "Server-side Node.js",
  credits: 3,
});

// Cach 2: new Model(data) va .save()
// Dung khi can xu ly logic, gan them gia tri truoc khi luu
const item = new Product(req.body);
item.createdBy = req.user.id;
item.finalPrice = item.price * (1 - (item.discount || 0));
const savedItem = await item.save();

// Cach 3: Model.insertMany(array) - Them hang loat (Batch Insert)
// Thuong dung trong script seed du lieu mau
const insertedList = await Student.insertMany([
  { studentCode: "SE001", fullName: "Nguyen Van A", email: "a@fpt.edu.vn" },
  { studentCode: "SE002", fullName: "Tran Thi B", email: "b@fpt.edu.vn" },
]);
```

---

### 5.5. Phuong thuc Cap nhat (Update)

```javascript
// 1. Model.findByIdAndUpdate(id, updateData, options)
// QUAN TRONG: Bat buoc truyen { new: true, runValidators: true }
// - new: true -> Tra ve ban ghi sau khi da sua (mac dinh false tra ve ban ghi cu)
// - runValidators: true -> Kich hoat lai kiem tra rang buoc trong Schema
const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
  new: true,
  runValidators: true,
});
if (!updated) {
  return res.status(404).json({ error: "Item not found" });
}

// 2. Model.findOneAndUpdate(filter, updateData, options)
// Tim ban ghi dau tien khop filter va update
const updatedUser = await User.findOneAndUpdate(
  { email: req.body.email },
  { $set: { lastLogin: new Date() } },
  { new: true },
);

// 3. Model.updateOne(filter, updateData)
// Chi update ban ghi dau tien, tra ve metadata so ban ghi thay doi
const result1 = await Product.updateOne(
  { _id: id },
  { $set: { status: "INACTIVE" } },
); // Ket qua: { acknowledged: true, modifiedCount: 1, matchedCount: 1 }

// 4. Model.updateMany(filter, updateData)
// Cap nhat hang loat tat ca cac ban ghi thoa man dieu kien
const result2 = await Product.updateMany(
  { category: "Old" },
  { $set: { category: "New", updatedAt: new Date() } },
);
```

---

### 5.6. Cac toan tu cap nhat (Update Operators)

```javascript
// 1. $set: Gan gia tri moi cho cac field cu the (khong lam mat cac field khac)
await Product.findByIdAndUpdate(id, {
  $set: { price: 250, status: "OPEN" },
});

// 2. $unset: Xoa bo hoan toan mot field khoi document
await Product.findByIdAndUpdate(id, {
  $unset: { oldField: "" },
});

// 3. $inc: Tang hoac giam gia tri so (cong/tru gia tri)
await Product.findByIdAndUpdate(id, {
  $inc: { views: 1, stock: -5 }, // Tang views len 1, giam stock di 5
});

// 4. $push: Them phan tu vao mang
await Class.findByIdAndUpdate(
  classId,
  {
    $push: { enrollments: { studentId, status: "enrolled" } },
  },
  { new: true },
);

// 5. $pull: Xoa phan tu khoi mang theo dieu kien
await Class.findByIdAndUpdate(
  classId,
  {
    $pull: { enrollments: { studentId: targetStudentId } },
  },
  { new: true },
);

// 6. $addToSet: Them vao mang neu CHUA TON TAI (tranh trung lap gia tri)
await User.findByIdAndUpdate(userId, {
  $addToSet: { roles: "ADMIN" },
});
```

---

### 5.7. Phuong thuc Xoa (Delete / Remove)

```javascript
// 1. Model.findByIdAndDelete(id) - Tim va xoa theo _id
// Tra ve ban ghi vua xoa, tra ve null neu khong tim thay
const deletedItem = await Product.findByIdAndDelete(req.params.id);
if (!deletedItem) {
  return res
    .status(404)
    .json({ error: `Product with id ${req.params.id} not found` });
}
return res
  .status(200)
  .json({ message: "Deleted successfully", data: deletedItem });

// 2. Model.findOneAndDelete(filter) - Tim va xoa 1 ban ghi khop filter
const deletedUser = await User.findOneAndDelete({ email: req.params.email });

// 3. Model.deleteOne(filter) - Xoa 1 ban ghi, tra ve metadata
const result = await Product.deleteOne({ _id: id });
// { acknowledged: true, deletedCount: 1 }

// 4. Model.deleteMany(filter) - Xoa nhieu ban ghi thoa dieu kien
await Product.deleteMany({ status: "EXPIRED" });

// Xoa toan bo du lieu trong collection (reset collection):
await Product.deleteMany({});
```

---

### 5.8. Thao tac voi Mang Sub-document (Mang nhung)

Trong SDN302, cac de thi rat hay cho mảng sub-documents (vi du `Class` chua mang `enrollments: [{ studentId, status }]`):

```javascript
// 1. Tim cac Class ma mot Student cu the dang theo hoc:
const studentClasses = await Class.find({ "enrollments.studentId": studentId });

// 2. Them 1 sinh vien vao lop ($push):
const updated = await Class.findByIdAndUpdate(
  classId,
  { $push: { enrollments: { studentId, status: "enrolled" } } },
  { new: true, runValidators: true },
);

// 3. Xoa 1 sinh vien khoi lop ($pull):
const updated = await Class.findByIdAndUpdate(
  classId,
  { $pull: { enrollments: { studentId } } },
  { new: true },
);

// 4. Cap nhat status cua 1 sinh vien cu the trong lop (Dung toan tu vi tri '$'):
// Luu y: Dieu kien tim kiem phai chi ro phan tu mang thi moi dung duoc '$'
const updated = await Class.findOneAndUpdate(
  { _id: classId, "enrollments.studentId": studentId },
  { $set: { "enrollments.$.status": "dropped" } },
  { new: true },
);
```

---

### 5.9. Bo khung Controller CRUD mau chuan chi (Full Template)

Day la file Controller mau day du 5 action co san search, filter, sort, pagination dung de copy-paste khi thi PE:

```javascript
const mongoose = require("mongoose");
const Subject = require("../models/subject.model");

// 1. GET ALL (Ho tro Search, Filter, Sort, Pagination)
const getAll = async (req, res) => {
  try {
    const { keyword, status, sortBy, order, page = 1, limit = 10 } = req.query;
    const filter = {};

    // Tim kiem gan dung theo keyword (Regex)
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword.trim(), $options: "i" } },
        { code: { $regex: keyword.trim(), $options: "i" } },
      ];
    }

    // Loc theo truong cu the
    if (status) {
      filter.status = status;
    }

    // Sap xep
    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = order === "desc" ? -1 : 1;
    } else {
      sortOptions.createdAt = -1; // Mac dinh moi nhat len dau
    }

    // Phan trang
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [data, totalDocs] = await Promise.all([
      Subject.find(filter).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Subject.countDocuments(filter),
    ]);

    return res.status(200).json({
      data,
      pagination: {
        totalDocs,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalDocs / limitNum),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 2. GET BY ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid ID: ${id}` });
    }

    const item = await Subject.findById(id);
    if (!item) {
      return res
        .status(404)
        .json({ error: `Subject with id = ${id} not found` });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 3. CREATE
const create = async (req, res) => {
  try {
    const newItem = await Subject.create(req.body);
    return res.status(201).json(newItem);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// 4. UPDATE
const update = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid ID: ${id}` });
    }

    const updated = await Subject.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res
        .status(404)
        .json({ error: `Subject with id = ${id} not found` });
    }

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// 5. DELETE
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid ID: ${id}` });
    }

    const deleted = await Subject.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ error: `Subject with id = ${id} not found` });
    }

    return res
      .status(200)
      .json({ message: "Deleted successfully", data: deleted });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteItem,
};
```

---

## 6. MONGOOSE POPULATE (TRUY VAN KHOA NGOAI)

### 6.1. Populate co ban 1 truong

```javascript
// Lay tat ca thong tin student duoc tham chieu boi studentId
const attendances = await Attendance.find().populate("studentId");
```

### 6.2. Populate chi lay cac truong can thiet (Select Fields)

```javascript
// Chi lay fullName va email tu model Student, bo qua truong khac
const attendances = await Attendance.find().populate(
  "studentId",
  "fullName email",
);

// Loai tru truong cu the (dau tru -)
const attendances = await Attendance.find().populate(
  "studentId",
  "-password -__v",
);
```

### 6.3. Populate nhieu truong cung luc

```javascript
// Cach 1: Noi chuoi populate
const attendances = await Attendance.find()
  .populate("studentId", "studentCode fullName")
  .populate("classId", "className");

// Cach 2: Truyen mang vao populate
const attendances = await Attendance.find().populate([
  { path: "studentId", select: "studentCode fullName" },
  { path: "classId", select: "className" },
]);
```

### 6.4. Populate long nhau da tang (Nested Populate)

Vi du: `Attendance` tham chieu `classId` (`Class`), trong `Class` lai tham chieu `subjectId` (`Subject`):

```javascript
const attendances = await Attendance.find().populate({
  path: "classId",
  select: "className lecturerName subjectId",
  populate: {
    path: "subjectId",
    select: "code name credits",
  },
});
```

### 6.5. Populate trong mang Sub-document (Array of Subdocs)

Vi du: `Class` co mang `enrollments: [ { studentId: ObjectId, status: String } ]`:

```javascript
const classDetail = await Class.findById(req.params.id).populate(
  "enrollments.studentId",
  "studentCode fullName email",
);
```

### 6.6. Populate co dieu kien loc (Match Condition)

```javascript
// Chi populate nhung student co email fpt
const classDetail = await Class.findById(req.params.id).populate({
  path: "enrollments.studentId",
  match: { email: { $regex: "@fpt.edu.vn$", $options: "i" } },
  select: "studentCode fullName email",
});
```

---

## 7. MONGOOSE AGGREGATION PIPELINE (THONG KE & GOM NHOM)

### 7.1. Quy tac vang khi dung Aggregation

1. **ObjectId trong `$match`**: Phai dung `new mongoose.Types.ObjectId(id)`. Khong dung chuoi string truc tiep vi Aggregation khong tu dong cast kieu nhu `find()`.
2. **Ten Collection trong `$lookup`**: Truong `from` luon la ten vat ly cua collection trong MongoDB (thuong la chu thuong so nhieu, vi du: `'subjects'`, `'students'`, `'classes'`).

---

### 7.2. Cac Stage co ban trong Pipeline

#### `$match` (Loc ban ghi)

```javascript
const mongoose = require('mongoose');

{
  $match: {
    status: 'ACTIVE',
    credits: { $gte: 3 },
    subjectId: new mongoose.Types.ObjectId(req.params.subjectId)
  }
}
```

#### `$lookup` (Join giua 2 collection)

```javascript
// Join tu classes sang subjects dua tren classes.subjectId = subjects._id
{
  $lookup: {
    from: 'subjects',          // Ten collection can join den
    localField: 'subjectId',   // Truong khoa ngoai o collection hien tai
    foreignField: '_id',       // Truong khoa chinh o collection can join
    as: 'subjectInfo'          // Ten field chua ket qua (tra ve dang mang)
  }
}
```

#### `$unwind` (Giai nen mang thanh object don le)

```javascript
// Biến subjectInfo từ [ { ... } ] thành { ... }
{
  $unwind: {
    path: '$subjectInfo',
    preserveNullAndEmptyArrays: true // Giu lai ban ghi ngay ca khi khong tim thay (LEFT JOIN)
  }
}
```

#### `$group` (Gom nhom va tinh toan ham tong hop)

```javascript
{
  $group: {
    _id: '$subjectId',                           // Gom nhom theo subjectId (hoac _id: null neu tinh toan toan bo)
    totalClasses: { $sum: 1 },                   // Dem so luong lop: COUNT(*)
    totalEnrollments: { $sum: { $size: '$enrollments' } }, // Tong so sinh vien dang ky
    avgCredits: { $avg: '$credits' },            // Tinh trung binh cong
    maxPrice: { $max: '$price' },                // Gia cao nhat
    minPrice: { $min: '$price' },                // Gia thap nhat
    classList: { $push: '$className' }           // Thu thap danh sach ten lop vao mang
  }
}
```

#### `$project` va `$addFields` (Dinh dang dau ra)

```javascript
{
  $project: {
    _id: 1,
    className: 1,
    lecturerName: 1,
    // Tinh do dai cua mang
    totalStudents: { $size: '$enrollments' },
    // Lam tron so thap phan 2 chu so trong pipeline
    roundedAvg: { $round: ['$avgScore', 2] }
  }
}
```

#### `$sort`, `$skip`, `$limit` (Sap xep va Phan trang)

```javascript
// Sap xep: 1 la tang dan, -1 la giam dan
{ $sort: { totalClasses: -1, _id: 1 } },
{ $skip: (page - 1) * limit },
{ $limit: Number(limit) }
```

---

### 7.3. Cac mau Aggregation kinh dien cho phong thi PE

#### Mau 1: Dem so luong ban ghi con va tinh tong

De bai: Tinh so luong sinh vien da diem danh `PRESENT` cho tung lop hoc:

```javascript
const result = await Attendance.aggregate([
  {
    $match: { status: "PRESENT" },
  },
  {
    $group: {
      _id: "$classId",
      presentCount: { $sum: 1 },
    },
  },
  {
    $lookup: {
      from: "classes",
      localField: "_id",
      foreignField: "_id",
      as: "class",
    },
  },
  {
    $unwind: "$class",
  },
  {
    $project: {
      classId: "$_id",
      className: "$class.className",
      presentCount: 1,
      _id: 0,
    },
  },
  {
    $sort: { presentCount: -1 },
  },
]);
```

#### Mau 2: Tach Sub-document va Gom nhom theo Sinh vien

De bai: Tu collection `classes`, tim xem moi sinh vien dang hoc o bao nhieu lop:

```javascript
const result = await Class.aggregate([
  // 1. Tach tung phan tu trong mang enrollments
  { $unwind: "$enrollments" },

  // 2. Gom nhom theo studentId ben trong enrollment
  {
    $group: {
      _id: "$enrollments.studentId",
      classCount: { $sum: 1 },
      enrolledClasses: { $push: "$className" },
    },
  },

  // 3. Join thong tin chi tiet cua sinh vien
  {
    $lookup: {
      from: "students",
      localField: "_id",
      foreignField: "_id",
      as: "student",
    },
  },
  { $unwind: "$student" },

  // 4. Chon cac truong hien thi
  {
    $project: {
      studentId: "$_id",
      studentCode: "$student.studentCode",
      fullName: "$student.fullName",
      classCount: 1,
      enrolledClasses: 1,
      _id: 0,
    },
  },
  { $sort: { classCount: -1 } },
]);
```

#### Mau 3: Thong ke doanh thu / diem so co tinh trung binh lam tron

```javascript
const stats = await Grade.aggregate([
  {
    $group: {
      _id: "$subjectId",
      avgScore: { $avg: "$score" },
      maxScore: { $max: "$score" },
      minScore: { $min: "$score" },
      totalStudents: { $sum: 1 },
    },
  },
  {
    $project: {
      subjectId: "$_id",
      avgScore: { $round: ["$avgScore", 2] },
      maxScore: 1,
      minScore: 1,
      totalStudents: 1,
      _id: 0,
    },
  },
]);
```

---

## 8. CAC LOI THUONG GAP TRONG PHONG THI VA CACH XU LY

| Hien tuong loi                                                | Nguyen nhan                                                                  | Cach khac phuc                                                                                              |
| :------------------------------------------------------------ | :--------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- | --- |
| `CastError: Cast to ObjectId failed for value "..."`          | Truyen id khong dung dinh dang 24 ky tu hex vao truy van.                    | Dung `mongoose.Types.ObjectId.isValid(id)` de kiem tra truoc khi goi query.                                 |
| Aggregation `$match` tra ve mang rong `[]` du du lieu ton tai | Truyen chuoi String vao `$match` tren truong `_id` hoac khoa ngoai ObjectId. | Ep kieu: `new mongoose.Types.ObjectId(id)`.                                                                 |     |
| `$lookup` tra ve mang rong `[]`                               | Sai ten collection trong truong `from`.                                      | Kiem tra ten collection trong Mongo (thuong la chu thuong so nhieu, vi du: `subjects` thay vi `Subject`).   |
| Du lieu them vao bi mat field khong luu                       | Model Schema chua khai bao truong do.                                        | Them truong can thiet vao Schema cua Model hoac bo sung `strict: false`.                                    |
| Server crash khi goi API                                      | Khong co khoi `try { ... } catch (error) { ... }`.                           | Luon bao boc logic Controller trong `try/catch` va tra ve `res.status(500).json({ error: error.message })`. |
| Du lieu so bi cong chuoi (`"10" + 5 = "105"`)                 | Gia tri lay tu `req.query` hoac `req.body` o dang String.                    | Luon ep kieu: `Number(req.query.val) \|\| 0`.                                                               |
| `Cannot read properties of undefined` khi lay sub-doc         | Doi tuong hoac mang cha la `null`/`undefined`.                               | Dung Optional Chaining: `item?.enrollments?.length \|\| 0`.                                                 |
| Ket qua tra ve kem field password hoac token                  | Chua bo field nhay cam truoc khi response.                                   | Trong Mongoose query dung `.select('-password')` hoac `delete user.password` sau `.toObject()`.             |
| `findByIdAndUpdate` tra ve du lieu cu truoc khi update        | Mac dinh Mongoose tra ve document truoc update.                              | Luon truyen options `{ new: true, runValidators: true }`.                                                   |
| Update mang sub-doc bi de toan bo mang                        | Gan de gia tri mang thay vi dung toan tu mang.                               | Dung `$push` de them, `$pull` de xoa, `$set: { 'arr.$.field': val }` de update phan tu.                     |

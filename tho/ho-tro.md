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
   - 5.5. [Phuong thuc Cap nhat (Update 1 phan PATCH, Update toan bo PUT, Update 1 ban ghi &amp; Update nhieu ban ghi)](#55-phuong-thuc-cap-nhat-update)
   - 5.6. [Cac toan tu cap nhat (Update Operators: $set, $unset, $inc, $push, $pull, $[], arrayFilters)](#56-cac-toan-tu-cap-nhat-update-operators)
   - 5.7. [Phuong thuc Xoa (Delete / Remove)](#57-phuong-thuc-xoa-delete--remove)
   - 5.8. [Thao tac voi Mang Sub-document (Update 1 phan tu $, Update nhieu phan tu $[], Loc do dai mang con $expr $filter)](#58-thao-tac-voi-mang-sub-document-mang-nhung)
   - 5.9. [Bo khung Controller CRUD mau chuan chi (Full Template)](#59-bo-khung-controller-crud-mau-chuan-chi-full-template)
6. [Mongoose Populate (Truy van khoa ngoai)](#6-mongoose-populate-truy-van-khoa-ngoai)
7. [Mongoose Aggregation Pipeline (Thong ke &amp; Gom nhom chuyen sau)](#7-mongoose-aggregation-pipeline-thong-ke--gom-nhom-chuyen-sau)
   - 7.1. [Quy tac vang khi dung Aggregation](#71-quy-tac-vang-khi-dung-aggregation)
   - 7.2. [Chi tiet toan tu $group (Gom nhom, Cong don, Dem, Multi-group)](#72-chi-tiet-toan-tu-group-gom-nhom-cong-don-dem-multi-group)
   - 7.3. [Chi tiet $project &amp; $addFields (Tinh toan, Dieu kien $cond, $switch, Xu ly mang)](#73-chi-tiet-project--addfields-tinh-toan-dieu-kien-cond-switch-xu-ly-mang)
   - 7.4. [Chi tiet $lookup (Join co ban, Join co pipeline long, Join mang ID)](#74-chi-tiet-lookup-join-co-ban-join-co-pipeline-long-join-mang-id)
   - 7.5. [Chi tiet $unwind (Tach mang, preserveNullAndEmptyArrays, includeArrayIndex)](#75-chi-tiet-unwind-tach-mang-preservenullandemptyarrays-includearrayindex)
   - 7.6. [Chi tiet $facet (Phan trang &amp; Tinh tong count trong 1 query duy nhat)](#76-chi-tiet-facet-phan-trang--tinh-tong-count-trong-1-query-duy-nhat)
   - 7.7. [Cac bai toan mau Aggregation kinh dien cho phong thi PE](#77-cac-bai-toan-mau-aggregation-kinh-dien-cho-phong-thi-pe)
8. [Cac loi thuong gap trong phong thi va cach xu ly](#8-cac-loi-thuong-gap-trong-phong-thi-va-cach-xu-ly)
9. [Quy luat So it &amp; So nhieu trong Tieng Anh (Singular &amp; Plural Rules cho Model &amp; Collection)](#9-quy-luat-so-it--so-nhieu-trong-tieng-anh-singular--plural-rules-cho-model--collection)
10. [Chien thuat Hybrid: Ket hop Mongoose lean() va JavaScript (Map, Filter, Reduce, Sort, Slice)](#10-chien-thuat-hybrid-ket-hop-mongoose-lean-va-javascript-map-filter-reduce-sort-slice)

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

### 5.5. Phuong thuc Cap nhat (Update: 1 phan PATCH, toan bo PUT, 1 ban ghi & nhieu ban ghi)

Trong cac de thi PE, yeu cau cap nhat rat da dang: co bai yeu cau chi cap nhat 1 so truong duoc gui len (PATCH), co bai yeu cau cap nhat toan bo (PUT), co bai yeu cau cap nhat dong loat hang loat ban ghi (`updateMany`).

#### 5.5.1. Cap nhat TUNG PHAN (Partial Update - PATCH / Chi sua truong duoc gui, giu nguyen truong cu)

> **Khai niem**: Client chi gui len `{ price: 150 }` hoac `{ status: 'CLOSED' }`. Cac truong khac (nhu `className`, `subjectId`, `enrollments`, `createdAt`) **phai duoc giu nguyen tuyet doi**, khong duoc ghi de lam mat hay rong du lieu cu.

**Cach 1: Dung `$set` voi Object loc du lieu truyen len (Khuyen dung cho API PATCH)**:

```javascript
// PATCH /api/classes/:id - Chi sua cac truong hop le duoc gui trong req.body
const patchClass = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid ID: ${id}` });
    }

    // 1. Whitelist cac truong duoc phep sua (chong sua _id, createdAt, role he thong)
    const allowedFields = ["className", "lecturerName", "status"];
    const updateData = {};
    for (const key of Object.keys(req.body)) {
      if (allowedFields.includes(key) && req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ error: "No valid fields provided for partial update" });
    }

    // 2. Dung $set de chi cap nhat cac truong trong updateData
    // Bat buoc co: { new: true, runValidators: true }
    const updated = await Class.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!updated) {
      return res.status(404).json({ error: `Class with id = ${id} not found` });
    }

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
```

**Cach 2: Dung `findById` -> sua bang JS -> `save()`**:

```javascript
const item = await Class.findById(id);
if (!item) return res.status(404).json({ error: "Not found" });

// Chi ghi de khi gia tri khac undefined
if (req.body.className !== undefined) item.className = req.body.className;
if (req.body.status !== undefined) item.status = req.body.status;

const saved = await item.save(); // Chay validation cua tung truong
```

---

#### 5.5.2. Cap nhat TOAN BO / THAY THE (Full Update - PUT)

> **Khai niem**: Kiem tra day du tat ca cac truong bat buoc cua document. Neu thieu mot truong bat buoc se tra ve loi 400.

```javascript
// PUT /api/classes/:id - Cap nhat toan bo thong tin lop hoc
const putClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { className, subjectId, lecturerName, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid ID: ${id}` });
    }

    // Kiem tra day du cac truong bat buoc theo yeu cau cua PUT
    if (!className || !subjectId || !lecturerName || !status) {
      return res.status(400).json({
        error:
          "Missing required fields: className, subjectId, lecturerName, status",
      });
    }

    const updated = await Class.findByIdAndUpdate(
      id,
      { className, subjectId, lecturerName, status },
      { new: true, runValidators: true },
    );

    if (!updated) {
      return res.status(404).json({ error: `Class with id = ${id} not found` });
    }

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
```

---

#### 5.5.3. Cap nhat 1 BAN GHI DUY NHAT (Single Document Update)

```javascript
// 1. findByIdAndUpdate(id, data, options) - Nhanh nhat theo _id
const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
  new: true,
  runValidators: true,
});

// 2. findOneAndUpdate(filter, data, options) - Cap nhat ban ghi dau tien khop dieu kien bat ky
const user = await User.findOneAndUpdate(
  { email: req.body.email },
  { $set: { lastLogin: new Date() } },
  { new: true },
);

// 3. updateOne(filter, data) - Cap nhat nhung chi tra ve metadata (khong tra ve document)
const resMeta = await Product.updateOne(
  { _id: id },
  { $set: { isAvailable: false } },
); // Tra ve: { acknowledged: true, modifiedCount: 1, matchedCount: 1 }
```

---

#### 5.5.4. Cap nhat NHIEU BAN GHI DONG LOAT (Multiple Documents Batch Update - updateMany)

> **Khai niem**: Khi de bai yeu cau: _"Chuyen trang thai tat ca cac lop hoc cua mon hoc X thanh 'CLOSED'"_ hoac _"Tang 1 tin chi cho tat ca cac mon hoc co tin chi < 3"_.

```javascript
// Vi du 1: Cap nhat trang thai hang loat theo dieu kien
const updateClassesStatus = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { newStatus } = req.body;

    // updateMany se sua tat ca document thoa man filter
    const result = await Class.updateMany(
      { subjectId: subjectId, status: "OPEN" },
      { $set: { status: newStatus || "CLOSED", updatedAt: new Date() } },
    );

    // Metadata tra ve:
    // result.matchedCount  : So ban ghi tim thay thoa man filter
    // result.modifiedCount : So ban ghi thuc su duoc thay doi gia tri
    return res.status(200).json({
      message: `Successfully updated ${result.modifiedCount} classes`,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Vi du 2: Tang gia / Cong don so hoc hang loat bang $inc hoac $mul
await Product.updateMany(
  { category: "Electronics" },
  {
    $inc: { stock: 10 }, // Tang stock moi san pham them 10
    $mul: { price: 1.05 }, // Tang gia moi san pham them 5%
  },
);
```

---

### 5.6. Cac toan tu cap nhat (Update Operators: $set, $unset, $inc, $mul, $push, $pull, $addToSet)

```javascript
// 1. $set: Gan gia tri moi cho field (khong lam mat cac field khac)
await Product.findByIdAndUpdate(id, {
  $set: { price: 250, status: "OPEN" },
});

// 2. $unset: Xoa bo han 1 truong khoi document
await Product.findByIdAndUpdate(id, {
  $unset: { oldField: "" },
});

// 3. $inc: Tang hoac giam gia tri so hoc (cong don / tru bot)
await Product.findByIdAndUpdate(id, {
  $inc: { views: 1, stock: -5 }, // Tang views len 1, giam stock di 5
});

// 4. $mul: Nhan gia tri voi mot he so (vi du giam gia 10%: nhan 0.9)
await Product.findByIdAndUpdate(id, {
  $mul: { price: 0.9 },
});

// 5. $push: Them 1 phan tu vao mang
await Class.findByIdAndUpdate(
  classId,
  {
    $push: { enrollments: { studentId, status: "enrolled" } },
  },
  { new: true },
);

// 6. $push + $each: Them NHIEU PHAN TU CUNG LUC vao mang
await Class.findByIdAndUpdate(
  classId,
  {
    $push: {
      enrollments: {
        $each: [
          { studentId: id1, status: "enrolled" },
          { studentId: id2, status: "enrolled" },
        ],
      },
    },
  },
  { new: true },
);

// 7. $pull: Xoa 1 hoac nhieu phan tu khoi mang theo dieu kien
await Class.findByIdAndUpdate(
  classId,
  {
    $pull: { enrollments: { studentId: targetStudentId } },
  },
  { new: true },
);

// 8. $addToSet: Them vao mang neu CHUA TON TAI (chong trung lap)
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

#### 5.8.1. Cac thao tac Tim kiem, Them, Xoa va Cap nhat mang Sub-document

##### A. Tim kiem trong mang (Querying Arrays)

```javascript
// 1. Tim cac Class chua mot sinh vien cu the:
const classes = await Class.find({ "enrollments.studentId": studentId });

// 2. Tim bang $elemMatch khi can khop DONG THOI nhieu truong trong cung 1 sub-document:
// (Vi du: Lop co sinh vien studentId va sinh vien do phai co status la 'enrolled')
const enrolledClasses = await Class.find({
  enrollments: {
    $elemMatch: { studentId: studentId, status: "enrolled" },
  },
});
```

##### B. Them phan tu vao mang (Insert / Push)

```javascript
// 1. Them 1 phan tu vao cuoi mang ($push):
const updated = await Class.findByIdAndUpdate(
  classId,
  { $push: { enrollments: { studentId, status: "enrolled" } } },
  { new: true, runValidators: true },
);

// 2. Them NHIEU phan tu cung luc vao mang ($push + $each):
const updatedMany = await Class.findByIdAndUpdate(
  classId,
  {
    $push: {
      enrollments: {
        $each: [
          { studentId: id1, status: "enrolled" },
          { studentId: id2, status: "enrolled" },
        ],
      },
    },
  },
  { new: true, runValidators: true },
);

// 3. Them phan tu neu CHUA TON TAI ($addToSet - chong trung lap):
await Class.findByIdAndUpdate(classId, {
  $addToSet: { tags: "NODEJS" },
});
```

##### C. Xoa phan tu khoi mang (Delete / Pull)

```javascript
// 1. Xoa 1 phan tu cu the theo studentId ($pull):
const afterRemoveOne = await Class.findByIdAndUpdate(
  classId,
  { $pull: { enrollments: { studentId: targetStudentId } } },
  { new: true },
);

// 2. Xoa NHIEU phan tu thoa dieu kien ($pull + $in hoac so sanh):
// Vi du: Xoa tat ca sinh vien co status la 'dropped' hoac 'cancelled'
const afterRemoveMany = await Class.findByIdAndUpdate(
  classId,
  {
    $pull: {
      enrollments: { status: { $in: ["dropped", "cancelled"] } },
    },
  },
  { new: true },
);

// Xoa tat ca cac sub-doc co diem so < 5:
await Student.findByIdAndUpdate(studentId, {
  $pull: { scores: { value: { $lt: 5 } } },
});
```

##### D. Cap nhat phan tu trong mang (Update Array Elements - 4 Truong hop cot loi)

> **Luu y quan trong**: Cap nhat field binh thuong chi can `$set: { field: val }`, nhung khi cap nhat ben trong MANG SUB-DOCUMENT, phai chon dung 1 trong 4 ky thuat duoi day tuy theo de bai.

###### Truong hop 1: Cap nhat 1 PHAN TU DAU TIEN khop dieu kien (Toan tu vi tri `$`)

_Khi nao dung?_ Khi ban biet lop do va biet sinh vien cu the can cap nhat trang thai.
_Quy tac_: Bat buoc filter tim kiem phai chi ro field cua mang de MongoDB biet con tro `$` dang tro vao dau.

```javascript
// Cap nhat status cua 1 sinh vien cu the trong lop thanh 'dropped'
const updated = await Class.findOneAndUpdate(
  { _id: classId, "enrollments.studentId": studentId },
  {
    $set: {
      "enrollments.$.status": "dropped",
      "enrollments.$.updatedAt": new Date(),
    },
  },
  { new: true, runValidators: true },
);
```

###### Truong hop 2: Cap nhat TAT CA CAC PHAN TU trong mang (Toan tu `$[]`)

_Khi nao dung?_ Khi de bai yeu cau doi trang thai toan bo thanh vien trong lop (vi du: ket thuc khoa hoc, doi tat ca sinh vien thanh `completed` hoac `inactive`).

```javascript
// Chuyen status cua TAT CA sinh vien trong lop thanh 'completed'
const updatedAll = await Class.findByIdAndUpdate(
  classId,
  {
    $set: { "enrollments.$[].status": "completed" },
  },
  { new: true },
);
```

###### Truong hop 3: Cap nhat NHIEU PHAN TU THOA DIEU KIEN trong mang (Toan tu `$[<identifier>]` + `arrayFilters`)

_Khi nao dung?_ Khi de yeu cau: _"Chuyen tat ca sinh vien dang o trang thai 'pending' thanh 'rejected'"_ hoac _"Cong 1 diem cho tat ca cac bai kiem tra co diem < 5"_.

```javascript
// Vi du 1: Cap nhat trang thai cua tat ca phan tu co status === 'pending'
const updatedFiltered = await Class.findByIdAndUpdate(
  classId,
  {
    $set: { "enrollments.$[elem].status": "rejected" },
  },
  {
    arrayFilters: [{ "elem.status": "pending" }],
    new: true,
  },
);

// Vi du 2: Tang gia tri so hoc cho nhieu phan tu thoa dieu kien ($inc + arrayFilters)
const updatedScores = await Student.findByIdAndUpdate(
  studentId,
  {
    $inc: { "scores.$[item].value": 1 }, // Tang 1 diem
  },
  {
    arrayFilters: [{ "item.value": { $lt: 5 } }], // Chi tang cho cac bai co diem < 5
    new: true,
  },
);
```

###### Truong hop 4: Cap nhat mang Sub-documents bang JavaScript thuan (Cach cuu canh sieu de nho trong phong thi)

_Khuyen dung khi_: Logic sua doi phuc tap, can ket hop tinh toan, if/else ma khong nho noi cu phap `arrayFilters` cua MongoDB.

```javascript
// Router Handler cap nhat mang sub-doc bang JS thuan:
const updateSubdocWithJS = async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentId, newStatus } = req.body;

    // 1. Lay document ra
    const targetClass = await Class.findById(classId);
    if (!targetClass) {
      return res
        .status(404)
        .json({ error: `Class with id = ${classId} not found` });
    }

    // 2. Thao tac truc tiep tren mang JavaScript thuan tuy:
    // A. Sua 1 phan tu:
    const targetEnrollment = targetClass.enrollments.find(
      (e) => String(e.studentId) === String(studentId),
    );
    if (targetEnrollment) {
      targetEnrollment.status = newStatus || "dropped";
    }

    // B. Sua nhieu phan tu thoa dieu kien:
    // targetClass.enrollments.forEach((e) => {
    //   if (e.status === 'pending') e.status = 'rejected';
    // });

    // 3. Luu nguoc lai vao database (Mongoose tu validate va update)
    const saved = await targetClass.save();

    return res.status(200).json(saved);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
```

---

#### 5.8.2. Truy van find() loc theo DO DAI MANG CON DA QUA LOC DIEU KIEN ($expr + $size + $filter)

> **Van de thuc te thuong gap trong de thi PE**:
>
> - De bai yeu cau: _"Lay danh sach cac lop hoc co so luong sinh vien dang ky hop le (`status === 'enrolled'`) toi thieu `X` nguoi"_.
> - **Vi sao kho?** Toan tu `{ enrollments: { $size: 5 } }` mac dinh cua MongoDB **chi nhan so co dinh**, KHONG chap nhan `{ $gte: 5 }` (se bao loi neu truyen `$gte` vao `$size` thuong). Dong thoi `$size` thuong dem toan bo mang chu khong loc theo trang thai con ben trong.

Duoi day la **4 giai phap thuc chien** tu truc tiep trong `find()` den `aggregate()` va `in-memory`:

##### Cach 1: Dung `$expr` + `$size` + `$filter` truc tiep trong `find()` (Chuan nhat va manh nhat)

Cho phep nhung bieu thuc aggregation vao lenh `Model.find()` de loc mang con roi moi dem do dai:

```javascript
// Lay cac lop hoc co it nhat minMembers sinh vien co status la 'enrolled'
const minMembers = Number(req.query.minMembers) || 3;

const classes = await Class.find({
  $expr: {
    $gte: [
      {
        $size: {
          $filter: {
            input: "$enrollments", // Mang con can loc
            as: "item", // Ten bien dai dien cho phan tu mang
            cond: { $eq: ["$$item.status", "enrolled"] }, // Dieu kien loc phan tu (dung 2 dau $$)
          },
        },
      },
      minMembers, // So luong toi thieu
    ],
  },
});
```

_Giai thich cu phap_:

1. `$expr`: Cho phep su dung cu phap bieu thuc cua Aggregation ngay trong ham `Model.find()`.
2. `$filter`: Loc mang `enrollments`, chi giu lai cac object thoa man `$$item.status === 'enrolled'`.
3. `$size`: Tinh do dai cua mang da loc.
4. `$gte: [do_dai_sau_loc, minMembers]`: So sanh lon hon hoac bang.

---

##### Cach 2: Truong hop de chi yeu cau do dai mang goc (chua can loc con) `>= X`

Neu de bai chi hoi: _"Lop hoc co it nhat X thanh vien (khong phan biet status)"_:

**Cach 2A: Dung `$expr` va `$size` trong `find()`**:

```javascript
const minCount = Number(req.query.minCount) || 5;

const classes = await Class.find({
  $expr: {
    $gte: [{ $size: "$enrollments" }, minCount],
  },
});
```

**Cach 2B: Meo kiem tra su ton tai cua Index trong mang (Sieu nhanh, khong can `$expr`)**:

```javascript
// Neu mang co it nhat 5 phan tu, nghia la phan tu o vi tri index 4 (0, 1, 2, 3, 4) PHAI TON TAI!
const classes = await Class.find({
  "enrollments.4": { $exists: true },
});

// Neu muon mang co tu 3 den 10 phan tu:
const classes = await Class.find({
  "enrollments.2": { $exists: true }, // Co it nhat 3 phan tu (index 0, 1, 2)
  "enrollments.10": { $exists: false }, // Khong co phan tu thu 11 (index 10)
});
```

---

##### Cach 3: Dung `aggregate()` (Khi can tra ve them ca truong so luong dem duoc ra JSON)

Dung khi de bai yeu cau tra ve them truong `totalEnrolled`:

```javascript
const minMembers = Number(req.query.minMembers) || 3;

const classes = await Class.aggregate([
  // 1. Tinh truoc do dai cua mang sau khi loc
  {
    $addFields: {
      enrolledCount: {
        $size: {
          $filter: {
            input: "$enrollments",
            as: "e",
            cond: { $eq: ["$$e.status", "enrolled"] },
          },
        },
      },
    },
  },
  // 2. Loc theo so luong vua tinh
  {
    $match: {
      enrolledCount: { $gte: minMembers },
    },
  },
]);
```

---

##### Cach 4: Dung ket hop map va filter cua JavaScript thuan (Cach de hieu, truc quan va de debug nhat)

Thay vi phai nho cac cu phap phuc tap cua MongoDB nhu `$expr`, `$filter`, `$cond`, cach tiep can **cuc ky de hieu va luon an diem 100%** trong phong thi la:

1. Goi `Model.find().lean()` (kem `populate` neu can) de lay ve mang Plain JavaScript Objects.
2. Dung `map` de duyet tung document, dung `filter` loc mang con va gan them field (nhu `activeCount`, `activeEnrollments`).
3. Dung `filter` o cap ngoai de loc cac document co `activeCount >= minMembers`.

```javascript
// Vi du: Loc cac lop co it nhat minMembers sinh vien co status === 'enrolled'
const getClassesByActiveMembers = async (req, res) => {
  try {
    const minMembers = Number(req.query.minMembers) || 3;

    // 1. Lay du lieu tu Mongo kem .lean() de co Object JS thuan
    const classes = await Class.find()
      .populate("subjectId", "name code")
      .populate("enrollments.studentId", "studentCode fullName")
      .lean();

    // 2. Dung MAP: Duyet qua tung lop, dung filter loc mang con enrollments va gan them activeCount
    const processedClasses = classes.map((c) => {
      // Loc mang con: chi giu lai sinh vien co status la 'enrolled'
      const activeEnrollments = (c.enrollments || []).filter(
        (e) => e.status === "enrolled",
      );

      return {
        ...c,
        activeCount: activeEnrollments.length, // Field moi chua so luong thanh vien hop le
        activeEnrollments: activeEnrollments, // Field moi chua danh sach da loc
      };
    });

    // 3. Dung FILTER: Loc nhung lop co activeCount >= minMembers
    const result = processedClasses.filter((c) => c.activeCount >= minMembers);

    // 4. (Tuy chon) Dung SORT de sap xep lop dong sinh vien nhat len dau
    result.sort((a, b) => b.activeCount - a.activeCount);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
```

_Vi sao cach nay cuc ky duoc khuyen khich khi thi PE?_

- Khong so sai cu phap `$expr` hay `$$` cua MongoDB.
- Dung duoc `console.log()` de in ra kiem tra du lieu o bat ky buoc nao (`classes`, `processedClasses`, `result`).
- De thi PE chi co tu 10 - 50 documents nen xu ly in-memory bang JS chay tuc thi (duoi 5ms), khong anh huong den hieu nang.
- Xem them chi tiet day du o [Muc 10. Chien thuat Hybrid](#10-chien-thuat-hybrid-ket-hop-mongoose-lean-va-javascript-map-filter-reduce-sort-slice).

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

## 7. MONGOOSE AGGREGATION PIPELINE (THONG KE & GOM NHOM CHUYEN SAU)

### 7.1. Quy tac vang khi dung Aggregation

1. **ObjectId trong `$match`**: Phai dung `new mongoose.Types.ObjectId(id)`. Khong dung chuoi string truc tiep vi Aggregation khong tu dong cast kieu nhu `find()`.
2. **Ten Collection trong `$lookup`**: Truong `from` luon la ten vat ly cua collection trong MongoDB (thuong la chu thuong so nhieu, vi du: `'subjects'`, `'students'`, `'classes'`).
3. **Thu tu Pipeline**: Luon dat `$match` o dau de giam thieu so luong document truoc khi `$lookup` hoac `$group`; dat `$sort`, `$skip`, `$limit` o cuoi cung.

---

### 7.2. Chi tiet toan tu $group (Gom nhom, Cong don, Dem, Multi-group)

Toan tu `$group` gom nhom cac document theo mot khoa dinh danh `_id` va tinh toan cac gia tri tich luy (accumulators).

#### 7.2.1. Cac dang xac dinh khoa gom nhom `_id`

```javascript
// 1. _id: null -> Gom toan bo collection thanh 1 ket qua duy nhat (tinh tong toan he thong, trung binh ca truong)
{
  $group: {
    _id: null,
    totalRecords: { $sum: 1 },
    grandTotalRevenue: { $sum: '$amount' },
    overallAvgScore: { $avg: '$score' }
  }
}

// 2. _id: '$singleField' -> Gom theo mot truong don le (theo lop, theo mon, theo trang thai)
{
  $group: {
    _id: '$subjectId',
    classCount: { $sum: 1 }
  }
}

// 3. _id: { ... } -> Gom theo nhieu truong ket hop (Composite Group Key)
// Vi du: Gom theo tung Mon va tung Trang thai cua mon do
{
  $group: {
    _id: {
      subjectId: '$subjectId',
      status: '$status'
    },
    count: { $sum: 1 }
  }
}

// 4. Gom theo thoi gian (Nam, Thang, Ngay)
{
  $group: {
    _id: {
      year: { $year: '$date' },
      month: { $month: '$date' }
    },
    totalAttendance: { $sum: 1 }
  }
}
```

#### 7.2.2. Cac toan tu tich luy (Accumulator Operators) - Dem & Cong don

```javascript
{
  $group: {
    _id: '$classId',

    // 1. Dem tong so ban ghi
    totalRecords: { $sum: 1 },

    // 2. Dem co dieu kien (Conditional Count dung $cond)
    // Dem so ban ghi co status la 'PRESENT' va 'ABSENT' trong cung 1 lan group
    presentCount: {
      $sum: { $cond: [{ $eq: ['$status', 'PRESENT'] }, 1, 0] }
    },
    absentCount: {
      $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] }
    },

    // 3. Cong don gia tri mot truong so (Sum field)
    totalAmount: { $sum: '$amount' },

    // 4. Cong don gia tri nhan he so (Sum expression: quantity * price)
    totalRevenue: {
      $sum: { $multiply: ['$quantity', '$unitPrice'] }
    },

    // 5. Cong don co dieu kien (Conditional Sum)
    // Tinh tong so tien da thanh toan (status === 'PAID')
    paidAmount: {
      $sum: {
        $cond: [{ $eq: ['$status', 'PAID'] }, '$amount', 0]
      }
    },

    // 6. Tinh trung binh cong ($avg)
    avgScore: { $avg: '$score' },

    // 7. Tim gia tri lon nhat va nho nhat ($max, $min)
    highestScore: { $max: '$score' },
    lowestScore: { $min: '$score' },

    // 8. Lay gia tri dau tien hoac cuoi cung ($first, $last)
    // Luu y: Can stage $sort ngay truoc $group de dam bao thu tu
    latestDate: { $last: '$date' },
    earliestDate: { $first: '$date' },

    // 9. Thu thap phan tu vao mang (Push)
    studentIds: { $push: '$studentId' },
    // Push ca object chua nhieu thong tin
    studentDetails: {
      $push: {
        id: '$studentId',
        score: '$score',
        status: '$status'
      }
    },

    // 10. Thu thap phan tu vao mang KHONG TRUNG LAP (Unique Set dung $addToSet)
    distinctSubjects: { $addToSet: '$subjectId' }
  }
}
```

#### 7.2.3. Nhieu stage `$group` trong cung mot Pipeline (Multi-stage Group)

Day la ky thuat thuong gap trong cac cau hoi thong ke da tang: Gom nhom lan 1 de tinh chi tiet tung nhom con, sau do gom nhom lan 2 de tong hop len nhom cha.

**Vi du: Tinh GPA trung binh cua sinh vien tu collection diem so (Grades)**:

- _Lan 1_: Gom theo `(studentId, subjectId)` de lay diem cao nhat cua mon do.
- _Lan 2_: Gom theo `studentId` de tinh trung binh cong GPA tat ca cac mon va dem tong so mon da hoc.

```javascript
const studentGpaList = await Grade.aggregate([
  // Stage 1: Loc cac ban ghi hop le
  { $match: { isDeleted: false } },

  // Stage 2: Group lan 1 - Gom theo Sinh vien + Mon hoc de lay diem cao nhat cua mon
  {
    $group: {
      _id: {
        studentId: "$studentId",
        subjectId: "$subjectId",
      },
      finalSubjectScore: { $max: "$score" },
    },
  },

  // Stage 3: Group lan 2 - Gom tiep theo Sinh vien de tinh GPA toan bo cac mon
  {
    $group: {
      _id: "$_id.studentId",
      totalSubjects: { $sum: 1 },
      gpa: { $avg: "$finalSubjectScore" },
      subjectsSummary: {
        $push: {
          subjectId: "$_id.subjectId",
          score: "$finalSubjectScore",
        },
      },
    },
  },

  // Stage 4: Dinh dang dau ra va lam tron 2 chu so thap phan
  {
    $project: {
      studentId: "$_id",
      totalSubjects: 1,
      gpa: { $round: ["$gpa", 2] },
      subjectsSummary: 1,
      _id: 0,
    },
  },

  // Stage 5: Sap xep GPA giam dan
  { $sort: { gpa: -1 } },
]);
```

---

### 7.3. Chi tiet $project & $addFields (Tinh toan, Dieu kien $cond, $switch, Xu ly mang)

- `$project`: Chon ro cac truong hien thi (1: giu, 0: an).
- `$addFields`: Giu nguyen toan bo cac truong cu va them moi cac truong tinh toan.

#### 7.3.1. Tinh toan so hoc & Lam tron

```javascript
{
  $addFields: {
    // Phep nhan: quantity * price
    subTotal: { $multiply: ['$quantity', '$price'] },
    // Phep tru: subTotal - discount
    finalAmount: { $subtract: [{ $multiply: ['$quantity', '$price'] }, '$discount'] },
    // Lam tron 2 chu so thap phan
    roundedAvg: { $round: ['$avgScore', 2] }
  }
}
```

#### 7.3.2. Bieu thuc dieu kien ($cond va $switch)

```javascript
{
  $addFields: {
    // 1. $cond: Neu dung thi lay A, sai thi lay B (ternary operator)
    resultStatus: {
      $cond: {
        if: { $gte: ['$avgScore', 5.0] },
        then: 'PASSED',
        else: 'FAILED'
      }
    },

    // 2. $switch: Nhieu nhanh dieu kien (if - else if - else) de xep loai hoc luc
    academicRanking: {
      $switch: {
        branches: [
          { case: { $gte: ['$avgScore', 8.5] }, then: 'EXCELLENT' },
          { case: { $gte: ['$avgScore', 7.0] }, then: 'GOOD' },
          { case: { $gte: ['$avgScore', 5.0] }, then: 'AVERAGE' }
        ],
        default: 'POOR'
      }
    }
  }
}
```

#### 7.3.3. Thao tac mang khong can $unwind ($size, $filter, $arrayElemAt)

```javascript
{
  $project: {
    className: 1,

    // Dem so luong phan tu mang truc tiep
    totalStudents: { $size: '$enrollments' },

    // Loc mang con truc tiep bang $filter ma khong can tach ban ghi
    activeEnrollments: {
      $filter: {
        input: '$enrollments',
        as: 'item',
        cond: { $eq: ['$$item.status', 'enrolled'] }
      }
    },

    // Lay phan tu dau tien cua mang (index 0)
    firstEnrollment: { $arrayElemAt: ['$enrollments', 0] }
  }
}
```

#### 7.3.4. Thao tac chuoi & Dinh dang ngay

```javascript
{
  $project: {
    // Ghep chuoi ($concat)
    fullNameFormatted: { $concat: ['$lastName', ' ', '$firstName'] },
    // Chu hoa, chu thuong
    upperCode: { $toUpper: '$code' },
    // Dinh dang Date thanh chuoi YYYY-MM-DD HH:mm
    formattedDate: {
      $dateToString: {
        format: "%Y-%m-%d %H:%M",
        date: "$createdAt"
      }
    }
  }
}
```

---

### 7.4. Chi tiet $lookup (Join co ban, Join co pipeline long, Join mang ID)

#### 7.4.1. Equality Match co ban (Join 1 - 1 hoac 1 - N)

```javascript
{
  $lookup: {
    from: 'subjects',          // Collection dich (chu thuong so nhieu)
    localField: 'subjectId',   // Field o collection hien tai
    foreignField: '_id',       // Field o collection dich
    as: 'subject'              // Ten field mang ket qua tra ve
  }
}
```

#### 7.4.2. Correlated Subquery (Lookup nang cao co pipeline long)

Dung khi can join kem theo dieu kien phuc tap, loc hoac sort truoc khi join:

```javascript
{
  $lookup: {
    from: 'attendances',
    let: { currentClassId: '$_id' }, // Khai bao bien tu collection cha
    pipeline: [
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ['$classId', '$$currentClassId'] }, // Tham chieu bien bang '$$'
              { $eq: ['$status', 'PRESENT'] }
            ]
          }
        }
      },
      { $sort: { date: -1 } },
      { $limit: 5 } // Chi lay 5 buoi diem danh gan nhat
    ],
    as: 'recentPresentAttendances'
  }
}
```

#### 7.4.3. Lookup voi truong la Mang cac ID (Array of ObjectIds)

Neu document chua mang `studentIds: [ObjectId1, ObjectId2]`:

```javascript
{
  $lookup: {
    from: 'students',
    localField: 'studentIds',  // Mongoose tu dong duyet qua tung ID trong mang
    foreignField: '_id',
    as: 'studentsList'
  }
}
```

---

### 7.5. Chi tiet $unwind (Tach mang, preserveNullAndEmptyArrays, includeArrayIndex)

```javascript
{
  $unwind: {
    path: '$enrollments',
    // QUAN TRONG: preserveNullAndEmptyArrays = true giup giu lai ban ghi neu mang rong hoac null (LEFT JOIN)
    // Neu de mac dinh (false), cac document co mang rong se bi XOA MAT khoi ket qua!
    preserveNullAndEmptyArrays: true,
    // (Tuy chon) Them field chua chi so index cua phan tu (0, 1, 2, ...)
    includeArrayIndex: 'enrollmentIndex'
  }
}
```

---

### 7.6. Chi tiet $facet (Phan trang & Tinh tong count trong 1 query duy nhat)

Thay vi phai goi 2 query: `Model.find()` va `Model.countDocuments()`, `$facet` cho phep chay song song 2 pipeline doc lap trong 1 lan truy van duy nhat:

```javascript
const page = parseInt(req.query.page, 10) || 1;
const limit = parseInt(req.query.limit, 10) || 10;
const skip = (page - 1) * limit;

const [result] = await Product.aggregate([
  // 1. Loc ban ghi ban dau
  { $match: { status: "ACTIVE" } },

  // 2. Facet: Chay song song 2 luong
  {
    $facet: {
      // Luong 1: Lay du lieu cua trang hien tai
      data: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }],
      // Luong 2: Dem tong so ban ghi thoa man dieu kien
      totalCount: [{ $count: "total" }],
    },
  },
]);

const totalDocs = result.totalCount[0] ? result.totalCount[0].total : 0;
const items = result.data;

res.status(200).json({
  data: items,
  pagination: {
    totalDocs,
    page,
    limit,
    totalPages: Math.ceil(totalDocs / limit),
  },
});
```

---

### 7.7. Cac bai toan mau Aggregation kinh dien cho phong thi PE

#### Mau 1: Thong ke diem danh (Tong so buoi, So buoi co mat, So buoi vang, Ty le %)

De bai: Thong ke theo tung lop hoc xem co tong bao nhieu luot diem danh, bao nhieu luot `PRESENT`, `ABSENT` va ty le phan tram di hoc:

```javascript
const attendanceStats = await Attendance.aggregate([
  {
    $group: {
      _id: "$classId",
      totalSessions: { $sum: 1 },
      presentCount: {
        $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] },
      },
      absentCount: {
        $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] },
      },
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
  { $unwind: "$class" },
  {
    $project: {
      classId: "$_id",
      className: "$class.className",
      totalSessions: 1,
      presentCount: 1,
      absentCount: 1,
      // Ty le % co mat: (presentCount / totalSessions) * 100, lam tron 1 chu so thap phan
      attendanceRate: {
        $round: [
          {
            $multiply: [
              {
                $divide: [
                  "$presentCount",
                  {
                    $cond: [
                      { $eq: ["$totalSessions", 0] },
                      1,
                      "$totalSessions",
                    ],
                  },
                ],
              },
              100,
            ],
          },
          1,
        ],
      },
      _id: 0,
    },
  },
  { $sort: { attendanceRate: -1 } },
]);
```

#### Mau 2: Multi-stage $group (Tinh GPA Sinh vien tu Grades)

De bai: Tinh diem trung binh tat ca cac mon cua tung sinh vien, kem xep loai hoc luc bang `$switch`:

```javascript
const studentRankings = await Grade.aggregate([
  // Group 1: Lay diem cao nhat theo tung mon cua tung sinh vien
  {
    $group: {
      _id: {
        studentId: "$studentId",
        subjectId: "$subjectId",
      },
      maxScore: { $max: "$score" },
    },
  },
  // Group 2: Gom tiep theo sinh vien de tinh GPA
  {
    $group: {
      _id: "$_id.studentId",
      totalPassedSubjects: {
        $sum: { $cond: [{ $gte: ["$maxScore", 5] }, 1, 0] },
      },
      totalSubjects: { $sum: 1 },
      gpa: { $avg: "$maxScore" },
    },
  },
  // Join thong tin sinh vien
  {
    $lookup: {
      from: "students",
      localField: "_id",
      foreignField: "_id",
      as: "student",
    },
  },
  { $unwind: "$student" },
  // Dinh dang & Xep loai
  {
    $project: {
      studentCode: "$student.studentCode",
      fullName: "$student.fullName",
      totalPassedSubjects: 1,
      totalSubjects: 1,
      gpa: { $round: ["$gpa", 2] },
      ranking: {
        $switch: {
          branches: [
            { case: { $gte: ["$gpa", 8.5] }, then: "Xuat sac" },
            { case: { $gte: ["$gpa", 7.0] }, then: "Gioi" },
            { case: { $gte: ["$gpa", 5.0] }, then: "Dat" },
          ],
          default: "Khong dat",
        },
      },
      _id: 0,
    },
  },
  { $sort: { gpa: -1 } },
]);
```

#### Mau 3: Tach Sub-document va Gom nhom theo Sinh vien

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

---

## 8. CAC LOI THUONG GAP TRONG PHONG THI VA CACH XU LY

| Hien tuong loi                                                | Nguyen nhan                                                                  | Cach khac phuc                                                                                              |     |     |     |     |
| :------------------------------------------------------------ | :--------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- | --- | --- | --- | --- | --- |
| `CastError: Cast to ObjectId failed for value "..."`          | Truyen id khong dung dinh dang 24 ky tu hex vao truy van.                    | Dung `mongoose.Types.ObjectId.isValid(id)` de kiem tra truoc khi goi query.                                 |     |     |     |     |
| Aggregation `$match` tra ve mang rong `[]` du du lieu ton tai | Truyen chuoi String vao `$match` tren truong `_id` hoac khoa ngoai ObjectId. | Ep kieu: `new mongoose.Types.ObjectId(id)`.                                                                 |     |     |     |     |     |
| `$lookup` tra ve mang rong `[]`                               | Sai ten collection trong truong `from`.                                      | Kiem tra ten collection trong Mongo (thuong la chu thuong so nhieu, vi du: `subjects` thay vi `Subject`).   |     |     |     |     |
| Du lieu them vao bi mat field khong luu                       | Model Schema chua khai bao truong do.                                        | Them truong can thiet vao Schema cua Model hoac bo sung `strict: false`.                                    |     |     |     |     |
| Server crash khi goi API                                      | Khong co khoi `try { ... } catch (error) { ... }`.                           | Luon bao boc logic Controller trong `try/catch` va tra ve `res.status(500).json({ error: error.message })`. |     |     |     |     |
| Du lieu so bi cong chuoi (`"10" + 5 = "105"`)                 | Gia tri lay tu `req.query` hoac `req.body` o dang String.                    | Luon ep kieu: `Number(req.query.val) \|\| 0`.                                                               |     |     |     |     |
| `Cannot read properties of undefined` khi lay sub-doc         | Doi tuong hoac mang cha la `null`/`undefined`.                               | Dung Optional Chaining: `item?.enrollments?.length \|\| 0`.                                                 |     |     |     |     |
| Ket qua tra ve kem field password hoac token                  | Chua bo field nhay cam truoc khi response.                                   | Trong Mongoose query dung `.select('-password')` hoac `delete user.password` sau `.toObject()`.             |     |     |     |     |
| `findByIdAndUpdate` tra ve du lieu cu truoc khi update        | Mac dinh Mongoose tra ve document truoc update.                              | Luon truyen options `{ new: true, runValidators: true }`.                                                   |     |     |     |     |
| Update mang sub-doc bi de toan bo mang                        | Gan de gia tri mang thay vi dung toan tu mang.                               | Dung `$push` de them, `$pull` de xoa, `$set: { 'arr.$.field': val }` de update phan tu.                     |     |     |     |     |

---

## 9. QUY LUAT SO IT & SO NHIEU TRONG TIENG ANH (SINGULAR & PLURAL RULES CHO MODEL & COLLECTION)

Trong Mongoose va MongoDB, Collection thuong o dang **So nhieu (Plural, chu thuong)** con Model thuong o dang **So it (Singular, PascalCase)**.

> **Vi sao co loi `courses` thanh `cours`?**
>
> - Mot so thuat toan don gian chi kiem tra `endsWith('ses')` va cat 2 ky tu `es`, khien `courses` bi cat thanh `cours` (sai).
> - Thuc te: Goc tu la `course` da ket thuc bang chu `e`. Khi sang so nhieu no **chi them `s`** (`course + s = courses`). Do do khi chuyen ve so it, **chi duoc bo `s`** de tra ve `course`!

---

### 9.1. Bang quy tac khi nao bo `-es`, khi nao chi bo `-s`

| Nhom quy tac                                                          | Dang so nhieu (Collection)                                                               | Dang so it (Model)                                                                    | Quy tac bien doi                                        | Vi du minh hoa                                                        |
| :-------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------ | :------------------------------------------------------ | :-------------------------------------------------------------------- |
| **Goc tan cung '-se'**                                                | `courses`, `houses`, `cases`, `databases`, `licenses`, `responses`, `releases`           | `Course`, `House`, `Case`, `Database`, `License`, `Response`, `Release`               | **Chi bo `s`** (vi goc tu da co san `e`)                | `courses` -> `Course` _(khong phai Cours)_, `databases` -> `Database` |
| **Goc tan cung '-e' khac** (`-ce`, `-ze`, `-ge`, `-te`, `-de`, `-re`) | `services`, `devices`, `prices`, `sizes`, `pages`, `dates`, `grades`, `stores`, `genres` | `Service`, `Device`, `Price`, `Size`, `Page`, `Date`, `Grade`, `Store`, `Genre`       | **Chi bo `s`**                                          | `services` -> `Service`, `devices` -> `Device`, `sizes` -> `Size`     |
| **Tan cung bang 'sses'**                                              | `classes`, `addresses`, `glasses`, `processes`, `businesses`, `passes`                   | `Class`, `Address`, `Glass`, `Process`, `Business`, `Pass`                            | **Bo `es`** (tra ve tan cung `ss`)                      | `classes` -> `Class`, `addresses` -> `Address`                        |
| **Tan cung am rit (`-sh`, `-ch`, `-x`)**                              | `dishes`, `wishes`, `watches`, `matches`, `branches`, `boxes`, `taxes`, `indexes`        | `Dish`, `Wish`, `Watch`, `Match`, `Branch`, `Box`, `Tax`, `Index`                     | **Bo `es`**                                             | `boxes` -> `Box`, `watches` -> `Watch`, `dishes` -> `Dish`            |
| **Tan cung Phu am + 'ies'**                                           | `categories`, `cities`, `companies`, `countries`, `faculties`, `stories`                 | `Category`, `City`, `Company`, `Country`, `Faculty`, `Story`                          | **Bo `ies` thay bang `y`**                              | `categories` -> `Category`, `cities` -> `City`                        |
| **Tan cung Nguyen am + 'ys' hoac '-ie'**                              | `days`, `boys`, `keys`, `movies`, `cookies`, `zombies`                                   | `Day`, `Boy`, `Key`, `Movie`, `Cookie`, `Zombie`                                      | **Chi bo `s`**                                          | `movies` -> `Movie`, `days` -> `Day`                                  |
| **Tan cung 'uses' (goc '-us')**                                       | `statuses`, `buses`, `campuses`, `viruses`, `bonuses`, `focuses`, `gases`                | `Status`, `Bus`, `Campus`, `Virus`, `Bonus`, `Focus`, `Gas`                           | **Bo `es`** (hoac giu nguyen `status` neu da la so it)  | `statuses` -> `Status`, `buses` -> `Bus`                              |
| **Tan cung '-ves'**                                                   | `leaves`, `shelves`, `halves`, `knives`, `lives`, `archives`, `drives`                   | `Leaf`, `Shelf`, `Half`, `Knife`, `Life`, `Archive`, `Drive`                          | `ves` -> `f`/`fe` (rieng tu cong nghe `-ve` chi bo `s`) | `leaves` -> `Leaf`, `knives` -> `Knife`, `archives` -> `Archive`      |
| **Bat quy tac (Irregular)**                                           | `people`, `children`, `criteria`, `quizzes`, `indices`, `matrices`, `men`, `women`       | `Person`, `Child`, `Criterion`, `Quiz`, `Index`, `Matrix`, `Man`, `Woman`             | **Tra cuu bang tu dien**                                | `people` -> `Person`, `children` -> `Child`, `quizzes` -> `Quiz`      |
| **Khong dem duoc / Giu nguyen**                                       | `data`, `information`, `equipment`, `feedback`, `money`, `software`, `news`, `series`    | `Data`, `Information`, `Equipment`, `Feedback`, `Money`, `Software`, `News`, `Series` | **Giu nguyen**                                          | `data` -> `Data`, `feedback` -> `Feedback`                            |
| **So nhieu quy tac chung (+s)**                                       | `students`, `subjects`, `books`, `orders`, `products`, `users`, `tickets`, `rooms`       | `Student`, `Subject`, `Book`, `Order`, `Product`, `User`, `Ticket`, `Room`            | **Bo `s`**                                              | `students` -> `Student`, `subjects` -> `Subject`                      |

---

### 9.2. Ma JavaScript chuan chuyen doi So it / So nhieu (Singularize & Pluralize)

Day la thuat toan da duoc tich hop truc tiep trong `khoi-tao.js` va `khoi-tao-jwt.js`:

```javascript
function singularize(word) {
  if (!word || typeof word !== "string") return "";
  const trimmed = word.trim();
  const lower = trimmed.toLowerCase();

  // 1. Bat quy tac
  const irregular = {
    people: "person",
    children: "child",
    criteria: "criterion",
    quizzes: "quiz",
    indices: "index",
    matrices: "matrix",
    men: "man",
    women: "woman",
    mice: "mouse",
  };
  if (irregular[lower]) return irregular[lower];

  // 2. Khong dem duoc
  const uncountable = new Set([
    "data",
    "information",
    "equipment",
    "feedback",
    "news",
    "software",
  ]);
  if (uncountable.has(lower)) return trimmed;

  // 3. Neu khong co 's' hoac tan cung 'ss'/'us' -> da la so it
  if (
    !lower.endsWith("s") ||
    lower.endsWith("ss") ||
    (lower.endsWith("us") && !lower.endsWith("uses"))
  ) {
    return trimmed;
  }

  // 4. statuses -> status, buses -> bus
  const specialUses = {
    statuses: "status",
    buses: "bus",
    campuses: "campus",
    gases: "gas",
  };
  if (specialUses[lower]) return specialUses[lower];

  // 5. classes -> class, addresses -> address
  if (lower.endsWith("sses")) return trimmed.slice(0, -2);

  // 6. movies -> movie (chi bo s); categories -> category (ies -> y)
  if (lower.endsWith("ies")) {
    if (["movies", "cookies", "zombies", "ties", "pies"].includes(lower))
      return trimmed.slice(0, -1);
    return trimmed.slice(0, -3) + "y";
  }

  // 7. leaves -> leaf, knives -> knife; archives -> archive
  if (lower.endsWith("ves")) {
    if (["leaves", "shelves", "halves", "wolves"].includes(lower))
      return trimmed.slice(0, -3) + "f";
    if (["knives", "wives", "lives"].includes(lower))
      return trimmed.slice(0, -3) + "fe";
    return trimmed.slice(0, -1); // archives -> archive, drives -> drive
  }

  // 8. dishes -> dish, boxes -> box, watches -> watch
  if (lower.endsWith("shes") || lower.endsWith("xes"))
    return trimmed.slice(0, -2);
  if (lower.endsWith("ches")) {
    if (lower.endsWith("caches") || lower.endsWith("niches"))
      return trimmed.slice(0, -1);
    return trimmed.slice(0, -2);
  }

  // 9. QUY TAC VANG: courses -> course, houses -> house, cases -> case, databases -> database
  // Goc tu von tan cung la 'se' -> CHI BO 's'
  if (lower.endsWith("ses")) return trimmed.slice(0, -1);

  // 10. Goc tu von tan cung la 'e': services -> service, devices -> device, dates -> date, roles -> role
  if (/(?:[cgtkdlnmprv]es)$/i.test(trimmed)) return trimmed.slice(0, -1);

  // 11. Quy tac mac dinh
  return trimmed.slice(0, -1);
}
```

---

## 10. CHIEN THUAT HYBRID: KET HOP MONGOOSE LEAN() VA JAVASCRIPT (MAP, FILTER, REDUCE, SORT, SLICE)

Trong phong thi Practical Exam (PE) mon SDN302, du lieu thuong chi tu **10 den 100 documents**. Khi gap cac de bai phuc tap (nhu loc theo so luong phan tu mang con da qua loc, tinh tong / trung binh da cap, xep loai phuc tap, tim kiem da truong), viec co viet cu phap MongoDB/Aggregation phuc tap (`$expr`, `$filter`, `$cond`, `$switch`, `$facet`) rat de bi:

- Sai cu phap `$`, `$$`, `$expr`.
- Nhieu loi kho debug vi MongoDB khong hien thi chi tiet tung buoc tinh toan.

**Chien thuat Hybrid (Query Lean -> Xu ly bang JavaScript thuan)** la phuong phap giai quyet cuc ky don gian, de hieu va luon hoat dong 100%:

### 10.1. Quy trinh 5 buoc cua Chien thuat Hybrid

```
[B1: Mongoose Query] -> [B2: Map] -> [B3: Filter] -> [B4: Sort] -> [B5: Slice (Phan trang)]
  find().lean()          Tinh toan     Loc dieu kien   Sap xep       Cat trang (page, limit)
```

> **Luu y toi quan trong**: Luon them `.lean()` o cuoi cau query Mongoose (vi du: `Model.find().lean()`).
> Lenh `.lean()` bien ket qua tra ve thanh Plain JavaScript Object thuan tuy, giup ban thoai mai them/sua truong, dung spread operator `{ ...item, newField: 123 }` ma khong bi Mongoose Schema chan lai.

---

### 10.2. Mau 1: Loc lop hoc theo so luong thanh vien tham gia (status === 'enrolled') bang map + filter

De bai: _Lay danh sach cac lop hoc co it nhat `minMembers` sinh vien co status la `enrolled`, kem theo ten mon hoc va tong so thanh vien cua lop:_

```javascript
const getClassesByActiveCount = async (req, res) => {
  try {
    const minMembers = Number(req.query.minMembers) || 1;

    // 1. Lay toan bo lop hoc kem lean() va populate
    const classes = await Class.find()
      .populate("subjectId", "name code")
      .populate("enrollments.studentId", "studentCode fullName email")
      .lean();

    // 2. DUNG MAP: Tinh toan cac truong can thiet cho tung lop
    const processed = classes.map((c) => {
      // Loc danh sach sinh vien dang theo hoc (status === 'enrolled')
      const activeList = (c.enrollments || []).filter(
        (e) => e.status === "enrolled",
      );

      return {
        ...c,
        activeCount: activeList.length, // So luong sinh vien dang hoc
        totalCount: (c.enrollments || []).length, // Tong so luong ghi danh
        activeEnrollments: activeList, // Danh sach chi tiet da loc
      };
    });

    // 3. DUNG FILTER: Loc cac lop co activeCount >= minMembers
    const matchedClasses = processed.filter((c) => c.activeCount >= minMembers);

    return res.status(200).json(matchedClasses);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
```

---

### 10.3. Mau 2: Quy trinh Controller hoan chinh (Filter da dieu kien + Map + Sort + Slice phan trang)

De bai: _Viet API GET `/api/classes` ho tro tim kiem theo keyword (ten lop hoac ten mon), loc so luong sinh vien toi thieu `minStudents`, sap xep tang/giam theo so luong sinh vien, va phan trang:_

```javascript
const getClassesWithSearchAndPagination = async (req, res) => {
  try {
    const {
      keyword,
      minStudents = 0,
      sortBy = "activeCount",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // 1. Query Mongoose co ban voi lean()
    let data = await Class.find()
      .populate("subjectId", "name code")
      .populate("enrollments.studentId", "studentCode fullName")
      .lean();

    // 2. MAP: Tinh toan thong tin bo sung
    data = data.map((item) => {
      const activeEnrollments = (item.enrollments || []).filter(
        (e) => e.status === "enrolled",
      );
      return {
        ...item,
        activeCount: activeEnrollments.length,
        totalEnrollments: (item.enrollments || []).length,
      };
    });

    // 3. FILTER: Loc theo keyword va minStudents
    const min = Number(minStudents);
    data = data.filter((item) => {
      // Kiem tra so luong thanh vien
      const matchMin = item.activeCount >= min;

      // Kiem tra keyword (khong phan biet hoa thuong)
      let matchKeyword = true;
      if (keyword) {
        const key = keyword.toLowerCase().trim();
        const className = (item.className || "").toLowerCase();
        const subjectName = (item.subjectId?.name || "").toLowerCase();
        const subjectCode = (item.subjectId?.code || "").toLowerCase();
        matchKeyword =
          className.includes(key) ||
          subjectName.includes(key) ||
          subjectCode.includes(key);
      }

      return matchMin && matchKeyword;
    });

    // 4. SORT: Sap xep linh hoat bang JavaScript
    data.sort((a, b) => {
      const valA = a[sortBy] ?? 0;
      const valB = b[sortBy] ?? 0;
      return order === "asc" ? valA - valB : valB - valA;
    });

    // 5. SLICE: Phan trang in-memory
    const totalDocs = data.length;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);
    const paginatedData = data.slice(
      (pageNum - 1) * limitNum,
      pageNum * limitNum,
    );

    return res.status(200).json({
      data: paginatedData,
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
```

---

### 10.4. Mau 3: Tinh toan Thong ke / Gom nhom bang reduce + map (Thay the $group)

De bai: _Tinh diem trung binh GPA cua tung sinh vien tren tat ca cac mon va xep loai:_

```javascript
const getStudentGpaRankings = async (req, res) => {
  try {
    // 1. Lay toan bo danh sach Grade
    const grades = await Grade.find()
      .populate("studentId", "studentCode fullName email")
      .populate("subjectId", "name code credits")
      .lean();

    // 2. DUNG REDUCE: Gom nhom theo studentId
    const groupedByStudent = grades.reduce((acc, item) => {
      const student = item.studentId;
      if (!student) return acc;
      const sId = String(student._id);

      if (!acc[sId]) {
        acc[sId] = {
          student: student,
          scores: [],
          totalCredits: 0,
        };
      }

      acc[sId].scores.push(item.score);
      acc[sId].totalCredits += item.subjectId?.credits || 1;
      return acc;
    }, {});

    // 3. DUNG MAP: Chuyen Object gom nhom thanh mang va tinh GPA
    const rankings = Object.values(groupedByStudent).map((entry) => {
      const totalScore = entry.scores.reduce((sum, s) => sum + s, 0);
      const gpa =
        entry.scores.length > 0 ? totalScore / entry.scores.length : 0;
      const roundedGpa = Number(gpa.toFixed(2));

      // Xep loai
      let rank = "Yeu";
      if (roundedGpa >= 8.5) rank = "Xuat sac";
      else if (roundedGpa >= 7.0) rank = "Gioi";
      else if (roundedGpa >= 5.0) rank = "Dat";

      return {
        student: entry.student,
        totalSubjects: entry.scores.length,
        gpa: roundedGpa,
        ranking: rank,
      };
    });

    // 4. Sap xep GPA cao nhat len dau
    rankings.sort((a, b) => b.gpa - a.gpa);

    return res.status(200).json(rankings);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
```

---

### 10.5. So sanh nhanh giua Mongoose Query / Aggregation va Chien thuat Hybrid

| Tieu chi                                | Mongoose Query / Aggregation Pipeline                        | Chien thuat Hybrid (Lean + JS Map/Filter)                        |
| :-------------------------------------- | :----------------------------------------------------------- | :--------------------------------------------------------------- |
| **Do de hieu & hoc thuoc**              | Kho, nhieu ky tu dac biet (`$expr`, `$$`, `$cond`, `$facet`) | **Rat de**, dung 100% cu phap JavaScript quen thuoc              |
| **Kha nang debug**                      | Kho console.log giua cac stage cua pipeline                  | **Rat de**, co the `console.log()` o moi buoc `map` hay `filter` |
| **Nguy co loi trong phong thi**         | Cao (neu nho sai cu phap se loi 500 ngay)                    | **Cuc thap**, JS thuan it khi bi loi cu phap                     |
| **Toc do tren du lieu PE (< 100 docs)** | ~3ms                                                         | ~4ms (khong co su khac biet ve mat trai nghiem)                  |
| **Phu hop phong thi PE**                | Khi de yeu cau bat buoc viet aggregation                     | **Khuyen dung cho moi bai toan loc / tinh toan logic phuc tap**  |

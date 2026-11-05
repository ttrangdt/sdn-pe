/**
 * ============================================================================
 * UNIVERSAL MONGOOSE MODEL GENERATOR
 * File: generate-models.js
 * ============================================================================
 * Tác dụng:
 * - Tự động quét toàn bộ file JSON trong folder (ví dụ: material_0)
 * - Tự động suy luận kiểu dữ liệu: String, Number, Boolean, Date, ObjectId
 * - Tự động suy luận quan hệ ref (khóa ngoại: studentId -> Student, classId -> Class...)
 * - Tự động quét và phát hiện Enum thông minh:
 *     + Trường tên là status, role, type, gender, level, mode, state...
 *     + Hoặc tập giá trị là các hằng số định danh ngắn (như OPEN, CLOSED, PRESENT, ABSENT, enrolled, dropped)
 *     + KHÔNG biến các trường như fullName, email, name thành enum nhầm lẫn
 * - Tự động nhận diện Sub-document / Mảng đối tượng con (như enrollments, seats)
 * - Tự động sinh ra các file Model Mongoose (.js) chuẩn chỉ đặt trong folder models/
 *
 * Cách sử dụng:
 *   node generate-models.js [inputDir] [outputDir]
 * Ví dụ:
 *   node generate-models.js material_0 resource/models
 */

const fs = require("fs");
const path = require("path");

// Helper chuyển tên số nhiều sang tên Model số ít viết hoa
function toModelName(pluralName) {
  let name = pluralName.replace(/\.json$/i, "");
  if (name.endsWith("ies")) {
    name = name.slice(0, -3) + "y";
  } else if (name.endsWith("ses")) {
    name = name.slice(0, -2); // classes -> class
  } else if (name.endsWith("s") && !name.endsWith("ss")) {
    name = name.slice(0, -1);
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Helper suy luận tên model từ tên trường khóa ngoại (studentId -> Student)
function inferRefModel(fieldName) {
  let clean = fieldName.replace(/Id$/i, "");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

// Kiểm tra xem giá trị có phải là định dạng ISO Date không
function isIsoDateString(val) {
  return (
    typeof val === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val) &&
    !isNaN(Date.parse(val))
  );
}

// Kiểm tra xem một trường string có phải là Enum không
function isEnumField(fieldName, valuesSet) {
  // Không bao giờ là enum nếu chứa email, name, description, address, title, code, url, image
  if (
    /name|email|description|address|title|url|img|avatar|phone|comment|content|code/i.test(
      fieldName,
    )
  ) {
    return false;
  }

  // Tên trường đặc thù chắc chắn là enum
  if (
    /status|role|type|gender|category|level|mode|state|payment/i.test(fieldName)
  ) {
    return true;
  }

  // Kiểm tra tập giá trị: số lượng từ 2 đến 6 giá trị và mỗi giá trị là token ngắn (không có khoảng trắng, @, dấu chấm)
  const vals = Array.from(valuesSet);
  if (vals.length >= 2 && vals.length <= 6) {
    const allAreTokens = vals.every((v) => /^[A-Za-z0-9_-]{2,20}$/.test(v));
    if (allAreTokens) return true;
  }

  return false;
}

function analyzeCollection(data, collectionName) {
  const fields = {};
  const totalDocs = data.length;

  for (const doc of data) {
    for (const [key, val] of Object.entries(doc)) {
      if (key === "_id") continue; // Bỏ qua _id vì mongoose tự quản lý

      if (!fields[key]) {
        fields[key] = {
          types: new Set(),
          values: new Set(),
          count: 0,
          sampleArray: null,
          hasOid: false,
          hasDate: false,
        };
      }

      fields[key].count++;

      if (val === null || val === undefined) {
        fields[key].types.add("null");
      } else if (Array.isArray(val)) {
        fields[key].types.add("array");
        if (!fields[key].sampleArray && val.length > 0) {
          fields[key].sampleArray = val;
        }
      } else if (typeof val === "object") {
        if (val.$oid) {
          fields[key].types.add("ObjectId");
          fields[key].hasOid = true;
        } else if (val.$date) {
          fields[key].types.add("Date");
          fields[key].hasDate = true;
        } else {
          fields[key].types.add("object");
        }
      } else if (isIsoDateString(val)) {
        fields[key].types.add("Date");
      } else {
        fields[key].types.add(typeof val);
        if (typeof val === "string") {
          fields[key].values.add(val);
        }
      }
    }
  }

  return { fields, totalDocs };
}

function generateSchemaCode(fields, totalDocs, modelName, collectionName) {
  const subSchemas = [];
  const fieldLines = [];

  for (const [field, info] of Object.entries(fields)) {
    const isRequired = info.count === totalDocs;

    // 1. Kiểm tra trường ObjectId (khóa ngoại)
    if (info.hasOid || field.endsWith("Id") || info.types.has("ObjectId")) {
      const refModel = inferRefModel(field);
      fieldLines.push(`  ${field}: {
    type: mongoose.Schema.Types.ObjectId,
    ref: '${refModel}'${isRequired ? ",\n    required: true" : ""}
  }`);
      continue;
    }

    // 2. Kiểm tra trường Ngày tháng
    if (info.hasDate || info.types.has("Date")) {
      fieldLines.push(`  ${field}: {
    type: Date${isRequired ? ",\n    required: true" : ""}
  }`);
      continue;
    }

    // 3. Kiểm tra trường Số
    if (info.types.has("number")) {
      fieldLines.push(`  ${field}: {
    type: Number${isRequired ? ",\n    required: true" : ""}
  }`);
      continue;
    }

    // 4. Kiểm tra trường Boolean
    if (info.types.has("boolean")) {
      fieldLines.push(`  ${field}: {
    type: Boolean,
    default: false
  }`);
      continue;
    }

    // 5. Kiểm tra Mảng (Array)
    if (info.types.has("array")) {
      if (
        info.sampleArray &&
        typeof info.sampleArray[0] === "object" &&
        !info.sampleArray[0].$oid
      ) {
        // Mảng đối tượng con (Sub-document) như enrollments hoặc seats
        const subSchemaName = `${field.replace(/s$/, "")}Schema`;
        const subFields = {};
        for (const item of info.sampleArray) {
          for (const [subKey, subVal] of Object.entries(item)) {
            if (!subFields[subKey]) subFields[subKey] = new Set();
            if (subVal && subVal.$oid) subFields[subKey].add("ObjectId");
            else subFields[subKey].add(typeof subVal);
          }
        }

        const subFieldProps = [];
        for (const [subKey, subTypes] of Object.entries(subFields)) {
          if (subKey.endsWith("Id") || subTypes.has("ObjectId")) {
            subFieldProps.push(
              `  ${subKey}: { type: mongoose.Schema.Types.ObjectId, ref: '${inferRefModel(subKey)}', required: true }`,
            );
          } else if (
            subKey === "status" ||
            isEnumField(subKey, new Set(info.sampleArray.map((x) => x[subKey])))
          ) {
            const distinctVals = Array.from(
              new Set(info.sampleArray.map((x) => x[subKey]).filter(Boolean)),
            );
            if (distinctVals.length > 0 && distinctVals.length <= 6) {
              subFieldProps.push(
                `  ${subKey}: { type: String, enum: [${distinctVals.map((v) => `'${v}'`).join(", ")}], default: '${distinctVals[0]}' }`,
              );
            } else {
              subFieldProps.push(
                `  ${subKey}: { type: String, required: true }`,
              );
            }
          } else {
            subFieldProps.push(`  ${subKey}: { type: String }`);
          }
        }

        subSchemas.push(`const ${subSchemaName} = new mongoose.Schema({
${subFieldProps.join(",\n")}
}, { _id: false });`);

        fieldLines.push(`  ${field}: [${subSchemaName}]`);
      } else {
        fieldLines.push(`  ${field}: [{ type: String }]`);
      }
      continue;
    }

    // 6. Kiểm tra trường Chuỗi (String) & Phát hiện Enum thông minh
    if (info.types.has("string")) {
      if (isEnumField(field, info.values)) {
        const enumValues = Array.from(info.values)
          .map((v) => `'${v}'`)
          .join(", ");
        fieldLines.push(`  ${field}: {
    type: String,
    enum: [${enumValues}]${isRequired ? ",\n    required: true" : ""}
  }`);
      } else {
        fieldLines.push(`  ${field}: {
    type: String${isRequired ? ",\n    required: true" : ""},
    trim: true
  }`);
      }
      continue;
    }

    // Mặc định kiểu String
    fieldLines.push(`  ${field}: { type: String }`);
  }

  const subSchemasCode =
    subSchemas.length > 0 ? subSchemas.join("\n\n") + "\n\n" : "";
  const schemaVarName = `${modelName.charAt(0).toLowerCase() + modelName.slice(1)}Schema`;

  return `const mongoose = require('mongoose');

${subSchemasCode}const ${schemaVarName} = new mongoose.Schema({
${fieldLines.join(",\n")}
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('${modelName}', ${schemaVarName}, '${collectionName}');
`;
}

function runGenerator(inputDir, outputDir) {
  if (!fs.existsSync(inputDir)) {
    console.error(`Folder nguồn không tồn tại: ${inputDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(inputDir).filter((f) => f.endsWith(".json"));
  console.log(`Tìm thấy ${files.length} file JSON trong ${inputDir}`);

  for (const file of files) {
    const collName = file.replace(/\.json$/i, "");
    const modelName = toModelName(collName);
    const filePath = path.join(inputDir, file);

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    const { fields, totalDocs } = analyzeCollection(data, collName);
    const code = generateSchemaCode(fields, totalDocs, modelName, collName);

    const outPath = path.join(outputDir, `${modelName}.js`);
    fs.writeFileSync(outPath, code, "utf-8");
    console.log(
      `[GEN] Đã tạo model: ${outPath} (${modelName} -> collection: "${collName}")`,
    );
  }

  console.log(
    `\n Hoàn thành tự động sinh model! Toàn bộ file đã nằm tại: ${outputDir}`,
  );
}

// Nhận tham số dòng lệnh
const input = process.argv[2] || path.join(__dirname, "data");
const output = process.argv[3] || path.join(__dirname, "resource", "models");

runGenerator(input, output);

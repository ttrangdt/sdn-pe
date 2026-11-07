const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const isSeedRequested = process.argv.includes('--seed');
const isSeedOnly = process.argv.includes('--seed-only');

function isProtectedPath(targetPath) {
  if (!targetPath) return false;
  const resolved = path.resolve(targetPath).toLowerCase();
  return resolved.includes('sdn302_given');
}

function safeWriteFileSync(filePath, content, encoding = 'utf-8') {
  if (isProtectedPath(filePath)) {
    console.error(`[CHAN] Bao ve SDN302_given: Khong duoc ghi vao ${filePath}`);
    return false;
  }
  if (path.basename(filePath).toLowerCase() === 'package-lock.json') {
    console.error(`[CHAN] Bao ve package-lock.json: Khong duoc phep ghi de package-lock.json!`);
    return false;
  }
  fs.writeFileSync(filePath, content, encoding);
  return true;
}

function safeMkdirSync(dirPath) {
  if (isProtectedPath(dirPath)) {
    console.error(`[CHAN] Bao ve SDN302_given: Khong duoc tao thu muc trong ${dirPath}`);
    return false;
  }
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return true;
}

function safeUnlinkSync(filePath) {
  if (isProtectedPath(filePath)) {
    console.error(`[CHAN] Bao ve SDN302_given: Khong duoc xoa file trong ${filePath}`);
    return false;
  }
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

const possibleInputDirs = [
  args[0],
  path.join(process.cwd(), 'material_0'),
  path.join(process.cwd(), 'data'),
  path.join(__dirname, 'material_0'),
  path.join(__dirname, 'data'),
  path.join(__dirname, '..', 'material_0'),
  path.join(__dirname, '..', 'data')
].filter(Boolean);

let inputDir = null;
for (const dir of possibleInputDirs) {
  if (isProtectedPath(dir)) continue;
  if (fs.existsSync(dir) && fs.readdirSync(dir).some(f => f.endsWith('.json'))) {
    inputDir = dir;
    break;
  }
}

const possibleResourceDirs = [
  args[1],
  path.join(process.cwd(), 'resource'),
  fs.existsSync(path.join(process.cwd(), 'dal')) ? process.cwd() : null,
  path.join(__dirname, 'resource'),
  fs.existsSync(path.join(__dirname, 'dal')) ? __dirname : null,
  path.join(__dirname, '..', 'resource')
].filter(Boolean);

let resourceDir = null;
for (const dir of possibleResourceDirs) {
  if (isProtectedPath(dir)) continue;

  if (fs.existsSync(dir) && (fs.existsSync(path.join(dir, 'package.json')) || fs.existsSync(path.join(dir, 'server.js')))) {
    resourceDir = dir;
    break;
  }
}

if (!inputDir) {
  console.error('[ERROR] Khong tim thay thu muc chua file .json (vi du: material_0)!');
  console.log('[HINT] Hay dat thu muc material_0 cung cap voi khoi-tao.js hoac truyen tham so: node khoi-tao.js <path_to_material_0>');
  process.exit(1);
}

if (!resourceDir) {
  const fallback = path.join(process.cwd(), 'resource');
  if (!isProtectedPath(fallback)) {
    resourceDir = fallback;
    safeMkdirSync(resourceDir);
  }
}

if (!resourceDir || isProtectedPath(resourceDir) || isProtectedPath(process.cwd())) {
  console.error('[ERROR] Phat hien thu muc dich hoac thu muc thuc thi la "SDN302_given"!');
  console.error('[BAO VE] Thu muc "SDN302_given" la thu muc goc cua de thi, duoc bao ve tuyet doi!');
  console.error('[BAO VE] Nghiem cam thay the hay chinh sua package.json, package-lock.json hoac bat ky file nao trong SDN302_given!');
  console.log('[HUONG DAN] Hay tao mot thu muc lam bai rieng (vi du: test1, work,...) roi copy material_0 va resource vao do de lam bai.');
  process.exit(1);
}

console.log('=== SDN302 FRAMEWORK INITIALIZER ===');
console.log(`[INFO] Input JSON:  ${path.resolve(inputDir)}`);
console.log(`[INFO] Resource:    ${path.resolve(resourceDir)}\n`);

function matchCase(target, source) {
  if (!source) return target;
  if (source === source.toUpperCase()) return target.toUpperCase();
  if (source.charAt(0) === source.charAt(0).toUpperCase()) {
    return target.charAt(0).toUpperCase() + target.slice(1);
  }
  return target;
}

function singularize(word) {
  if (!word || typeof word !== 'string') return '';
  const trimmed = word.trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();

  // 1. Danh tu bat quy tac (Irregular Nouns)
  const irregularMap = {
    people: 'person',
    children: 'child',
    men: 'man',
    women: 'woman',
    spokesmen: 'spokesman',
    spokeswomen: 'spokeswoman',
    criteria: 'criterion',
    indices: 'index',
    indexes: 'index',
    matrices: 'matrix',
    vertices: 'vertex',
    analyses: 'analysis',
    diagnoses: 'diagnosis',
    theses: 'thesis',
    crises: 'crisis',
    phenomena: 'phenomenon',
    curricula: 'curriculum',
    quizzes: 'quiz',
    quizes: 'quiz',
    mice: 'mouse',
    geese: 'goose',
    teeth: 'tooth',
    feet: 'foot',
    oxen: 'ox'
  };

  if (irregularMap[lower]) {
    return matchCase(irregularMap[lower], trimmed);
  }

  // 2. Danh tu khong dem duoc hoac dang so it giong so nhieu (Uncountable / Same form)
  const uncountable = new Set([
    'data',
    'information',
    'equipment',
    'feedback',
    'money',
    'traffic',
    'software',
    'hardware',
    'metadata',
    'news',
    'series',
    'species',
    'police'
  ]);

  if (uncountable.has(lower)) {
    return trimmed;
  }

  // 3. Neu khong ket thuc bang 's', tu von da la so it
  if (!lower.endsWith('s')) {
    return trimmed;
  }

  // 4. Neu ket thuc bang 'ss' (class, address, access, process, business, pass, boss) -> da la so it
  if (lower.endsWith('ss')) {
    return trimmed;
  }

  // 5. Neu ket thuc bang 'us' ma khong phai 'uses' (status, campus, virus, focus, bonus) -> da la so it
  if (lower.endsWith('us') && !lower.endsWith('uses')) {
    return trimmed;
  }

  // 6. Danh tu co dang so nhieu 'uses' (statuses -> status, buses -> bus, campuses -> campus)
  const specialUses = {
    statuses: 'status',
    buses: 'bus',
    campuses: 'campus',
    viruses: 'virus',
    bonuses: 'bonus',
    focuses: 'focus',
    gases: 'gas',
    gasses: 'gas'
  };
  if (specialUses[lower]) {
    return matchCase(specialUses[lower], trimmed);
  }

  // 7. Ket thuc bang 'sses' (classes -> class, addresses -> address, glasses -> glass)
  if (lower.endsWith('sses')) {
    return trimmed.slice(0, -2);
  }

  // 8. Ket thuc bang 'ies'
  if (lower.endsWith('ies')) {
    const ieWords = ['movies', 'cookies', 'zombies', 'ties', 'pies', 'lies'];
    if (ieWords.includes(lower)) {
      return trimmed.slice(0, -1); // movies -> movie
    }
    const isUpper = trimmed.slice(-1) === trimmed.slice(-1).toUpperCase();
    return trimmed.slice(0, -3) + (isUpper ? 'Y' : 'y'); // categories -> category
  }

  // 9. Ket thuc bang 'ves'
  if (lower.endsWith('ves')) {
    const fWords = {
      leaves: 'leaf',
      shelves: 'shelf',
      halves: 'half',
      wolves: 'wolf',
      calves: 'calf',
      loaves: 'loaf',
      thieves: 'thief'
    };
    if (fWords[lower]) {
      return matchCase(fWords[lower], trimmed);
    }
    const feWords = {
      knives: 'knife',
      wives: 'wife',
      lives: 'life'
    };
    if (feWords[lower]) {
      return matchCase(feWords[lower], trimmed);
    }
    return trimmed.slice(0, -1); // archives -> archive, drives -> drive, saves -> save
  }

  // 10. Ket thuc bang 'shes' (dishes -> dish, wishes -> wish)
  if (lower.endsWith('shes')) {
    return trimmed.slice(0, -2);
  }

  // 11. Ket thuc bang 'ches'
  if (lower.endsWith('ches')) {
    if (lower.endsWith('caches') || lower.endsWith('niches') || lower.endsWith('aches')) {
      return trimmed.slice(0, -1); // caches -> cache, niches -> niche
    }
    return trimmed.slice(0, -2); // watches -> watch, matches -> match, branches -> branch
  }

  // 12. Ket thuc bang 'xes' (boxes -> box, taxes -> tax, fixes -> fix)
  if (lower.endsWith('xes')) {
    return trimmed.slice(0, -2);
  }

  // 13. Ket thuc bang 'zes'
  if (lower.endsWith('zes')) {
    if (lower.endsWith('quizzes') || lower.endsWith('quizes')) {
      return matchCase('quiz', trimmed);
    }
    return trimmed.slice(0, -1); // sizes -> size, prizes -> prize
  }

  // 14. Ket thuc bang 'oes' (heroes -> hero, potatoes -> potato, tomatoes -> tomato)
  if (lower.endsWith('oes')) {
    return trimmed.slice(0, -2);
  }

  // 15. QUY TAC DUOI 'ses' (courses -> course, houses -> house, cases -> case, databases -> database)
  // Goc tu von tan cung la 'se', khi so nhieu chi them 's' -> khi sang so it CHỈ BỎ 's'
  if (lower.endsWith('ses')) {
    return trimmed.slice(0, -1);
  }

  // 16. Cac tu co goc tan cung la 'e' (services -> service, devices -> device, pages -> page, dates -> date, roles -> role)
  if (/(?:[cgtkdlnmprv]es)$/i.test(trimmed)) {
    return trimmed.slice(0, -1);
  }

  // 17. Quy tac tong quat cho danh tu so nhieu them 's'
  return trimmed.slice(0, -1);
}

function pluralize(word) {
  if (!word || typeof word !== 'string') return '';
  const trimmed = word.trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();

  const irregularPlural = {
    person: 'people',
    child: 'children',
    man: 'men',
    woman: 'women',
    spokesman: 'spokesmen',
    spokeswoman: 'spokeswomen',
    criterion: 'criteria',
    index: 'indices',
    matrix: 'matrices',
    vertex: 'vertices',
    analysis: 'analyses',
    diagnosis: 'diagnoses',
    thesis: 'theses',
    crisis: 'crises',
    phenomenon: 'phenomena',
    curriculum: 'curricula',
    quiz: 'quizzes',
    mouse: 'mice',
    goose: 'geese',
    tooth: 'teeth',
    foot: 'feet',
    oxen: 'oxen'
  };

  if (irregularPlural[lower]) {
    return matchCase(irregularPlural[lower], trimmed);
  }

  const uncountable = new Set([
    'data', 'information', 'equipment', 'feedback', 'money', 'traffic',
    'software', 'hardware', 'metadata', 'news', 'series', 'species', 'police'
  ]);

  if (uncountable.has(lower)) {
    return trimmed;
  }

  const usWords = {
    bus: 'buses',
    gas: 'gases',
    status: 'statuses',
    campus: 'campuses',
    virus: 'viruses',
    bonus: 'bonuses',
    focus: 'focuses'
  };
  if (usWords[lower]) {
    return matchCase(usWords[lower], trimmed);
  }

  // Neu da la so nhieu
  if (lower.endsWith('courses') || lower.endsWith('classes') || lower.endsWith('categories') || lower.endsWith('students') || lower.endsWith('subjects')) {
    return trimmed;
  }

  // ss, sh, ch, x, z -> them es
  if (lower.endsWith('ss') || lower.endsWith('sh') || lower.endsWith('ch') || lower.endsWith('x') || lower.endsWith('z')) {
    return trimmed + 'es';
  }

  // Phu am + y -> ies
  if (/[bcdfghjklmnpqrstvwxyz]y$/i.test(trimmed)) {
    return trimmed.slice(0, -1) + (trimmed.slice(-1) === 'Y' ? 'IES' : 'ies');
  }

  // fe / f -> ves
  const fMap = {
    life: 'lives', knife: 'knives', wife: 'wives', leaf: 'leaves',
    shelf: 'shelves', half: 'halves', wolf: 'wolves', thief: 'thieves'
  };
  if (fMap[lower]) {
    return matchCase(fMap[lower], trimmed);
  }

  return trimmed + 's';
}

function toModelName(pluralName) {
  let name = pluralName.replace(/\.json$/i, '').trim();
  const sing = singularize(name);
  return sing.charAt(0).toUpperCase() + sing.slice(1);
}

function toCamelCase(str) {
  const model = toModelName(str);
  return model.charAt(0).toLowerCase() + model.slice(1);
}

function inferRefModel(fieldName) {
  const clean = fieldName.replace(/Id$/i, '');
  return toModelName(clean);
}

function isIsoDateString(val) {
  return typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val) && !isNaN(Date.parse(val));
}

function analyzeCollection(data, collectionName) {
  const fields = {};
  const totalDocs = data.length;

  for (const doc of data) {
    for (const [key, val] of Object.entries(doc)) {
      if (key === '_id') continue;

      if (!fields[key]) {
        fields[key] = {
          types: new Set(),
          count: 0,
          sampleArray: null,
          hasOid: false,
          hasDate: false
        };
      }

      fields[key].count++;

      if (val === null || val === undefined) {
        fields[key].types.add('null');
      } else if (Array.isArray(val)) {
        fields[key].types.add('array');
        if (!fields[key].sampleArray && val.length > 0) {
          fields[key].sampleArray = val;
        }
      } else if (typeof val === 'object') {
        if (val.$oid) {
          fields[key].types.add('ObjectId');
          fields[key].hasOid = true;
        } else if (val.$date) {
          fields[key].types.add('Date');
          fields[key].hasDate = true;
        } else {
          fields[key].types.add('object');
        }
      } else if (isIsoDateString(val)) {
        fields[key].types.add('Date');
      } else {
        fields[key].types.add(typeof val);
      }
    }
  }

  return { fields, totalDocs };
}

function generateModelCode(fields, totalDocs, modelName, collectionName) {
  const subSchemas = [];
  const fieldLines = [];
  const refFields = [];

  for (const [field, info] of Object.entries(fields)) {
    const isRequired = info.count === totalDocs;

    if (info.hasOid || field.endsWith('Id') || info.types.has('ObjectId')) {
      const refModel = inferRefModel(field);
      refFields.push(field);
      fieldLines.push(`  ${field}: {
    type: mongoose.Schema.Types.ObjectId,
    ref: '${refModel}'${isRequired ? ',\n    required: true' : ''}
  }`);
      continue;
    }

    if (info.hasDate || info.types.has('Date')) {
      fieldLines.push(`  ${field}: {
    type: Date${isRequired ? ',\n    required: true' : ''}
  }`);
      continue;
    }

    if (info.types.has('number')) {
      fieldLines.push(`  ${field}: {
    type: Number${isRequired ? ',\n    required: true' : ''}
  }`);
      continue;
    }

    if (info.types.has('boolean')) {
      fieldLines.push(`  ${field}: {
    type: Boolean,
    default: false
  }`);
      continue;
    }

    if (info.types.has('array')) {
      if (info.sampleArray && typeof info.sampleArray[0] === 'object' && !info.sampleArray[0].$oid) {
        const subSchemaName = `${toCamelCase(field)}Schema`;
        const subFields = {};

        for (const item of info.sampleArray) {
          for (const [subKey, subVal] of Object.entries(item)) {
            if (!subFields[subKey]) subFields[subKey] = new Set();
            if (subVal && subVal.$oid) subFields[subKey].add('ObjectId');
            else subFields[subKey].add(typeof subVal);
          }
        }

        const subFieldProps = [];
        for (const [subKey, subTypes] of Object.entries(subFields)) {
          if (subKey.endsWith('Id') || subTypes.has('ObjectId')) {
            const subRefModel = inferRefModel(subKey);
            refFields.push(`${field}.${subKey}`);
            subFieldProps.push(`  ${subKey}: { type: mongoose.Schema.Types.ObjectId, ref: '${subRefModel}', required: true }`);
          } else {
            subFieldProps.push(`  ${subKey}: { type: String }`);
          }
        }

        subSchemas.push(`const ${subSchemaName} = new mongoose.Schema({
${subFieldProps.join(',\n')}
}, { _id: false });`);

        fieldLines.push(`  ${field}: [${subSchemaName}]`);
      } else {
        fieldLines.push(`  ${field}: [{ type: String }]`);
      }
      continue;
    }

    if (info.types.has('string')) {
      fieldLines.push(`  ${field}: {
    type: String${isRequired ? ',\n    required: true' : ''},
    trim: true
  }`);
      continue;
    }

    fieldLines.push(`  ${field}: { type: String }`);
  }

  const subSchemasCode = subSchemas.length > 0 ? subSchemas.join('\n\n') + '\n\n' : '';
  const schemaVarName = `${modelName.charAt(0).toLowerCase() + modelName.slice(1)}Schema`;

  const code = `const mongoose = require('mongoose');

${subSchemasCode}const ${schemaVarName} = new mongoose.Schema({
${fieldLines.join(',\n')}
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('${modelName}', ${schemaVarName}, '${collectionName}');
`;

  return { code, refFields };
}

function generateControllerCode(modelName, camelName, collectionName, refFields) {
  let populateChain = '';
  if (refFields && refFields.length > 0) {
    populateChain = refFields.map(f => `\n      .populate('${f}')`).join('');
  }

  return `const mongoose = require('mongoose');
const ${modelName} = require('../models/${camelName}.model');

const getAll = async (req, res) => {
  try {
    const list = await ${modelName}.find(req.query)${populateChain};
    return res.status(200).json(list);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: \`Invalid ${modelName} ID: \${id}\` });
    }

    const item = await ${modelName}.findById(id)${populateChain};
    if (!item) {
      return res.status(404).json({ error: \`${modelName} with id = \${id} not found\` });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const newItem = await ${modelName}.create(req.body);
    return res.status(201).json(newItem);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: \`Invalid ${modelName} ID: \${id}\` });
    }

    const updated = await ${modelName}.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ error: \`${modelName} with id = \${id} not found\` });
    }

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: \`Invalid ${modelName} ID: \${id}\` });
    }

    const deleted = await ${modelName}.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: \`${modelName} with id = \${id} not found\` });
    }

    return res.status(200).json({ message: \`${modelName} deleted successfully\` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteItem
};
`;
}

function generateRouteCode(modelName, camelName) {
  return `const express = require('express');
const router = express.Router();
const controller = require('../controllers/${camelName}.controller');

// Mac dinh comment san cac route CRUD de tranh bi de hoac trung lap voi de thi PE.
// Khi can su dung route nao, hay bo comment o route do:
// router.get('/', controller.getAll);
// router.get('/:id', controller.getById);
// router.post('/', controller.create);
// router.put('/:id', controller.update);
// router.delete('/:id', controller.deleteItem);

module.exports = router;
`;
}

function generateServerCode(modelsMeta) {
  const routeImports = modelsMeta.map(m => `const ${m.camelName}Route = require('./routes/${m.camelName}.route');`).join('\n');
  const routeUses = modelsMeta.map(m => `app.use('/api/${m.collectionName}', ${m.camelName}Route);`).join('\n');
  const logEndpoints = modelsMeta.map(m => `      console.log(' - http://localhost:' + PORT + '/api/${m.collectionName}');`).join('\n');

  return `const express = require('express');
const morgan = require('morgan');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const { connectDb } = require('./dal/database');

${routeImports}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

try {
  const cors = require('cors');
  app.use(cors());
} catch (e) {}

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'SDN302 Exam API Server is ready',
    endpoints: [
${modelsMeta.map(m => `      '/api/${m.collectionName}'`).join(',\n')}
    ]
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Welcome to SDN302 RESTful API Server' });
});

${routeUses}

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 9999;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/databaseName';

(async () => {
  try {
    await connectDb(MONGO_URI);
    app.listen(PORT, () => {
      console.log('\\n====================================================');
      console.log(\`  Server running at: http://localhost:\${PORT}\`);
      console.log('====================================================');
      console.log('Available API Endpoints:');
${logEndpoints}
      console.log('====================================================\\n');
    });
  } catch (error) {
    console.error('[ERROR] Cannot start server:', error.message);
    process.exit(1);
  }
})();

module.exports = app;
`;
}

function generateMarkdownRelationships(modelsMeta, relationships) {
  const toMermaidEntity = name => {
    const upper = name.toUpperCase();
    const reserved = ['CLASS', 'ONE', 'MANY', 'TO', 'U', 'STYLE', 'CLICK', 'GRAPH', 'END', 'DEFAULT', 'TITLE'];
    return reserved.includes(upper) ? `${upper}_ENTITY` : upper;
  };

  let mermaid = '```mermaid\nerDiagram\n';
  const entityDefs = [];

  for (const meta of modelsMeta) {
    const entityName = toMermaidEntity(meta.modelName);
    const fieldsList = Object.entries(meta.fields).map(([fname, finfo]) => {
      let t = 'string';
      if (finfo.hasOid || fname.endsWith('Id') || finfo.types.has('ObjectId')) t = 'ObjectId';
      else if (finfo.hasDate || finfo.types.has('Date')) t = 'Date';
      else if (finfo.types.has('number')) t = 'number';
      else if (finfo.types.has('boolean')) t = 'boolean';
      else if (finfo.types.has('array')) t = 'array';
      return `        ${t} ${fname}`;
    }).slice(0, 8);

    entityDefs.push(`    ${entityName} {\n${fieldsList.join('\n')}\n    }`);
  }

  mermaid += entityDefs.join('\n\n') + '\n\n';

  for (const rel of relationships) {
    const from = toMermaidEntity(rel.fromModel);
    const to = toMermaidEntity(rel.toModel);
    mermaid += `    ${from} }o--|| ${to} : "${rel.field}"\n`;
  }
  mermaid += '```\n';

  let relTable = '| Collection goc | Truong khoa ngoai (Field) | Tham chieu Model | Collection dich | Quan he | Ghi chu |\n';
  relTable += '| :--- | :--- | :--- | :--- | :--- | :--- |\n';
  if (relationships.length === 0) {
    relTable += '| Khong phat hien khoa ngoai truc tiep | - | - | - | - | - |\n';
  } else {
    for (const rel of relationships) {
      relTable += `| **${rel.fromCollection}** | \`${rel.field}\` | **${rel.toModel}** | \`${rel.toCollection}\` | N - 1 | ${rel.isSubdoc ? 'Khoa ngoai trong Sub-document' : 'Khoa ngoai truc tiep'} |\n`;
    }
  }

  let collectionsDetail = '';
  for (const meta of modelsMeta) {
    collectionsDetail += `\n### Collection: \`${meta.collectionName}\` (Model: \`${meta.modelName}\`)\n`;
    collectionsDetail += `- **So luong ban ghi mau**: ${meta.totalDocs} documents\n`;
    collectionsDetail += `- **API Endpoint**: \`http://localhost:9999/api/${meta.collectionName}\`\n\n`;

    collectionsDetail += '| Truong (Field) | Kieu du lieu (Type) | Bat buoc (Required) | Tham chieu (Ref) |\n';
    collectionsDetail += '| :--- | :--- | :---: | :--- |\n';

    for (const [fName, fInfo] of Object.entries(meta.fields)) {
      let t = Array.from(fInfo.types).filter(x => x !== 'null').join(' / ') || 'String';
      if (fInfo.hasOid || fName.endsWith('Id')) t = 'ObjectId';
      if (fInfo.hasDate) t = 'Date';
      const req = fInfo.count === meta.totalDocs ? 'Co' : 'Khong';
      let refStr = '-';
      if (fInfo.hasOid || fName.endsWith('Id') || fInfo.types.has('ObjectId')) {
        refStr = `\`ref: '${inferRefModel(fName)}'\``;
      }
      collectionsDetail += `| \`${fName}\` | \`${t}\` | ${req} | ${refStr} |\n`;
    }
  }

  let apiTable = '| Method | Endpoint | Controller | Route | Model |\n';
  apiTable += '| :---: | :--- | :--- | :--- | :--- |\n';
  for (const meta of modelsMeta) {
    apiTable += `| \`GET\` | \`/api/${meta.collectionName}\` | \`${meta.camelName}.controller.js\` | \`${meta.camelName}.route.js\` | \`${meta.camelName}.model.js\` |\n`;
    apiTable += `| \`GET\` | \`/api/${meta.collectionName}/:id\` | \`${meta.camelName}.controller.js\` | \`${meta.camelName}.route.js\` | \`${meta.camelName}.model.js\` |\n`;
    apiTable += `| \`POST\` | \`/api/${meta.collectionName}\` | \`${meta.camelName}.controller.js\` | \`${meta.camelName}.route.js\` | \`${meta.camelName}.model.js\` |\n`;
    apiTable += `| \`PUT\` | \`/api/${meta.collectionName}/:id\` | \`${meta.camelName}.controller.js\` | \`${meta.camelName}.route.js\` | \`${meta.camelName}.model.js\` |\n`;
    apiTable += `| \`DELETE\` | \`/api/${meta.collectionName}/:id\` | \`${meta.camelName}.controller.js\` | \`${meta.camelName}.route.js\` | \`${meta.camelName}.model.js\` |\n`;
  }

  return `# BAN DO LIEN KET DU LIEU & KIEN TRUC HE THONG (SDN302)

> File nay duoc tu dong phan tich va sinh boi khoi-tao.js dua tren du lieu mau tu \`${inputDir}\`.

---

## 1. So do thuc the lien ket (ERD)

${mermaid}

---

## 2. Bang ma tran quan he (Foreign Keys)

${relTable}

---

## 3. Danh muc API CRUD mau

${apiTable}

---

## 4. Chi tiet cau truc tung Collection

${collectionsDetail}

---

## 5. Cu phap Mongoose tham khao

### Truy van kem Populate:
\`\`\`javascript
const data = await Model.find().populate('studentId');

const data = await Class.findById(classId).populate('enrollments.studentId');

const data = await Attendance.find({ studentId }).populate({
  path: 'classId',
  populate: { path: 'subjectId' }
});
\`\`\`

### Kiem tra ObjectId hop le:
\`\`\`javascript
const mongoose = require('mongoose');
if (!mongoose.Types.ObjectId.isValid(id)) {
  return res.status(400).json({ error: \`Invalid ID: \${id}\` });
}
\`\`\`
`;
}

function transformBson(val, mongooseInstance) {
  if (val === null || val === undefined) return val;
  if (Array.isArray(val)) {
    return val.map(item => transformBson(item, mongooseInstance));
  }
  if (typeof val === 'object') {
    if (val.$oid) {
      return mongooseInstance ? new mongooseInstance.Types.ObjectId(val.$oid) : val.$oid;
    }
    if (val.$date) {
      return new Date(val.$date);
    }
    const result = {};
    for (const [k, v] of Object.entries(val)) {
      result[k] = transformBson(v, mongooseInstance);
    }
    return result;
  }
  return val;
}

async function runSeeder(targetInputDir, targetResourceDir) {
  console.log('\n--- NAP DU LIEU VAO MONGODB (--seed) ---');

  let mongoose, dotenv;
  try {
    mongoose = require('mongoose');
    dotenv = require('dotenv');
  } catch (e) {
    const nodeModulesPath = path.join(targetResourceDir, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      try {
        mongoose = require(path.join(nodeModulesPath, 'mongoose'));
        dotenv = require(path.join(nodeModulesPath, 'dotenv'));
      } catch (err) {}
    }
  }

  if (!mongoose) {
    console.log('[WARN] Chua cai dat node_modules trong resource.');
    console.log('[HINT] Chay "cd resource && npm install" roi chay lai "node khoi-tao.js --seed"');
    return;
  }

  const envPath = path.join(targetResourceDir, '.env');
  if (fs.existsSync(envPath) && dotenv) {
    dotenv.config({ path: envPath });
  }

  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/su26db';
  console.log('[INFO] Connecting to MongoDB:', uri);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('[INFO] MongoDB connected.');

    const jsonFiles = fs.readdirSync(targetInputDir).filter(f => f.endsWith('.json'));
    const db = mongoose.connection.db;
    const summary = [];

    for (const file of jsonFiles) {
      const collName = file.replace(/\.json$/i, '');
      const filePath = path.join(targetInputDir, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const docs = transformBson(JSON.parse(raw), mongoose);

      const collection = db.collection(collName);
      await collection.deleteMany({});
      if (docs.length > 0) {
        await collection.insertMany(docs);
      }
      summary.push({ Collection: collName, Documents: docs.length, Status: 'Imported' });
    }

    console.table(summary);
    console.log('[INFO] Seed completed.\n');
    await mongoose.disconnect();
  } catch (err) {
    console.log('[WARN] Cannot connect to MongoDB:', err.message);
  }
}

async function main() {
  const jsonFiles = fs.readdirSync(inputDir).filter(f => f.endsWith('.json'));
  if (jsonFiles.length === 0) {
    console.error(`[ERROR] Khong tim thay file .json trong: ${inputDir}`);
    process.exit(1);
  }

  console.log(`[INFO] Found ${jsonFiles.length} JSON files: ${jsonFiles.join(', ')}\n`);

  const modelsDir = path.join(resourceDir, 'models');
  const controllersDir = path.join(resourceDir, 'controllers');
  const routesDir = path.join(resourceDir, 'routes');

  [modelsDir, controllersDir, routesDir].forEach(d => {
    safeMkdirSync(d);
  });

  try {
    const oldModels = fs.readdirSync(modelsDir).filter(f => !f.endsWith('.model.js'));
    oldModels.forEach(f => safeUnlinkSync(path.join(modelsDir, f)));
    const oldControllers = fs.readdirSync(controllersDir).filter(f => !f.endsWith('.controller.js'));
    oldControllers.forEach(f => safeUnlinkSync(path.join(controllersDir, f)));
    const oldRoutes = fs.readdirSync(routesDir).filter(f => !f.endsWith('.route.js'));
    oldRoutes.forEach(f => safeUnlinkSync(path.join(routesDir, f)));
  } catch (e) {}

  const modelsMeta = [];
  const relationships = [];

  console.log('--- 1. MODELS (resource/models/<object>.model.js) ---');
  for (const file of jsonFiles) {
    const collName = file.replace(/\.json$/i, '');
    const modelName = toModelName(collName);
    const camelName = toCamelCase(collName);
    const filePath = path.join(inputDir, file);

    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);

    const { fields, totalDocs } = analyzeCollection(data, collName);
    const { code, refFields } = generateModelCode(fields, totalDocs, modelName, collName);

    const outPath = path.join(modelsDir, `${camelName}.model.js`);
    safeWriteFileSync(outPath, code, 'utf-8');
    console.log(` [OK] models/${camelName}.model.js`);

    modelsMeta.push({
      modelName,
      camelName,
      collectionName: collName,
      fields,
      totalDocs,
      refFields
    });
  }

  for (const meta of modelsMeta) {
    for (const ref of meta.refFields) {
      const isSubdoc = ref.includes('.');
      const fieldPart = isSubdoc ? ref.split('.')[1] : ref;
      const targetModel = inferRefModel(fieldPart);
      const targetMeta = modelsMeta.find(m => m.modelName.toLowerCase() === targetModel.toLowerCase());

      relationships.push({
        fromModel: meta.modelName,
        fromCollection: meta.collectionName,
        field: ref,
        toModel: targetModel,
        toCollection: targetMeta ? targetMeta.collectionName : pluralize(targetModel.toLowerCase()),
        isSubdoc
      });
    }
  }

  console.log('\n--- 2. CONTROLLERS (resource/controllers/<object>.controller.js) ---');
  for (const meta of modelsMeta) {
    const controllerCode = generateControllerCode(meta.modelName, meta.camelName, meta.collectionName, meta.refFields);
    const standardPath = path.join(controllersDir, `${meta.camelName}.controller.js`);
    safeWriteFileSync(standardPath, controllerCode, 'utf-8');
    console.log(` [OK] controllers/${meta.camelName}.controller.js`);
  }

  console.log('\n--- 3. ROUTES (resource/routes/<object>.route.js) ---');
  for (const meta of modelsMeta) {
    const routeCode = generateRouteCode(meta.modelName, meta.camelName);
    const outPath = path.join(routesDir, `${meta.camelName}.route.js`);
    safeWriteFileSync(outPath, routeCode, 'utf-8');
    console.log(` [OK] routes/${meta.camelName}.route.js (/api/${meta.collectionName})`);
  }

  console.log('\n--- 4. SERVER (resource/server.js) ---');
  const serverPath = path.join(resourceDir, 'server.js');
  const serverCode = generateServerCode(modelsMeta);
  safeWriteFileSync(serverPath, serverCode, 'utf-8');
  console.log(` [OK] server.js`);

  console.log('\n--- 5. DOCUMENTATION (LIEN_KET_DU_LIEU.md) ---');
  const markdownReport = generateMarkdownRelationships(modelsMeta, relationships);
  const reportDir = path.dirname(resourceDir);
  const reportPath = isProtectedPath(reportDir) ? path.join(process.cwd(), 'LIEN_KET_DU_LIEU.md') : path.join(reportDir, 'LIEN_KET_DU_LIEU.md');
  safeWriteFileSync(reportPath, markdownReport, 'utf-8');
  console.log(` [OK] LIEN_KET_DU_LIEU.md`);

  if (isSeedRequested || isSeedOnly) {
    await runSeeder(inputDir, resourceDir);
  } else {
    console.log('\n[INFO] Chay "node khoi-tao.js --seed" neu muon nap du lieu vao MongoDB.');
  }

  console.log('\n=== KHOI TAO HOAN TAT ===');
  console.log(`1. Tai lieu lien ket: ${path.basename(reportPath)}`);
  console.log(`2. Thu muc code:      ${path.relative(process.cwd(), resourceDir)}`);
  console.log('3. Chay server:       npm start (hoac nodemon server.js)\n');
}

main().catch(err => {
  console.error('[ERROR] Initialization failed:', err);
  process.exit(1);
});

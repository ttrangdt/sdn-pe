const http = require('http');

const PORT = process.env.PORT || 9999;
const BASE_URL = `http://localhost:${PORT}`;

function request(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = { ...headers };
    let bodyData = null;

    if (body) {
      bodyData = JSON.stringify(body);
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(bodyData);
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: reqHeaders
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);
    if (bodyData) {
      req.write(bodyData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('  STARTING TEST SUITE FOR SDN302 PAPER 2 (su26db)   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message, details = '') {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      if (details) console.error('   Details:', details);
      failed++;
    }
  }

  try {
    // Test Root
    const rootRes = await request('GET', '/');
    assert(rootRes.status === 200, 'Root endpoint / returns 200 OK');

    // ==========================================
    // Question 1: GET /api/classes/:classId/students?status=enrolled
    // ==========================================
    console.log('\n--- Question 1: Retrieve Students by Class ---');

    // 1.1 Invalid ObjectId -> 400
    const q1InvalidId = await request('GET', '/api/classes/65bb000000000000000000/students?status=enrolled');
    assert(q1InvalidId.status === 400, 'Q1: Invalid classId returns 400');
    assert(q1InvalidId.data.error === 'Invalid classId: 65bb000000000000000000', 'Q1: 400 message matches');

    // 1.2 Class Not Found -> 404
    const q1NotFound = await request('GET', '/api/classes/65bb00000000000000000099/students?status=enrolled');
    assert(q1NotFound.status === 404, 'Q1: Class not found returns 404');
    assert(q1NotFound.data.error === 'Class with id = 65bb00000000000000000099 not found', 'Q1: 404 message matches');

    // 1.3 Invalid status -> 400
    const q1InvalidStatus = await request('GET', '/api/classes/65bb00000000000000000001/students?status=active');
    assert(q1InvalidStatus.status === 400, 'Q1: Invalid status returns 400');
    assert(q1InvalidStatus.data.error === 'Invalid status: active', 'Q1: Invalid status message matches');

    // 1.4 Success (enrolled) -> 200
    const q1Success = await request('GET', '/api/classes/65bb00000000000000000001/students?status=enrolled');
    assert(q1Success.status === 200, 'Q1: Valid query returns 200 OK');
    assert(Array.isArray(q1Success.data) && q1Success.data.length === 3, 'Q1: Returns 3 enrolled students');
    assert(q1Success.data[0].id === '65dd00000000000000000001', 'Q1: Output id is renamed from _id');
    assert(q1Success.data[0].studentCode === 'SE001', 'Q1: studentCode is SE001');
    assert(q1Success.data[0].fullName === 'Nguyen Van An', 'Q1: fullName matches');
    assert(q1Success.data[0].email === 'anvn@fpt.edu.vn', 'Q1: email matches');
    console.log('Q1 Output Sample:', JSON.stringify(q1Success.data[0], null, 2));

    // ==========================================
    // Question 2: GET /api/classes/:classId/attendance-summary
    // ==========================================
    console.log('\n--- Question 2: Attendance Statistics by Class ---');

    // 2.1 Invalid ObjectId -> 400
    const q2InvalidId = await request('GET', '/api/classes/65bb000000000000000000/attendance-summary');
    assert(q2InvalidId.status === 400, 'Q2: Invalid classId returns 400');
    assert(q2InvalidId.data.error === 'Invalid classId: 65bb000000000000000000', 'Q2: 400 message matches');

    // 2.2 Class Not Found -> 404
    const q2NotFound = await request('GET', '/api/classes/65bb00000000000000000099/attendance-summary');
    assert(q2NotFound.status === 404, 'Q2: Class not found returns 404');
    assert(q2NotFound.data.error === 'Class with id = 65bb00000000000000000099 not found', 'Q2: 404 message matches');

    // 2.3 Success -> 200
    const q2Success = await request('GET', '/api/classes/65bb00000000000000000001/attendance-summary');
    assert(q2Success.status === 200, 'Q2: Valid class returns 200 OK');
    assert(Array.isArray(q2Success.data) && q2Success.data.length === 3, 'Q2: Returns summary for 3 enrolled students');
    
    const se001 = q2Success.data.find(s => s.studentCode === 'SE001');
    assert(se001 && se001.totalSessions === 10, 'Q2: SE001 totalSessions is 10');
    assert(se001 && se001.present === 9 && se001.absent === 1, 'Q2: SE001 present=9, absent=1');
    assert(se001 && se001.attendanceRate === 90, 'Q2: SE001 attendanceRate is 90.0%');
    assert(se001 && se001.warning === false, 'Q2: SE001 warning is false');

    const se002 = q2Success.data.find(s => s.studentCode === 'SE002');
    assert(se002 && se002.attendanceRate === 70 && se002.warning === true, 'Q2: SE002 rate=70.0% and warning is true (<80%)');
    console.log('Q2 Output Sample:', JSON.stringify(q2Success.data, null, 2));

    // ==========================================
    // Question 3: GET /api/students/:studentId/attendances
    // ==========================================
    console.log('\n--- Question 3: Retrieve Attendance History of a Student ---');

    // 3.1 Invalid ObjectId -> 400
    const q3InvalidId = await request('GET', '/api/students/65dd000000000000000000/attendances');
    assert(q3InvalidId.status === 400, 'Q3: Invalid studentId returns 400');
    assert(q3InvalidId.data.error === 'Invalid studentId: 65dd000000000000000000', 'Q3: 400 message matches');

    // 3.2 Student Not Found -> 404
    const q3NotFound = await request('GET', '/api/students/65dd00000000000000000099/attendances');
    assert(q3NotFound.status === 404, 'Q3: Student not found returns 404');
    assert(q3NotFound.data.error === 'Student with id = 65dd00000000000000000099 not found', 'Q3: 404 message matches');

    // 3.3 Success -> 200
    const q3Success = await request('GET', '/api/students/65dd00000000000000000001/attendances');
    assert(q3Success.status === 200, 'Q3: Valid student returns 200 OK');
    assert(Array.isArray(q3Success.data) && q3Success.data.length > 0, 'Q3: Returns attendance records array');
    assert(q3Success.data[0].id !== undefined, 'Q3: Output id field present');
    assert(q3Success.data[0].className === 'SE1701', 'Q3: Populated className is SE1701');
    assert(q3Success.data[0].subjectName === 'Project Management', 'Q3: Populated subjectName is Project Management');
    assert(q3Success.data[0].date !== undefined && q3Success.data[0].status !== undefined, 'Q3: Date and status present');
    
    // Check sorting descending
    const d1 = new Date(q3Success.data[0].date).getTime();
    const d2 = new Date(q3Success.data[1].date).getTime();
    assert(d1 >= d2, 'Q3: Results are sorted descending by date');
    console.log('Q3 Output Sample:', JSON.stringify(q3Success.data[0], null, 2));

    // ==========================================
    // Question 4: POST /api/classes/:classId/attendances
    // ==========================================
    console.log('\n--- Question 4: Bulk Attendance Entry with Upsert ---');

    // 4.1 Future date -> 400
    const q4Future = await request('POST', '/api/classes/65bb00000000000000000001/attendances', {}, {
      date: '2099-01-01',
      records: [
        { studentId: '65dd00000000000000000001', status: 'PRESENT' }
      ]
    });
    assert(q4Future.status === 400, 'Q4: Future date returns 400 Bad Request');
    assert(q4Future.data.error === 'Date cannot be in the future', 'Q4: Future date message matches');

    // 4.2 Missing enrolled student in records -> 400
    const q4MissingStudent = await request('POST', '/api/classes/65bb00000000000000000001/attendances', {}, {
      date: '2026-03-15',
      records: [
        { studentId: '65dd00000000000000000001', status: 'PRESENT' },
        { studentId: '65dd00000000000000000002', status: 'PRESENT' }
        // Missing SE003 (Le Van Cuong)
      ]
    });
    assert(q4MissingStudent.status === 400, 'Q4: Missing enrolled student returns 400');
    assert(q4MissingStudent.data.error.includes('Missing attendance for student SE003'), 'Q4: Missing student message contains studentCode');

    // 4.3 Student not in class -> 400
    const q4NotInClass = await request('POST', '/api/classes/65bb00000000000000000001/attendances', {}, {
      date: '2026-03-15',
      records: [
        { studentId: '65dd00000000000000000001', status: 'PRESENT' },
        { studentId: '65dd00000000000000000002', status: 'PRESENT' },
        { studentId: '65dd00000000000000000003', status: 'ABSENT' },
        { studentId: '65dd00000000000000000099', status: 'PRESENT' }
      ]
    });
    assert(q4NotInClass.status === 400, 'Q4: Student not in class returns 400');
    assert(q4NotInClass.data.error === 'Student 65dd00000000000000000099 does not belong to class', 'Q4: Student not in class message matches');

    // 4.4 Fresh submission -> 201 Created (date: 2026-03-15)
    // First, let's delete any existing 2026-03-15 records for clean test
    const q4Fresh = await request('POST', '/api/classes/65bb00000000000000000001/attendances', {}, {
      date: '2026-03-15',
      records: [
        { studentId: '65dd00000000000000000001', status: 'PRESENT' },
        { studentId: '65dd00000000000000000002', status: 'PRESENT' },
        { studentId: '65dd00000000000000000003', status: 'ABSENT' }
      ]
    });
    assert(q4Fresh.status === 201, 'Q4: Fresh submission returns 201 Created');
    assert(q4Fresh.data.message === 'Attendance recorded successfully', 'Q4: Message matches');
    assert(q4Fresh.data.totalRecords === 3, 'Q4: totalRecords is 3');
    assert(q4Fresh.data.present === 2 && q4Fresh.data.absent === 1, 'Q4: present=2, absent=1');
    console.log('Q4 Fresh Output:', JSON.stringify(q4Fresh.data, null, 2));

    // 4.5 Re-submission (Overwrite / Upsert) -> 201 Created with updatedCount = 3
    const q4Resubmit = await request('POST', '/api/classes/65bb00000000000000000001/attendances', {}, {
      date: '2026-03-15',
      records: [
        { studentId: '65dd00000000000000000001', status: 'PRESENT' },
        { studentId: '65dd00000000000000000002', status: 'PRESENT' },
        { studentId: '65dd00000000000000000003', status: 'ABSENT' }
      ]
    });
    assert(q4Resubmit.status === 201, 'Q4: Re-submission returns 201 Created');
    assert(q4Resubmit.data.updatedCount === 3, 'Q4: Overwritten count (updatedCount) is 3');
    console.log('Q4 Re-submission Output:', JSON.stringify(q4Resubmit.data, null, 2));

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed.`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
}

runTests();


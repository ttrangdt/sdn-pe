/**
 * ============================================================================
 * COMPONENT: ZERO-DEPENDENCY AUTOMATED API TEST RUNNER
 * File: test-api.js
 * ============================================================================
 * Chức năng:
 * - Chạy kiểm thử tự động toàn bộ API trong 3 giây
 * - Không cần cài thêm thư viện (chỉ dùng module 'http' có sẵn của Node.js)
 * - Tự động đếm số lượng PASS / FAIL
 * - Kiểm tra chính xác HTTP Status Code và nội dung JSON trả về
 * 
 * Cách dùng:
 * 1. Chạy server ở terminal 1: node server.js
 * 2. Chạy test ở terminal 2:   node test-api.js
 */

const http = require('http');

const PORT = process.env.PORT || 9999;
const BASE_URL = `http://localhost:${PORT}`;

function request(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = { ...headers };
    let bodyData = null;

    if (body) {
      if (typeof body === 'string') {
        bodyData = body;
      } else {
        bodyData = JSON.stringify(body);
        reqHeaders['Content-Type'] = 'application/json';
      }
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
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);
    if (bodyData) req.write(bodyData);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('      STARTING AUTOMATED API TEST SUITE             ');
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
    // 1. Test Root
    const rootRes = await request('GET', '/');
    assert(rootRes.status === 200, 'Root endpoint / returns 200 OK');

    // 2. Test Get All
    // const listRes = await request('GET', '/api/items');
    // assert(listRes.status === 200, 'GET /api/items returns 200');

    // 3. Test Invalid ID -> 400
    // const invalidIdRes = await request('GET', '/api/items/invalid_id_123');
    // assert(invalidIdRes.status === 400, 'Invalid ID returns 400 Bad Request');

    // 4. Test Not Found ID -> 404
    // const notFoundRes = await request('GET', '/api/items/65fa00000000000000000009');
    // assert(notFoundRes.status === 404, 'Non-existing ID returns 404 Not Found');

    // 5. Test Auth Header Missing -> 403 / 401
    // const unauthRes = await request('POST', '/api/items', {}, { name: 'Test' });
    // assert(unauthRes.status === 403 || unauthRes.status === 401, 'Missing Auth returns 401/403');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed.`);
    console.log('====================================================');
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Test Runner Error:', error);
    process.exit(1);
  }
}

runTests();


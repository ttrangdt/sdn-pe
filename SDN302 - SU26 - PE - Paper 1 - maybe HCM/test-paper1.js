const http = require('http');

const PORT = process.env.PORT || 5000;
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
      res.on('data', (chunk) => { data += chunk; });
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
    if (bodyData) {
      req.write(bodyData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('   STARTING AUTOMATED TESTS FOR SDN302 PAPER 1      ');
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

  let jwtToken = '';
  let testManufacturerId = '';

  try {
    // ==========================================
    // Task 02.1: Authentication & JWT Generation
    // ==========================================
    console.log('--- Task 02: Generate JWT & Protected API ---');

    // Test invalid credentials
    const invalidTokenRes = await request('POST', '/auth/tokens', {}, { name: 'soldier', pass: 'wrongpass' });
    assert(invalidTokenRes.status === 401, 'Token generation with wrong password returns 401');

    // Test valid credentials (soldier / 123456789)
    const validTokenRes = await request('POST', '/auth/tokens', {}, { name: 'soldier', pass: '123456789' });
    assert(validTokenRes.status === 200, 'Token generation with valid credentials returns 200');
    assert(validTokenRes.data && validTokenRes.data.token, 'Response contains JWT token string');
    jwtToken = validTokenRes.data.token;
    console.log('Generated JWT:', jwtToken.substring(0, 30) + '...');

    // Also test GET /auth/tokens with query params
    const getTokenRes = await request('GET', '/auth/tokens?name=soldier&pass=123456789');
    assert(getTokenRes.status === 200, 'GET /auth/tokens also successfully returns token');

    // ==========================================
    // Task 02.2: JWT Protected Manufacturers API
    // ==========================================
    // Request without token -> 401
    const noTokenRes = await request('GET', '/api/manufacturers');
    assert(noTokenRes.status === 401, 'GET /api/manufacturers without token returns 401');

    // Request with token -> 200
    const listRes = await request('GET', '/api/manufacturers', { Authorization: `Bearer ${jwtToken}` });
    assert(listRes.status === 200, 'GET /api/manufacturers with valid token returns 200');
    assert(Array.isArray(listRes.data) && listRes.data.length >= 4, 'Returns array of manufacturers');
    console.log(`Found ${listRes.data.length} manufacturers in DB`);

    // GET /api/manufacturers/:id
    const symaId = listRes.data.find(m => m.manufacturer === 'Syma')._id;
    const getOneRes = await request('GET', `/api/manufacturers/${symaId}`, { Authorization: `Bearer ${jwtToken}` });
    assert(getOneRes.status === 200 && getOneRes.data.manufacturer === 'Syma', 'GET /api/manufacturers/:id returns single manufacturer');

    // POST /api/manufacturers (Create new)
    const createRes = await request('POST', '/api/manufacturers', { Authorization: `Bearer ${jwtToken}` }, {
      manufacturer: 'Bell Helicopter',
      isAsia: false
    });
    assert(createRes.status === 201, 'POST /api/manufacturers creates new manufacturer (201 Created)');
    assert(createRes.data.manufacturer === 'Bell Helicopter', 'Created manufacturer name matches');
    testManufacturerId = createRes.data._id;

    // PUT /api/manufacturers/:id (Update)
    const updateRes = await request('PUT', `/api/manufacturers/${testManufacturerId}`, { Authorization: `Bearer ${jwtToken}` }, {
      manufacturer: 'Bell Textron Inc',
      isAsia: false
    });
    assert(updateRes.status === 200, 'PUT /api/manufacturers/:id updates manufacturer');
    assert(updateRes.data.manufacturer === 'Bell Textron Inc', 'Updated manufacturer name matches');

    // DELETE /api/manufacturers/:id (CRITICAL RULE: Cannot delete if has associated helicopters)
    const deleteSymaRes = await request('DELETE', `/api/manufacturers/${symaId}`, { Authorization: `Bearer ${jwtToken}` });
    assert(deleteSymaRes.status === 400, 'DELETE manufacturer with associated helicopters rejected (400)');
    assert(deleteSymaRes.data.message === 'Cannot delete manufacturer because it has associated Helicopters', 'Exact error message matches');

    // DELETE manufacturer WITHOUT associated helicopters -> 200 OK
    const deleteBellRes = await request('DELETE', `/api/manufacturers/${testManufacturerId}`, { Authorization: `Bearer ${jwtToken}` });
    assert(deleteBellRes.status === 200, 'DELETE manufacturer without helicopters succeeds (200)');

    // ==========================================
    // Task 03: Client Web Application (EJS Views)
    // ==========================================
    console.log('\n--- Task 03: Web Client & Helicopter Management ---');

    // 1. Authentication View
    const loginPageRes = await request('GET', '/auth/access');
    assert(loginPageRes.status === 200, 'GET /auth/access renders login page');
    assert(typeof loginPageRes.data === 'string' && loginPageRes.data.includes('Member Login'), 'Login HTML contains "Member Login"');

    // Unauthenticated access to /management/helicopters redirects to /auth/access
    const unauthHeliRes = await request('GET', '/management/helicopters');
    assert(unauthHeliRes.status === 302 && unauthHeliRes.headers.location === '/auth/access', 'Unauthenticated request to /management/helicopters redirects to /auth/access');

    // Perform Login via POST /auth/access to get session cookie
    const loginFormBody = 'name=soldier&pass=123456789';
    const loginPostRes = await request('POST', '/auth/access', {
      'Content-Type': 'application/x-www-form-urlencoded'
    }, loginFormBody);
    assert(loginPostRes.status === 302, 'POST /auth/access succeeds and redirects');
    assert(loginPostRes.headers.location === '/management/helicopters', 'Redirects to /management/helicopters');

    const sessionCookie = loginPostRes.headers['set-cookie'] ? loginPostRes.headers['set-cookie'][0].split(';')[0] : '';
    assert(sessionCookie.length > 0, 'Session cookie received upon login');

    // 2. Display Helicopter List (Card View)
    const heliListRes = await request('GET', '/management/helicopters', { Cookie: sessionCookie });
    assert(heliListRes.status === 200, 'GET /management/helicopters with session returns 200 OK');
    assert(typeof heliListRes.data === 'string', 'Returns HTML content');
    assert(heliListRes.data.includes('card h-100'), 'Uses Card View (card h-100)');
    assert(heliListRes.data.includes('USD'), 'Displays Price in USD');
    assert(heliListRes.data.includes('65.8 USD'), 'Calculated USD price matches example (65.8 USD for 1709887)');
    assert(heliListRes.data.includes('Adult (Male)') || heliListRes.data.includes('gender-male'), 'Adult indicator displayed');
    assert(heliListRes.data.includes('Add New Helicopter'), 'Modal trigger button present');

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


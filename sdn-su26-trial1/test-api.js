const http = require('http');

const BASE_URL = 'http://localhost:9999';

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
  console.log('--- STARTING COMPREHENSIVE API TESTS ---');
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
    assert(rootRes.status === 200, 'Root endpoint / returns 200', rootRes.data);

    // ==========================================
    // Question 1: GET /api/rooms
    // ==========================================
    console.log('\n--- Question 1: Retrieve All Rooms (Sorted) ---');
    const q1Res = await request('GET', '/api/rooms');
    assert(q1Res.status === 200, 'Q1: Status is 200 OK');
    assert(Array.isArray(q1Res.data) && q1Res.data.length === 5, 'Q1: Returns 5 rooms');
    assert(q1Res.data[0].name === 'Room E', 'Q1: Sorted descending - first room is Room E');
    assert(q1Res.data[0].id === '65fb00000000000000000005', 'Q1: Room E id matches');
    assert(q1Res.data[0].totalSeats === 6, 'Q1: Room E totalSeats is 6');
    assert(q1Res.data[0].vipCount === 3, 'Q1: Room E vipCount is 3');
    assert(q1Res.data[4].name === 'Room A', 'Q1: Sorted descending - last room is Room A');
    console.log('Q1 Room E output:', JSON.stringify(q1Res.data[0], null, 2));

    // ==========================================
    // Question 2: GET /api/movies/:movieId
    // ==========================================
    console.log('\n--- Question 2: Movie Details with Showtimes ---');
    // 2.1 Invalid ObjectId -> 400
    const q2Invalid = await request('GET', '/api/movies/65fa000000000000000000');
    assert(q2Invalid.status === 400, 'Q2: Invalid ObjectId returns 400');
    assert(q2Invalid.data.error === 'Invalid movieId: 65fa000000000000000000', 'Q2: Exact 400 error message matches');

    // 2.2 Not Found -> 404
    const q2NotFound = await request('GET', '/api/movies/65fa00000000000000000009');
    assert(q2NotFound.status === 404, 'Q2: Movie not found returns 404');
    assert(q2NotFound.data.error === 'Movie with id: 65fa00000000000000000009 not found', 'Q2: Exact 404 error message matches');

    // 2.3 Success -> 200
    const q2Success = await request('GET', '/api/movies/65fa00000000000000000001');
    assert(q2Success.status === 200, 'Q2: Valid movie returns 200 OK');
    assert(q2Success.data.title === 'Avengers', 'Q2: Title is Avengers');
    assert(q2Success.data.duration === 180, 'Q2: Duration is 180');
    assert(q2Success.data.description === 'Superheroes assemble to save the world.', 'Q2: Description matches');
    assert(Array.isArray(q2Success.data.showtimes) && q2Success.data.showtimes.length === 3, 'Q2: 3 showtimes populated');
    assert(q2Success.data.showtimes[0].roomName === 'Room A', 'Q2: First showtime roomName is Room A');
    console.log('Q2 Success output:', JSON.stringify(q2Success.data, null, 2));

    // ==========================================
    // Question 3: POST /api/showtimes
    // ==========================================
    console.log('\n--- Question 3: Create Showtime (Admin Only) ---');
    // 3.1 No access_key -> 403
    const q3NoKey = await request('POST', '/api/showtimes', {}, { movieId: '1', roomId: '1', startTime: '2026-03-10T19:00:00.000Z', price: 95000 });
    assert(q3NoKey.status === 403, 'Q3: No access_key returns 403');
    assert(q3NoKey.data.error === 'No access key', 'Q3: 403 No access key message matches');

    // 3.2 Invalid access_key -> 403
    const q3InvalidKey = await request('POST', '/api/showtimes', { access_key: 'wrong_key' }, { movieId: '1', roomId: '1', startTime: '2026-03-10T19:00:00.000Z', price: 95000 });
    assert(q3InvalidKey.status === 403, 'Q3: Invalid access_key returns 403');
    assert(q3InvalidKey.data.error === 'Invalid or unauthorized access key', 'Q3: 403 Invalid access key message matches');

    // 3.3 Customer access_key (non-admin) -> 403
    const q3CustKey = await request('POST', '/api/showtimes', { access_key: 'cust_key_a' }, { movieId: '1', roomId: '1', startTime: '2026-03-10T19:00:00.000Z', price: 95000 });
    assert(q3CustKey.status === 403, 'Q3: Non-admin access_key returns 403');
    assert(q3CustKey.data.error === 'Admin access required', 'Q3: 403 Admin access required message matches');

    // 3.4 Missing fields -> 400
    const q3MissingFields = await request('POST', '/api/showtimes', { access_key: 'admin_key_1' }, { movieId: '65fa00000000000000000001' });
    assert(q3MissingFields.status === 400, 'Q3: Missing fields returns 400');
    assert(q3MissingFields.data.error === 'movieId, roomId, startTime, price required', 'Q3: 400 Fields required message matches');

    // 3.5 Overlapping showtime -> 409
    const q3Overlap = await request('POST', '/api/showtimes', { access_key: 'admin_key_1' }, {
      movieId: '65fa00000000000000000001',
      roomId: '65fb00000000000000000001',
      startTime: '2026-03-10T19:00:00.000Z',
      price: 95000
    });
    assert(q3Overlap.status === 409, 'Q3: Overlapping showtime returns 409 Conflict');
    assert(q3Overlap.data.error === 'Showtime overlaps with existing', 'Q3: 409 Overlap message matches');

    // 3.6 Valid non-overlapping showtime -> 201
    const q3Created = await request('POST', '/api/showtimes', { access_key: 'admin_key_1' }, {
      movieId: '65fa00000000000000000001',
      roomId: '65fb00000000000000000001',
      startTime: '2026-06-10T19:00:00.000Z',
      price: 95000
    });
    assert(q3Created.status === 201, 'Q3: Valid showtime returns 201 Created');
    assert(q3Created.data.price === 95000, 'Q3: Price is 95000');
    assert(q3Created.data.endTime === '2026-06-10T22:00:00.000Z', 'Q3: EndTime calculated correctly (+180 mins)');
    console.log('Q3 Created output:', JSON.stringify(q3Created.data, null, 2));

    // ==========================================
    // Question 4: GET /api/reports/revenue
    // ==========================================
    console.log('\n--- Question 4: Revenue Report (Admin Only) ---');
    // 4.1 No access_key -> 403
    const q4NoKey = await request('GET', '/api/reports/revenue');
    assert(q4NoKey.status === 403, 'Q4: No access_key returns 403');
    assert(q4NoKey.data.error === 'No access key', 'Q4: 403 No access key message matches');

    // 4.2 Invalid access_key -> 403
    const q4InvalidKey = await request('GET', '/api/reports/revenue', { access_key: 'wrong_key' });
    assert(q4InvalidKey.status === 403, 'Q4: Invalid access_key returns 403');
    assert(q4InvalidKey.data.error === 'Invalid or unauthorized access key', 'Q4: 403 Invalid access key message matches');

    // 4.3 Customer access_key (non-admin) -> 403
    const q4CustKey = await request('GET', '/api/reports/revenue', { access_key: 'cust_key_a' });
    assert(q4CustKey.status === 403, 'Q4: Non-admin access_key returns 403');
    assert(q4CustKey.data.error === 'Admin access required', 'Q4: 403 Admin access required message matches');

    // 4.4 Success -> 200
    const q4Success = await request('GET', '/api/reports/revenue', { access_key: 'admin_key_1' });
    assert(q4Success.status === 200, 'Q4: Valid admin returns 200 OK');
    assert(Array.isArray(q4Success.data), 'Q4: Response is array');
    console.log('Q4 Revenue report output:', JSON.stringify(q4Success.data, null, 2));

    const avengers = q4Success.data.find(r => r.movieTitle === 'Avengers');
    assert(avengers && avengers.ticketCount === 3 && avengers.revenue === 270000, 'Q4: Avengers has 3 tickets and 270000 revenue');

    const avatar = q4Success.data.find(r => r.movieTitle === 'Avatar');
    assert(avatar && avatar.ticketCount === 1 && avatar.revenue === 100000, 'Q4: Avatar has 1 ticket and 100000 revenue');

    console.log('\n==========================================');
    console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed.`);
    console.log('==========================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

runTests();


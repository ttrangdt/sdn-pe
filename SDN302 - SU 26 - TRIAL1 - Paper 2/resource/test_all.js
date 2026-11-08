const http = require('http');

const BASE_URL = 'http://localhost:9999';

function request(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n================ BAT DAU KIEM TRA 4 CAU HOI DE THI ================\n');

  let passed = 0;
  let total = 0;

  function assert(name, condition, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASS] ${name}`);
    } else {
      console.error(`[FAIL] ${name} -> ${details}`);
    }
  }

  // --- QUESTION 1 ---
  console.log('--- Question 1: Retrieve Active Movies ---');
  {
    // Q1.1: 200 OK
    const res = await request('GET', '/api/movies?status=NOW_SHOWING');
    assert('Q1.1: status 200', res.status === 200, `Got status ${res.status}`);
    assert('Q1.1: is array', Array.isArray(res.data), 'Not an array');
    assert('Q1.1: first movie has id, title, duration, genre', 
      res.data[0] && res.data[0].id && res.data[0].title === 'Avengers' && res.data[0].duration === 180,
      JSON.stringify(res.data[0])
    );
    assert('Q1.1: renamed id instead of _id', res.data[0] && !res.data[0]._id, 'Still has _id');

    // Q1.2: 400 Bad Request (Invalid status)
    const resBad = await request('GET', '/api/movies?status=SHOWING_ABC');
    assert('Q1.2: status 400 for invalid status', resBad.status === 400, `Got status ${resBad.status}`);
    assert('Q1.2: error message', resBad.data?.error === 'Invalid status: SHOWING_ABC', JSON.stringify(resBad.data));

    // Q1.3: 400 Bad Request (Missing status)
    const resMissing = await request('GET', '/api/movies');
    assert('Q1.3: status 400 for missing status', resMissing.status === 400, `Got status ${resMissing.status}`);
  }

  // --- QUESTION 2 ---
  console.log('\n--- Question 2: Retrieve Showtimes for a Movie ---');
  {
    // Q2.1: 400 Bad Request (Invalid ObjectId)
    const resBadId = await request('GET', '/api/movies/65fa000000000000000000/showtimes');
    assert('Q2.1: status 400 for invalid ObjectId', resBadId.status === 400, `Got status ${resBadId.status}`);
    assert('Q2.1: error message', resBadId.data?.error === 'Invalid movieId: 65fa000000000000000000', JSON.stringify(resBadId.data));

    // Q2.2: 404 Not Found (Non-existent movie)
    const resNotFound = await request('GET', '/api/movies/65fa00000000000000000009/showtimes');
    assert('Q2.2: status 404 for not found', resNotFound.status === 404, `Got status ${resNotFound.status}`);
    assert('Q2.2: error message', resNotFound.data?.error === 'Movie with id = 65fa00000000000000000009 not found', JSON.stringify(resNotFound.data));

    // Q2.3: 200 OK (Valid movie)
    const resOk = await request('GET', '/api/movies/65fa00000000000000000001/showtimes');
    assert('Q2.3: status 200', resOk.status === 200, `Got status ${resOk.status}`);
    assert('Q2.3: includes roomName', resOk.data[0] && resOk.data[0].roomName === 'Room A', JSON.stringify(resOk.data[0]));
    assert('Q2.3: id instead of _id', resOk.data[0] && resOk.data[0].id === '65fc00000000000000000001', JSON.stringify(resOk.data[0]));
    assert('Q2.3: has startTime, endTime, price', resOk.data[0]?.price === 90000, JSON.stringify(resOk.data[0]));
  }

  // --- QUESTION 3 ---
  console.log('\n--- Question 3: Retrieve Seat Availability by Showtime ---');
  {
    // Q3.1: 400 Bad Request (Invalid ObjectId)
    const resBadId = await request('GET', '/api/showtimes/65fc000000000000000000/seats');
    assert('Q3.1: status 400 for invalid ObjectId', resBadId.status === 400, `Got status ${resBadId.status}`);
    assert('Q3.1: error message', resBadId.data?.error === 'Invalid showtimeId: 65fc000000000000000000', JSON.stringify(resBadId.data));

    // Q3.2: 404 Not Found (Non-existent showtime)
    const resNotFound = await request('GET', '/api/showtimes/65fc00000000000000000009/seats');
    assert('Q3.2: status 404 for not found', resNotFound.status === 404, `Got status ${resNotFound.status}`);
    assert('Q3.2: error message', resNotFound.data?.error === 'Showtime with id: 65fc00000000000000000009 not found', JSON.stringify(resNotFound.data));

    // Q3.3: 200 OK (Valid showtime 65fc00000000000000000003)
    const resOk = await request('GET', '/api/showtimes/65fc00000000000000000003/seats');
    assert('Q3.3: status 200', resOk.status === 200, `Got status ${resOk.status}`);
    assert('Q3.3: returns 3 seats', resOk.data.length === 3, `Length: ${resOk.data.length}`);
    assert('Q3.3: A1 is BOOKED', resOk.data[0]?.code === 'A1' && resOk.data[0]?.status === 'BOOKED', JSON.stringify(resOk.data[0]));
    assert('Q3.3: A2 is AVAILABLE (canceled ticket)', resOk.data[1]?.code === 'A2' && resOk.data[1]?.status === 'AVAILABLE', JSON.stringify(resOk.data[1]));
    assert('Q3.3: B1 is AVAILABLE', resOk.data[2]?.code === 'B1' && resOk.data[2]?.status === 'AVAILABLE', JSON.stringify(resOk.data[2]));
  }

  // --- QUESTION 4 ---
  console.log('\n--- Question 4: Create Tickets (Customer Only) ---');
  {
    // Q4.1: 403 Forbidden (No access_key)
    const resNoKey = await request('POST', '/api/tickets', {}, { showtimeId: '65fc00000000000000000001', seats: ['A1'] });
    assert('Q4.1: status 403 for missing access_key', resNoKey.status === 403, `Got status ${resNoKey.status}`);
    assert('Q4.1: error message', resNoKey.data?.error === 'No access key', JSON.stringify(resNoKey.data));

    // Q4.2: 403 Forbidden (Invalid access_key)
    const resInvalidKey = await request('POST', '/api/tickets', { access_key: 'wrong_key' }, { showtimeId: '65fc00000000000000000001', seats: ['A1'] });
    assert('Q4.2: status 403 for invalid access_key', resInvalidKey.status === 403, `Got status ${resInvalidKey.status}`);
    assert('Q4.2: error message', resInvalidKey.data?.error === 'Invalid or unauthorized access key', JSON.stringify(resInvalidKey.data));

    // Q4.3: 403 Forbidden (Non-customer role)
    const resAdmin = await request('POST', '/api/tickets', { access_key: 'admin_key_1' }, { showtimeId: '65fc00000000000000000001', seats: ['A1'] });
    assert('Q4.3: status 403 for non-customer', resAdmin.status === 403, `Got status ${resAdmin.status}`);
    assert('Q4.3: error message', resAdmin.data?.error === 'Customer access required', JSON.stringify(resAdmin.data));

    // Q4.4: 400 Bad Request (Missing fields in body)
    const resMissingFields = await request('POST', '/api/tickets', { access_key: 'cust_key_a' }, {});
    assert('Q4.4: status 400 for missing body fields', resMissingFields.status === 400, `Got status ${resMissingFields.status}`);
    assert('Q4.4: error message', resMissingFields.data?.error === 'showtimeId and seats required', JSON.stringify(resMissingFields.data));

    // Q4.5: 409 Conflict (Seat already booked)
    const resConflict = await request('POST', '/api/tickets', { access_key: 'cust_key_a' }, {
      showtimeId: '65fc00000000000000000001',
      seats: ['A1', 'A2']
    });
    assert('Q4.5: status 409 for booked seat', resConflict.status === 409, `Got status ${resConflict.status}`);
    assert('Q4.5: error message', resConflict.data?.error === 'Seat A1 already booked', JSON.stringify(resConflict.data));

    // Q4.6: 201 Created (Valid booking: showtime 6, seats A1, A2)
    // Clean up any previously created test tickets for showtime 6 first
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.collection('tickets').deleteMany({
        showTimeId: new mongoose.Types.ObjectId('65fc00000000000000000006'),
        seatId: { $in: ['A1', 'A2'] }
      });
    }

    const resCreated = await request('POST', '/api/tickets', { access_key: 'cust_key_a' }, {
      showtimeId: '65fc00000000000000000006',
      seats: ['A1', 'A2']
    });
    assert('Q4.6: status 201 for valid booking', resCreated.status === 201, `Got status ${resCreated.status}`);
    assert('Q4.6: response message', resCreated.data?.message === 'Tickets created', JSON.stringify(resCreated.data));
    assert('Q4.6: response count = 2', resCreated.data?.count === 2, JSON.stringify(resCreated.data));
    assert('Q4.6: totalAmount = 192000', resCreated.data?.totalAmount === 192000, JSON.stringify(resCreated.data));
  }

  console.log(`\n================ KET QUA: ${passed}/${total} TESTS DA PASS ================\n`);
}

module.exports = { runTests };

if (require.main === module) {
  runTests();
}

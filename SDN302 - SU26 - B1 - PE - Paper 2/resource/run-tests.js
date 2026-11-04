const { fork } = require('child_process');
const path = require('path');

console.log('--- Launching Server ---');
const serverProc = fork(path.join(__dirname, 'server.js'), [], {
  cwd: __dirname,
  stdio: 'inherit'
});

setTimeout(async () => {
  console.log('--- Server launched, running tests now ---');
  const testProc = fork(path.join(__dirname, 'test-api.js'), [], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  testProc.on('exit', (code) => {
    console.log(`--- Tests finished with code ${code}. Stopping server... ---`);
    serverProc.kill();
    process.exit(code);
  });
}, 2500);


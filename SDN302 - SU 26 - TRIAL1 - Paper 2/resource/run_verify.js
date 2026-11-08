const app = require('./server');
const { runTests } = require('./test_all');

setTimeout(async () => {
  try {
    await runTests();
    process.exit(0);
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}, 1500);


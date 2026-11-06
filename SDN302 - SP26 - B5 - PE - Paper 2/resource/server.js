const express = require('express');
const morgan = require('morgan');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const { connectDb } = require('./dal/database');

const projectRoute = require('./routes/project.route');
const reportRoute = require('./routes/report.route');

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
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Welcome to SDN302 RESTful API Server' });
});

app.use('/api/projects', projectRoute);
app.use('/api/reports', reportRoute);

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
      console.log('\n====================================================');
      console.log(`  Server running at: http://localhost:${PORT}`);
      console.log('====================================================');
    });
  } catch (error) {
    console.error('[ERROR] Cannot start server:', error.message);
    process.exit(1);
  }
})();

module.exports = app;

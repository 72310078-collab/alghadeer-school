const express = require('express');
const cors    = require('cors');
const path    = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/grades', require('./routes/grades'));
app.use('/api/events', require('./routes/events'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/lectures', require('./routes/lectures'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/seats',      require('./routes/seats'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/materials',  require('./routes/materials'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (_, res) => res.json({ status: 'OK', app: 'Al-Ghadeer School API' }));

// Global JSON error handler — Express 5 auto-catches sync errors and needs this
// to return JSON instead of the default HTML error page
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(err.status || err.statusCode || 500).json({
    message: err.message || 'خطأ في الخادم',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

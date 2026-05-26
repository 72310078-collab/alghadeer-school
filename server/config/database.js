const mysql = require('mysql2');
const path  = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const db = mysql.createPool({
  host:            process.env.DB_HOST     || 'localhost',
  user:            process.env.DB_USER     || 'root',
  password:        process.env.DB_PASSWORD || '',
  database:        process.env.DB_NAME     || 'school',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.log('❌ DB connection error:', err.message);
    return;
  }
  console.log('✅ Connected to MySQL — database:', process.env.DB_NAME || 'school');
  connection.release();
});

module.exports = db;

const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  port: 3307,              // <-- ADD THIS LINE
  user: 'root',
  password: 'Arya@123', // Make sure this is the correct password for the 3307 instance
  database: 'ashgrtz_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
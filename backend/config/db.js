const mysql = require('mysql2');
require('dotenv').config(); // Ensure dotenv is loaded

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 18155, // Uses Aiven port
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // CRITICAL: Aiven requires SSL to connect
  ssl: {
    rejectUnauthorized: false 
  }
});

module.exports = pool.promise();
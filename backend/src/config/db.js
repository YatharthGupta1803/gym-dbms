const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'gym_user',
  password: process.env.DB_PASSWORD || 'gym_password',
  database: process.env.DB_NAME || 'gym_dbms',
  port: process.env.DB_PORT || 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('PostgreSQL connected');
  release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'gym_user',
  password: 'gym_password',
  database: 'gym_dbms',
  port: 5432,
});

async function fixAdmin() {
  const hash = await bcrypt.hash('admin123', 10);
  await pool.query('UPDATE admins SET password_hash = $1 WHERE username = $2', [hash, 'admin']);
  console.log('Fixed admin password!');
  process.exit(0);
}

fixAdmin();

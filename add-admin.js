const { pool } = require('./db/database');

async function addAdmin() {
  try {
    // Hash the password for: admin123
    const hashedPassword = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DRcx2a';

    // Insert admin user
    const result = await pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      ['damilaredaniel05@gmail.com', hashedPassword, 'admin']
    );

    console.log('✅ Admin created successfully!');
    console.log('Admin Details:', result.rows[0]);
    console.log('\nYou can now login with:');
    console.log('Email: damilaredaniel05@gmail.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addAdmin();

const db = require('./database');

const [,, name, email, password, role = 'student'] = process.argv;

if (!name || !email || !password) {
  console.log('\n❌  Missing arguments');
  console.log('   Usage: node config/addUser.js <name> <email> <password> <role>');
  console.log('   Roles: admin | teacher | student\n');
  process.exit(1);
}

const q = `INSERT INTO users (name, email, password, role)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE password = VALUES(password), role = VALUES(role)`;

db.query(q, [name, email, password, role], (err) => {
  if (err) { console.error('❌  DB error:', err.message); process.exit(1); }
  console.log(`\n✅  User saved successfully`);
  console.log(`   Name  : ${name}`);
  console.log(`   Email : ${email}`);
  console.log(`   Role  : ${role}`);
  console.log(`   Pass  : ${password}\n`);
  process.exit(0);
});

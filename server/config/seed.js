const db   = require('./database');
const pool = db.promise();

async function seed() {
  await pool.query(
    `INSERT INTO users (name, email, password, role) VALUES
       ('مدير النظام',  'admin@alghadeer.edu',   'admin2026',   'admin'),
       ('أحمد الحسن',   'teacher@alghadeer.edu', 'teacher2026', 'teacher'),
       ('محمد الغدير',  'student@alghadeer.edu', 'student2026', 'student')
     ON DUPLICATE KEY UPDATE password = VALUES(password), role = VALUES(role)`
  );

  console.log('\n✅  Users seeded successfully\n');
  console.log('  Admin   → admin@alghadeer.edu   / admin2026');
  console.log('  Teacher → teacher@alghadeer.edu / teacher2026');
  console.log('  Student → student@alghadeer.edu / student2026\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('\n❌  Seed failed:', err.message || err);
  process.exit(1);
});

const db = require('../config/database');

db.query(`
  CREATE TABLE IF NOT EXISTS grades (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    student_id    INT NOT NULL,
    subject_id    INT NOT NULL,
    score         DECIMAL(6,2) NOT NULL DEFAULT 0,
    max_score     DECIMAL(6,2) NOT NULL DEFAULT 100,
    semester      ENUM('first','second','final') NOT NULL DEFAULT 'first',
    academic_year VARCHAR(20)  NOT NULL DEFAULT '2025-2026',
    notes         TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
  )
`, err => { if (err) console.error('grades table create:', err.message); });

const alterColumns = [
  `ALTER TABLE grades ADD COLUMN IF NOT EXISTS max_score     DECIMAL(6,2) NOT NULL DEFAULT 100`,
  `ALTER TABLE grades ADD COLUMN IF NOT EXISTS semester      ENUM('first','second','final') NOT NULL DEFAULT 'first'`,
  `ALTER TABLE grades ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20)  NOT NULL DEFAULT '2025-2026'`,
  `ALTER TABLE grades ADD COLUMN IF NOT EXISTS notes         TEXT`,
];
alterColumns.forEach(q =>
  db.query(q, err => { if (err && !err.message.includes('Duplicate column')) console.error('grades alter:', err.message); })
);

db.query(`SHOW INDEX FROM grades WHERE Key_name = 'uq_grade'`, (err, rows) => {
  if (err) return console.error('grades index check:', err.message);
  if (rows && rows.length > 0) return;
  db.query(
    `ALTER TABLE grades ADD UNIQUE KEY uq_grade (student_id, subject_id, semester, academic_year)`,
    err2 => { if (err2) console.error('grades unique key:', err2.message); }
  );
});

exports.getAllSubjects = (req, res) => {
  db.query(
    `SELECT DISTINCT id, name FROM subjects ORDER BY name`,
    (err, data) => {
      if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
      res.json(data);
    }
  );
};

exports.getAll = (req, res) => {
  const { class_id, subject_id, semester, academic_year } = req.query;

  let q = `
    SELECT g.*, u.name AS student_name, s.name AS subject_name,
           c.name AS class_name, c.grade_level
    FROM grades g
    LEFT JOIN users    u ON g.student_id  = u.id
    LEFT JOIN subjects s ON g.subject_id  = s.id
    LEFT JOIN classes  c ON s.class_id    = c.id
    WHERE 1=1
  `;
  const params = [];

  if (class_id)      { q += ' AND c.id = ?';           params.push(class_id); }
  if (subject_id)    { q += ' AND g.subject_id = ?';   params.push(subject_id); }
  if (semester)      { q += ' AND g.semester = ?';      params.push(semester); }
  if (academic_year) { q += ' AND g.academic_year = ?'; params.push(academic_year); }
  q += ' ORDER BY c.name, u.name, s.name';

  db.query(q, params, (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json(data);
  });
};

exports.getStudentGrades = (req, res) => {
  const { semester, year } = req.query;

  let q = `
    SELECT g.*, s.name AS subject_name, c.name AS class_name
    FROM grades g
    JOIN subjects s ON g.subject_id = s.id
    JOIN classes c ON s.class_id = c.id
    WHERE g.student_id = ?
  `;
  const params = [req.params.studentId];

  if (semester) { q += ' AND g.semester = ?';      params.push(semester); }
  if (year)     { q += ' AND g.academic_year = ?'; params.push(year); }
  q += ' ORDER BY c.name, s.name';

  db.query(q, params, (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json(data);
  });
};

exports.getClassGrades = (req, res) => {
  const q = `
    SELECT g.*, u.name AS student_name, s.name AS subject_name
    FROM grades g
    JOIN users u ON g.student_id = u.id
    JOIN subjects s ON g.subject_id = s.id
    WHERE s.class_id = ?
    ORDER BY s.name, u.name
  `;
  db.query(q, [req.params.classId], (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json(data);
  });
};

exports.upsertGrade = (req, res) => {
  const { student_id, subject_id, score, max_score, semester, academic_year, notes } = req.body;

  const q = `
    INSERT INTO grades (student_id, subject_id, score, max_score, semester, academic_year, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE score = VALUES(score), notes = VALUES(notes)
  `;
  db.query(q, [student_id, subject_id, score, max_score || 100, semester || 'first', academic_year || '2024-2025', notes || null], (err) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json({ message: 'تم حفظ العلامة' });
  });
};

exports.bulkSave = (req, res) => {
  const { subject_id, semester, academic_year, grades } = req.body;
  if (!subject_id || !semester || !Array.isArray(grades) || grades.length === 0)
    return res.status(400).json({ message: 'بيانات ناقصة' });

  const year = academic_year || '2025-2026';
  const sid  = Number(subject_id);

  const rows = grades.map(g => [
    Number(g.student_id), sid, Number(g.score), Number(g.max_score) || 100,
    semester, year, g.notes || null,
  ]);
  const placeholders = rows.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');

  const q = `
    INSERT INTO grades (student_id, subject_id, score, max_score, semester, academic_year, notes)
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE
      score     = VALUES(score),
      max_score = VALUES(max_score),
      notes     = VALUES(notes)
  `;

  db.query(q, rows.flat(), (err) => {
    if (err) return res.status(500).json({ message: 'خطأ في الحفظ', error: err.message });
    res.json({ message: `تم حفظ ${grades.length} علامة` });
  });
};

exports.deleteGrade = (req, res) => {
  db.query('DELETE FROM grades WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json({ message: 'تم حذف العلامة' });
  });
};

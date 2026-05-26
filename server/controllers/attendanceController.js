const db = require('../config/database');

db.query(`
  CREATE TABLE IF NOT EXISTS attendance (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    student_id  INT NOT NULL,
    class_id    INT NOT NULL,
    date        DATE NOT NULL,
    status      ENUM('present','absent','late','excused') NOT NULL DEFAULT 'present',
    recorded_by INT DEFAULT NULL,
    notes       TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_attendance (student_id, class_id, date),
    FOREIGN KEY (student_id)  REFERENCES users(id)   ON DELETE CASCADE,
    FOREIGN KEY (class_id)    REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id)   ON DELETE SET NULL
  )
`, (err) => {
  if (err) console.error('Attendance table init error:', err.message);
});

db.query(
  `ALTER TABLE attendance CHANGE COLUMN teacher_id recorded_by INT DEFAULT NULL`,
  (err) => { if (err && !err.message.includes("Unknown column")) console.error('attendance rename:', err.message); }
);

exports.getByClassDate = (req, res) => {
  const { class_id, date } = req.query;
  if (!class_id || !date) return res.status(400).json({ message: 'class_id و date مطلوبان' });

  const q = `
    SELECT u.id AS student_id, u.name AS student_name,
      COALESCE(a.status, 'present') AS status,
      a.notes, a.id AS attendance_id
    FROM users u
    LEFT JOIN attendance a ON a.student_id = u.id AND a.class_id = ? AND a.date = ?
    WHERE u.class_id = ? AND u.role = 'student'
    ORDER BY u.name
  `;
  db.query(q, [class_id, date, class_id], (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json(data);
  });
};

exports.saveBulk = (req, res) => {
  const { class_id, date, records } = req.body;
  const teacher_id = req.user?.id || null;

  if (!class_id || !date || !Array.isArray(records) || records.length === 0)
    return res.status(400).json({ message: 'بيانات ناقصة' });

  const values = records.map(r => [
    r.student_id, class_id, date, r.status || 'present', teacher_id, r.notes || null
  ]);

  const q = `
    INSERT INTO attendance (student_id, class_id, date, status, recorded_by, notes)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      status      = VALUES(status),
      notes       = VALUES(notes),
      recorded_by = VALUES(recorded_by)
  `;
  db.query(q, [values], (err) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json({ message: 'تم حفظ الحضور بنجاح' });
  });
};

exports.getReport = (req, res) => {
  const { class_id, from, to } = req.query;
  if (!class_id) return res.status(400).json({ message: 'class_id مطلوب' });

  let q = `
    SELECT a.date, a.status, a.notes,
      u.id AS student_id, u.name AS student_name
    FROM attendance a
    JOIN users u ON a.student_id = u.id
    WHERE a.class_id = ?
  `;
  const params = [class_id];
  if (from) { q += ' AND a.date >= ?'; params.push(from); }
  if (to)   { q += ' AND a.date <= ?'; params.push(to); }
  q += ' ORDER BY a.date DESC, u.name';

  db.query(q, params, (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json(data);
  });
};

exports.getSummary = (req, res) => {
  const { class_id } = req.query;
  if (!class_id) return res.status(400).json({ message: 'class_id مطلوب' });

  const q = `
    SELECT u.id AS student_id, u.name AS student_name,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) AS present_count,
      COUNT(CASE WHEN a.status = 'absent'  THEN 1 END) AS absent_count,
      COUNT(CASE WHEN a.status = 'late'    THEN 1 END) AS late_count,
      COUNT(CASE WHEN a.status = 'excused' THEN 1 END) AS excused_count,
      COUNT(a.id) AS total_days
    FROM users u
    LEFT JOIN attendance a ON a.student_id = u.id AND a.class_id = ?
    WHERE u.class_id = ? AND u.role = 'student'
    GROUP BY u.id, u.name
    ORDER BY u.name
  `;
  db.query(q, [class_id, class_id], (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json(data);
  });
};

exports.getStudentAttendance = (req, res) => {
  const q = `
    SELECT a.date, a.status, a.notes, c.name AS class_name
    FROM attendance a
    JOIN classes c ON a.class_id = c.id
    WHERE a.student_id = ?
    ORDER BY a.date DESC
    LIMIT 90
  `;
  db.query(q, [req.params.studentId], (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json(data);
  });
};

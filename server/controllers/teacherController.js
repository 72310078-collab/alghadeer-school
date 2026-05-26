const db = require('../config/database');

exports.getAll = (req, res) => {
  const { search } = req.query;

  let q = `
    SELECT u.id, u.name, u.email, u.phone, u.created_at,
      COUNT(DISTINCT s.class_id) AS class_count,
      COUNT(DISTINCT l.id)       AS lecture_count,
      COUNT(DISTINCT s.id)       AS subject_count
    FROM users u
    LEFT JOIN subjects s ON s.teacher_id = u.id
    LEFT JOIN lectures l ON l.teacher_id = u.id
    WHERE u.role = 'teacher'
  `;
  const params = [];

  if (search) { q += ' AND (u.name LIKE ? OR u.email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  q += ' GROUP BY u.id ORDER BY u.name';

  db.query(q, params, (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json({ teachers: data, total: data.length });
  });
};

exports.getById = (req, res) => {
  db.query(
    'SELECT id, name, email, phone, address, date_of_birth, created_at FROM users WHERE id = ? AND role = "teacher"',
    [req.params.id],
    (err, data) => {
      if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
      if (data.length === 0) return res.status(404).json({ message: 'المعلم غير موجود' });

      const teacher = data[0];
      const tid = req.params.id;

      db.query(
        `SELECT DISTINCT c.id, c.name, c.grade_level
         FROM classes c
         JOIN subjects s ON s.class_id = c.id AND s.teacher_id = ?
         ORDER BY c.grade_level, c.name`,
        [tid],
        (err, classes) => {
          if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });

          db.query(
            `SELECT s.id, s.name, s.class_id, c.name AS class_name, c.grade_level
             FROM subjects s
             JOIN classes c ON c.id = s.class_id
             WHERE s.teacher_id = ?
             ORDER BY c.grade_level, c.name, s.name`,
            [tid],
            (err, subjects) => {
              if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });

              db.query(
                `SELECT l.*, c.name AS class_name FROM lectures l
                 JOIN classes c ON c.id = l.class_id WHERE l.teacher_id = ?
                 ORDER BY FIELD(l.day_of_week,'sunday','monday','tuesday','wednesday','thursday'), l.start_time`,
                [tid],
                (err, lectures) => {
                  if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
                  res.json({ ...teacher, classes, subjects, lectures });
                }
              );
            }
          );
        }
      );
    }
  );
};

exports.getSchedule = (req, res) => {
  const q = `
    SELECT l.*, c.name AS class_name, c.grade_level
    FROM lectures l
    JOIN classes c ON c.id = l.class_id
    WHERE l.teacher_id = ?
    ORDER BY FIELD(l.day_of_week,'sunday','monday','tuesday','wednesday','thursday'), l.start_time
  `;
  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json(data);
  });
};

const db = require('../config/database');

exports.getAll = (req, res) => {
  const { class_id, semester, academic_year } = req.query;
  const role   = req.user?.role;
  const userId = req.user?.id;

  let q = `
    SELECT e.*, c.name AS class_name, c.grade_level
    FROM exam_schedule e
    LEFT JOIN classes c ON c.id = e.class_id
    WHERE 1=1
  `;
  const params = [];

  if (role === 'teacher') {
    q += ` AND (e.class_id IN (SELECT DISTINCT class_id FROM subjects WHERE teacher_id = ?) OR e.class_id IS NULL)`;
    params.push(userId);
  } else if (role === 'student') {
    q += ` AND (e.class_id = (SELECT class_id FROM users WHERE id = ? AND role = 'student') OR e.class_id IS NULL)`;
    params.push(userId);
  }

  if (class_id)      { q += ' AND e.class_id = ?';      params.push(class_id); }
  if (semester)      { q += ' AND e.semester = ?';       params.push(semester); }
  if (academic_year) { q += ' AND e.academic_year = ?';  params.push(academic_year); }

  q += ' ORDER BY e.exam_date, e.start_time';

  db.query(q, params, (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json(data);
  });
};

exports.getById = (req, res) => {
  const q = `
    SELECT e.*, c.name AS class_name
    FROM exam_schedule e
    LEFT JOIN classes c ON c.id = e.class_id
    WHERE e.id = ?
  `;
  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    if (data.length === 0) return res.status(404).json({ message: 'الامتحان غير موجود' });
    res.json(data[0]);
  });
};

exports.create = (req, res) => {
  const { title, class_id, subject_name, exam_date, start_time, end_time, room, semester, academic_year, notes } = req.body;

  if (!title || !subject_name || !exam_date || !start_time || !end_time)
    return res.status(400).json({ message: 'جميع الحقول المطلوبة يجب ملؤها' });

  const q = `INSERT INTO exam_schedule
    (title, class_id, subject_name, exam_date, start_time, end_time, room, semester, academic_year, notes, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(q,
    [title, class_id || null, subject_name, exam_date, start_time, end_time,
     room || null, semester || 'first', academic_year || '2024-2025', notes || null, req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });

      db.query(
        'SELECT e.*, c.name AS class_name FROM exam_schedule e LEFT JOIN classes c ON c.id = e.class_id WHERE e.id = ?',
        [result.insertId],
        (err, rows) => {
          if (err) return res.status(500).json({ message: 'خطأ في الخادم' });
          res.status(201).json(rows[0]);
        }
      );
    }
  );
};

exports.update = (req, res) => {
  const { title, class_id, subject_name, exam_date, start_time, end_time, room, semester, academic_year, notes } = req.body;

  const q = `UPDATE exam_schedule SET
    title=?, class_id=?, subject_name=?, exam_date=?, start_time=?,
    end_time=?, room=?, semester=?, academic_year=?, notes=?
    WHERE id=?`;

  db.query(q,
    [title, class_id || null, subject_name, exam_date, start_time,
     end_time, room || null, semester || 'first', academic_year || '2024-2025', notes || null, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'الامتحان غير موجود' });
      res.json({ message: 'تم التحديث' });
    }
  );
};

exports.remove = (req, res) => {
  db.query('DELETE FROM exam_schedule WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'الامتحان غير موجود' });
    res.json({ message: 'تم الحذف' });
  });
};

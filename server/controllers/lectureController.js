const db = require('../config/database');

exports.getAll = (req, res) => {
  const { teacher_id, class_id, day, academic_year } = req.query;

  let q = `
    SELECT l.*, u.name AS teacher_name, c.name AS class_name, c.grade_level
    FROM lectures l
    LEFT JOIN users   u ON u.id = l.teacher_id
    JOIN      classes c ON c.id = l.class_id
    WHERE 1=1
  `;
  const params = [];

  if (teacher_id)    { q += ' AND l.teacher_id = ?';    params.push(teacher_id); }
  if (class_id)      { q += ' AND l.class_id = ?';      params.push(class_id); }
  if (day)           { q += ' AND l.day_of_week = ?';   params.push(day); }
  if (academic_year) { q += ' AND l.academic_year = ?'; params.push(academic_year); }
  q += ` ORDER BY FIELD(l.day_of_week,'sunday','monday','tuesday','wednesday','thursday'), l.start_time`;

  db.query(q, params, (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json(data);
  });
};

exports.create = (req, res) => {
  const { teacher_id, class_id, subject_name, day_of_week, start_time, end_time, room, academic_year } = req.body;

  if (!class_id)      return res.status(400).json({ message: 'الصف مطلوب' });
  if (!subject_name)  return res.status(400).json({ message: 'اسم المادة مطلوب' });
  if (!day_of_week)   return res.status(400).json({ message: 'اليوم مطلوب' });
  if (!start_time)    return res.status(400).json({ message: 'وقت البداية مطلوب' });
  if (!end_time)      return res.status(400).json({ message: 'وقت النهاية مطلوب' });

  const tid = teacher_id || null;

  const cols = tid
    ? 'teacher_id, class_id, subject_name, day_of_week, start_time, end_time, room, academic_year'
    : 'class_id, subject_name, day_of_week, start_time, end_time, room, academic_year';
  const vals = tid
    ? [tid, class_id, subject_name, day_of_week, start_time, end_time, room || null, academic_year || '2025-2026']
    : [class_id, subject_name, day_of_week, start_time, end_time, room || null, academic_year || '2025-2026'];
  const placeholders = vals.map(() => '?').join(', ');

  db.query(`INSERT INTO lectures (${cols}) VALUES (${placeholders})`, vals, (err, result) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });

    db.query(
      `SELECT l.*, u.name AS teacher_name, c.name AS class_name
       FROM lectures l
       LEFT JOIN users   u ON u.id = l.teacher_id
       JOIN      classes c ON c.id = l.class_id
       WHERE l.id = ?`,
      [result.insertId],
      (err, rows) => {
        if (err) return res.status(500).json({ message: 'خطأ في الخادم' });
        res.status(201).json(rows[0]);
      }
    );
  });
};

exports.update = (req, res) => {
  const { teacher_id, class_id, subject_name, day_of_week, start_time, end_time, room, academic_year } = req.body;

  const q = `UPDATE lectures SET teacher_id=?, class_id=?, subject_name=?, day_of_week=?,
             start_time=?, end_time=?, room=?, academic_year=? WHERE id=?`;

  db.query(q, [teacher_id || null, class_id, subject_name, day_of_week, start_time, end_time, room || null, academic_year || '2025-2026', req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'الحصة غير موجودة' });
    res.json({ message: 'تم التحديث' });
  });
};

exports.remove = (req, res) => {
  db.query('DELETE FROM lectures WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'الحصة غير موجودة' });
    res.json({ message: 'تم الحذف' });
  });
};

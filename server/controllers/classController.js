const db = require('../config/database');

db.query(`
  CREATE TABLE IF NOT EXISTS subjects (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    class_id   INT NOT NULL,
    teacher_id INT,
    name       VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id)   REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id)   ON DELETE SET NULL
  )
`, err => { if (err) console.error('subjects table:', err.message); });

db.query(`
  CREATE TABLE IF NOT EXISTS subject_catalog (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, err => {
  if (err) { console.error('subject_catalog table:', err.message); return; }

  db.query('SELECT COUNT(*) AS cnt FROM subject_catalog', (e, rows) => {
    if (e || rows[0].cnt > 0) return;
    const defaults = [
      'اللغة العربية', 'اللغة الإنجليزية', 'اللغة الفرنسية',
      'الرياضيات', 'العلوم', 'الفيزياء', 'الكيمياء', 'الأحياء',
      'التاريخ', 'الجغرافيا', 'التربية الوطنية', 'التربية الإسلامية',
      'التربية المسيحية', 'الفلسفة', 'علم النفس والاجتماع',
      'الاقتصاد', 'المحاسبة', 'الحاسوب وتقنية المعلومات',
      'التربية الفنية', 'التربية الموسيقية', 'التربية البدنية',
    ];
    db.query(
      'INSERT IGNORE INTO subject_catalog (name) VALUES ?',
      [defaults.map(n => [n])],
      err2 => { if (err2) console.error('subject_catalog seed:', err2.message); }
    );
  });
});

exports.getCatalog = (req, res) => {
  db.query('SELECT id, name FROM subject_catalog ORDER BY id', (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json(data);
  });
};

exports.addCatalog = (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'اسم المادة مطلوب' });
  db.query('INSERT INTO subject_catalog (name) VALUES ?',
    [[[name.trim()]]],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY')
          return res.status(409).json({ message: 'هذه المادة موجودة بالفعل في القائمة' });
        return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
      }
      res.status(201).json({ id: result.insertId, name: name.trim() });
    }
  );
};

exports.removeCatalog = (req, res) => {
  db.query('DELETE FROM subject_catalog WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json({ message: 'تم الحذف' });
  });
};

exports.getAll = (req, res) => {
  const { teacher_id } = req.query;

  let q = `
    SELECT c.*, u.name AS teacher_name,
      IFNULL(sc.student_count, 0) AS student_count
    FROM classes c
    LEFT JOIN users u ON c.teacher_id = u.id
    LEFT JOIN (
      SELECT class_id, COUNT(*) AS student_count
      FROM users
      WHERE role = 'student'
      GROUP BY class_id
    ) sc ON sc.class_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (teacher_id) {
    q += ` AND (c.teacher_id = ? OR c.id IN (
              SELECT DISTINCT class_id FROM subjects WHERE teacher_id = ?
            ))`;
    params.push(teacher_id, teacher_id);
  }
  q += ' ORDER BY c.grade_level, c.name';

  db.query(q, params, (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json(data);
  });
};

exports.getById = (req, res) => {
  db.query(
    'SELECT c.*, u.name AS teacher_name FROM classes c LEFT JOIN users u ON c.teacher_id = u.id WHERE c.id = ?',
    [req.params.id],
    (err, classRows) => {
      if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
      if (classRows.length === 0) return res.status(404).json({ message: 'الصف غير موجود' });

      db.query(
        `SELECT u.id, u.name, u.email, u.phone, u.parent_phone
         FROM users u
         WHERE u.class_id = ? AND u.role = 'student'
         ORDER BY u.name`,
        [req.params.id],
        (err, students) => {
          if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });

          db.query(
            `SELECT s.*, u.name AS teacher_name
             FROM subjects s
             LEFT JOIN users u ON s.teacher_id = u.id
             WHERE s.class_id = ?
             ORDER BY s.name`,
            [req.params.id],
            (err, subjects) => {
              if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
              res.json({ ...classRows[0], students, subjects });
            }
          );
        }
      );
    }
  );
};

exports.create = (req, res) => {
  const { name, grade_level, teacher_id, academic_year } = req.body;

  const q = 'INSERT INTO classes (name, grade_level, teacher_id, academic_year) VALUES (?, ?, ?, ?)';
  db.query(q, [name, grade_level, teacher_id || null, academic_year || '2025-2026'], (err, result) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });

    db.query('SELECT * FROM classes WHERE id = ?', [result.insertId], (err, rows) => {
      if (err) return res.status(500).json({ message: 'خطأ في الخادم' });
      res.status(201).json(rows[0]);
    });
  });
};

exports.update = (req, res) => {
  const { name, grade_level, teacher_id, academic_year } = req.body;

  const q = 'UPDATE classes SET name=?, grade_level=?, teacher_id=?, academic_year=? WHERE id=?';
  db.query(q, [name, grade_level, teacher_id || null, academic_year, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });

    db.query('SELECT * FROM classes WHERE id = ?', [req.params.id], (err, rows) => {
      if (err) return res.status(500).json({ message: 'خطأ في الخادم' });
      res.json(rows[0]);
    });
  });
};

exports.remove = (req, res) => {
  db.query('UPDATE users SET class_id = NULL WHERE class_id = ?', [req.params.id], () => {
    db.query('DELETE FROM classes WHERE id = ?', [req.params.id], (err) => {
      if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
      res.json({ message: 'تم حذف الصف' });
    });
  });
};

exports.enrollStudent = (req, res) => {
  const { student_id } = req.body;
  if (!student_id) return res.status(400).json({ message: 'student_id مطلوب' });

  db.query(
    'UPDATE users SET class_id = ? WHERE id = ? AND role = "student"',
    [req.params.id, student_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'الطالب غير موجود' });
      res.json({ message: 'تم تسجيل الطالب في الصف' });
    }
  );
};

exports.unenrollStudent = (req, res) => {
  db.query(
    'UPDATE users SET class_id = NULL WHERE id = ? AND class_id = ?',
    [req.params.studentId, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
      res.json({ message: 'تم إزالة الطالب من الصف' });
    }
  );
};

exports.getStudentClasses = (req, res) => {
  const q = `
    SELECT c.*, u.name AS teacher_name
    FROM classes c
    LEFT JOIN users u ON c.teacher_id = u.id
    JOIN users s ON s.class_id = c.id AND s.id = ?
  `;
  db.query(q, [req.params.studentId], (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json(data);
  });
};

exports.addSubject = (req, res) => {
  const { name, teacher_id } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'اسم المادة مطلوب' });

  db.query(
    'INSERT INTO subjects (class_id, teacher_id, name) VALUES (?, ?, ?)',
    [req.params.id, teacher_id || null, name.trim()],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
      db.query(
        `SELECT s.*, u.name AS teacher_name FROM subjects s LEFT JOIN users u ON s.teacher_id = u.id WHERE s.id = ?`,
        [result.insertId],
        (err, rows) => {
          if (err) return res.status(500).json({ message: 'خطأ في الخادم' });
          res.status(201).json(rows[0]);
        }
      );
    }
  );
};

exports.updateSubject = (req, res) => {
  const { name, teacher_id } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'اسم المادة مطلوب' });

  db.query(
    'UPDATE subjects SET name=?, teacher_id=? WHERE id=? AND class_id=?',
    [name.trim(), teacher_id || null, req.params.subjectId, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'المادة غير موجودة' });
      res.json({ message: 'تم التحديث' });
    }
  );
};

exports.deleteSubject = (req, res) => {
  db.query(
    'DELETE FROM subjects WHERE id=? AND class_id=?',
    [req.params.subjectId, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'المادة غير موجودة' });
      res.json({ message: 'تم حذف المادة' });
    }
  );
};

const db     = require('../config/database');
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const uploadDir = path.join(__dirname, '../uploads/materials');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename:    (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = [
      '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt',
      '.mp4', '.mp3', '.avi', '.mov', '.webm',
      '.jpg', '.jpeg', '.png', '.gif', '.webp',
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(allowed.includes(ext) ? null : new Error('نوع الملف غير مسموح'), allowed.includes(ext));
  },
});

exports.uploadMiddleware = upload.single('file');

db.query(`
  CREATE TABLE IF NOT EXISTS class_materials (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    class_id   INT NOT NULL,
    teacher_id INT NOT NULL,
    subject_id INT,
    title      VARCHAR(255) NOT NULL,
    body       TEXT,
    type       ENUM('video','document','text','image') NOT NULL DEFAULT 'text',
    file_url   VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id)   REFERENCES classes(id)  ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
  )
`, err => {
  if (err) console.error('class_materials table:', err.message);
});

[
  `ALTER TABLE class_materials ADD COLUMN IF NOT EXISTS subject_id INT NULL`,
  `ALTER TABLE class_materials MODIFY COLUMN type ENUM('video','document','text','image') NOT NULL DEFAULT 'text'`,
].forEach(q => db.query(q, err => { if (err) console.error('class_materials alter:', err.message); }));

exports.getByClass = (req, res) => {
  const { class_id, subject_id } = req.query;
  if (!class_id) return res.status(400).json({ message: 'class_id مطلوب' });

  const subjId = parseInt(subject_id, 10);
  const filterBySubject = !isNaN(subjId) && subjId > 0;

  let q = `
    SELECT m.*, u.name AS teacher_name, s.name AS subject_name
    FROM class_materials m
    LEFT JOIN users    u ON u.id = m.teacher_id
    LEFT JOIN subjects s ON s.id = m.subject_id
    WHERE m.class_id = ?
  `;
  const params = [class_id];
  if (filterBySubject) { q += ' AND m.subject_id = ?'; params.push(subjId); }
  q += ' ORDER BY m.created_at DESC';

  db.query(q, params, (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json(data);
  });
};

exports.getForStudent = (req, res) => {
  const { subject_id } = req.query;
  const subjId = parseInt(subject_id, 10);
  const filterBySubject = !isNaN(subjId) && subjId > 0;

  let q = `
    SELECT m.*, u.name AS teacher_name, c.name AS class_name, s.name AS subject_name
    FROM class_materials m
    LEFT JOIN users    u ON u.id  = m.teacher_id
    LEFT JOIN classes  c ON c.id  = m.class_id
    LEFT JOIN subjects s ON s.id  = m.subject_id
    WHERE m.class_id = (SELECT class_id FROM users WHERE id = ? AND role = 'student')
  `;
  const params = [req.user.id];
  if (filterBySubject) { q += ' AND m.subject_id = ?'; params.push(subjId); }
  q += ' ORDER BY m.subject_id, m.created_at DESC';

  db.query(q, params, (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json(data);
  });
};

exports.create = (req, res) => {
  const { class_id, subject_id, title, body, type } = req.body;
  const teacher_id = req.user.id;
  if (!class_id || !title || !type)
    return res.status(400).json({ message: 'الصف والعنوان والنوع مطلوبون' });

  const subjId = parseInt(subject_id, 10);
  const safeSubjectId = (!isNaN(subjId) && subjId > 0) ? subjId : null;

  const file_url = req.file
    ? `/uploads/materials/${req.file.filename}`
    : (req.body.file_url || null);

  db.query(
    'INSERT INTO class_materials (class_id, teacher_id, subject_id, title, body, type, file_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [class_id, teacher_id, safeSubjectId, title, body || null, type, file_url],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
      res.status(201).json({ id: result.insertId, message: 'تم النشر بنجاح' });
    }
  );
};

exports.remove = (req, res) => {
  const isAdmin = req.user.role === 'admin';

  const q = isAdmin
    ? 'DELETE FROM class_materials WHERE id = ?'
    : 'DELETE FROM class_materials WHERE id = ? AND teacher_id = ?';
  const params = isAdmin
    ? [req.params.id]
    : [req.params.id, req.user.id];

  db.query(q, params, (err, result) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    if (result.affectedRows === 0) return res.status(403).json({ message: 'غير مسموح — لا يمكنك حذف مواد معلم آخر' });
    res.json({ message: 'تم الحذف' });
  });
};

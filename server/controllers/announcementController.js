const db = require('../config/database');

exports.getAll = (req, res) => {
  const { category, role, pinned } = req.query;

  let q = `
    SELECT a.*, u.name AS author_name
    FROM announcements a
    LEFT JOIN users u ON a.author_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (category)       { q += ' AND a.category = ?';                                    params.push(category); }
  if (role && role !== 'admin') { q += ' AND (a.target_role = "all" OR a.target_role = ?)'; params.push(role); }
  if (pinned === 'true') { q += ' AND a.is_pinned = 1'; }
  q += ' ORDER BY a.is_pinned DESC, a.created_at DESC';

  db.query(q, params, (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json(data);
  });
};

exports.getById = (req, res) => {
  const q = `
    SELECT a.*, u.name AS author_name
    FROM announcements a
    LEFT JOIN users u ON a.author_id = u.id
    WHERE a.id = ?
  `;
  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    if (data.length === 0) return res.status(404).json({ message: 'الإعلان غير موجود' });
    res.json(data[0]);
  });
};

exports.create = (req, res) => {
  const { title, content, category, target_role, is_pinned } = req.body;

  const q = 'INSERT INTO announcements (title, content, author_id, category, target_role, is_pinned) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(q, [title, content, req.user.id, category || 'general', target_role || 'all', is_pinned ? 1 : 0], (err, result) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });

    db.query('SELECT a.*, u.name AS author_name FROM announcements a LEFT JOIN users u ON a.author_id = u.id WHERE a.id = ?',
      [result.insertId], (err, rows) => {
        if (err) return res.status(500).json({ message: 'خطأ في الخادم' });
        res.status(201).json(rows[0]);
      });
  });
};

exports.update = (req, res) => {
  const { title, content, category, target_role, is_pinned } = req.body;

  const q = 'UPDATE announcements SET title=?, content=?, category=?, target_role=?, is_pinned=? WHERE id=?';
  db.query(q, [title, content, category, target_role, is_pinned ? 1 : 0, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });

    db.query('SELECT * FROM announcements WHERE id = ?', [req.params.id], (err, rows) => {
      if (err) return res.status(500).json({ message: 'خطأ في الخادم' });
      res.json(rows[0]);
    });
  });
};

exports.remove = (req, res) => {
  db.query('DELETE FROM announcements WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json({ message: 'تم حذف الإعلان' });
  });
};

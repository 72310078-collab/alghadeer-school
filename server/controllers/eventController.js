const db = require('../config/database');

exports.getAll = (req, res) => {
  const { month, year, type } = req.query;

  let q = `
    SELECT e.*, u.name AS created_by_name
    FROM events e
    LEFT JOIN users u ON e.created_by = u.id
    WHERE 1=1
  `;
  const params = [];

  if (month) { q += ' AND MONTH(e.event_date) = ?'; params.push(month); }
  if (year)  { q += ' AND YEAR(e.event_date) = ?';  params.push(year); }
  if (type)  { q += ' AND e.event_type = ?';         params.push(type); }
  q += ' ORDER BY e.event_date ASC';

  db.query(q, params, (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json(data);
  });
};

exports.create = (req, res) => {
  const { title, description, event_date, event_type } = req.body;

  const q = 'INSERT INTO events (title, description, event_date, event_type, created_by) VALUES (?, ?, ?, ?, ?)';
  db.query(q, [title, description || null, event_date, event_type || 'other', req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });

    db.query('SELECT e.*, u.name AS created_by_name FROM events e LEFT JOIN users u ON e.created_by = u.id WHERE e.id = ?',
      [result.insertId], (err, rows) => {
        if (err) return res.status(500).json({ message: 'خطأ في الخادم' });
        res.status(201).json(rows[0]);
      });
  });
};

exports.update = (req, res) => {
  const { title, description, event_date, event_type } = req.body;

  const q = 'UPDATE events SET title=?, description=?, event_date=?, event_type=? WHERE id=?';
  db.query(q, [title, description || null, event_date, event_type, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });

    db.query('SELECT e.*, u.name AS created_by_name FROM events e LEFT JOIN users u ON e.created_by = u.id WHERE e.id = ?',
      [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'خطأ في الخادم' });
        res.json(rows[0]);
      });
  });
};

exports.remove = (req, res) => {
  db.query('DELETE FROM events WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json({ message: 'تم حذف الحدث' });
  });
};

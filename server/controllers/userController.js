const db = require('../config/database');

exports.getAllUsers = (req, res) => {
  const { role, search } = req.query;

  let q = 'SELECT id, name, email, role, phone, parent_phone, avatar, created_at FROM users WHERE 1=1';
  const params = [];

  if (role)   { q += ' AND role = ?';                          params.push(role); }
  if (search) { q += ' AND (name LIKE ? OR email LIKE ?)';     params.push(`%${search}%`, `%${search}%`); }
  q += ' ORDER BY created_at DESC';

  db.query(q, params, (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json({ users: data, total: data.length });
  });
};

exports.getUserById = (req, res) => {
  const q = 'SELECT id, name, email, role, phone, parent_phone, address, avatar, date_of_birth, created_at FROM users WHERE id = ?';

  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    if (data.length === 0) return res.status(404).json({ message: 'المستخدم غير موجود' });
    res.json(data[0]);
  });
};

exports.createUser = (req, res) => {
  const { name, email, password, role, phone, address, date_of_birth, parent_phone, class_id } = req.body;

  db.query('SELECT id FROM users WHERE email = ?', [email], (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    if (data.length > 0) return res.status(409).json({ message: 'البريد الإلكتروني مستخدم' });

    const plain = password || 'School@2024';
    const q = `
      INSERT INTO users (name, email, password, role, phone, address, date_of_birth, parent_phone, class_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const vals = [name, email, plain, role || 'student', phone || null, address || null, date_of_birth || null, parent_phone || null, class_id || null];
    db.query(q, vals, (err, result) => {
      if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
      db.query('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?', [result.insertId], (err, rows) => {
        if (err) return res.status(500).json({ message: 'خطأ في الخادم' });
        res.status(201).json(rows[0]);
      });
    });
  });
};

exports.updateUser = (req, res) => {
  const { name, email, role, phone, address, date_of_birth, password, parent_phone, class_id } = req.body;

  const doUpdate = (hashed) => {
    const updates = [];
    const params  = [];

    if (name)                        { updates.push('name = ?');          params.push(name); }
    if (email)                       { updates.push('email = ?');         params.push(email); }
    if (role)                        { updates.push('role = ?');          params.push(role); }
    if (phone !== undefined)         { updates.push('phone = ?');         params.push(phone); }
    if (address !== undefined)       { updates.push('address = ?');       params.push(address); }
    if (date_of_birth !== undefined) { updates.push('date_of_birth = ?'); params.push(date_of_birth); }
    if (parent_phone !== undefined)  { updates.push('parent_phone = ?');  params.push(parent_phone); }
    if (class_id !== undefined)      { updates.push('class_id = ?');      params.push(class_id || null); }
    if (hashed)                      { updates.push('password = ?');      params.push(hashed); }

    if (!updates.length)
      return res.status(400).json({ message: 'لا توجد بيانات للتحديث' });

    params.push(req.params.id);
    db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params, (err) => {
      if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });

      db.query('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?', [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'خطأ في الخادم' });
        res.json(rows[0]);
      });
    });
  };

  doUpdate(password || null);
};

exports.deleteUser = (req, res) => {
  db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });
    res.json({ message: 'تم حذف المستخدم بنجاح' });
  });
};

exports.getStats = (req, res) => {
  db.query("SELECT role, COUNT(*) as count FROM users GROUP BY role", (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });

    db.query('SELECT COUNT(*) as classes FROM classes', (err, classData) => {
      if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });

      db.query('SELECT COUNT(*) as announcements FROM announcements', (err, annData) => {
        if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });

        const stats = { students: 0, teachers: 0, admins: 0 };
        data.forEach(row => { stats[row.role + 's'] = row.count; });
        stats.classes       = classData[0].classes;
        stats.announcements = annData[0].announcements;

        res.json(stats);
      });
    });
  });
};

const db = require('../config/database');

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبان' });

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, data) => {
    if (err) return res.status(500).json({ message: 'خطأ في الخادم', error: err.message });

    if (data.length === 0)
      return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });

    const user = data[0];

    if (password !== user.password)
      return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });

    const { password: _, ...userData } = user;
    res.json({ user: userData });
  });
};

exports.getMe = (req, res) => {
  const userId = req.headers['x-user-id'];

  if (!userId)
    return res.status(401).json({ message: 'غير مصرح' });

  db.query(
    'SELECT id, name, email, role, avatar, phone, address, date_of_birth, class_id, parent_phone, created_at FROM users WHERE id = ?',
    [userId],
    (err, data) => {
      if (err) return res.status(500).json({ message: 'خطأ في الخادم' });
      if (data.length === 0) return res.status(404).json({ message: 'المستخدم غير موجود' });
      res.json(data[0]);
    }
  );
};

const authenticate = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];

  if (!userId || !userRole)
    return res.status(401).json({ message: 'غير مصرح به — سجّل دخولك أولاً' });

  req.user = { id: parseInt(userId), role: userRole };
  next();
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return res.status(403).json({ message: 'غير مسموح لك بالوصول' });
  next();
};

module.exports = { authenticate, authorize };

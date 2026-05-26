const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/materialController');

router.use(authenticate);

router.get('/student',              ctrl.getForStudent);
router.get('/',                     ctrl.getByClass);
router.post('/', authorize('admin', 'teacher'), ctrl.uploadMiddleware, ctrl.create);
router.delete('/:id', authorize('admin', 'teacher'), ctrl.remove);

module.exports = router;

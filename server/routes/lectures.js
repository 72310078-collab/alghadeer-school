const router = require('express').Router();
const ctrl = require('../controllers/lectureController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', ctrl.getAll);
router.post('/', authorize('admin', 'teacher'), ctrl.create);
router.put('/:id', authorize('admin', 'teacher'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;

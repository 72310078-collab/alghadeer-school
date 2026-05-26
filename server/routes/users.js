const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/userController');

router.use(authenticate);
router.get('/stats', authorize('admin'), ctrl.getStats);
router.get('/', authorize('admin', 'teacher'), ctrl.getAllUsers);
router.get('/:id', ctrl.getUserById);
router.post('/', authorize('admin'), ctrl.createUser);
router.put('/:id', ctrl.updateUser);
router.delete('/:id', authorize('admin'), ctrl.deleteUser);

module.exports = router;

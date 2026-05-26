const router = require('express').Router();
const ctrl = require('../controllers/teacherController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.get('/:id/schedule', ctrl.getSchedule);

module.exports = router;

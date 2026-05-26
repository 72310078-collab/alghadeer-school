const router = require('express').Router();
const ctrl   = require('../controllers/seatController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/my-seat', ctrl.getMySeat);

router.get('/classroom/:class_id',  ctrl.getClassroom);
router.post('/classroom', authorize('admin', 'teacher'), ctrl.saveClassroom);

router.get('/allocations/:class_id',    ctrl.getAllocations);
router.post('/generate', authorize('admin', 'teacher'), ctrl.generateAllocations);
router.delete('/allocations/:class_id', authorize('admin', 'teacher'), ctrl.clearAllocations);

module.exports = router;

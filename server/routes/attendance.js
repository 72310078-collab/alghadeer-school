const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/attendanceController');

router.use(authenticate);

router.get('/report',             ctrl.getReport);
router.get('/summary',            ctrl.getSummary);
router.get('/student/:studentId', ctrl.getStudentAttendance);
router.get('/',                   ctrl.getByClassDate);
router.post('/bulk', authorize('admin', 'teacher'), ctrl.saveBulk);

module.exports = router;

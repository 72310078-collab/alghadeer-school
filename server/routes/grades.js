const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/gradeController');

router.use(authenticate);
router.get('/',                   authorize('admin'), ctrl.getAll);
router.get('/student/:studentId', ctrl.getStudentGrades);
router.get('/class/:classId', authorize('admin', 'teacher'), ctrl.getClassGrades);
router.post('/bulk', authorize('admin', 'teacher'), ctrl.bulkSave);
router.post('/', authorize('admin', 'teacher'), ctrl.upsertGrade);
router.delete('/:id', authorize('admin', 'teacher'), ctrl.deleteGrade);

module.exports = router;

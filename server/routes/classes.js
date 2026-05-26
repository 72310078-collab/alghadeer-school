const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/classController');

router.use(authenticate);
router.get('/student/:studentId', ctrl.getStudentClasses);
router.get('/catalog',            ctrl.getCatalog);
router.post('/catalog',           authorize('admin'), ctrl.addCatalog);
router.delete('/catalog/:id',     authorize('admin'), ctrl.removeCatalog);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('admin'), ctrl.create);
router.put('/:id', authorize('admin', 'teacher'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);
router.post('/:id/enroll', authorize('admin'), ctrl.enrollStudent);
router.delete('/:id/students/:studentId', authorize('admin'), ctrl.unenrollStudent);
router.post('/:id/subjects', authorize('admin'), ctrl.addSubject);
router.put('/:id/subjects/:subjectId', authorize('admin'), ctrl.updateSubject);
router.delete('/:id/subjects/:subjectId', authorize('admin'), ctrl.deleteSubject);

module.exports = router;

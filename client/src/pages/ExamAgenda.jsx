import { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RoomIcon from '@mui/icons-material/Room';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import '../styles/dashboard.css';

const SEMESTER_LABEL = { first: 'الفصل الأول', second: 'الفصل الثاني', final: 'الامتحان النهائي' };
const SEMESTER_COLOR = { first: 'badge-green', second: 'badge-confirm', final: 'badge-red' };

export default function ExamAgenda() {
  const { user } = useAuth();
  const isAdmin   = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSemester, setFilterSemester] = useState('');
  const [filterClass, setFilterClass] = useState('');

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', class_id: '', subject_name: '',
    exam_date: '', start_time: '08:00', end_time: '10:00',
    room: '', semester: 'first', academic_year: '2024-2025', notes: '',
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterSemester) params.semester = filterSemester;
      if (filterClass)    params.class_id = filterClass;
      const { data } = await api.get('/exams', { params });
      setExams(data);
    } catch { toast.error('فشل تحميل جدول الامتحانات'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (isAdmin) {
      // Admin sees all classes
      api.get('/classes').then(r => setClasses(r.data || [])).catch(() => {});
    } else if (isTeacher) {
      // Teacher sees only their own classes in the filter
      api.get('/classes', { params: { teacher_id: user.id } })
        .then(r => setClasses(r.data || [])).catch(() => {});
    }
    // Student: no class filter needed
  }, [user, isAdmin, isTeacher]);

  useEffect(() => { load(); }, [filterSemester, filterClass]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: '', class_id: '', subject_name: '',
      exam_date: '', start_time: '08:00', end_time: '10:00',
      room: '', semester: 'first', academic_year: '2024-2025', notes: '',
    });
    setModal(true);
  };

  const openEdit = (e) => {
    setEditing(e);
    setForm({
      title: e.title,
      class_id: e.class_id ? String(e.class_id) : '',
      subject_name: e.subject_name,
      exam_date: e.exam_date?.slice(0, 10) || '',
      start_time: e.start_time?.slice(0, 5) || '08:00',
      end_time: e.end_time?.slice(0, 5) || '10:00',
      room: e.room || '',
      semester: e.semester || 'first',
      academic_year: e.academic_year || '2024-2025',
      notes: e.notes || '',
    });
    setModal(true);
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/exams/${editing.id}`, form);
        toast.success('تم التحديث');
      } else {
        await api.post('/exams', form);
        toast.success('تمت إضافة الامتحان');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل الحفظ');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`هل تريد حذف امتحان "${title}"؟`)) return;
    try {
      await api.delete(`/exams/${id}`);
      toast.success('تم الحذف');
      load();
    } catch { toast.error('فشل الحذف'); }
  };

  const formatDate = (d) => {
    try { return format(new Date(d), 'EEEE، d MMMM yyyy', { locale: ar }); } catch { return d; }
  };

  const byDate = exams.reduce((acc, e) => {
    const key = e.exam_date?.slice(0, 10);
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});
  const sortedDates = Object.keys(byDate).sort();

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">جدول الامتحانات</h1>
          <p className="page-breadcrumb">
            {isStudent
              ? `${exams.length} امتحان لصفّك`
              : isTeacher
              ? `${exams.length} امتحان لصفوفك`
              : `${exams.length} امتحان مجدول`}
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-school-primary d-flex align-items-center gap-1" onClick={openCreate}>
            <AddIcon style={{ fontSize: 20 }} /> إضافة امتحان
          </button>
        )}
      </div>

      <div className="school-card mb-4">
        <div className="row g-3 align-items-end">
          <div className={isStudent ? 'col-md-6' : 'col-md-3'}>
            <label className="school-label">الفصل الدراسي</label>
            <select className="school-input" value={filterSemester} onChange={e => setFilterSemester(e.target.value)}>
              <option value="">جميع الفصول</option>
              <option value="first">الفصل الأول</option>
              <option value="second">الفصل الثاني</option>
              <option value="final">النهائي</option>
            </select>
          </div>
          {!isStudent && (
            <div className="col-md-3">
              <label className="school-label">الصف</label>
              <select className="school-input" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
                <option value="">{isTeacher ? 'جميع صفوفي' : 'جميع الصفوف'}</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          {(filterSemester || filterClass) && (
            <div className="col-auto">
              <button className="btn btn-ghost btn-sm" onClick={() => { setFilterSemester(''); setFilterClass(''); }}>
                مسح الفلتر
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="school-card p-5 text-center"><div className="school-spinner" /></div>
      ) : sortedDates.length === 0 ? (
        <div className="school-card text-center p-5" style={{ color: '#9ca3af' }}>
          <AssignmentIcon style={{ fontSize: 48, opacity: 0.3 }} />
          <p style={{ marginTop: 12 }}>لا توجد امتحانات مجدولة</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {sortedDates.map(date => {
            const isPast = date < today;
            const isToday = date === today;
            return (
              <div key={date}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
                }}>
                  <div style={{
                    background: isToday ? 'var(--clr-green)' : isPast ? '#6b7280' : 'var(--clr-confirm)',
                    color: '#fff', borderRadius: 8, padding: '4px 12px',
                    fontWeight: 700, fontSize: 14,
                  }}>
                    {isToday ? 'اليوم' : formatDate(date)}
                  </div>
                  {isPast && !isToday && (
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>انتهى</span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {byDate[date].map(exam => (
                    <div key={exam.id} className="school-card" style={{
                      borderRight: `4px solid ${isPast ? '#d1d5db' : 'var(--clr-confirm)'}`,
                      opacity: isPast ? 0.75 : 1,
                      padding: '14px 16px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: 16 }}>{exam.subject_name}</span>
                            <span className={`badge-school ${SEMESTER_COLOR[exam.semester]}`}>
                              {SEMESTER_LABEL[exam.semester]}
                            </span>
                            {exam.class_name && (
                              <span className="badge-school badge-gray">{exam.class_name}</span>
                            )}
                          </div>
                          {exam.title !== exam.subject_name && (
                            <p style={{ margin: '0 0 6px', color: '#6b7280', fontSize: 13 }}>{exam.title}</p>
                          )}
                          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: '#9ca3af' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <AccessTimeIcon style={{ fontSize: 14 }} />
                              <span style={{ direction: 'ltr' }}>
                                {exam.start_time?.slice(0, 5)} – {exam.end_time?.slice(0, 5)}
                              </span>
                            </span>
                            {exam.room && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <RoomIcon style={{ fontSize: 14 }} />
                                {exam.room}
                              </span>
                            )}
                          </div>
                          {exam.notes && (
                            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>
                              {exam.notes}
                            </p>
                          )}
                        </div>
                        {isAdmin && (
                          <div className="d-flex gap-2" style={{ flexShrink: 0, marginRight: 12 }}>
                            <button className="btn btn-school-primary btn-sm" onClick={() => openEdit(exam)}>
                              <EditIcon style={{ fontSize: 15 }} />
                            </button>
                            <button className="btn btn-school-danger btn-sm" onClick={() => handleDelete(exam.id, exam.subject_name)}>
                              <DeleteIcon style={{ fontSize: 15 }} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="school-modal-overlay" onClick={() => setModal(false)}>
          <div className="school-modal" onClick={e => e.stopPropagation()}>
            <div className="school-modal-header">
              <span className="school-modal-title">{editing ? 'تعديل امتحان' : 'إضافة امتحان جديد'}</span>
              <button className="school-modal-close" onClick={() => setModal(false)}><CloseIcon style={{ fontSize: 18 }} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="school-modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="school-label">عنوان الامتحان</label>
                    <input className="school-input" required value={form.title}
                      onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                      />
                  </div>
                  <div className="col-md-6">
                    <label className="school-label">اسم المادة</label>
                    <input className="school-input" required value={form.subject_name}
                      onChange={e => setForm(p => ({ ...p, subject_name: e.target.value }))}
                      />
                  </div>
                  <div className="col-md-6">
                    <label className="school-label">الصف</label>
                    <select className="school-input" value={form.class_id}
                      onChange={e => setForm(p => ({ ...p, class_id: e.target.value }))}>
                      <option value="">جميع الصفوف</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="school-label">الفصل الدراسي</label>
                    <select className="school-input" value={form.semester}
                      onChange={e => setForm(p => ({ ...p, semester: e.target.value }))}>
                      <option value="first">الفصل الأول</option>
                      <option value="second">الفصل الثاني</option>
                      <option value="final">النهائي</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="school-label">تاريخ الامتحان</label>
                    <input className="school-input" type="date" required value={form.exam_date}
                      onChange={e => setForm(p => ({ ...p, exam_date: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="school-label">وقت البداية</label>
                    <input className="school-input" type="time" required value={form.start_time}
                      onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="school-label">وقت النهاية</label>
                    <input className="school-input" type="time" required value={form.end_time}
                      onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="school-label">القاعة</label>
                    <input className="school-input" value={form.room}
                      onChange={e => setForm(p => ({ ...p, room: e.target.value }))}
                      />
                  </div>
                  <div className="col-12">
                    <label className="school-label">ملاحظات</label>
                    <textarea className="school-input" rows={2} value={form.notes}
                      onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                      />
                  </div>
                </div>
              </div>
              <div className="school-modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-school-primary" disabled={saving}>
                  {saving ? 'جارٍ الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RoomIcon from '@mui/icons-material/Room';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

const DAYS = [
  { key: 'monday',    label: 'الاثنين' },
  { key: 'tuesday',  label: 'الثلاثاء' },
  { key: 'wednesday',label: 'الأربعاء' },
  { key: 'thursday', label: 'الخميس' },
];

const DAY_COLORS = {
  monday:    '#1E7A2A',
  tuesday:   '#D4A017',
  wednesday: '#1565C0',
  thursday:  '#6A1B9A',
};

const EMPTY_FORM = {
  subject_id: '', day_of_week: 'monday',
  start_time: '08:00', end_time: '09:00', room: '',
};

export default function Schedule() {
  const { user } = useAuth();
  const isAdmin   = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  const canEdit   = isAdmin; // only admin can add/edit/delete

  const [classes,       setClasses]       = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [classData,     setClassData]     = useState(null);
  const [schedule,      setSchedule]      = useState([]);
  const [loading,       setLoading]       = useState(false);

  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [saving,  setSaving]  = useState(false);

  // Load class list for admin/teacher picker; student auto-loads their class
  useEffect(() => {
    if (!user) return;
    if (isStudent) {
      // Auto-load the student's own class
      if (user.class_id) {
        setSelectedClass(String(user.class_id));
        loadSchedule(user.class_id);
      }
    } else if (isTeacher) {
      api.get('/classes', { params: { teacher_id: user.id } })
        .then(r => setClasses(r.data || []))
        .catch(() => toast.error('فشل تحميل الصفوف'));
    } else if (isAdmin) {
      api.get('/classes')
        .then(r => setClasses(r.data || []))
        .catch(() => toast.error('فشل تحميل الصفوف'));
    }
  }, [user]);

  const loadSchedule = async (classId) => {
    if (!classId) { setSchedule([]); setClassData(null); return; }
    setLoading(true);
    try {
      const [schedRes, classRes] = await Promise.all([
        api.get('/lectures', { params: { class_id: classId } }),
        api.get(`/classes/${classId}`),
      ]);
      setSchedule(schedRes.data || []);
      setClassData(classRes.data);
    } catch { toast.error('فشل تحميل الجدول'); }
    finally { setLoading(false); }
  };

  const handleClassChange = (id) => {
    setSelectedClass(id);
    loadSchedule(id);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModal(true);
  };

  const openEdit = (entry) => {
    setEditing(entry);
    const subj = (classData?.subjects || []).find(s => s.name === entry.subject_name);
    setForm({
      subject_id:  subj ? String(subj.id) : '',
      day_of_week: entry.day_of_week,
      start_time:  entry.start_time?.slice(0, 5) || '08:00',
      end_time:    entry.end_time?.slice(0, 5)   || '09:00',
      room:        entry.room || '',
    });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const subj = (classData?.subjects || []).find(s => String(s.id) === String(form.subject_id));
      if (!subj) { toast.error('اختر مادة دراسية'); setSaving(false); return; }

      const payload = {
        class_id:      parseInt(selectedClass),
        teacher_id:    subj.teacher_id || null,
        subject_name:  subj.name,
        day_of_week:   form.day_of_week,
        start_time:    form.start_time,
        end_time:      form.end_time,
        room:          form.room || null,
        academic_year: classData?.academic_year || '2025-2026',
      };

      if (editing) {
        await api.put(`/lectures/${editing.id}`, payload);
        toast.success('تم التحديث');
      } else {
        await api.post('/lectures', payload);
        toast.success('تمت إضافة الحصة');
      }
      setModal(false);
      loadSchedule(selectedClass);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل الحفظ');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل تريد حذف هذه الحصة؟')) return;
    try {
      await api.delete(`/lectures/${id}`);
      toast.success('تم الحذف');
      loadSchedule(selectedClass);
    } catch { toast.error('فشل الحذف'); }
  };

  const byDay = DAYS.map(d => ({
    ...d,
    entries: schedule
      .filter(s => s.day_of_week === d.key)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
  }));

  const subjects = classData?.subjects || [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">الجدول الأسبوعي</h1>
          <p className="page-breadcrumb">
            {isStudent
              ? (classData ? `جدول ${classData.name}` : 'جدول صفّك')
              : `${schedule.length} حصة مجدولة`}
          </p>
        </div>
        {selectedClass && canEdit && subjects.length > 0 && (
          <button className="btn btn-school-primary d-flex align-items-center gap-1" onClick={openCreate}>
            <AddIcon style={{ fontSize: 20 }} /> إضافة حصة
          </button>
        )}
      </div>

      {/* Class selector — admin and teacher only */}
      {!isStudent && (
        <div className="school-card mb-4">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <SchoolIcon style={{ color: 'var(--clr-green)', fontSize: 22 }} />
            <label style={{ fontWeight: 700, fontFamily: 'Tajawal,sans-serif', whiteSpace: 'nowrap' }}>
              {isTeacher ? 'اختر صفّك:' : 'اختر الصف:'}
            </label>
            <select
              className="school-input"
              style={{ maxWidth: 340, flex: 1 }}
              value={selectedClass}
              onChange={e => handleClassChange(e.target.value)}
            >
              <option value="">— اختر صفاً —</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — المرحلة {c.grade_level}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      {!selectedClass ? (
        <div className="school-card text-center p-5" style={{ color: '#9ca3af' }}>
          <CalendarViewWeekIcon style={{ fontSize: 56, opacity: 0.2, marginBottom: 12 }} />
          <p style={{ fontFamily: 'Tajawal,sans-serif' }}>اختر صفاً لعرض جدوله الأسبوعي</p>
        </div>

      ) : loading ? (
        <div className="school-card p-5 text-center"><div className="school-spinner" /></div>

      ) : (
        /* 4-day grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
        }}>
          {byDay.map(day => {
            const clr = DAY_COLORS[day.key];
            return (
              <div key={day.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                {/* Day header */}
                <div style={{
                  background: clr, color: '#fff', borderRadius: 10,
                  padding: '9px 14px', fontWeight: 700, fontSize: 14,
                  fontFamily: 'Tajawal,sans-serif', textAlign: 'center',
                  boxShadow: `0 3px 10px ${clr}40`,
                }}>
                  {day.label}
                  <span style={{ fontWeight: 400, fontSize: 12, opacity: 0.85, marginRight: 6 }}>
                    ({day.entries.length})
                  </span>
                </div>

                {/* Entries */}
                {day.entries.length === 0 ? (
                  <div style={{
                    minHeight: 90, borderRadius: 10,
                    border: `2px dashed ${clr}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#c4c4c4', fontSize: 12, fontFamily: 'Tajawal,sans-serif',
                  }}>
                    لا حصص
                  </div>
                ) : (
                  day.entries.map(entry => (
                    <div key={entry.id} style={{
                      background: '#fff',
                      border: `1.5px solid ${clr}25`,
                      borderRight: `4px solid ${clr}`,
                      borderRadius: 10,
                      padding: '10px 12px',
                      boxShadow: '0 1px 5px rgba(0,0,0,0.05)',
                    }}>
                      <div style={{
                        fontWeight: 700, fontSize: 14,
                        fontFamily: 'Tajawal,sans-serif', color: 'var(--clr-dark)',
                        marginBottom: 3,
                      }}>
                        {entry.subject_name}
                      </div>

                      {entry.teacher_name && (
                        <div style={{
                          fontSize: 12, color: clr, fontFamily: 'Tajawal,sans-serif',
                          fontWeight: 600, marginBottom: 4,
                        }}>
                          {entry.teacher_name}
                        </div>
                      )}

                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 11, color: '#9ca3af', direction: 'ltr', fontWeight: 600,
                      }}>
                        <AccessTimeIcon style={{ fontSize: 13 }} />
                        {entry.start_time?.slice(0, 5)} – {entry.end_time?.slice(0, 5)}
                      </div>

                      {entry.room && (
                        <div style={{
                          fontSize: 11, color: '#9ca3af', marginTop: 3,
                          display: 'flex', alignItems: 'center', gap: 3,
                          fontFamily: 'Tajawal,sans-serif',
                        }}>
                          <RoomIcon style={{ fontSize: 12 }} /> {entry.room}
                        </div>
                      )}

                      {/* Edit/Delete only for admin */}
                      {canEdit && (
                        <div className="d-flex gap-1 mt-2"
                          style={{ borderTop: '1px solid #f3f4f6', paddingTop: 6 }}>
                          <button
                            className="btn btn-school-primary btn-sm flex-fill"
                            style={{ fontSize: 11, padding: '3px 0' }}
                            onClick={() => openEdit(entry)}
                          >
                            <EditIcon style={{ fontSize: 13 }} />
                          </button>
                          <button
                            className="btn btn-school-danger btn-sm flex-fill"
                            style={{ fontSize: 11, padding: '3px 0' }}
                            onClick={() => handleDelete(entry.id)}
                          >
                            <DeleteIcon style={{ fontSize: 13 }} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit modal — admin only */}
      {modal && canEdit && (
        <div className="school-modal-overlay" onClick={() => setModal(false)}>
          <div className="school-modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="school-modal-header">
              <span className="school-modal-title">{editing ? 'تعديل حصة' : 'إضافة حصة'}</span>
              <button className="school-modal-close" onClick={() => setModal(false)}>
                <CloseIcon style={{ fontSize: 18 }} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="school-modal-body">
                <div className="row g-3">

                  <div className="col-12">
                    <label className="school-label">المادة الدراسية <span style={{ color: '#C0132A' }}>*</span></label>
                    <select className="school-input" required value={form.subject_id}
                      onChange={e => setForm(p => ({ ...p, subject_id: e.target.value }))}>
                      <option value="">— اختر مادة —</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}{s.teacher_name ? ` — ${s.teacher_name}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="school-label">اليوم <span style={{ color: '#C0132A' }}>*</span></label>
                    <select className="school-input" required value={form.day_of_week}
                      onChange={e => setForm(p => ({ ...p, day_of_week: e.target.value }))}>
                      {DAYS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                    </select>
                  </div>

                  <div className="col-6">
                    <label className="school-label">وقت البداية <span style={{ color: '#C0132A' }}>*</span></label>
                    <input className="school-input" type="time" required value={form.start_time}
                      onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} />
                  </div>

                  <div className="col-6">
                    <label className="school-label">وقت النهاية <span style={{ color: '#C0132A' }}>*</span></label>
                    <input className="school-input" type="time" required value={form.end_time}
                      onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} />
                  </div>

                  <div className="col-12">
                    <label className="school-label">القاعة</label>
                    <input className="school-input" value={form.room}
                      onChange={e => setForm(p => ({ ...p, room: e.target.value }))} />
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

import { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ScheduleIcon from '@mui/icons-material/Schedule';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

const DAYS = [
  { key: 'sunday',    label: 'الأحد' },
  { key: 'monday',    label: 'الاثنين' },
  { key: 'tuesday',  label: 'الثلاثاء' },
  { key: 'wednesday',label: 'الأربعاء' },
  { key: 'thursday', label: 'الخميس' },
];

const DAY_COLORS = {
  sunday: '#4caf7d', monday: '#f0a500',
  tuesday: '#e05c5c', wednesday: '#5c9ce0', thursday: '#9c5ce0',
};

export default function Lectures() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [lectures, setLectures] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTeacher, setFilterTeacher] = useState(isAdmin ? '' : String(user?.id || ''));
  const [filterClass, setFilterClass] = useState('');
  const [filterDay, setFilterDay] = useState('');

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    teacher_id: '', class_id: '', subject_name: '',
    day_of_week: 'sunday', start_time: '08:00', end_time: '09:00',
    room: '', academic_year: '2024-2025',
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterTeacher) params.teacher_id = filterTeacher;
      if (filterClass) params.class_id = filterClass;
      if (filterDay) params.day = filterDay;
      const { data } = await api.get('/lectures', { params });
      setLectures(data);
    } catch { toast.error('فشل تحميل المحاضرات'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [tRes, cRes] = await Promise.all([
          api.get('/teachers'),
          api.get('/classes'),
        ]);
        setTeachers(tRes.data.teachers || []);
        setClasses(cRes.data || []);
      } catch { }
    };
    init();
  }, []);

  useEffect(() => { load(); }, [filterTeacher, filterClass, filterDay]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      teacher_id: isAdmin ? '' : String(user?.id || ''),
      class_id: '', subject_name: '', day_of_week: 'sunday',
      start_time: '08:00', end_time: '09:00', room: '', academic_year: '2024-2025',
    });
    setModal(true);
  };

  const openEdit = (l) => {
    setEditing(l);
    setForm({
      teacher_id: String(l.teacher_id),
      class_id: String(l.class_id),
      subject_name: l.subject_name,
      day_of_week: l.day_of_week,
      start_time: l.start_time?.slice(0, 5) || '08:00',
      end_time: l.end_time?.slice(0, 5) || '09:00',
      room: l.room || '',
      academic_year: l.academic_year || '2024-2025',
    });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/lectures/${editing.id}`, form);
        toast.success('تم التحديث');
      } else {
        await api.post('/lectures', form);
        toast.success('تمت إضافة المحاضرة');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل الحفظ');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل تريد حذف هذه المحاضرة؟')) return;
    try {
      await api.delete(`/lectures/${id}`);
      toast.success('تم الحذف');
      load();
    } catch { toast.error('فشل الحذف'); }
  };

  const byDay = DAYS.map(d => ({
    ...d,
    items: lectures.filter(l => l.day_of_week === d.key)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
  }));

  const visibleDays = filterDay
    ? byDay.filter(d => d.key === filterDay)
    : byDay.filter(d => d.items.length > 0);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">جدول المحاضرات</h1>
          <p className="page-breadcrumb">إجمالي: {lectures.length} محاضرة</p>
        </div>
        <button className="btn btn-school-primary d-flex align-items-center gap-1" onClick={openCreate}>
          <AddIcon style={{ fontSize: 20 }} /> إضافة محاضرة
        </button>
      </div>

      <div className="school-card mb-4">
        <div className="row g-3 align-items-center">
          {isAdmin && (
            <div className="col-md-3">
              <label className="school-label">المعلم</label>
              <select className="school-input" value={filterTeacher} onChange={e => setFilterTeacher(e.target.value)}>
                <option value="">جميع المعلمين</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
          <div className="col-md-3">
            <label className="school-label">الصف</label>
            <select className="school-input" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
              <option value="">جميع الصفوف</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label className="school-label">اليوم</label>
            <select className="school-input" value={filterDay} onChange={e => setFilterDay(e.target.value)}>
              <option value="">جميع الأيام</option>
              {DAYS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
            </select>
          </div>
          {(filterTeacher || filterClass || filterDay) && (
            <div className="col-auto" style={{ marginTop: 22 }}>
              <button className="btn btn-ghost btn-sm"
                onClick={() => { setFilterTeacher(isAdmin ? '' : String(user?.id || '')); setFilterClass(''); setFilterDay(''); }}>
                مسح الفلتر
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="school-card p-5 text-center"><div className="school-spinner" /></div>
      ) : visibleDays.length === 0 ? (
        <div className="school-card text-center p-5" style={{ color: '#9ca3af' }}>
          <ScheduleIcon style={{ fontSize: 48, opacity: 0.3 }} />
          <p style={{ marginTop: 12 }}>لا توجد محاضرات مجدولة</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {visibleDays.map(day => (
            <div key={day.key} className="school-card p-0 overflow-hidden">
              <div style={{ background: DAY_COLORS[day.key], color: '#fff', padding: '10px 18px', fontWeight: 700, fontSize: 15 }}>
                {day.label}
                <span style={{ fontWeight: 400, marginRight: 8, opacity: 0.85, fontSize: 13 }}>
                  ({day.items.length} {day.items.length === 1 ? 'محاضرة' : 'محاضرات'})
                </span>
              </div>
              {day.items.map((l, idx) => (
                <div key={l.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 18px',
                  borderBottom: idx < day.items.length - 1 ? '1px solid var(--clr-border)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: DAY_COLORS[day.key], flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{l.subject_name}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>
                        {l.class_name}{l.room ? ` — ${l.room}` : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {isAdmin && <span style={{ fontSize: 13, color: '#9ca3af' }}>{l.teacher_name}</span>}
                    <span style={{ direction: 'ltr', fontWeight: 600, color: DAY_COLORS[day.key] }}>
                      {l.start_time?.slice(0, 5)} – {l.end_time?.slice(0, 5)}
                    </span>
                    <div className="d-flex gap-2">
                      <button className="btn btn-school-primary btn-sm" onClick={() => openEdit(l)}>
                        <EditIcon style={{ fontSize: 15 }} />
                      </button>
                      <button className="btn btn-school-danger btn-sm" onClick={() => handleDelete(l.id)}>
                        <DeleteIcon style={{ fontSize: 15 }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="school-modal-overlay" onClick={() => setModal(false)}>
          <div className="school-modal" onClick={e => e.stopPropagation()}>
            <div className="school-modal-header">
              <span className="school-modal-title">{editing ? 'تعديل محاضرة' : 'إضافة محاضرة جديدة'}</span>
              <button className="school-modal-close" onClick={() => setModal(false)}><CloseIcon style={{ fontSize: 18 }} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="school-modal-body">
                <div className="row g-3">
                  {isAdmin && (
                    <div className="col-12">
                      <label className="school-label">المعلم</label>
                      <select className="school-input" required value={form.teacher_id}
                        onChange={e => setForm(p => ({ ...p, teacher_id: e.target.value }))}>
                        <option value="">اختر معلماً</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="col-md-6">
                    <label className="school-label">الصف</label>
                    <select className="school-input" required value={form.class_id}
                      onChange={e => setForm(p => ({ ...p, class_id: e.target.value }))}>
                      <option value="">اختر صفاً</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="school-label">اسم المادة</label>
                    <input className="school-input" required value={form.subject_name}
                      onChange={e => setForm(p => ({ ...p, subject_name: e.target.value }))}
                      />
                  </div>
                  <div className="col-md-6">
                    <label className="school-label">اليوم</label>
                    <select className="school-input" required value={form.day_of_week}
                      onChange={e => setForm(p => ({ ...p, day_of_week: e.target.value }))}>
                      {DAYS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="school-label">القاعة</label>
                    <input className="school-input" value={form.room}
                      onChange={e => setForm(p => ({ ...p, room: e.target.value }))}
                      />
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

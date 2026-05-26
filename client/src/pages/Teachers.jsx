import { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import ScheduleIcon from '@mui/icons-material/Schedule';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckIcon from '@mui/icons-material/Check';
import api from '../services/api';
import toast from 'react-hot-toast';
import '../styles/dashboard.css';

const DAY_LABELS = {
  sunday: 'الأحد', monday: 'الاثنين', tuesday: 'الثلاثاء',
  wednesday: 'الأربعاء', thursday: 'الخميس',
};

const SUBJ_COLORS = [
  '#1E7A2A','#0d6efd','#D4A017','#9333ea','#0e7490',
  '#9a3412','#065f46','#1e40af','#6d28d9','#b8860b',
];

export default function Teachers() {
  const [teachers,    setTeachers]    = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [modal,       setModal]       = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [form,        setForm]        = useState({ name: '', email: '', password: '', phone: '' });
  const [saving,      setSaving]      = useState(false);

  const [detail,         setDetail]         = useState(null);
  const [detailLoading,  setDetailLoading]  = useState(false);

  const [allClasses,         setAllClasses]         = useState([]);
  const [assignClassId,      setAssignClassId]      = useState('');
  const [assignClassSubjects,setAssignClassSubjects] = useState([]);
  const [assignSubjectId,    setAssignSubjectId]    = useState('');
  const [assigning,          setAssigning]          = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/teachers', { params: { search: search || undefined } });
      setTeachers(data.teachers);
      setTotal(data.total);
    } catch { toast.error('فشل تحميل المعلمين'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [search]);

  useEffect(() => {
    if (!assignClassId) { setAssignClassSubjects([]); setAssignSubjectId(''); return; }
    api.get(`/classes/${assignClassId}`)
      .then(r => { setAssignClassSubjects(r.data?.subjects || []); setAssignSubjectId(''); })
      .catch(() => {});
  }, [assignClassId]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', phone: '' });
    setModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({ name: t.name, email: t.email, password: '', phone: t.phone || '' });
    setModal(true);
  };

  const openDetail = async (t) => {
    setDetail({ ...t, classes: [], subjects: [], lectures: [] });
    setDetailLoading(true);
    setAssignClassId('');
    setAssignSubjectId('');
    try {
      const [detailRes, classesRes] = await Promise.all([
        api.get(`/teachers/${t.id}`),
        api.get('/classes'),
      ]);
      setDetail(detailRes.data);
      setAllClasses(classesRes.data || []);
    } catch { toast.error('فشل تحميل تفاصيل المعلم'); }
    finally { setDetailLoading(false); }
  };

  const refreshDetail = async () => {
    if (!detail) return;
    try {
      const r = await api.get(`/teachers/${detail.id}`);
      setDetail(r.data);
    } catch {}
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/users/${editing.id}`, { ...form, role: 'teacher' });
        toast.success('تم التحديث');
      } else {
        await api.post('/users', { ...form, role: 'teacher' });
        toast.success('تمت إضافة المعلم');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل الحفظ');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`هل تريد حذف المعلم "${name}"؟`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('تم الحذف');
      load();
    } catch { toast.error('فشل الحذف'); }
  };

  const handleAssign = async () => {
    if (!assignSubjectId || !assignClassId || !detail) return;
    const subj = assignClassSubjects.find(s => String(s.id) === String(assignSubjectId));
    if (!subj) return;
    setAssigning(true);
    try {
      await api.put(`/classes/${assignClassId}/subjects/${assignSubjectId}`, {
        name: subj.name,
        teacher_id: detail.id,
      });
      toast.success(`✓ تم تعيين "${subj.name}" للمعلم`);
      setAssignClassId('');
      setAssignSubjectId('');
      await refreshDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل التعيين');
    } finally { setAssigning(false); }
  };

  const handleRemoveAssignment = async (subj) => {
    if (!window.confirm(`إزالة "${subj.name}" من ${subj.class_name}؟`)) return;
    try {
      await api.put(`/classes/${subj.class_id}/subjects/${subj.id}`, {
        name: subj.name,
        teacher_id: null,
      });
      toast.success('تمت الإزالة');
      await refreshDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل الإزالة');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">إدارة المعلمين</h1>
          <p className="page-breadcrumb">إجمالي: {total} معلم</p>
        </div>
        <button className="btn btn-school-primary d-flex align-items-center gap-1" onClick={openCreate}>
          <AddIcon style={{ fontSize: 20 }} /> إضافة معلم
        </button>
      </div>

      <div className="school-card mb-4">
        <div className="input-icon-wrap" style={{ maxWidth: 400 }}>
          <span className="input-icon-right"><SearchIcon style={{ fontSize: 18 }} /></span>
          <input className="school-input input-with-icon-r"
            placeholder="ابحث بالاسم أو البريد..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="school-card p-0 overflow-hidden">
        {loading ? <div className="p-5 text-center"><div className="school-spinner" /></div> : (
          <div className="table-wrapper">
            <table className="table school-table mb-0">
              <thead><tr>
                <th>المعلم</th>
                <th>البريد الإلكتروني</th>
                <th>الهاتف</th>
                <th>الصفوف</th>
                <th>المواد</th>
                <th>الإجراءات</th>
              </tr></thead>
              <tbody>
                {teachers.length === 0 ? (
                  <tr><td colSpan={6} className="text-center p-4" style={{ color: '#9ca3af' }}>لا يوجد معلمون</td></tr>
                ) : teachers.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--clr-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                          <PersonIcon style={{ fontSize: 18 }} />
                        </div>
                        <span style={{ fontWeight: 600 }}>{t.name}</span>
                      </div>
                    </td>
                    <td style={{ direction: 'ltr' }}>{t.email}</td>
                    <td>{t.phone || '—'}</td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <SchoolIcon style={{ fontSize: 16, color: 'var(--clr-green)' }} />
                        <span>{t.class_count}</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <MenuBookIcon style={{ fontSize: 16, color: 'var(--clr-gold)' }} />
                        <span>{t.subject_count}</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn btn-school-primary btn-sm" title="عرض الملف" onClick={() => openDetail(t)}>
                          <VisibilityIcon style={{ fontSize: 16 }} />
                        </button>
                        <button className="btn btn-school-primary btn-sm" onClick={() => openEdit(t)}>
                          <EditIcon style={{ fontSize: 16 }} />
                        </button>
                        <button className="btn btn-school-danger btn-sm" onClick={() => handleDelete(t.id, t.name)}>
                          <DeleteIcon style={{ fontSize: 16 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="school-modal-overlay" onClick={() => setModal(false)}>
          <div className="school-modal" onClick={e => e.stopPropagation()}>
            <div className="school-modal-header">
              <span className="school-modal-title">{editing ? 'تعديل معلم' : 'إضافة معلم جديد'}</span>
              <button className="school-modal-close" onClick={() => setModal(false)}><CloseIcon style={{ fontSize: 18 }} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="school-modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="school-label">الاسم الكامل</label>
                    <input className="school-input" required value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="col-12">
                    <label className="school-label">البريد الإلكتروني</label>
                    <input className="school-input" type="email" required value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      style={{ direction: 'ltr' }} />
                  </div>
                  <div className="col-12">
                    <label className="school-label">الهاتف</label>
                    <input className="school-input" value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="col-12">
                    <label className="school-label">{editing ? 'كلمة مرور جديدة (اتركها فارغة للإبقاء)' : 'كلمة المرور'}</label>
                    <input className="school-input" type="password" required={!editing} value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
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

      {detail && (
        <div className="school-modal-overlay" onClick={() => setDetail(null)}>
          <div className="school-modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="school-modal-header">
              <span className="school-modal-title">ملف المعلم — {detail.name}</span>
              <button className="school-modal-close" onClick={() => setDetail(null)}><CloseIcon style={{ fontSize: 18 }} /></button>
            </div>

            <div className="school-modal-body">
              {detailLoading ? (
                <div className="text-center p-4"><div className="school-spinner" /></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                  <div style={{ background: 'var(--clr-surface)', borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--clr-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                      <PersonIcon style={{ fontSize: 26 }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'Tajawal,sans-serif' }}>{detail.name}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.85rem', direction: 'ltr' }}>{detail.email}</div>
                      {detail.phone && <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{detail.phone}</div>}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: 'Tajawal,sans-serif', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MenuBookIcon style={{ fontSize: 17, color: 'var(--clr-gold)' }} />
                      مواد التدريس
                      <span style={{ fontSize: 12, background: 'var(--clr-gold)', color: '#fff', borderRadius: 20, padding: '1px 8px', fontWeight: 600 }}>
                        {detail.subjects?.length || 0}
                      </span>
                    </div>

                    {detail.subjects?.length ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                        {detail.subjects.map((s, idx) => (
                          <div key={s.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: '#f9fafb', borderRadius: 8, padding: '8px 12px',
                            border: `1.5px solid ${SUBJ_COLORS[idx % SUBJ_COLORS.length]}25`,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{
                                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                background: SUBJ_COLORS[idx % SUBJ_COLORS.length],
                              }} />
                              <span style={{ fontWeight: 700, fontSize: '0.9rem', fontFamily: 'Tajawal,sans-serif', color: 'var(--clr-dark)' }}>
                                {s.name}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{
                                fontSize: '0.78rem', color: '#6b7280', fontFamily: 'Tajawal,sans-serif',
                                background: '#e5e7eb', borderRadius: 6, padding: '2px 8px',
                              }}>
                                {s.class_name}
                              </span>
                              <button onClick={() => handleRemoveAssignment(s)}
                                title="إزالة التعيين"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0132A', padding: 2, borderRadius: 4, display: 'flex' }}>
                                <CloseIcon style={{ fontSize: 16 }} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#9ca3af', fontSize: '0.88rem', fontFamily: 'Tajawal,sans-serif', marginBottom: 12 }}>
                        لم يتم تعيين أي مادة لهذا المعلم بعد
                      </p>
                    )}

                    <div style={{ background: 'rgba(30,122,42,0.04)', border: '1.5px dashed var(--clr-green)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Tajawal,sans-serif', color: 'var(--clr-green)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <AddIcon style={{ fontSize: 16 }} /> تعيين مادة جديدة
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1, minWidth: 140 }}>
                          <label className="school-label" style={{ fontSize: '0.78rem' }}>الصف</label>
                          <select className="school-input" style={{ fontSize: '0.85rem' }}
                            value={assignClassId}
                            onChange={e => setAssignClassId(e.target.value)}>
                            <option value="">— اختر الصف —</option>
                            {allClasses.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div style={{ flex: 1, minWidth: 140 }}>
                          <label className="school-label" style={{ fontSize: '0.78rem' }}>المادة</label>
                          <select className="school-input" style={{ fontSize: '0.85rem' }}
                            value={assignSubjectId}
                            disabled={!assignClassId || assignClassSubjects.length === 0}
                            onChange={e => setAssignSubjectId(e.target.value)}>
                            <option value="">— اختر المادة —</option>
                            {assignClassSubjects.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                                {s.teacher_name ? ` (${s.teacher_name})` : ' (غير معين)'}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={handleAssign}
                          disabled={!assignSubjectId || assigning}
                          className="btn btn-school-primary d-flex align-items-center gap-1"
                          style={{ fontSize: '0.85rem', height: 40 }}>
                          {assigning
                            ? <><span className="school-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> جارٍ...</>
                            : <><CheckIcon style={{ fontSize: 16 }} /> تعيين</>}
                        </button>
                      </div>

                      {assignClassId && assignClassSubjects.length === 0 && (
                        <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#9ca3af', fontFamily: 'Tajawal,sans-serif' }}>
                          لا توجد مواد في هذا الصف — أضف مواد أولاً من صفحة الصفوف
                        </p>
                      )}
                    </div>
                  </div>

                  {detail.lectures?.length > 0 && (
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: 'Tajawal,sans-serif', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ScheduleIcon style={{ fontSize: 17, color: 'var(--clr-green)' }} />
                        الجدول الأسبوعي
                        <span style={{ fontSize: 12, background: 'var(--clr-green)', color: '#fff', borderRadius: 20, padding: '1px 8px', fontWeight: 600 }}>
                          {detail.lectures.length}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {detail.lectures.map(l => (
                          <div key={l.id} style={{ background: 'var(--clr-surface)', borderRadius: 8, padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', fontFamily: 'Tajawal,sans-serif' }}>
                            <span style={{ fontWeight: 600 }}>{l.subject_name}</span>
                            <span style={{ color: '#6b7280' }}>{l.class_name}</span>
                            <span style={{ direction: 'ltr', color: 'var(--clr-green)', fontWeight: 600 }}>
                              {DAY_LABELS[l.day_of_week]} &nbsp;{l.start_time?.slice(0, 5)}–{l.end_time?.slice(0, 5)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

            <div className="school-modal-footer">
              <button className="btn btn-ghost" onClick={() => setDetail(null)}>إغلاق</button>
              <button className="btn btn-school-primary" onClick={() => { setDetail(null); openEdit(detail); }}>
                <EditIcon style={{ fontSize: 16, marginLeft: 4 }} /> تعديل البيانات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

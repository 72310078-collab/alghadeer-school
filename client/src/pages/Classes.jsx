import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

const SUBJECT_COLORS = [
  { bg: '#e8f5e9', text: '#1E7A2A' },
  { bg: '#fff8e1', text: '#b8860b' },
  { bg: '#e3f2fd', text: '#1e40af' },
  { bg: '#e0f2f1', text: '#065f46' },
  { bg: '#f3e5f5', text: '#6d28d9' },
  { bg: '#e0f7fa', text: '#0e7490' },
  { bg: '#fff3e0', text: '#9a3412' },
  { bg: '#fce4ec', text: '#9f1239' },
  { bg: '#ede7f6', text: '#4c1d95' },
  { bg: '#e8eaf6', text: '#3730a3' },
];

export default function Classes() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [classes,  setClasses]  = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [catalog,  setCatalog]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', grade_level: '', academic_year: '2025-2026',
    subjects: [],
    deletedIds: [],
  });
  const [subjectInput, setSubjectInput] = useState({ name: '', teacher_id: '' });
  const [saving, setSaving] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = user?.role === 'teacher' ? { teacher_id: user.id } : {};
      const clRes = await api.get('/classes', { params });
      setClasses(clRes.data);
      if (user?.role === 'admin') {
        const [tRes, catRes] = await Promise.allSettled([
          api.get('/users', { params: { role: 'teacher' } }),
          api.get('/classes/catalog'),
        ]);
        if (tRes.status === 'fulfilled') setTeachers(tRes.value.data.users || []);
        if (catRes.status === 'fulfilled') setCatalog(catRes.value.data || []);
      }
    } catch { toast.error('فشل التحميل'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', grade_level: '', academic_year: '2025-2026', subjects: [], deletedIds: [] });
    setSubjectInput({ name: '', teacher_id: '' });
    setModal(true);
  };

  const openEdit = async (c, e) => {
    e.stopPropagation();
    setEditing(c);
    setForm({ name: c.name, grade_level: c.grade_level, academic_year: c.academic_year, subjects: [], deletedIds: [] });
    setSubjectInput({ name: '', teacher_id: '' });
    setModal(true);
    setLoadingSubjects(true);
    try {
      const res = await api.get(`/classes/${c.id}`);
      setForm(prev => ({
        ...prev,
        subjects: (res.data.subjects || []).map(s => ({
          id: s.id, name: s.name,
          teacher_id: s.teacher_id ? String(s.teacher_id) : '',
          teacher_name: s.teacher_name || '',
        })),
      }));
    } catch {}
    finally { setLoadingSubjects(false); }
  };

  const addSubjectToForm = () => {
    const trimmed = subjectInput.name.trim();
    if (!trimmed) { toast.error('اختر مادة دراسية'); return; }
    const exists = form.subjects.some(s => s.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) { toast.error('هذه المادة موجودة بالفعل'); return; }
    const teacherObj = teachers.find(t => String(t.id) === String(subjectInput.teacher_id));
    setForm(prev => ({
      ...prev,
      subjects: [...prev.subjects, {
        name: trimmed,
        teacher_id: subjectInput.teacher_id || '',
        teacher_name: teacherObj?.name || '',
      }],
    }));
    setSubjectInput({ name: '', teacher_id: '' });
  };

  const removeSubjectFromForm = (idx) => {
    const subj = form.subjects[idx];
    setForm(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== idx),
      deletedIds: subj.id ? [...prev.deletedIds, subj.id] : prev.deletedIds,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        grade_level: form.grade_level,
        teacher_id: null,
        academic_year: form.academic_year,
      };

      let classId;
      if (editing) {
        await api.put(`/classes/${editing.id}`, payload);
        classId = editing.id;

        for (const id of form.deletedIds) {
          await api.delete(`/classes/${classId}/subjects/${id}`).catch(() => {});
        }

        for (const s of form.subjects) {
          if (s.id) {
            await api.put(`/classes/${classId}/subjects/${s.id}`, {
              name: s.name,
              teacher_id: s.teacher_id || null,
            }).catch(() => {});
          } else {
            await api.post(`/classes/${classId}/subjects`, {
              name: s.name,
              teacher_id: s.teacher_id || null,
            }).catch(() => {});
          }
        }
      } else {
        const { data } = await api.post('/classes', payload);
        classId = data.id;

        for (const s of form.subjects) {
          await api.post(`/classes/${classId}/subjects`, {
            name: s.name,
            teacher_id: s.teacher_id || null,
          }).catch(() => {});
        }
      }

      toast.success(editing ? 'تم التحديث' : 'تم الإنشاء');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل الحفظ');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`حذف الصف "${name}"؟`)) return;
    try { await api.delete(`/classes/${id}`); toast.success('تم الحذف'); load(); }
    catch { toast.error('فشل الحذف'); }
  };

  const openDetail = async (c) => {
    if (user?.role === 'teacher') {
      navigate(`/classes/${c.id}/materials`);
      return;
    }
    setDetail({ ...c, subjects: [] });
    setDetailLoading(true);
    try {
      const res = await api.get(`/classes/${c.id}`);
      setDetail(res.data);
    } catch { toast.error('فشل تحميل التفاصيل'); }
    finally { setDetailLoading(false); }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{user?.role === 'teacher' ? 'صفوفي الدراسية' : 'الصفوف الدراسية'}</h1>
          <p className="page-breadcrumb">{classes.length} صف</p>
        </div>
        {isAdmin && (
          <button className="btn btn-school-primary d-flex align-items-center gap-1" onClick={openCreate}>
            <AddIcon style={{ fontSize: 20 }} /> إضافة صف
          </button>
        )}
      </div>

      {loading ? <div className="text-center p-5"><div className="school-spinner" /></div> : (
        <div className="row g-4">
          {classes.map(c => (
            <div key={c.id} className="col-md-4 col-lg-3">
              <div
                className="school-card h-100"
                style={{ borderTop: '4px solid var(--clr-green)', cursor: 'pointer' }}
                onClick={() => openDetail(c)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(30,122,42,0.13)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,var(--clr-green),var(--clr-green-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: '1rem' }}>
                  <MenuBookIcon style={{ fontSize: 26 }} />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--clr-dark)', marginBottom: '0.5rem', fontFamily: 'Tajawal,sans-serif' }}>{c.name}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: 0 }}>المرحلة: {c.grade_level}</p>

                <div className="d-flex align-items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
                  <PeopleIcon style={{ fontSize: 18, color: 'var(--clr-green)' }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--clr-dark)' }}>{c.student_count} طالب</span>
                </div>

                {user?.role === 'teacher' && (
                  <div className="d-flex align-items-center gap-2 mt-2"
                    style={{ color: 'var(--clr-green)', fontSize: '0.83rem', fontWeight: 700, fontFamily: 'Tajawal,sans-serif' }}>
                    <VideoLibraryIcon style={{ fontSize: 16 }} />
                    <span>المواد والملفات</span>
                    <ArrowForwardIosIcon style={{ fontSize: 11, marginRight: 'auto' }} />
                  </div>
                )}

                {isAdmin && (
                  <div className="d-flex gap-2 mt-3">
                    <button
                      className="btn btn-school-primary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                      onClick={(e) => openEdit(c, e)}
                    >
                      <EditIcon style={{ fontSize: 16 }} /> تعديل
                    </button>
                    <button
                      className="btn btn-school-danger btn-sm"
                      onClick={(e) => handleDelete(c.id, c.name, e)}
                    >
                      <DeleteIcon style={{ fontSize: 16 }} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="school-modal-overlay" onClick={() => setModal(false)}>
          <div className="school-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="school-modal-header">
              <span className="school-modal-title">{editing ? 'تعديل الصف' : 'إضافة صف جديد'}</span>
              <button className="school-modal-close" onClick={() => setModal(false)}><CloseIcon style={{ fontSize: 18 }} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="school-modal-body">

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="school-label">اسم الصف <span style={{ color: '#C0132A' }}>*</span></label>
                    <input className="school-input" required value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="school-label">المرحلة الدراسية <span style={{ color: '#C0132A' }}>*</span></label>
                    <input className="school-input" required value={form.grade_level}
                      onChange={e => setForm(p => ({ ...p, grade_level: e.target.value }))} />
                  </div>
                  <div className="col-12">
                    <label className="school-label">العام الدراسي</label>
                    <input className="school-input" value={form.academic_year}
                      onChange={e => setForm(p => ({ ...p, academic_year: e.target.value }))} />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <MenuBookIcon style={{ fontSize: 17, color: 'var(--clr-green)' }} />
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--clr-dark)', fontFamily: 'Tajawal,sans-serif' }}>
                      المواد الدراسية
                    </span>
                    {form.subjects.length > 0 && (
                      <span style={{ background: 'var(--clr-green)', color: '#fff', borderRadius: 20, padding: '1px 9px', fontSize: '0.72rem', fontWeight: 700 }}>
                        {form.subjects.length}
                      </span>
                    )}
                  </div>

                  {loadingSubjects ? (
                    <div className="text-center py-3">
                      <div className="school-spinner" style={{ width: 24, height: 24, margin: '0 auto' }} />
                    </div>
                  ) : (
                    <>
                      {form.subjects.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1rem', color: '#9ca3af', fontSize: '0.85rem', fontFamily: 'Tajawal,sans-serif', background: '#f9fafb', borderRadius: 8, border: '2px dashed #e5e7eb', marginBottom: 10 }}>
                          لا توجد مواد — أضف مادة من السطر أدناه
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                          {form.subjects.map((s, idx) => {
                            const clr = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
                            return (
                              <div key={s.id ?? `new-${idx}`} style={{
                                background: clr.bg,
                                border: `1.5px solid ${clr.text}33`,
                                borderRadius: 12,
                                padding: '0.6rem 0.75rem',
                                direction: 'rtl',
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{
                                      fontWeight: 800, fontSize: '0.9rem',
                                      color: clr.text, fontFamily: 'Tajawal,sans-serif',
                                    }}>
                                      {s.name}
                                    </span>
                                    {!s.id && (
                                      <span style={{
                                        fontSize: '0.68rem', background: clr.text, color: '#fff',
                                        borderRadius: 4, padding: '1px 6px', fontFamily: 'Tajawal,sans-serif',
                                      }}>جديد</span>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeSubjectFromForm(idx)}
                                    style={{
                                      background: '#fff', border: `1px solid ${clr.text}44`,
                                      borderRadius: 6, cursor: 'pointer',
                                      padding: '2px 5px', color: '#ef4444',
                                      display: 'flex', alignItems: 'center',
                                    }}
                                  >
                                    <CloseIcon style={{ fontSize: 14 }} />
                                  </button>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{
                                    fontSize: '0.78rem', color: clr.text, opacity: 0.75,
                                    fontFamily: 'Tajawal,sans-serif', fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                  }}>المعلم:</span>
                                  <select
                                    className="school-input"
                                    style={{
                                      flex: 1, fontSize: '0.82rem',
                                      padding: '0.22rem 0.5rem',
                                      background: '#fff',
                                      border: `1px solid ${clr.text}44`,
                                      borderRadius: 7,
                                    }}
                                    value={s.teacher_id || ''}
                                    onChange={e => {
                                      const teacherObj = teachers.find(t => String(t.id) === e.target.value);
                                      setForm(prev => ({
                                        ...prev,
                                        subjects: prev.subjects.map((sub, i) =>
                                          i === idx
                                            ? { ...sub, teacher_id: e.target.value, teacher_name: teacherObj?.name || '' }
                                            : sub
                                        ),
                                      }));
                                    }}
                                  >
                                    <option value="">— بدون معلم —</option>
                                    {teachers.map(t => (
                                      <option key={t.id} value={String(t.id)}>{t.name}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', background: '#f9fafb', borderRadius: 8, padding: '0.6rem', border: '1.5px dashed #e5e7eb' }}>
                        <select
                          className="school-input"
                          style={{ flex: '1 1 160px', minWidth: 140, fontSize: '0.85rem' }}
                          value={subjectInput.name}
                          onChange={e => setSubjectInput(p => ({ ...p, name: e.target.value }))}
                        >
                          <option value="">— اختر مادة جديدة —</option>
                          {catalog
                            .filter(opt => !form.subjects.some(s => s.name === opt.name))
                            .map(opt => <option key={opt.id} value={opt.name}>{opt.name}</option>)}
                        </select>
                        <select
                          className="school-input"
                          style={{ flex: '1 1 140px', minWidth: 120, fontSize: '0.85rem' }}
                          value={subjectInput.teacher_id}
                          onChange={e => setSubjectInput(p => ({ ...p, teacher_id: e.target.value }))}
                        >
                          <option value="">— بدون معلم —</option>
                          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <button
                          type="button"
                          className="btn btn-school-primary d-flex align-items-center gap-1"
                          style={{ padding: '0 0.9rem', whiteSpace: 'nowrap', flexShrink: 0, fontSize: '0.85rem' }}
                          onClick={addSubjectToForm}
                        >
                          <AddIcon style={{ fontSize: 16 }} /> إضافة
                        </button>
                      </div>
                    </>
                  )}
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
          <div className="school-modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>

            <div className="school-modal-header" style={{
              background: 'linear-gradient(135deg, var(--clr-green-dark), var(--clr-green))',
              borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
            }}>
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MenuBookIcon style={{ fontSize: 22, color: '#fff' }} />
                </div>
                <div>
                  <div className="school-modal-title" style={{ color: '#fff' }}>{detail.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', fontFamily: 'Tajawal,sans-serif' }}>{detail.grade_level}</div>
                </div>
              </div>
              <button
                className="school-modal-close"
                style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}
                onClick={() => setDetail(null)}
              >
                <CloseIcon style={{ fontSize: 18 }} />
              </button>
            </div>

            <div className="school-modal-body">
              <div className="d-flex flex-wrap gap-2 mb-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '0.45rem 0.75rem' }}>
                  <PeopleIcon style={{ fontSize: 15, color: 'var(--clr-green)' }} />
                  <span style={{ fontSize: '0.83rem', fontFamily: 'Tajawal,sans-serif', color: '#15803d', fontWeight: 600 }}>{detail.student_count} طالب</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '0.45rem 0.75rem' }}>
                  <CalendarTodayIcon style={{ fontSize: 15, color: 'var(--clr-green)' }} />
                  <span style={{ fontSize: '0.83rem', fontFamily: 'Tajawal,sans-serif', color: '#15803d', fontWeight: 600 }}>{detail.academic_year}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.25rem' }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <MenuBookIcon style={{ fontSize: 17, color: 'var(--clr-green)' }} />
                  <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--clr-dark)', fontFamily: 'Tajawal,sans-serif' }}>
                    المواد الدراسية
                  </span>
                  {!detailLoading && (
                    <span style={{ background: 'var(--clr-green)', color: '#fff', borderRadius: 20, padding: '1px 9px', fontSize: '0.72rem', fontWeight: 700 }}>
                      {(detail.subjects || []).length}
                    </span>
                  )}
                </div>

                {detailLoading ? (
                  <div className="text-center py-4"><div className="school-spinner" style={{ width: 28, height: 28, margin: '0 auto' }} /></div>
                ) : (detail.subjects || []).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontFamily: 'Tajawal,sans-serif', fontSize: '0.9rem', background: '#f9fafb', borderRadius: 10, border: '2px dashed #e5e7eb' }}>
                    لم تُضَف أي مادة — افتح تعديل الصف لإضافة المواد
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(detail.subjects || []).map((s, idx) => {
                      const clr = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
                      return (
                        <div
                          key={s.id}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: clr.bg, border: `1.5px solid ${clr.text}22`,
                            borderRadius: 10, padding: '0.5rem 0.85rem',
                          }}
                        >
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: clr.text, fontFamily: 'Tajawal,sans-serif' }}>
                            {s.name}
                          </span>
                          {s.teacher_name && (
                            <span style={{ fontSize: '0.8rem', color: clr.text, opacity: 0.75, fontFamily: 'Tajawal,sans-serif', fontWeight: 600 }}>
                              {s.teacher_name}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {(detail.students || []).length > 0 && (
                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <PeopleIcon style={{ fontSize: 17, color: 'var(--clr-green)' }} />
                    <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--clr-dark)', fontFamily: 'Tajawal,sans-serif' }}>
                      الطلاب
                    </span>
                    <span style={{ background: 'var(--clr-green)', color: '#fff', borderRadius: 20, padding: '1px 9px', fontSize: '0.72rem', fontWeight: 700 }}>
                      {detail.students.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
                    {detail.students.map(st => (
                      <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', background: '#f9fafb', borderRadius: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--clr-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                          {st.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem', fontFamily: 'Tajawal,sans-serif' }}>{st.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="school-modal-footer">
              <button className="btn btn-ghost" onClick={() => setDetail(null)}>إغلاق</button>
              {isAdmin && (
                <button className="btn btn-school-primary d-flex align-items-center gap-1"
                  onClick={() => { setDetail(null); openEdit(detail, { stopPropagation: () => {} }); }}>
                  <EditIcon style={{ fontSize: 16 }} /> تعديل الصف
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

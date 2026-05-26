import { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import PhoneIcon from '@mui/icons-material/Phone';
import CloseIcon from '@mui/icons-material/Close';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import api from '../services/api';
import toast from 'react-hot-toast';
import '../styles/dashboard.css';

const LEVEL_ORDER = ['KG1','KG2','KG3','1','2','3','4','5','6','7','8','9'];

export default function Students() {
  const [students, setStudents]   = useState([]);
  const [total,    setTotal]      = useState(0);
  const [loading,  setLoading]    = useState(true);
  const [search,   setSearch]     = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [classes,  setClasses]    = useState([]);

  const [modal,    setModal]      = useState(false);
  const [editing,  setEditing]    = useState(null);
  const [saving,   setSaving]     = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    phone: '', parent_phone: '', class_id: '',
  });

  const [detail,   setDetail]     = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [usersRes, classRes] = await Promise.all([
        api.get('/users', { params: { role: 'student', search: search || undefined } }),
        api.get('/classes'),
      ]);
      let list = usersRes.data.users || [];

      if (classFilter) {
        const classDetail = await api.get(`/classes/${classFilter}`);
        const ids = new Set((classDetail.data.students || []).map(s => s.id));
        list = list.filter(s => ids.has(s.id));
      }

      setStudents(list);
      setTotal(list.length);
      setClasses(classRes.data);
    } catch { toast.error('فشل التحميل'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, classFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', phone: '', parent_phone: '', class_id: '' });
    setModal(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name, email: s.email, password: '',
      phone: s.phone || '', parent_phone: s.parent_phone || '',
      class_id: s.class_id || '',
    });
    setModal(true);
  };

  const openDetail = async (s) => {
    setDetail({ ...s, myClass: null });
    try {
      const [userRes, classRes] = await Promise.all([
        api.get(`/users/${s.id}`),
        api.get(`/classes/student/${s.id}`),
      ]);
      setDetail({ ...userRes.data, myClass: (classRes.data || [])[0] || null });
    } catch (e) {}
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: 'student',
        phone: form.phone || null,
        parent_phone: form.parent_phone || null,
        class_id: form.class_id || null,
      };
      if (!editing) payload.password = form.password || 'School@2024';
      else if (form.password) payload.password = form.password;

      if (editing) {
        await api.put(`/users/${editing.id}`, payload);
        toast.success('تم تحديث بيانات الطالب');
      } else {
        await api.post('/users', payload);
        toast.success('تمت إضافة الطالب');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل الحفظ');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`هل تريد حذف الطالب "${name}"؟`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('تم حذف الطالب');
      load();
    } catch { toast.error('فشل الحذف'); }
  };

  const sortedClasses = [...classes].sort((a, b) => {
    const ai = LEVEL_ORDER.indexOf(a.grade_level);
    const bi = LEVEL_ORDER.indexOf(b.grade_level);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const avatarInitial = (name) => name?.charAt(0)?.toUpperCase() || '?';

  const AVATAR_COLORS = [
    '#1E7A2A','#D4A017','#1565C0','#6A1B9A','#C62828','#00695C','#E65100',
  ];
  const avatarColor = (id) => AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">إدارة الطلاب</h1>
          <p className="page-breadcrumb">إجمالي: {total} طالب</p>
        </div>
        <button className="btn btn-school-primary d-flex align-items-center gap-1" onClick={openCreate}>
          <AddIcon style={{ fontSize: 20 }} /> إضافة طالب
        </button>
      </div>

      <div className="school-card mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <div className="input-icon-wrap">
              <span className="input-icon-right"><SearchIcon style={{ fontSize: 18 }} /></span>
              <input
                className="school-input input-with-icon-r"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select className="school-input" value={classFilter} onChange={e => setClassFilter(e.target.value)}>
              <option value="">جميع الصفوف</option>
              {sortedClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-5"><div className="school-spinner" /></div>
      ) : students.length === 0 ? (
        <div className="school-card text-center p-5" style={{ color: '#9ca3af', fontFamily: 'Tajawal,sans-serif' }}>
          لا يوجد طلاب مطابقون للبحث
        </div>
      ) : (
        <div className="row g-3">
          {students.map(s => (
            <div key={s.id} className="col-md-6 col-lg-4">
              <div className="school-card h-100" style={{
                borderTop: '3px solid var(--clr-green)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onClick={() => openDetail(s)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(30,122,42,0.13)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div style={{
                    width: 50, height: 50, borderRadius: '50%',
                    background: avatarColor(s.id),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 900, fontSize: '1.2rem',
                    fontFamily: 'Tajawal,sans-serif', flexShrink: 0,
                  }}>
                    {avatarInitial(s.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontFamily: 'Tajawal,sans-serif', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', direction: 'ltr', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.email}
                    </div>
                  </div>
                </div>

                {s.phone && (
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <PhoneIcon style={{ fontSize: 15, color: 'var(--clr-green)' }} />
                    <span style={{ fontSize: '0.85rem', color: '#6b7280', fontFamily: 'Tajawal,sans-serif' }}>{s.phone}</span>
                  </div>
                )}

                <div className="d-flex gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #f3f4f6' }}
                  onClick={e => e.stopPropagation()}>
                  <button className="btn btn-school-primary btn-sm flex-fill d-flex align-items-center justify-content-center gap-1"
                    onClick={() => openEdit(s)}>
                    <EditIcon style={{ fontSize: 15 }} /> تعديل
                  </button>
                  <button className="btn btn-school-danger btn-sm"
                    onClick={() => handleDelete(s.id, s.name)}>
                    <DeleteIcon style={{ fontSize: 15 }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="school-modal-overlay" onClick={() => setModal(false)}>
          <div className="school-modal" onClick={e => e.stopPropagation()}>
            <div className="school-modal-header">
              <span className="school-modal-title">{editing ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</span>
              <button className="school-modal-close" onClick={() => setModal(false)}>
                <CloseIcon style={{ fontSize: 18 }} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="school-modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="school-label">الاسم الكامل <span style={{ color: '#C0132A' }}>*</span></label>
                    <input
                      className="school-input" required
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="col-12">
                    <label className="school-label">البريد الإلكتروني <span style={{ color: '#C0132A' }}>*</span></label>
                    <input
                      className="school-input" type="email" required
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      style={{ direction: 'ltr' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="school-label">هاتف الطالب</label>
                    <input
                      className="school-input"
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="school-label">هاتف ولي الأمر</label>
                    <input
                      className="school-input"
                      value={form.parent_phone}
                      onChange={e => setForm(p => ({ ...p, parent_phone: e.target.value }))}
                    />
                  </div>
                  <div className="col-12">
                    <label className="school-label">الصف الدراسي</label>
                    <select className="school-input" value={form.class_id}
                      onChange={e => setForm(p => ({ ...p, class_id: e.target.value }))}>
                      <option value="">— بدون صف —</option>
                      {sortedClasses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.grade_level})</option>)}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="school-label">
                      {editing ? 'كلمة مرور جديدة' : 'كلمة المرور'}
                    </label>
                    <input
                      className="school-input" type="password"
                      required={!editing}
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
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

      {detail && (
        <div className="school-modal-overlay" onClick={() => setDetail(null)}>
          <div className="school-modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="school-modal-header" style={{
              background: 'linear-gradient(135deg, var(--clr-green-dark), var(--clr-green))',
              borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
            }}>
              <span className="school-modal-title" style={{ color: '#fff' }}>ملف الطالب</span>
              <button className="school-modal-close"
                style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}
                onClick={() => setDetail(null)}>
                <CloseIcon style={{ fontSize: 18 }} />
              </button>
            </div>

            <div className="school-modal-body">
              <div className="text-center mb-4">
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: avatarColor(detail.id),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 900, fontSize: '1.8rem',
                  fontFamily: 'Tajawal,sans-serif', margin: '0 auto 0.75rem',
                }}>
                  {avatarInitial(detail.name)}
                </div>
                <div style={{ fontWeight: 900, fontSize: '1.15rem', fontFamily: 'Tajawal,sans-serif' }}>{detail.name}</div>
                <div style={{ color: '#9ca3af', fontSize: '0.85rem', direction: 'ltr' }}>{detail.email}</div>
              </div>

              <div className="d-flex flex-wrap gap-2 mb-4 justify-content-center">
                {detail.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '0.4rem 0.8rem' }}>
                    <PhoneIcon style={{ fontSize: 14, color: 'var(--clr-green)' }} />
                    <span style={{ fontSize: '0.83rem', fontFamily: 'Tajawal,sans-serif', color: '#15803d', fontWeight: 600 }}>{detail.phone}</span>
                  </div>
                )}
                {detail.parent_phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff8e1', border: '1px solid rgba(212,160,23,0.35)', borderRadius: 8, padding: '0.4rem 0.8rem' }}>
                    <FamilyRestroomIcon style={{ fontSize: 14, color: '#D4A017' }} />
                    <span style={{ fontSize: '0.83rem', fontFamily: 'Tajawal,sans-serif', color: '#b8860b', fontWeight: 600 }}>{detail.parent_phone}</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <SchoolIcon style={{ fontSize: 17, color: 'var(--clr-green)' }} />
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', fontFamily: 'Tajawal,sans-serif' }}>
                    الصف الدراسي
                  </span>
                </div>
                {detail.myClass ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '0.6rem 1rem' }}>
                    <SchoolIcon style={{ fontSize: 18, color: 'var(--clr-green)' }} />
                    <div>
                      <div style={{ fontWeight: 800, fontFamily: 'Tajawal,sans-serif', color: '#15803d' }}>{detail.myClass.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#6b7280', fontFamily: 'Tajawal,sans-serif' }}>المرحلة: {detail.myClass.grade_level}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#9ca3af', fontSize: '0.88rem', fontFamily: 'Tajawal,sans-serif', textAlign: 'center', padding: '1rem', background: '#f9fafb', borderRadius: 8, border: '2px dashed #e5e7eb' }}>
                    لم يُسجَّل في أي صف بعد
                  </div>
                )}
              </div>
            </div>

            <div className="school-modal-footer">
              <button className="btn btn-ghost" onClick={() => setDetail(null)}>إغلاق</button>
              <button className="btn btn-school-primary" onClick={() => { setDetail(null); openEdit(detail); }}>
                <EditIcon style={{ fontSize: 16 }} /> تعديل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

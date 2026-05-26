import { useState, useEffect } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

const roleLabel = { admin: 'مدير النظام', teacher: 'معلم', student: 'طالب' };

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);   // full profile fetched from server
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  // Fetch full profile (includes phone, address, etc.) on mount
  useEffect(() => {
    if (!user?.id) return;
    api.get(`/users/${user.id}`)
      .then(r => {
        setProfile(r.data);
        setForm({ name: r.data.name || '', phone: r.data.phone || '', address: r.data.address || '' });
      })
      .catch(() => {
        // Fallback to context data if fetch fails
        setProfile(user);
        setForm({ name: user.name || '', phone: user.phone || '', address: user.address || '' });
      });
  }, [user?.id]);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.put(`/users/${user.id}`, form);
      // Update both local profile state and AuthContext (localStorage)
      setProfile(prev => ({ ...prev, ...form }));
      updateUser(form);
      toast.success('تم تحديث الملف الشخصي');
      setEditing(false);
    } catch { toast.error('فشل التحديث'); } finally { setSaving(false); }
  };

  const display = profile || user;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">الملف الشخصي</h1>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="school-card text-center">
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,var(--clr-green),var(--clr-green-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', margin: '0 auto 1rem' }}>
              <PersonIcon style={{ fontSize: 40 }} />
            </div>
            <h2 style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: '0.3rem', fontFamily: 'Tajawal,sans-serif' }}>{display?.name}</h2>
            <span className="badge-school badge-green">{roleLabel[display?.role]}</span>
            <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '0.75rem', direction: 'ltr' }}>{display?.email}</p>
            <div style={{ borderTop: '1px solid #f3f4f6', marginTop: '1rem', paddingTop: '1rem', color: '#9ca3af', fontSize: '0.82rem' }}>
              عضو منذ {display?.created_at ? new Date(display.created_at).toLocaleDateString('ar-IQ') : '—'}
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="school-card">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0, fontFamily: 'Tajawal,sans-serif' }}>المعلومات الشخصية</h3>
              {!editing ? (
                <button className="btn btn-school-outline btn-sm d-flex align-items-center gap-1" onClick={() => setEditing(true)}>
                  <EditIcon style={{ fontSize: 16 }} /> تعديل
                </button>
              ) : null}
            </div>

            {editing ? (
              <form onSubmit={handleSave}>
                <div className="mb-3">
                  <label className="school-label">الاسم الكامل</label>
                  <input className="school-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="mb-3">
                  <label className="school-label">رقم الهاتف</label>
                  <input className="school-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="mb-4">
                  <label className="school-label">العنوان</label>
                  <input className="school-input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-school-primary d-flex align-items-center gap-1" disabled={saving}>
                    <SaveIcon style={{ fontSize: 18 }} /> {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>إلغاء</button>
                </div>
              </form>
            ) : (
              <div>
                {[
                  { label: 'البريد الإلكتروني', value: display?.email, dir: 'ltr' },
                  { label: 'رقم الهاتف', value: display?.phone || '—' },
                  { label: 'العنوان', value: display?.address || '—' },
                  { label: 'الدور', value: roleLabel[display?.role] },
                ].map(({ label, value, dir }) => (
                  <div key={label} style={{ display: 'flex', padding: '0.85rem 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ width: '160px', fontWeight: 700, color: '#6b7280', fontSize: '0.88rem', flexShrink: 0 }}>{label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--clr-dark)', direction: dir || 'rtl' }}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

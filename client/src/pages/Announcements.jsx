import { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PushPinIcon from '@mui/icons-material/PushPin';
import CloseIcon from '@mui/icons-material/Close';
import CampaignIcon from '@mui/icons-material/Campaign';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

const catLabel = { general: 'عام', academic: 'أكاديمي', event: 'فعالية', urgent: 'عاجل' };
const catColor = { general: 'badge-gray', academic: 'badge-green', event: 'badge-confirm', urgent: 'badge-red' };

const EMPTY_FORM = { title: '', content: '', category: 'general', target_role: 'all', is_pinned: false };

export default function Announcements() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get('/announcements'); setItems(data); }
    catch { toast.error('فشل تحميل التعاميم'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditId(null); setForm(EMPTY_FORM); setModal(true); };

  const openEdit = (a) => {
    setEditId(a.id);
    setForm({ title: a.title, content: a.content, category: a.category, target_role: a.target_role, is_pinned: !!a.is_pinned });
    setModal(true);
  };

  const closeModal = () => { setModal(false); setEditId(null); setForm(EMPTY_FORM); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) {
        await api.put(`/announcements/${editId}`, form);
        toast.success('تم تعديل التعميم');
      } else {
        await api.post('/announcements', form);
        toast.success('تم نشر التعميم');
      }
      closeModal(); load();
    } catch (err) { toast.error(err.response?.data?.message || 'فشل الحفظ'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل تريد حذف هذا التعميم؟')) return;
    try { await api.delete(`/announcements/${id}`); toast.success('تم الحذف'); load(); }
    catch { toast.error('فشل الحذف'); }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">تعاميم مدرسية</h1>
          <p className="page-breadcrumb">{items.length} تعميم</p>
        </div>
        {isAdmin && (
          <button className="btn btn-school-primary d-flex align-items-center gap-1" onClick={openCreate}>
            <AddIcon style={{ fontSize: 20 }} /> تعميم جديد
          </button>
        )}
      </div>

      {loading ? <div className="text-center p-5"><div className="school-spinner" /></div> : (
        <div className="row g-4">
          {items.length === 0 && <div className="col-12 text-center p-5" style={{ color: '#9ca3af' }}>لا توجد تعاميم</div>}
          {items.map(a => (
            <div key={a.id} className="col-md-6 col-lg-4">
              <div className="school-card h-100 d-flex flex-column">
                <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className={`badge-school ${catColor[a.category]}`}>{catLabel[a.category]}</span>
                    {a.is_pinned ? <span className="badge-school badge-gold d-flex align-items-center gap-1"><PushPinIcon style={{ fontSize: 12 }} /> مثبت</span> : null}
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => openEdit(a)}
                        style={{ background: 'rgba(13,110,253,0.08)', border: 'none', borderRadius: 7,
                          cursor: 'pointer', color: '#0d6efd', padding: '4px 7px', display: 'flex', alignItems: 'center' }}
                        title="تعديل">
                        <EditIcon style={{ fontSize: 15 }} />
                      </button>
                      <button className="btn btn-school-danger btn-sm" onClick={() => handleDelete(a.id)} title="حذف">
                        <DeleteIcon style={{ fontSize: 15 }} />
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, var(--clr-green), var(--clr-green-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: '0.75rem' }}>
                  <CampaignIcon style={{ fontSize: 22 }} />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--clr-dark)', marginBottom: '0.6rem', fontFamily: 'Tajawal,sans-serif', lineHeight: 1.4 }}>{a.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.7, flex: 1, margin: 0 }}>{a.content}</p>
                <div className="divider" style={{ marginTop: '1rem' }} />
                <div style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{a.author_name || 'الإدارة'}</span>
                  <span>{new Date(a.created_at).toLocaleDateString('ar-IQ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="school-modal-overlay" onClick={closeModal}>
          <div className="school-modal" onClick={e => e.stopPropagation()}>
            <div className="school-modal-header">
              <span className="school-modal-title">{editId ? 'تعديل التعميم' : 'تعميم جديد'}</span>
              <button className="school-modal-close" onClick={closeModal}><CloseIcon style={{ fontSize: 18 }} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="school-modal-body">
                <div className="mb-3">
                  <label className="school-label">العنوان</label>
                  <input className="school-input" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="mb-3">
                  <label className="school-label">المحتوى</label>
                  <textarea className="school-input" rows={4} required value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} style={{ resize: 'vertical' }} />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="school-label">التصنيف</label>
                    <select className="school-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                      <option value="general">عام</option>
                      <option value="academic">أكاديمي</option>
                      <option value="event">فعالية</option>
                      <option value="urgent">عاجل</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="school-label">الموجه لـ</label>
                    <select className="school-input" value={form.target_role} onChange={e => setForm(p => ({ ...p, target_role: e.target.value }))}>
                      <option value="all">الجميع</option>
                      <option value="students">الطلاب</option>
                      <option value="teachers">المعلمون</option>
                    </select>
                  </div>
                </div>
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="pinned" checked={form.is_pinned} onChange={e => setForm(p => ({ ...p, is_pinned: e.target.checked }))} />
                  <label className="form-check-label" htmlFor="pinned" style={{ fontFamily: 'Tajawal,sans-serif', fontWeight: 600, marginRight: '0.3rem' }}>تثبيت التعميم</label>
                </div>
              </div>
              <div className="school-modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>إلغاء</button>
                <button type="submit" className="btn btn-school-primary" disabled={saving}>
                  {saving ? 'جارٍ الحفظ...' : editId ? 'حفظ التعديلات' : 'نشر التعميم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

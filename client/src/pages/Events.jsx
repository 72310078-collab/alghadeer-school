import { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

const typeLabel = { holiday: 'إجازة', exam: 'امتحان', activity: 'نشاط', meeting: 'اجتماع', other: 'أخرى' };
const typeColor = { holiday: 'badge-red', exam: 'badge-gold', activity: 'badge-confirm', meeting: 'badge-green', other: 'badge-gray' };
const typeBg    = { holiday: 'var(--clr-red)', exam: 'var(--clr-gold)', activity: 'var(--clr-confirm)', meeting: 'var(--clr-green)', other: '#6b7280' };

const EMPTY_FORM = { title: '', description: '', event_date: '', event_type: 'other' };

export default function Events() {
  const { user } = useAuth();
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [saving,  setSaving]  = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get('/events'); setEvents(data); }
    catch { toast.error('فشل تحميل الأحداث'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModal(true);
  };

  const openEdit = (ev) => {
    setEditing(ev);
    setForm({
      title:       ev.title,
      description: ev.description || '',
      event_date:  ev.event_date?.slice(0, 10) || '',
      event_type:  ev.event_type,
    });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/events/${editing.id}`, form);
        toast.success('تم تحديث الحدث');
      } else {
        await api.post('/events', form);
        toast.success('تم إضافة الحدث');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل الحفظ');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل تريد حذف هذا الحدث؟')) return;
    try { await api.delete(`/events/${id}`); toast.success('تم الحذف'); load(); }
    catch { toast.error('فشل الحذف'); }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">التقويم المدرسي</h1>
          <p className="page-breadcrumb">العام الدراسي 2025-2026</p>
        </div>
        {isAdmin && (
          <button className="btn btn-school-primary d-flex align-items-center gap-1" onClick={openCreate}>
            <AddIcon style={{ fontSize: 20 }} /> إضافة حدث
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center p-5"><div className="school-spinner" /></div>
      ) : events.length === 0 ? (
        <div className="school-card text-center p-5" style={{ color: '#9ca3af' }}>
          <CalendarMonthIcon style={{ fontSize: 56, opacity: 0.2, marginBottom: 12 }} />
          <p style={{ fontFamily: 'Tajawal,sans-serif' }}>لا توجد أحداث مضافة حتى الآن</p>
        </div>
      ) : (
        <div className="row g-4">
          {events.map(ev => {
            const d    = new Date(ev.event_date);
            const bg   = typeBg[ev.event_type] || '#6b7280';
            return (
              <div key={ev.id} className="col-md-6 col-lg-4">
                <div className="school-card h-100" style={{ borderRight: `4px solid ${bg}`, position: 'relative' }}>

                  <div className="d-flex align-items-start gap-3">
                    <div style={{
                      width: 54, height: 54, borderRadius: 12, background: bg,
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', color: '#fff', flexShrink: 0,
                    }}>
                      <span style={{ fontSize: '1.3rem', fontWeight: 900, lineHeight: 1 }}>{d.getDate()}</span>
                      <span style={{ fontSize: '0.62rem', opacity: 0.85 }}>
                        {d.toLocaleString('ar', { month: 'short' })}
                      </span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontWeight: 800, fontSize: '0.98rem', color: 'var(--clr-dark)',
                        marginBottom: '0.3rem', fontFamily: 'Tajawal,sans-serif',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {ev.title}
                      </h3>
                      <span className={`badge-school ${typeColor[ev.event_type]}`}>
                        {typeLabel[ev.event_type]}
                      </span>
                    </div>

                    {isAdmin && (
                      <div className="d-flex gap-1" style={{ flexShrink: 0 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 7px' }}
                          onClick={() => openEdit(ev)}
                          title="تعديل"
                        >
                          <EditIcon style={{ fontSize: 15 }} />
                        </button>
                        <button
                          className="btn btn-school-danger btn-sm"
                          style={{ padding: '4px 7px' }}
                          onClick={() => handleDelete(ev.id)}
                          title="حذف"
                        >
                          <DeleteIcon style={{ fontSize: 15 }} />
                        </button>
                      </div>
                    )}
                  </div>

                  {ev.description && (
                    <p style={{
                      color: '#6b7280', fontSize: '0.87rem', marginTop: '0.75rem',
                      marginBottom: 0, lineHeight: 1.65, fontFamily: 'Tajawal,sans-serif',
                    }}>
                      {ev.description}
                    </p>
                  )}

                  {ev.created_by_name && (
                    <div style={{
                      marginTop: '0.75rem', fontSize: '0.78rem', color: '#9ca3af',
                      fontFamily: 'Tajawal,sans-serif',
                    }}>
                      أضافه: {ev.created_by_name}
                    </div>
                  )}
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
              <span className="school-modal-title">
                {editing ? 'تعديل الحدث' : 'إضافة حدث جديد'}
              </span>
              <button className="school-modal-close" onClick={() => setModal(false)}>
                <CloseIcon style={{ fontSize: 18 }} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="school-modal-body">
                <div className="mb-3">
                  <label className="school-label">عنوان الحدث <span style={{ color: '#C0132A' }}>*</span></label>
                  <input
                    className="school-input" required
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  />
                </div>

                <div className="mb-3">
                  <label className="school-label">التاريخ <span style={{ color: '#C0132A' }}>*</span></label>
                  <input
                    type="date" className="school-input" required
                    value={form.event_date}
                    onChange={e => setForm(p => ({ ...p, event_date: e.target.value }))}
                    style={{ direction: 'ltr' }}
                  />
                </div>

                <div className="mb-3">
                  <label className="school-label">نوع الحدث</label>
                  <select
                    className="school-input"
                    value={form.event_type}
                    onChange={e => setForm(p => ({ ...p, event_type: e.target.value }))}
                  >
                    {Object.entries(typeLabel).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="school-label">الوصف</label>
                  <textarea
                    className="school-input" rows={3}
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="school-modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-school-primary" disabled={saving}>
                  {saving ? 'جارٍ الحفظ...' : editing ? 'حفظ التعديلات' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

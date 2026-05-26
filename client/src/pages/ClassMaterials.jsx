import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import NotesIcon from '@mui/icons-material/Notes';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

const IMAGE_EXTS  = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const DOC_EXTS    = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt'];
const VIDEO_EXTS  = ['.mp4', '.mp3', '.avi', '.mov', '.webm'];

function detectType(filename) {
  const ext = ('.' + filename.split('.').pop()).toLowerCase();
  if (IMAGE_EXTS.includes(ext))  return 'image';
  if (VIDEO_EXTS.includes(ext))  return 'video';
  if (DOC_EXTS.includes(ext))    return 'document';
  return 'document';
}

const TYPE_CFG = {
  text:     { label: 'نص / أجندة',  Icon: NotesIcon,        color: '#1E7A2A', bg: 'rgba(30,122,42,0.10)'  },
  video:    { label: 'فيديو',        Icon: VideoLibraryIcon, color: '#0d6efd', bg: 'rgba(13,110,253,0.10)' },
  document: { label: 'مستند / ملف', Icon: DescriptionIcon,  color: '#D4A017', bg: 'rgba(212,160,23,0.10)' },
  image:    { label: 'صورة',         Icon: ImageIcon,        color: '#9333ea', bg: 'rgba(147,51,234,0.10)' },
};

const SUBJ_COLORS = [
  '#1E7A2A','#0d6efd','#D4A017','#9333ea','#0e7490',
  '#9a3412','#065f46','#1e40af','#6d28d9','#b8860b',
];

const fmt = (d) =>
  new Date(d).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: 'numeric' });

const EMPTY_MODAL = { open: false, type: 'document', title: '', body: '', file_url: '', file: null };
export default function ClassMaterials() {
  const { classId } = useParams();
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const isTeacher   = user?.role === 'teacher';
  const fileInputRef = useRef(null);

  const [classInfo,       setClassInfo]      = useState(null);
  const [mySubjects,      setMySubjects]     = useState([]);
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [items,           setItems]          = useState([]);
  const [loading,         setLoading]        = useState(true);
  const [dragging,        setDragging]       = useState(false);
  const [modal,           setModal]          = useState(EMPTY_MODAL);
  const [saving,          setSaving]         = useState(false);

  const activeSubject = mySubjects.find(s => s.id === activeSubjectId) || null;

  useEffect(() => {
    Promise.all([
      api.get('/classes', {}),
      api.get(`/classes/${classId}`),
    ])
      .then(([allRes, clRes]) => {
        const cls = (allRes.data || []).find(c => String(c.id) === String(classId));
        setClassInfo(cls || clRes.data);

        const allSubjects = clRes.data?.subjects || [];
        const mine = isTeacher
          ? allSubjects.filter(s => String(s.teacher_id) === String(user.id))
          : allSubjects;
        const mineNorm = mine.map(s => ({ ...s, id: Number(s.id) }));
        setMySubjects(mineNorm);

        if (mineNorm.length > 0) {
          setActiveSubjectId(Number(mineNorm[0].id));
        }
      })
      .catch(() => toast.error('فشل تحميل بيانات الصف'))
      .finally(() => setLoading(false));
  }, [classId]);

  useEffect(() => {
    if (!activeSubjectId) return;
    api.get('/materials', { params: { class_id: classId, subject_id: activeSubjectId } })
      .then(r => setItems(r.data || []))
      .catch(() => toast.error('فشل تحميل المواد'));
  }, [activeSubjectId, classId]);

  const reloadMaterials = useCallback(() => {
    if (!activeSubjectId) return;
    api.get('/materials', { params: { class_id: classId, subject_id: activeSubjectId } })
      .then(r => setItems(r.data || []))
      .catch(() => {});
  }, [activeSubjectId, classId]);

  const handleDragOver  = useCallback((e) => { e.preventDefault(); setDragging(true); }, []);
  const handleDragLeave = useCallback(() => setDragging(false), []);
  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) openModalWithFile(file);
  }, []);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) openModalWithFile(file);
    e.target.value = '';
  };

  const openModalWithFile = (file) => {
    setModal({
      open: true,
      type: detectType(file.name),
      title: file.name.replace(/\.[^/.]+$/, ''),
      body: '', file_url: '', file,
    });
  };

  const closeModal = () => setModal(EMPTY_MODAL);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!activeSubjectId) return toast.error('اختر مادة أولاً');
    if (modal.type === 'video' && !modal.file && !modal.file_url.trim()) return toast.error('ارفع ملف فيديو أو أدخل رابطاً');
    if ((modal.type === 'document' || modal.type === 'image') && !modal.file) return toast.error('اختر ملفاً');

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('class_id',   classId);
      fd.append('subject_id', String(activeSubjectId));
      fd.append('title',      modal.title);
      fd.append('body',       modal.body || '');
      fd.append('type',       modal.type);
      if (modal.type === 'video' && modal.file) fd.append('file', modal.file);
      else if (modal.type === 'video' && modal.file_url) fd.append('file_url', modal.file_url);
      if ((modal.type === 'document' || modal.type === 'image') && modal.file)
        fd.append('file', modal.file);

      await api.post('/materials', fd, { headers: { 'Content-Type': undefined } });
      toast.success('تم الرفع بنجاح ✓');
      closeModal();
      reloadMaterials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل الرفع');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل تريد حذف هذا المحتوى؟')) return;
    try {
      await api.delete(`/materials/${id}`);
      toast.success('تم الحذف');
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) { toast.error(err.response?.data?.message || 'فشل الحذف'); }
  };

  const getVideoEmbed = (url) => {
    const m = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
  };

  if (loading) return <div className="fade-in text-center p-5"><div className="school-spinner" /></div>;

  return (
    <div className="fade-in">

      <div className="page-header" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/classes')} style={{
            background: '#f3f4f6', border: 'none', borderRadius: 10,
            width: 38, height: 38, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
          }}>
            <ArrowForwardIcon style={{ fontSize: 20 }} />
          </button>
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>{classInfo?.name || 'مواد الصف'}</h1>
            <p className="page-breadcrumb" style={{ margin: 0 }}>
              المرحلة {classInfo?.grade_level}
              {activeSubject && ` · ${activeSubject.name}`}
              {` · ${items.length} مادة`}
            </p>
          </div>
        </div>

        {activeSubject && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost d-flex align-items-center gap-1"
              style={{ fontSize: '0.85rem' }}
              onClick={() => setModal({ open: true, type: 'text', title: '', body: '', file_url: '', file: null })}>
              <NotesIcon style={{ fontSize: 18 }} /> أجندة / نص
            </button>
            <button className="btn btn-ghost d-flex align-items-center gap-1"
              style={{ fontSize: '0.85rem', color: '#0d6efd', borderColor: '#0d6efd33' }}
              onClick={() => setModal({ open: true, type: 'video', title: '', body: '', file_url: '', file: null })}>
              <VideoLibraryIcon style={{ fontSize: 18 }} /> فيديو
            </button>
            <button className="btn btn-school-primary d-flex align-items-center gap-1"
              style={{ fontSize: '0.85rem' }}
              onClick={() => fileInputRef.current?.click()}>
              <CloudUploadIcon style={{ fontSize: 18 }} /> رفع ملف
            </button>
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" style={{ display: 'none' }}
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.mp4,.mp3,.avi,.mov,.webm,.jpg,.jpeg,.png,.gif,.webp"
        onChange={handleFileInput} />

      {mySubjects.length > 0 && (
        <div className="school-card mb-4 p-2">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {mySubjects.map((s, idx) => {
              const color   = SUBJ_COLORS[idx % SUBJ_COLORS.length];
              const isActive = activeSubjectId === s.id;
              return (
                <button key={s.id} onClick={() => setActiveSubjectId(s.id)}
                  style={{
                    padding: '0.5rem 1.1rem', borderRadius: 10, border: 'none',
                    cursor: 'pointer', fontFamily: 'Tajawal,sans-serif',
                    fontWeight: 700, fontSize: '0.88rem', transition: 'all 0.15s',
                    background: isActive ? color : `${color}18`,
                    color: isActive ? '#fff' : color,
                    boxShadow: isActive ? `0 3px 10px ${color}40` : 'none',
                  }}>
                  <MenuBookIcon style={{ fontSize: 15, verticalAlign: 'middle', marginLeft: 5 }} />
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {mySubjects.length === 0 && (
        <div className="school-card text-center p-5" style={{ color: '#9ca3af' }}>
          <MenuBookIcon style={{ fontSize: 52, opacity: 0.15, display: 'block', margin: '0 auto 12px' }} />
          <p style={{ fontFamily: 'Tajawal,sans-serif' }}>
            لم يتم تعيين أي مادة لك في هذا الصف — تواصل مع المدير لإضافة مادتك
          </p>
        </div>
      )}

      {activeSubject && (
        <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--clr-green)' : '#d1d5db'}`,
            borderRadius: 16, padding: '2rem 1rem', textAlign: 'center',
            cursor: 'pointer', background: dragging ? 'rgba(30,122,42,0.05)' : '#fafafa',
            transition: 'all 0.2s', marginBottom: 24,
          }}>
          <CloudUploadIcon style={{ fontSize: 44, color: dragging ? 'var(--clr-green)' : '#d1d5db', transition: 'color 0.2s' }} />
          <p style={{ margin: '8px 0 4px', fontFamily: 'Tajawal,sans-serif', fontWeight: 700, fontSize: '0.95rem',
            color: dragging ? 'var(--clr-green)' : '#6b7280' }}>
            {dragging ? 'أفلت الملف هنا...' : `اسحب ملفات ${activeSubject.name} هنا أو انقر للاختيار`}
          </p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'Tajawal,sans-serif' }}>
            صور · مستندات (PDF, Word, PPT) · فيديو (MP4, AVI, MOV)
          </p>
        </div>
      )}

      {activeSubject && (
        items.length === 0 ? (
          <div className="school-card text-center p-5" style={{ color: '#9ca3af' }}>
            <MenuBookIcon style={{ fontSize: 52, opacity: 0.15, display: 'block', margin: '0 auto 12px' }} />
            <p style={{ fontFamily: 'Tajawal,sans-serif' }}>لا توجد مواد لـ {activeSubject.name} بعد</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {items.map(item => {
              const cfg      = TYPE_CFG[item.type] || TYPE_CFG.document;
              const TypeIcon = cfg.Icon;
              const embed    = item.type === 'video' ? getVideoEmbed(item.file_url) : null;

              return (
                <div key={item.id} className="school-card"
                  style={{ borderRight: `4px solid ${cfg.color}`, padding: '1rem 1.1rem' }}>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: cfg.bg, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TypeIcon style={{ fontSize: 20, color: cfg.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.98rem', fontFamily: 'Tajawal,sans-serif', color: 'var(--clr-dark)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#9ca3af', marginTop: 2, fontFamily: 'Tajawal,sans-serif' }}>
                        {item.teacher_name} · {fmt(item.created_at)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg,
                        borderRadius: 6, padding: '2px 8px', fontFamily: 'Tajawal,sans-serif' }}>
                        {cfg.label}
                      </span>
                      <button onClick={() => handleDelete(item.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0132A', padding: 4, borderRadius: 6 }}>
                        <DeleteIcon style={{ fontSize: 18 }} />
                      </button>
                    </div>
                  </div>

                  {item.body && (
                    <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#374151', lineHeight: 1.7, fontFamily: 'Tajawal,sans-serif' }}>
                      {item.body}
                    </p>
                  )}

                  {item.type === 'image' && item.file_url && (
                    <img src={`http://localhost:5000${item.file_url}`} alt={item.title}
                      style={{ maxWidth: '100%', maxHeight: 340, borderRadius: 10, objectFit: 'contain', display: 'block' }} />
                  )}

                  {item.type === 'video' && item.file_url && (
                    embed ? (
                      <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 10, overflow: 'hidden', background: '#000' }}>
                        <iframe src={embed} title={item.title} allowFullScreen
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} />
                      </div>
                    ) : item.file_url.startsWith('/uploads') ? (
                      <video controls style={{ width: '100%', borderRadius: 10, maxHeight: 340, background: '#000' }}>
                        <source src={`http://localhost:5000${item.file_url}`} />
                        متصفحك لا يدعم تشغيل الفيديو
                      </video>
                    ) : (
                      <a href={item.file_url} target="_blank" rel="noreferrer"
                        style={{ color: cfg.color, fontWeight: 700, fontSize: '0.88rem', fontFamily: 'Tajawal,sans-serif' }}>
                        ▶ فتح رابط الفيديو
                      </a>
                    )
                  )}

                  {item.type === 'document' && item.file_url && (
                    <a href={`http://localhost:5000${item.file_url}`} target="_blank" rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.4rem 1rem',
                        borderRadius: 8, background: cfg.bg, color: cfg.color, fontWeight: 700,
                        fontSize: '0.85rem', textDecoration: 'none', fontFamily: 'Tajawal,sans-serif',
                        border: `1px solid ${cfg.color}30` }}>
                      <DescriptionIcon style={{ fontSize: 16 }} /> تحميل الملف
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {modal.open && (
        <div className="school-modal-overlay" onClick={closeModal}>
          <div className="school-modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="school-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {(() => { const Ico = TYPE_CFG[modal.type]?.Icon || DescriptionIcon; return <Ico style={{ fontSize: 20, color: TYPE_CFG[modal.type]?.color }} />; })()}
                <span className="school-modal-title">
                  {modal.type === 'text' ? 'إضافة أجندة / نص' :
                   modal.type === 'video' ? 'إضافة فيديو' :
                   modal.type === 'image' ? 'رفع صورة' : 'رفع مستند / ملف'}
                  {activeSubject && <span style={{ fontSize: '0.8rem', fontWeight: 500, marginRight: 8, opacity: 0.7 }}>— {activeSubject.name}</span>}
                </span>
              </div>
              <button className="school-modal-close" onClick={closeModal}><CloseIcon style={{ fontSize: 18 }} /></button>
            </div>

            <form onSubmit={handleSave}>
              <div className="school-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {modal.file && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: TYPE_CFG[modal.type]?.bg,
                    borderRadius: 10, padding: '0.6rem 0.85rem', border: `1.5px solid ${TYPE_CFG[modal.type]?.color}33` }}>
                    {(() => { const Ico = TYPE_CFG[modal.type]?.Icon || DescriptionIcon; return <Ico style={{ fontSize: 20, color: TYPE_CFG[modal.type]?.color, flexShrink: 0 }} />; })()}
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Tajawal,sans-serif', color: 'var(--clr-dark)', wordBreak: 'break-all' }}>
                      {modal.file.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', flexShrink: 0, marginRight: 'auto' }}>
                      {(modal.file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                )}

                <div>
                  <label className="school-label">العنوان <span style={{ color: '#C0132A' }}>*</span></label>
                  <input className="school-input" required value={modal.title}
                    onChange={e => setModal(p => ({ ...p, title: e.target.value }))} />
                </div>

                {(modal.type === 'text' || modal.type === 'video') && (
                  <div>
                    <label className="school-label">
                      {modal.type === 'text' ? 'المحتوى' : 'وصف (اختياري)'}
                      {modal.type === 'text' && <span style={{ color: '#C0132A' }}> *</span>}
                    </label>
                    <textarea className="school-input" rows={modal.type === 'text' ? 5 : 2}
                      style={{ resize: 'vertical' }} required={modal.type === 'text'}
                      value={modal.body} onChange={e => setModal(p => ({ ...p, body: e.target.value }))} />
                  </div>
                )}

                {modal.type === 'video' && !modal.file && (
                  <>
                    <div>
                      <label className="school-label">رفع ملف فيديو</label>
                      <div onClick={() => fileInputRef.current?.click()}
                        style={{ border: '2px dashed var(--clr-border)', borderRadius: 10,
                          padding: '1.2rem', textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}>
                        <VideoLibraryIcon style={{ fontSize: 30, color: '#0d6efd' }} />
                        <p style={{ margin: '6px 0 0', fontFamily: 'Tajawal,sans-serif', fontSize: '0.85rem', color: '#6b7280' }}>
                          انقر لاختيار فيديو (MP4, AVI, MOV…)
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                      <span style={{ fontSize: '0.78rem', color: '#9ca3af', fontFamily: 'Tajawal,sans-serif' }}>أو</span>
                      <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                    </div>
                    <div>
                      <label className="school-label">رابط فيديو (YouTube أو غيره)</label>
                      <input className="school-input" type="url" dir="ltr"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={modal.file_url} onChange={e => setModal(p => ({ ...p, file_url: e.target.value }))} />
                    </div>
                  </>
                )}

                {(modal.type === 'document' || modal.type === 'image') && !modal.file && (
                  <div>
                    <label className="school-label">الملف <span style={{ color: '#C0132A' }}>*</span></label>
                    <div onClick={() => fileInputRef.current?.click()}
                      style={{ border: '2px dashed var(--clr-border)', borderRadius: 10,
                        padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}>
                      <CloudUploadIcon style={{ fontSize: 30, color: '#9ca3af' }} />
                      <p style={{ margin: '6px 0 0', fontFamily: 'Tajawal,sans-serif', fontSize: '0.85rem', color: '#9ca3af' }}>
                        انقر لاختيار ملف
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="school-modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>إلغاء</button>
                <button type="submit" className="btn btn-school-primary d-flex align-items-center gap-2" disabled={saving}>
                  {saving
                    ? <><span className="school-spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> جارٍ الرفع...</>
                    : <><CloudUploadIcon style={{ fontSize: 17 }} /> رفع</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

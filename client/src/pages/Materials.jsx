import { useState, useEffect } from 'react';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DescriptionIcon from '@mui/icons-material/Description';
import NotesIcon from '@mui/icons-material/Notes';
import ImageIcon from '@mui/icons-material/Image';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import api from '../services/api';
import toast from 'react-hot-toast';
import '../styles/dashboard.css';

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

export default function Materials() {
  const [items,         setItems]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [subjects,      setSubjects]      = useState([]); // unique subject names in order
  const [activeSubject, setActiveSubject] = useState(null);

  // Load all materials for the student's class
  useEffect(() => {
    api.get('/materials/student')
      .then(r => {
        const data = r.data || [];
        setItems(data);

        // Build ordered unique subject list
        const seen = new Set();
        const subjs = [];
        data.forEach(m => {
          const key = m.subject_name || 'عام';
          if (!seen.has(key)) { seen.add(key); subjs.push(key); }
        });
        setSubjects(subjs);
        if (subjs.length > 0) setActiveSubject(subjs[0]);
      })
      .catch(() => toast.error('فشل تحميل المواد'))
      .finally(() => setLoading(false));
  }, []);

  // Materials filtered by active subject
  const visibleItems = activeSubject
    ? items.filter(m => (m.subject_name || 'عام') === activeSubject)
    : items;

  const getVideoEmbed = (url) => {
    const m = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
  };

  if (loading) return (
    <div className="fade-in text-center p-5"><div className="school-spinner" /></div>
  );

  return (
    <div className="fade-in">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">المواد التعليمية</h1>
          <p className="page-breadcrumb">
            المواد التي شاركها معلموك · {items.length} مادة
          </p>
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="school-card text-center p-5" style={{ color: '#9ca3af' }}>
          <MenuBookIcon style={{ fontSize: 52, opacity: 0.15, display: 'block', margin: '0 auto 12px' }} />
          <p style={{ fontFamily: 'Tajawal,sans-serif' }}>لا توجد مواد منشورة بعد</p>
        </div>
      )}

      {/* Subject tabs */}
      {subjects.length > 0 && (
        <div className="school-card mb-4 p-2">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {subjects.map((subj, idx) => {
              const color    = SUBJ_COLORS[idx % SUBJ_COLORS.length];
              const isActive = activeSubject === subj;
              const count    = items.filter(m => (m.subject_name || 'عام') === subj).length;
              return (
                <button key={subj} onClick={() => setActiveSubject(subj)}
                  style={{
                    padding: '0.5rem 1.1rem', borderRadius: 10, border: 'none',
                    cursor: 'pointer', fontFamily: 'Tajawal,sans-serif',
                    fontWeight: 700, fontSize: '0.88rem', transition: 'all 0.15s',
                    background: isActive ? color : `${color}18`,
                    color:      isActive ? '#fff' : color,
                    boxShadow:  isActive ? `0 3px 10px ${color}40` : 'none',
                  }}>
                  <MenuBookIcon style={{ fontSize: 15, verticalAlign: 'middle', marginLeft: 5 }} />
                  {subj}
                  <span style={{
                    marginRight: 6, fontSize: 11, fontWeight: 600,
                    background: isActive ? 'rgba(255,255,255,0.25)' : `${color}30`,
                    color: isActive ? '#fff' : color,
                    borderRadius: 20, padding: '1px 7px',
                  }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Materials list */}
      {visibleItems.length === 0 && activeSubject && (
        <div className="school-card text-center p-4" style={{ color: '#9ca3af' }}>
          <p style={{ fontFamily: 'Tajawal,sans-serif', margin: 0 }}>
            لا توجد مواد لـ {activeSubject} بعد
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {visibleItems.map(item => {
          const cfg      = TYPE_CFG[item.type] || TYPE_CFG.document;
          const TypeIcon = cfg.Icon;
          const embed    = item.type === 'video' ? getVideoEmbed(item.file_url) : null;

          return (
            <div key={item.id} className="school-card"
              style={{ borderRight: `4px solid ${cfg.color}`, padding: '1rem 1.1rem' }}>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                {/* Icon */}
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: cfg.bg,
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <TypeIcon style={{ fontSize: 20, color: cfg.color }} />
                </div>

                {/* Title + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', fontFamily: 'Tajawal,sans-serif', color: 'var(--clr-dark)' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#9ca3af', marginTop: 2, fontFamily: 'Tajawal,sans-serif' }}>
                    {item.teacher_name}
                    {item.subject_name && <> · <span style={{ fontWeight: 700, color: '#6b7280' }}>{item.subject_name}</span></>}
                    {' · '}{fmt(item.created_at)}
                  </div>
                </div>

                {/* Type badge */}
                <span style={{
                  flexShrink: 0, fontSize: 11, fontWeight: 700,
                  color: cfg.color, background: cfg.bg,
                  borderRadius: 6, padding: '2px 8px', fontFamily: 'Tajawal,sans-serif',
                }}>
                  {cfg.label}
                </span>
              </div>

              {/* Body text */}
              {item.body && (
                <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#374151', lineHeight: 1.7, fontFamily: 'Tajawal,sans-serif' }}>
                  {item.body}
                </p>
              )}

              {/* Image */}
              {item.type === 'image' && item.file_url && (
                <img src={`http://localhost:5000${item.file_url}`} alt={item.title}
                  style={{ maxWidth: '100%', maxHeight: 340, borderRadius: 10, objectFit: 'contain', display: 'block' }} />
              )}

              {/* Video embed */}
              {item.type === 'video' && item.file_url && (
                embed ? (
                  <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 10, overflow: 'hidden', background: '#000' }}>
                    <iframe src={embed} title={item.title} allowFullScreen
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} />
                  </div>
                ) : (
                  <a href={item.file_url} target="_blank" rel="noreferrer"
                    style={{ color: cfg.color, fontWeight: 700, fontSize: '0.88rem', fontFamily: 'Tajawal,sans-serif' }}>
                    ▶ فتح رابط الفيديو
                  </a>
                )
              )}

              {/* Document download */}
              {item.type === 'document' && item.file_url && (
                <a href={`http://localhost:5000${item.file_url}`} target="_blank" rel="noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '0.4rem 1rem', borderRadius: 8,
                    background: cfg.bg, color: cfg.color,
                    fontWeight: 700, fontSize: '0.85rem',
                    textDecoration: 'none', fontFamily: 'Tajawal,sans-serif',
                    border: `1px solid ${cfg.color}30`,
                  }}>
                  <DescriptionIcon style={{ fontSize: 16 }} /> تحميل الملف
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

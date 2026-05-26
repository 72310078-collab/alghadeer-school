import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DescriptionIcon from '@mui/icons-material/Description';
import NotesIcon from '@mui/icons-material/Notes';
import ImageIcon from '@mui/icons-material/Image';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import api from '../services/api';
import toast from 'react-hot-toast';
import '../styles/dashboard.css';

const TYPE_CFG = {
  text:     { label: 'نص / أجندة',  Icon: NotesIcon,        color: '#1E7A2A', bg: 'rgba(30,122,42,0.10)'  },
  video:    { label: 'فيديو',        Icon: VideoLibraryIcon, color: '#0d6efd', bg: 'rgba(13,110,253,0.10)' },
  document: { label: 'مستند / ملف', Icon: DescriptionIcon,  color: '#D4A017', bg: 'rgba(212,160,23,0.10)' },
  image:    { label: 'صورة',         Icon: ImageIcon,        color: '#9333ea', bg: 'rgba(147,51,234,0.10)' },
};

const fmt = (d) =>
  new Date(d).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: 'numeric' });

export default function SubjectMaterials() {
  const { subjectId } = useParams();
  const navigate      = useNavigate();
  const location      = useLocation();

  // Info passed from MyCourses via navigation state
  const subjectName = location.state?.subjectName || 'المادة';
  const teacherName = location.state?.teacherName || '';
  const accent      = location.state?.accent      || 'var(--clr-green)';

  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/materials/student', { params: { subject_id: subjectId } })
      .then(r => setItems(r.data || []))
      .catch(() => toast.error('فشل تحميل المواد'))
      .finally(() => setLoading(false));
  }, [subjectId]);

  const getVideoEmbed = (url) => {
    const m = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
  };

  const byType = (type) => items.filter(i => i.type === type);

  // Group: text/agenda first, then videos, then documents, then images
  const ORDER = ['text', 'video', 'document', 'image'];

  if (loading) return (
    <div className="fade-in text-center p-5"><div className="school-spinner" /></div>
  );

  return (
    <div className="fade-in">

      {/* Header */}
      <div className="page-header" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/my-courses')} style={{
            background: '#f3f4f6', border: 'none', borderRadius: 10,
            width: 38, height: 38, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
          }}>
            <ArrowForwardIcon style={{ fontSize: 20 }} />
          </button>
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>{subjectName}</h1>
            <p className="page-breadcrumb" style={{ margin: 0 }}>
              {teacherName && <><PersonIcon style={{ fontSize: 13, verticalAlign: 'middle' }} /> {teacherName} · </>}
              {items.length} مادة تعليمية
            </p>
          </div>
        </div>
      </div>

      {/* Accent bar */}
      <div style={{
        height: 4, borderRadius: 99, marginBottom: 24,
        background: `linear-gradient(90deg, ${accent}, ${accent}44)`,
      }} />

      {/* Empty */}
      {items.length === 0 && (
        <div className="school-card text-center p-5" style={{ color: '#9ca3af' }}>
          <MenuBookIcon style={{ fontSize: 52, opacity: 0.15, display: 'block', margin: '0 auto 12px' }} />
          <p style={{ fontFamily: 'Tajawal,sans-serif' }}>
            لم يرفع المعلم أي مواد لـ {subjectName} بعد
          </p>
        </div>
      )}

      {/* Grouped by type */}
      {ORDER.map(type => {
        const group = byType(type);
        if (group.length === 0) return null;
        const cfg = TYPE_CFG[type];
        const GroupIcon = cfg.Icon;

        return (
          <div key={type} style={{ marginBottom: 28 }}>
            {/* Group header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginBottom: 12, fontFamily: 'Tajawal,sans-serif',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: cfg.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <GroupIcon style={{ fontSize: 17, color: cfg.color }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: cfg.color }}>
                {cfg.label}
              </span>
              <span style={{
                fontSize: 12, fontWeight: 600, color: cfg.color,
                background: cfg.bg, borderRadius: 20, padding: '1px 8px',
              }}>
                {group.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {group.map(item => {
                const embed = item.type === 'video' ? getVideoEmbed(item.file_url) : null;
                return (
                  <div key={item.id} className="school-card"
                    style={{ borderRight: `4px solid ${cfg.color}`, padding: '1rem 1.1rem' }}>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: item.body || item.file_url ? 10 : 0 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 9, background: cfg.bg,
                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <GroupIcon style={{ fontSize: 18, color: cfg.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.97rem', fontFamily: 'Tajawal,sans-serif', color: 'var(--clr-dark)' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2, fontFamily: 'Tajawal,sans-serif' }}>
                          {item.teacher_name} · {fmt(item.created_at)}
                        </div>
                      </div>
                      <span style={{
                        flexShrink: 0, fontSize: 11, fontWeight: 700,
                        color: cfg.color, background: cfg.bg,
                        borderRadius: 6, padding: '2px 8px', fontFamily: 'Tajawal,sans-serif',
                      }}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Text body */}
                    {item.body && (
                      <p style={{
                        margin: '0 0 10px', fontSize: '0.9rem', color: '#374151',
                        lineHeight: 1.8, fontFamily: 'Tajawal,sans-serif',
                        background: '#f9fafb', borderRadius: 8, padding: '0.75rem 1rem',
                      }}>
                        {item.body}
                      </p>
                    )}

                    {/* Image */}
                    {item.type === 'image' && item.file_url && (
                      <img src={`http://localhost:5000${item.file_url}`} alt={item.title}
                        style={{ maxWidth: '100%', maxHeight: 380, borderRadius: 10, objectFit: 'contain', display: 'block' }} />
                    )}

                    {/* Video embed */}
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

                    {/* Document download */}
                    {item.type === 'document' && item.file_url && (
                      <a href={`http://localhost:5000${item.file_url}`} target="_blank" rel="noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '0.45rem 1.1rem', borderRadius: 8,
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
      })}
    </div>
  );
}

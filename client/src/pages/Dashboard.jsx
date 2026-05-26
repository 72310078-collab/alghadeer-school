import { useState, useEffect } from 'react';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon   from '@mui/icons-material/MenuBook';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CampaignIcon from '@mui/icons-material/Campaign';
import SchoolIcon from '@mui/icons-material/School';
import GradeIcon from '@mui/icons-material/Grade';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventSeatIcon  from '@mui/icons-material/EventSeat';
import EventIcon       from '@mui/icons-material/Event';
import TrendingUpIcon  from '@mui/icons-material/TrendingUp';
import VisibilityIcon  from '@mui/icons-material/Visibility';
import HearingIcon     from '@mui/icons-material/Hearing';
import AccessibleIcon  from '@mui/icons-material/Accessible';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import '../styles/dashboard.css';

const catColor = { general: 'badge-gray', academic: 'badge-green', event: 'badge-confirm', urgent: 'badge-red' };
const catLabel = { general: 'عام', academic: 'أكاديمي', event: 'فعالية', urgent: 'عاجل' };
const evtColor = { holiday: 'red', exam: 'gold', activity: 'confirm', meeting: 'green', other: 'gray' };
const evtLabel = { holiday: 'إجازة', exam: 'امتحان', activity: 'نشاط', meeting: 'اجتماع', other: 'أخرى' };

const formatDate = (d) => {
  try { return format(new Date(d), 'd MMM', { locale: ar }); } catch { return d; }
};

function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, announcements: 0 });
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [stRes, annRes, evtRes] = await Promise.all([
          api.get('/users/stats'),
          api.get('/announcements'),
          api.get('/events'),
        ]);
        setStats(stRes.data);
        setAnnouncements(annRes.data.slice(0, 5));
        setEvents(evtRes.data.slice(0, 5));
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const today = new Date();
  const dayName = format(today, 'EEEE', { locale: ar });
  const dateStr = format(today, 'd MMMM yyyy', { locale: ar });

  if (loading) return <div className="page-loader"><div className="school-spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="dash-hero-pad" style={{
        background: 'linear-gradient(135deg, #1E7A2A 0%, #155a1f 60%, #0f3d15 100%)',
        borderRadius: 16,
        padding: '2rem 2.5rem',
        marginBottom: '1.75rem',
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        boxShadow: '0 8px 32px rgba(30,122,42,0.35)',
      }}>
        <div style={{ position: 'absolute', top: -20, left: -20, width: 180, height: 180, borderRadius: '50%', background: 'rgba(212,160,23,0.12)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 80, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <TrendingUpIcon className="d-none d-sm-block" style={{ position: 'absolute', left: '2.5rem', top: '50%', transform: 'translateY(-50%)', fontSize: 90, color: 'rgba(212,160,23,0.18)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.75, marginBottom: '0.35rem', fontFamily: 'Tajawal,sans-serif' }}>
            {dayName}، {dateStr}
          </div>
          <h2 style={{ fontWeight: 900, fontSize: '1.65rem', marginBottom: '0.3rem', fontFamily: 'Tajawal,sans-serif', lineHeight: 1.2 }}>
            أهلاً، {user?.name} 👋
          </h2>
          <p style={{ opacity: 0.85, marginBottom: 0, fontSize: '0.92rem', fontFamily: 'Tajawal,sans-serif' }}>
            لوحة التحكم الإدارية — العام الدراسي 2025-2026
          </p>
        </div>
      </div>

      <div className="stats-grid mb-4">
        {[
          { label: 'إجمالي الطلاب',    value: stats.students,      Icon: SchoolIcon,   color: 'green',   bg: 'rgba(30,122,42,0.1)',   iconClr: '#1E7A2A' },
          { label: 'المعلمون',          value: stats.teachers,      Icon: PeopleIcon,   color: 'gold',    bg: 'rgba(212,160,23,0.1)',  iconClr: '#D4A017' },
          { label: 'الصفوف الدراسية',  value: stats.classes,       Icon: MenuBookIcon, color: 'red',     bg: 'rgba(220,53,69,0.1)',   iconClr: '#dc3545' },
          { label: 'التعاميم',           value: stats.announcements, Icon: CampaignIcon, color: 'confirm', bg: 'rgba(13,110,253,0.1)',  iconClr: '#0d6efd' },
        ].map(({ label, value, Icon, color, bg, iconClr }) => (
          <div key={label} className={`stat-card ${color}`} style={{ cursor: 'default' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon style={{ fontSize: 28, color: iconClr }} />
            </div>
            <div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1, color: 'var(--clr-dark)', fontFamily: 'Tajawal,sans-serif' }}>{value}</div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.2rem', fontFamily: 'Tajawal,sans-serif' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.85rem', fontFamily: 'Tajawal,sans-serif' }}>
          إجراءات سريعة
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { label: 'إدارة الصفوف',    Icon: MenuBookIcon,    path: '/classes',       clr: '#D4A017' },
            { label: 'جدول الامتحانات', Icon: AssignmentIcon,  path: '/exams',         clr: '#dc3545' },
            { label: 'إضافة إعلان',     Icon: AddCircleIcon,   path: '/announcements', clr: '#0d6efd' },
          ].map(({ label, Icon, path, clr }) => (
            <button key={label} onClick={() => navigate(path)} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.55rem 1.1rem', borderRadius: 10, border: `1.5px solid ${clr}20`,
              background: `${clr}0d`, color: clr, fontWeight: 700, fontSize: '0.85rem',
              cursor: 'pointer', fontFamily: 'Tajawal,sans-serif',
              transition: 'background 0.15s, transform 0.1s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `${clr}1a`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${clr}0d`; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Icon style={{ fontSize: 18 }} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="content-grid-2">
        <div className="school-card">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
              <CampaignIcon style={{ fontSize: 20, color: 'var(--clr-green)' }} />
              <h3 style={{ fontWeight: 800, fontSize: '1rem', margin: 0, fontFamily: 'Tajawal,sans-serif' }}>آخر التعاميم</h3>
            </div>
            <a href="/announcements" style={{ color: 'var(--clr-green)', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>عرض الكل ←</a>
          </div>
          {announcements.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem 0', fontFamily: 'Tajawal,sans-serif' }}>لا توجد تعاميم</p>
          ) : announcements.map(a => (
            <div key={a.id} className="announcement-item">
              <div className="announcement-dot" style={{ background: a.category === 'urgent' ? 'var(--clr-red)' : 'var(--clr-green)', marginTop: 4 }} />
              <div style={{ flex: 1 }}>
                <div className="announcement-title">{a.title}</div>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span className={`badge-school ${catColor[a.category] || 'badge-gray'}`}>{catLabel[a.category] || a.category}</span>
                  <span className="announcement-meta">{a.author_name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="school-card">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
              <EventIcon style={{ fontSize: 20, color: 'var(--clr-gold)' }} />
              <h3 style={{ fontWeight: 800, fontSize: '1rem', margin: 0, fontFamily: 'Tajawal,sans-serif' }}>الأحداث القادمة</h3>
            </div>
            <a href="/events" style={{ color: 'var(--clr-green)', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>التقويم ←</a>
          </div>
          {events.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem 0', fontFamily: 'Tajawal,sans-serif' }}>لا توجد أحداث</p>
          ) : events.map(ev => (
            <div key={ev.id} className="event-item">
              <div className="event-date-box">
                <span className="event-date-day">{formatDate(ev.event_date).split(' ')[0]}</span>
                <span className="event-date-mon">{formatDate(ev.event_date).split(' ')[1]}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--clr-dark)', fontFamily: 'Tajawal,sans-serif' }}>{ev.title}</div>
                <span className={`badge-school badge-${evtColor[ev.event_type] || 'gray'} mt-1 d-inline-block`}>
                  {evtLabel[ev.event_type] || ev.event_type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudentDashboard({ user }) {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [mySeat,    setMySeat]    = useState(null);
  const [subjects,  setSubjects]  = useState([]);
  const [myClass,   setMyClass]   = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {

        const [annRes, evtRes, seatRes, classRes] = await Promise.all([
          api.get('/announcements').catch(() => ({ data: [] })),
          api.get('/events').catch(() => ({ data: [] })),
          api.get('/seats/my-seat').catch(() => ({ data: null })),
          api.get(`/classes/student/${user.id}`).catch(() => ({ data: [] })),
        ]);

        setAnnouncements((annRes.data || []).slice(0, 4));
        setEvents((evtRes.data || []).slice(0, 4));
        setMySeat(seatRes.data || null);

        const cls = (classRes.data || [])[0] || null;
        setMyClass(cls);

        const [gradeRes, detailRes] = await Promise.all([
          api.get(`/grades/student/${user.id}`).catch(() => ({ data: [] })),
          cls
            ? api.get(`/classes/${cls.id}`).catch(() => ({ data: {} }))
            : Promise.resolve({ data: {} }),
        ]);

        setGrades(gradeRes.data || []);
        setSubjects(detailRes.data?.subjects || []);

      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const today = new Date();
  const dayName = format(today, 'EEEE', { locale: ar });
  const dateStr = format(today, 'd MMMM yyyy', { locale: ar });

  const avgGrade = grades.length
    ? Math.round(
        grades.reduce((s, g) => s + (Number(g.score) / Number(g.max_score || 100)) * 100, 0)
        / grades.length
      )
    : null;

  const HEALTH_ICON = {
    vision:   VisibilityIcon,
    hearing:  HearingIcon,
    mobility: AccessibleIcon,
    none:     EventSeatIcon,
    other:    EventSeatIcon,
  };
  const HEALTH_COLOR = {
    vision: '#0d6efd', hearing: '#fd7e14', mobility: '#9b5de5', none: '#6f42c1', other: '#D4A017',
  };

  const SUBJECT_COLORS = [
    { from: '#1E7A2A', to: '#38a047' }, { from: '#b8860b', to: '#D4A017' },
    { from: '#1e40af', to: '#3b82f6' }, { from: '#6d28d9', to: '#9b5de5' },
    { from: '#0e7490', to: '#06b6d4' }, { from: '#9a3412', to: '#ea580c' },
    { from: '#9f1239', to: '#e11d48' }, { from: '#14532d', to: '#16a34a' },
    { from: '#4c1d95', to: '#7c3aed' },
  ];
  const NAMED_COLORS = {
    'رياضيات': 0, 'الرياضيات': 0, 'عربي': 1, 'لغة عربية': 1, 'اللغة العربية': 1,
    'انجليزي': 2, 'لغة انجليزية': 2, 'اللغة الإنجليزية': 2,
    'كيمياء': 3, 'الكيمياء': 3, 'فيزياء': 4, 'الفيزياء': 4,
    'تاريخ': 5, 'التاريخ': 5, 'تربية مدنية': 6, 'تربية وطنية': 6,
    'جغرافيا': 7, 'الجغرافيا': 7, 'فلسفة': 8, 'الفلسفة': 8,
    'أحياء': 7, 'علوم': 7, 'العلوم': 7,
  };
  const getSubjectColor = (name, idx) => {
    const key = Object.keys(NAMED_COLORS).find(k =>
      name?.includes(k) || k.includes(name)
    );
    return SUBJECT_COLORS[key !== undefined ? NAMED_COLORS[key] : idx % SUBJECT_COLORS.length];
  };

  if (loading) return <div className="page-loader"><div className="school-spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="dash-hero-pad" style={{
        background: 'linear-gradient(135deg, #155a1f 0%, #1E7A2A 50%, #2d9e3a 100%)',
        borderRadius: 16,
        padding: '2rem 2.5rem',
        marginBottom: '1.75rem',
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        boxShadow: '0 8px 32px rgba(30,122,42,0.3)',
      }}>
        <div style={{ position: 'absolute', top: -30, left: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(212,160,23,0.12)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: 100, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <SchoolIcon className="d-none d-sm-block" style={{ position: 'absolute', left: '2.5rem', top: '50%', transform: 'translateY(-50%)', fontSize: 90, color: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.75, marginBottom: '0.35rem', fontFamily: 'Tajawal,sans-serif' }}>
            {dayName}، {dateStr}
          </div>
          <h2 style={{ fontWeight: 900, fontSize: '1.65rem', marginBottom: '0.3rem', fontFamily: 'Tajawal,sans-serif', lineHeight: 1.2 }}>
            مرحباً، {user?.name} 👋
          </h2>
          <p style={{ opacity: 0.85, marginBottom: 0, fontSize: '0.92rem', fontFamily: 'Tajawal,sans-serif' }}>
            العام الدراسي 2025-2026 — مدرسة الغدير
          </p>
        </div>
      </div>

      <div className="dash-info-grid">
        <div className="school-card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(212,160,23,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
            <GradeIcon style={{ fontSize: 28, color: '#D4A017' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--clr-dark)', lineHeight: 1, fontFamily: 'Tajawal,sans-serif' }}>
            {avgGrade !== null ? `${avgGrade}%` : '—'}
          </div>
          <div style={{ fontSize: '0.83rem', color: '#6b7280', marginTop: '0.25rem', fontFamily: 'Tajawal,sans-serif' }}>متوسط العلامات</div>
        </div>
      </div>

      {mySeat && (() => {
        const ht    = mySeat.health_type || 'none';
        const clr   = HEALTH_COLOR[ht] || '#6f42c1';
        const SIcon = HEALTH_ICON[ht]  || EventSeatIcon;
        return (
          <div style={{
            background: `linear-gradient(135deg, ${clr} 0%, ${clr}cc 100%)`,
            borderRadius: 14, padding: '1.25rem 1.75rem',
            marginBottom: '1.75rem', color: '#fff',
            display: 'flex', alignItems: 'center', gap: '1.25rem',
            boxShadow: `0 6px 24px ${clr}40`,
            cursor: 'pointer',
          }} onClick={() => navigate('/my-seats')}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <SIcon style={{ fontSize: 30 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', fontFamily: 'Tajawal,sans-serif' }}>
                مقعدك في {mySeat.class_name}
              </div>
              <div style={{ opacity: 0.85, fontSize: '0.88rem', marginTop: '0.2rem', fontFamily: 'Tajawal,sans-serif' }}>
                صف {mySeat.row_num}، عمود {mySeat.col_num}
              </div>
            </div>
          </div>
        );
      })()}

      <div className="school-card mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <AutoStoriesIcon style={{ fontSize: 20, color: 'var(--clr-green)' }} />
            <h3 style={{ fontWeight: 800, fontSize: '1rem', margin: 0, fontFamily: 'Tajawal,sans-serif' }}>
              موادي الدراسية
            </h3>
            {myClass && (
              <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'Tajawal,sans-serif' }}>
                — {myClass.name}
              </span>
            )}
          </div>
          <a href="/courses" style={{ color: 'var(--clr-green)', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', fontFamily: 'Tajawal,sans-serif' }}>
            عرض الكل ←
          </a>
        </div>

        {subjects.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '1.5rem 0', fontFamily: 'Tajawal,sans-serif', fontSize: '0.9rem' }}>
            لم تُضَف مواد لصفك بعد
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {subjects.map((sub, idx) => {
              const clr = getSubjectColor(sub.name, idx);
              const initial = sub.name.replace(/^(ال|علم\s|لغة\s)/u, '').charAt(0);
              const gradeForSub = grades.find(g => g.subject_id === sub.id);
              return (
                <div key={sub.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', borderRadius: 12,
                  background: `linear-gradient(135deg, ${clr.from}15 0%, ${clr.to}10 100%)`,
                  border: `1.5px solid ${clr.from}30`,
                  minWidth: 150, flex: '1 1 150px', maxWidth: 220,
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  cursor: 'default',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${clr.from}25`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: `linear-gradient(135deg, ${clr.from}, ${clr.to})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 900, fontSize: '1rem',
                    fontFamily: 'Tajawal,sans-serif',
                    boxShadow: `0 4px 12px ${clr.from}40`,
                  }}>
                    {initial}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--clr-dark)',
                      fontFamily: 'Tajawal,sans-serif', whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sub.name}
                    </div>
                    {gradeForSub ? (
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: clr.from, marginTop: 1,
                        fontFamily: 'Tajawal,sans-serif' }}>
                        {gradeForSub.score}/{gradeForSub.max_score}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 1,
                        fontFamily: 'Tajawal,sans-serif' }}>
                        لا توجد علامة
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="content-grid-2">
        <div className="school-card">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
              <CampaignIcon style={{ fontSize: 20, color: 'var(--clr-green)' }} />
              <h3 style={{ fontWeight: 800, fontSize: '1rem', margin: 0, fontFamily: 'Tajawal,sans-serif' }}>آخر التعاميم</h3>
            </div>
            <a href="/announcements" style={{ color: 'var(--clr-green)', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>عرض الكل ←</a>
          </div>
          {announcements.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem 0', fontFamily: 'Tajawal,sans-serif' }}>لا توجد تعاميم</p>
          ) : announcements.map(a => (
            <div key={a.id} className="announcement-item">
              <div className="announcement-dot" style={{ background: a.category === 'urgent' ? 'var(--clr-red)' : 'var(--clr-green)', marginTop: 4 }} />
              <div style={{ flex: 1 }}>
                <div className="announcement-title">{a.title}</div>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span className={`badge-school ${catColor[a.category] || 'badge-gray'}`}>{catLabel[a.category] || a.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="school-card">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
              <EventIcon style={{ fontSize: 20, color: 'var(--clr-gold)' }} />
              <h3 style={{ fontWeight: 800, fontSize: '1rem', margin: 0, fontFamily: 'Tajawal,sans-serif' }}>الأحداث القادمة</h3>
            </div>
            <a href="/events" style={{ color: 'var(--clr-green)', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>التقويم ←</a>
          </div>
          {events.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem 0', fontFamily: 'Tajawal,sans-serif' }}>لا توجد أحداث</p>
          ) : events.map(ev => (
            <div key={ev.id} className="event-item">
              <div className="event-date-box">
                <span className="event-date-day">{formatDate(ev.event_date).split(' ')[0]}</span>
                <span className="event-date-mon">{formatDate(ev.event_date).split(' ')[1]}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--clr-dark)', fontFamily: 'Tajawal,sans-serif' }}>{ev.title}</div>
                <span className={`badge-school badge-${evtColor[ev.event_type] || 'gray'} mt-1 d-inline-block`}>
                  {evtLabel[ev.event_type] || ev.event_type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard user={user} />;
  return <StudentDashboard user={user} />;
}

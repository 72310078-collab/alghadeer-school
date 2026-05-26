import { useState, useEffect } from 'react';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CampaignIcon from '@mui/icons-material/Campaign';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import '../styles/dashboard.css';

const DAY_MAP   = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday' };
const DAY_LABEL = { sunday: 'الأحد', monday: 'الاثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس' };
const catLabel  = { general: 'عام', academic: 'أكاديمي', event: 'فعالية', urgent: 'عاجل' };
const catColor  = { general: 'badge-gray', academic: 'badge-green', event: 'badge-confirm', urgent: 'badge-red' };

export default function TeacherHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [todayLectures,  setTodayLectures]  = useState([]);
  const [allLectures,    setAllLectures]    = useState([]);
  const [classes,        setClasses]        = useState([]);
  const [announcements,  setAnnouncements]  = useState([]);
  const [upcomingExams,  setUpcomingExams]  = useState([]);
  const [loading,        setLoading]        = useState(true);

  const todayKey = DAY_MAP[new Date().getDay()];
  const today    = new Date().toISOString().slice(0, 10);
  const dayName  = DAY_LABEL[todayKey] || format(new Date(), 'EEEE', { locale: ar });
  const dateStr  = format(new Date(), 'd MMMM yyyy', { locale: ar });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [lectRes, classRes, annRes, examRes] = await Promise.all([
          api.get('/lectures', { params: { teacher_id: user.id } }),
          api.get('/classes'),
          api.get('/announcements'),
          api.get('/exams'),
        ]);
        const all   = lectRes.data || [];
        const myClasses = (classRes.data || []).filter(c => c.teacher_id === user.id);
        setAllLectures(all);
        setTodayLectures(all.filter(l => l.day_of_week === todayKey));
        setClasses(myClasses);
        setAnnouncements((annRes.data || []).slice(0, 4));
        setUpcomingExams((examRes.data || []).filter(e => e.exam_date >= today).slice(0, 5));

      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  const formatDate = (d) => {
    try { return format(new Date(d), 'd MMM yyyy', { locale: ar }); } catch { return d; }
  };

  const initials = user?.name?.split(' ').slice(0, 2).map(w => w[0]).join('') || 'م';

  if (loading) return <div className="page-loader"><div className="school-spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="dash-hero-pad" style={{
        background: 'linear-gradient(135deg, #1E7A2A 0%, #2d6a4f 100%)',
        borderRadius: 16, padding: '1.75rem 2rem',
        marginBottom: '1.75rem', color: '#fff',
        display: 'flex', alignItems: 'center', gap: '1.25rem',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 28px rgba(30,122,42,0.3)',
        flexWrap: 'wrap',
      }}>
        <div style={{ position: 'absolute', top: -20, left: -20, width: 140, height: 140, borderRadius: '50%', background: 'rgba(212,160,23,0.12)' }} />
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Tajawal,sans-serif', position: 'relative', zIndex: 1 }}>
          {initials}
        </div>
        <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
          <div style={{ fontSize: '0.82rem', opacity: 0.75, marginBottom: '0.2rem', fontFamily: 'Tajawal,sans-serif' }}>
            {dayName}، {dateStr}
          </div>
          <h2 style={{ margin: 0, fontWeight: 900, fontSize: '1.55rem', fontFamily: 'Tajawal,sans-serif', lineHeight: 1.2 }}>
            أهلاً بالأستاذ {user?.name}
          </h2>
          <p style={{ margin: '0.25rem 0 0', opacity: 0.85, fontSize: '0.88rem', fontFamily: 'Tajawal,sans-serif' }}>
            {todayLectures.length
              ? `لديك ${todayLectures.length} محاضرة اليوم`
              : 'لا توجد محاضرات مجدولة اليوم'}
          </p>
        </div>
        <div className="d-none d-sm-flex" style={{ gap: '0.6rem', flexShrink: 0, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          {[
            { v: classes.length,       l: 'صف' },
            { v: upcomingExams.length, l: 'امتحان' },
          ].map(({ v, l }) => (
            <div key={l} style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 10, padding: '0.4rem 0.8rem', textAlign: 'center' }}>
              <div style={{ fontWeight: 900, fontSize: '1.2rem', lineHeight: 1, fontFamily: 'Tajawal,sans-serif' }}>{v}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.85, fontFamily: 'Tajawal,sans-serif' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="school-card h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(30,122,42,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ScheduleIcon style={{ fontSize: 20, color: 'var(--clr-green)' }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1rem', fontFamily: 'Tajawal,sans-serif' }}>محاضرات اليوم</span>
              <span className="badge-school badge-green ms-auto">{todayLectures.length}</span>
            </div>
            {todayLectures.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem 0' }}>
                <ScheduleIcon style={{ fontSize: 40, opacity: 0.25 }} />
                <p style={{ marginTop: 8, fontSize: '0.88rem', fontFamily: 'Tajawal,sans-serif' }}>لا توجد محاضرات اليوم</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {todayLectures.map(l => (
                  <div key={l.id} style={{
                    background: 'var(--clr-surface)', borderRadius: 10, padding: '0.75rem 1rem',
                    borderRight: '3px solid var(--clr-green)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', fontFamily: 'Tajawal,sans-serif' }}>{l.subject_name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>{l.class_name}{l.room ? ` — ${l.room}` : ''}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, direction: 'ltr', fontSize: '0.82rem', color: 'var(--clr-green)', fontWeight: 700 }}>
                      <AccessTimeIcon style={{ fontSize: 14 }} />
                      {l.start_time?.slice(0, 5)} – {l.end_time?.slice(0, 5)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {allLectures.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
                <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 8, fontFamily: 'Tajawal,sans-serif' }}>ملخص الأسبوع</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {Object.entries(DAY_LABEL).map(([key, label]) => {
                    const count = allLectures.filter(l => l.day_of_week === key).length;
                    return (
                      <span key={key} style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                        background: count > 0 ? 'rgba(30,122,42,0.1)' : '#f3f4f6',
                        color: count > 0 ? 'var(--clr-green)' : '#9ca3af',
                        fontFamily: 'Tajawal,sans-serif',
                      }}>{label} {count > 0 ? `(${count})` : ''}</span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="school-card h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(220,53,69,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AssignmentIcon style={{ fontSize: 20, color: '#dc3545' }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1rem', fontFamily: 'Tajawal,sans-serif' }}>الامتحانات القادمة</span>
              <a href="/exams" style={{ color: 'var(--clr-green)', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', marginRight: 'auto' }}>عرض الكل ←</a>
            </div>
            {upcomingExams.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem 0' }}>
                <AssignmentIcon style={{ fontSize: 40, opacity: 0.25 }} />
                <p style={{ marginTop: 8, fontSize: '0.88rem', fontFamily: 'Tajawal,sans-serif' }}>لا توجد امتحانات قادمة</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {upcomingExams.map(e => (
                  <div key={e.id} style={{
                    background: 'var(--clr-surface)', borderRadius: 10, padding: '0.75rem 1rem',
                    borderRight: '3px solid #dc3545',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', fontFamily: 'Tajawal,sans-serif' }}>{e.subject_name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>{e.class_name || 'جميع الصفوف'}</div>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#dc3545' }}>{formatDate(e.exam_date)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', direction: 'ltr' }}>{e.start_time?.slice(0, 5)} – {e.end_time?.slice(0, 5)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="school-card h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(13,110,253,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CampaignIcon style={{ fontSize: 20, color: '#0d6efd' }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1rem', fontFamily: 'Tajawal,sans-serif' }}>آخر التعاميم</span>
              <a href="/announcements" style={{ color: 'var(--clr-green)', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', marginRight: 'auto' }}>عرض الكل ←</a>
            </div>
            {announcements.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem 0', fontFamily: 'Tajawal,sans-serif' }}>لا توجد تعاميم</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {announcements.map(a => (
                  <div key={a.id} style={{ background: 'var(--clr-surface)', borderRadius: 10, padding: '0.75rem 1rem' }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', fontFamily: 'Tajawal,sans-serif' }}>{a.title}</span>
                      <span className={`badge-school ${catColor[a.category]}`} style={{ flexShrink: 0, marginRight: 8 }}>{catLabel[a.category]}</span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#9ca3af', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {a.content}
                    </p>
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

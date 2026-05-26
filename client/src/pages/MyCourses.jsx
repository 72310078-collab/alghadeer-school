import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/dashboard.css';
import '../styles/courses.css';

const SUBJECT_MAP = {
  'رياضيات':          { from: '#1E7A2A', to: '#38a047', pat: 0 },
  'الرياضيات':        { from: '#1E7A2A', to: '#38a047', pat: 0 },
  'عربي':             { from: '#b8860b', to: '#D4A017', pat: 1 },
  'لغة عربية':        { from: '#b8860b', to: '#D4A017', pat: 1 },
  'اللغة العربية':    { from: '#b8860b', to: '#D4A017', pat: 1 },
  'انجليزي':          { from: '#1e40af', to: '#3b82f6', pat: 2 },
  'لغة انجليزية':     { from: '#1e40af', to: '#3b82f6', pat: 2 },
  'اللغة الإنجليزية': { from: '#1e40af', to: '#3b82f6', pat: 2 },
  'أحياء':            { from: '#065f46', to: '#10b981', pat: 3 },
  'علم الأحياء':      { from: '#065f46', to: '#10b981', pat: 3 },
  'الأحياء':          { from: '#065f46', to: '#10b981', pat: 3 },
  'biology':          { from: '#065f46', to: '#10b981', pat: 3 },
  'كيمياء':           { from: '#6d28d9', to: '#9b5de5', pat: 4 },
  'الكيمياء':         { from: '#6d28d9', to: '#9b5de5', pat: 4 },
  'chemistry':        { from: '#6d28d9', to: '#9b5de5', pat: 4 },
  'فيزياء':           { from: '#0e7490', to: '#06b6d4', pat: 5 },
  'الفيزياء':         { from: '#0e7490', to: '#06b6d4', pat: 5 },
  'physics':          { from: '#0e7490', to: '#06b6d4', pat: 5 },
  'تاريخ':            { from: '#9a3412', to: '#ea580c', pat: 0 },
  'التاريخ':          { from: '#9a3412', to: '#ea580c', pat: 0 },
  'history':          { from: '#9a3412', to: '#ea580c', pat: 0 },
  'جغرافيا':          { from: '#14532d', to: '#16a34a', pat: 1 },
  'الجغرافيا':        { from: '#14532d', to: '#16a34a', pat: 1 },
  'geography':        { from: '#14532d', to: '#16a34a', pat: 1 },
  'تربية مدنية':      { from: '#9f1239', to: '#e11d48', pat: 2 },
  'تربية وطنية':      { from: '#9f1239', to: '#e11d48', pat: 2 },
  'تربية اجتماعية':   { from: '#9f1239', to: '#e11d48', pat: 2 },
  'علوم':             { from: '#065f46', to: '#059669', pat: 3 },
  'العلوم':           { from: '#065f46', to: '#059669', pat: 3 },
  'فلسفة':            { from: '#4c1d95', to: '#7c3aed', pat: 4 },
  'الفلسفة':          { from: '#4c1d95', to: '#7c3aed', pat: 4 },
  'تربية دينية':      { from: '#1e3a5f', to: '#2563eb', pat: 5 },
};

const FALLBACK = [
  { from: '#1E7A2A', to: '#38a047', pat: 0 },
  { from: '#b8860b', to: '#D4A017', pat: 1 },
  { from: '#6d28d9', to: '#9b5de5', pat: 2 },
  { from: '#0e7490', to: '#06b6d4', pat: 3 },
  { from: '#9f1239', to: '#e11d48', pat: 4 },
  { from: '#1e40af', to: '#3b82f6', pat: 5 },
  { from: '#9a3412', to: '#ea580c', pat: 0 },
  { from: '#14532d', to: '#16a34a', pat: 1 },
  { from: '#4c1d95', to: '#7c3aed', pat: 2 },
];

const PATTERNS = [

  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Ccircle cx='20' cy='20' r='18' fill='none' stroke='rgba(255,255,255,0.18)' stroke-width='3'/%3E%3Ccircle cx='20' cy='20' r='9' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='2'/%3E%3Ccircle cx='95' cy='90' r='24' fill='none' stroke='rgba(255,255,255,0.14)' stroke-width='3'/%3E%3Ccircle cx='95' cy='90' r='13' fill='none' stroke='rgba(255,255,255,0.09)' stroke-width='2'/%3E%3Ccircle cx='90' cy='18' r='10' fill='none' stroke='rgba(255,255,255,0.12)' stroke-width='2'/%3E%3C/svg%3E")`,

  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cpolygon points='50,8 92,82 8,82' fill='none' stroke='rgba(255,255,255,0.16)' stroke-width='2'/%3E%3Cpolygon points='12,4 36,44 0,44' fill='rgba(255,255,255,0.07)'/%3E%3Cpolygon points='72,55 100,100 50,100' fill='rgba(255,255,255,0.07)'/%3E%3Cpolygon points='80,2 100,36 60,36' fill='rgba(255,255,255,0.05)'/%3E%3C/svg%3E")`,

  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect x='8' y='8' width='32' height='32' fill='none' stroke='rgba(255,255,255,0.16)' stroke-width='2' rx='4'/%3E%3Crect x='60' y='60' width='32' height='32' fill='none' stroke='rgba(255,255,255,0.16)' stroke-width='2' rx='4'/%3E%3Crect x='66' y='4' width='22' height='22' fill='rgba(255,255,255,0.07)' rx='3'/%3E%3Crect x='4' y='66' width='22' height='22' fill='rgba(255,255,255,0.07)' rx='3'/%3E%3C/svg%3E")`,

  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Ccircle cx='10' cy='10' r='3.5' fill='rgba(255,255,255,0.22)'/%3E%3Ccircle cx='28' cy='10' r='3.5' fill='rgba(255,255,255,0.15)'/%3E%3Ccircle cx='46' cy='10' r='3.5' fill='rgba(255,255,255,0.22)'/%3E%3Ccircle cx='10' cy='28' r='3.5' fill='rgba(255,255,255,0.15)'/%3E%3Ccircle cx='28' cy='28' r='5' fill='rgba(255,255,255,0.12)'/%3E%3Ccircle cx='46' cy='28' r='3.5' fill='rgba(255,255,255,0.15)'/%3E%3Ccircle cx='10' cy='46' r='3.5' fill='rgba(255,255,255,0.22)'/%3E%3Ccircle cx='28' cy='46' r='3.5' fill='rgba(255,255,255,0.15)'/%3E%3Ccircle cx='46' cy='46' r='3.5' fill='rgba(255,255,255,0.22)'/%3E%3C/svg%3E")`,

  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cline x1='0' y1='40' x2='40' y2='0' stroke='rgba(255,255,255,0.14)' stroke-width='2'/%3E%3Cline x1='-20' y1='40' x2='20' y2='0' stroke='rgba(255,255,255,0.08)' stroke-width='1.5'/%3E%3Cline x1='20' y1='40' x2='60' y2='0' stroke='rgba(255,255,255,0.08)' stroke-width='1.5'/%3E%3C/svg%3E")`,

  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cpolygon points='50,4 93,27 93,73 50,96 7,73 7,27' fill='none' stroke='rgba(255,255,255,0.16)' stroke-width='2'/%3E%3Cpolygon points='50,20 76,35 76,65 50,80 24,65 24,35' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='1.5'/%3E%3C/svg%3E")`,
];

const DAY_LABELS = {
  sunday: 'الأحد', monday: 'الاثنين', tuesday: 'الثلاثاء',
  wednesday: 'الأربعاء', thursday: 'الخميس',
};

function getStyle(name, idx) {
  const key = Object.keys(SUBJECT_MAP).find(k =>
    name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(name.toLowerCase())
  );
  const c = key ? SUBJECT_MAP[key] : FALLBACK[idx % FALLBACK.length];
  return {
    gradient: `linear-gradient(135deg, ${c.from} 0%, ${c.to} 100%)`,
    pattern:  PATTERNS[c.pat ?? (idx % PATTERNS.length)],
    accent:   c.from,
  };
}

export default function MyCourses() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [courses,  setCourses]  = useState([]);
  const [myClass,  setMyClass]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  // subjectId lookup: subject_name → subject_id
  const [subjectIds, setSubjectIds] = useState({});

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const classRes = await api.get(`/classes/student/${user.id}`);
        const cls = (classRes.data || [])[0] || null;
        setMyClass(cls);

        if (cls) {
          // Load lectures AND class subjects in parallel
          const [lectRes, clsDetailRes] = await Promise.all([
            api.get('/lectures', { params: { class_id: cls.id } }),
            api.get(`/classes/${cls.id}`),
          ]);

          const lectures = lectRes.data || [];
          const map = {};
          lectures.forEach(l => {
            if (!map[l.subject_name]) {
              map[l.subject_name] = { subject_name: l.subject_name, teacher_name: l.teacher_name, sessions: [] };
            }
            map[l.subject_name].sessions.push(l);
          });
          setCourses(Object.values(map));

          // Build subject_name → subject_id lookup
          const dbSubjects = clsDetailRes.data?.subjects || [];
          const lookup = {};
          Object.keys(map).forEach(name => {
            const match = dbSubjects.find(s =>
              s.name === name ||
              s.name.includes(name) ||
              name.includes(s.name)
            );
            if (match) lookup[name] = match.id;
          });
          setSubjectIds(lookup);
        }
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  if (loading) return <div className="page-loader"><div className="school-spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">موادي الدراسية</h1>
          <p className="page-breadcrumb">
            {myClass ? `${myClass.name} — ${myClass.grade_level}` : ''}
            {courses.length > 0 ? ` · ${courses.length} مادة` : ''}
          </p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="school-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <MenuBookIcon style={{ fontSize: 64, color: '#d1d5db', marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 700, color: '#6b7280', fontFamily: 'Tajawal,sans-serif' }}>
            لم تُسجَّل مواد بعد
          </h3>
          <p style={{ color: '#9ca3af', fontFamily: 'Tajawal,sans-serif' }}>
            سيتم عرض موادك الدراسية هنا فور إضافة الجدول من قِبل الإدارة
          </p>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map((course, idx) => {
            const { gradient, pattern, accent } = getStyle(course.subject_name, idx);
            const uniqueDays = [...new Set(course.sessions.map(s => s.day_of_week))];
            const subjId = subjectIds[course.subject_name];

            return (
              <div key={course.subject_name} className="course-card"
                style={{ cursor: subjId ? 'pointer' : 'default' }}
                onClick={() => subjId && navigate(
                  `/subjects/${subjId}/materials`,
                  { state: { subjectName: course.subject_name, teacherName: course.teacher_name, accent } }
                )}>

                <div className="course-card-header" style={{
                  backgroundImage: `${pattern}, ${gradient}`,
                  backgroundSize: 'auto, cover',
                }}>
                  <div className="course-sessions-pill">
                    {course.sessions.length} حصة / أسبوع
                  </div>
                  <div className="course-initial">
                    {course.subject_name.replace(/^(ال|علم\s|لغة\s)/u, '').charAt(0)}
                  </div>
                </div>

                <div className="course-card-body">
                  <h3 className="course-title">{course.subject_name}</h3>

                  {course.teacher_name && (
                    <div className="course-teacher">
                      <PersonIcon style={{ fontSize: 13 }} />
                      {course.teacher_name}
                    </div>
                  )}

                  <div className="course-days">
                    {uniqueDays.map(d => (
                      <span key={d} className="course-day-chip" style={{ background: `${accent}15`, color: accent }}>
                        {DAY_LABELS[d] || d}
                      </span>
                    ))}
                  </div>

                  <div className="course-divider" />

                  <div className="course-times">
                    {course.sessions.slice(0, 2).map((s, i) => (
                      <div key={i} className="course-time-row">
                        <AccessTimeIcon style={{ fontSize: 12 }} />
                        <span>{DAY_LABELS[s.day_of_week]}</span>
                        <span dir="ltr">{s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}</span>
                        {s.room && <span className="course-room">{s.room}</span>}
                      </div>
                    ))}
                    {course.sessions.length > 2 && (
                      <div className="course-more">+{course.sessions.length - 2} حصص أخرى</div>
                    )}
                  </div>

                  {/* Materials shortcut */}
                  {subjId && (
                    <div style={{
                      marginTop: 10, paddingTop: 10,
                      borderTop: `1px solid ${accent}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: '0.8rem', fontFamily: 'Tajawal,sans-serif',
                      color: accent, fontWeight: 700,
                    }}>
                      <span><MenuBookIcon style={{ fontSize: 14, verticalAlign: 'middle', marginLeft: 4 }} />
                        عرض المواد التعليمية
                      </span>
                      <ArrowBackIcon style={{ fontSize: 14, transform: 'rotate(180deg)' }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

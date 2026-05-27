import { useState, useEffect } from 'react';
import GradeIcon from '@mui/icons-material/Grade';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import EditNoteIcon from '@mui/icons-material/EditNote';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

const getGradeColor = (score, max = 100) => {
  const pct = (score / max) * 100;
  if (pct >= 90) return 'badge-confirm';
  if (pct >= 75) return 'badge-green';
  if (pct >= 60) return 'badge-gold';
  return 'badge-red';
};

const SEMESTER_LABEL = { first: 'الأول', second: 'الثاني', final: 'النهائي' };

const TAB_STYLE = (active) => ({
  padding: '0.55rem 1.3rem',
  borderRadius: 10,
  border: 'none',
  fontFamily: 'Tajawal,sans-serif',
  fontWeight: 700,
  fontSize: '0.9rem',
  cursor: 'pointer',
  background: active ? 'var(--clr-green)' : 'transparent',
  color: active ? '#fff' : 'var(--clr-dark)',
  transition: 'background 0.18s, color 0.18s',
});

export default function Grades() {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const [tab, setTab] = useState('view');

  /* ── VIEW TAB state ── */
  const [grades,          setGrades]          = useState([]);
  const [students,        setStudents]        = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [filterClass,     setFilterClass]     = useState('');
  const [filterSubject,   setFilterSubject]   = useState('');
  const [filterSubjects,  setFilterSubjects]  = useState([]);
  const [semester,        setSemester]        = useState('');
  const [filterYear,      setFilterYear]      = useState('2025-2026');
  const [loading,         setLoading]         = useState(false);

  /* ── ENTRY TAB state (teacher only) ── */
  const [classes, setClasses] = useState([]);   // shared: admin uses for filter, teacher uses for entry
  const [entryClass, setEntryClass] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [entryStudents, setEntryStudents] = useState([]);
  const [entrySubject, setEntrySubject] = useState('');
  const [entrySemester, setEntrySemester] = useState('first');
  const [scores, setScores] = useState({});   // { student_id: score }
  const [maxScore, setMaxScore] = useState(100);
  const [saving, setSaving] = useState(false);
  const [loadingClass, setLoadingClass] = useState(false);

  /* ── Load initial data ── */
  useEffect(() => {
    if (user?.role === 'admin') {
      // Load classes for filter dropdown + all grades immediately
      api.get('/classes').then(r => setClasses(r.data || [])).catch(() => {});
      api.get('/grades/subjects').then(r => setFilterSubjects(r.data || [])).catch(err => console.error('subjects error:', err));
      loadAllGrades({});
    } else if (user?.role === 'teacher') {
      api.get('/classes', { params: { teacher_id: user.id } })
        .then(async clsRes => {
          const cls = clsRes.data || [];
          setClasses(cls);
          const all = [];
          for (const c of cls) {
            const d = await api.get(`/classes/${c.id}`).catch(() => ({ data: { students: [] } }));
            (d.data.students || []).forEach(s => { if (!all.find(x => x.id === s.id)) all.push(s); });
          }
          setStudents(all);
        })
        .catch(() => toast.error('فشل تحميل قائمة الطلاب'));
    }
    if (user?.role === 'student') loadGrades(user.id);
  }, [user]);


  /* ── Load class detail when teacher selects a class in ENTRY tab ── */
  useEffect(() => {
    if (!entryClass) { setSubjects([]); setEntryStudents([]); setScores({}); setEntrySubject(''); return; }
    setLoadingClass(true);
    api.get(`/classes/${entryClass}`)
      .then(r => {
        // Teacher sees only their own subjects; admin sees all
        const allSubjects = r.data.subjects || [];
        setSubjects(
          isTeacher
            ? allSubjects.filter(s => String(s.teacher_id) === String(user.id))
            : allSubjects
        );
        setEntryStudents(r.data.students || []);
        setEntrySubject('');
        setScores({});
      })
      .catch(() => toast.error('فشل تحميل بيانات الصف'))
      .finally(() => setLoadingClass(false));
  }, [entryClass]);

  /* ── Load existing grades when subject/semester changes in ENTRY tab ── */
  useEffect(() => {
    if (!entryClass || !entrySubject || !entrySemester || entryStudents.length === 0) return;
    // Load existing grades for this class to pre-fill inputs
    api.get(`/grades/class/${entryClass}`)
      .then(r => {
        const existing = r.data || [];
        const map = {};
        existing.forEach(g => {
          if (String(g.subject_id) === String(entrySubject) && g.semester === entrySemester) {
            map[g.student_id] = g.score;
          }
        });
        setScores(map);
      })
      .catch(() => {});
  }, [entrySubject, entrySemester, entryClass, entryStudents]);

  const loadGrades = async (studentId) => {
    if (!studentId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/grades/student/${studentId}`, { params: { semester: semester || undefined } });
      setGrades(data);
    } catch { toast.error('فشل تحميل العلامات'); } finally { setLoading(false); }
  };

  const loadAllGrades = async (params) => {
    setLoading(true);
    try {
      const { data } = await api.get('/grades', { params });
      setGrades(data);
    } catch { toast.error('فشل تحميل العلامات'); } finally { setLoading(false); }
  };

  const handleSearch = () => {
    if (user?.role === 'admin') {
      loadAllGrades({
        class_id:      filterClass   || undefined,
        subject_id:    filterSubject || undefined,
        semester:      semester      || undefined,
        academic_year: filterYear    || undefined,
      });
    } else {
      const id = user?.role === 'student' ? user.id : selectedStudent;
      loadGrades(id);
    }
  };

  const handleScoreChange = (studentId, val) => {
    const num = val === '' ? '' : Math.min(maxScore, Math.max(0, Number(val)));
    setScores(prev => ({ ...prev, [studentId]: num }));
  };

  const handleSaveGrades = async () => {
    if (!entrySubject || !entrySemester) return toast.error('اختر المادة والفصل الدراسي');
    const toSave = entryStudents
      .filter(s => scores[s.id] !== '' && scores[s.id] !== undefined)
      .map(s => ({ student_id: s.id, score: Number(scores[s.id]), max_score: maxScore }));
    if (toSave.length === 0) return toast.error('لم تدخل أي علامة');
    setSaving(true);
    try {
      const { data } = await api.post('/grades/bulk', {
        subject_id: entrySubject,
        semester: entrySemester,
        academic_year: '2025-2026',
        grades: toSave,
      });
      toast.success(data.message || 'تم حفظ العلامات ✓');
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل الحفظ');
    } finally { setSaving(false); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{user?.role === 'student' ? 'علاماتي' : 'العلامات'}</h1>
          <p className="page-breadcrumb">العام الدراسي 2025-2026</p>
        </div>
      </div>

      {/* Tabs — teacher sees both, others only view */}
      {isTeacher && (
        <div className="school-card mb-4 p-2">
          <div className="d-flex gap-2 flex-wrap">
            <button style={TAB_STYLE(tab === 'view')}  onClick={() => setTab('view')}>عرض العلامات</button>
            <button style={TAB_STYLE(tab === 'entry')} onClick={() => setTab('entry')}>
              <EditNoteIcon style={{ fontSize: 17, verticalAlign: 'middle', marginLeft: 4 }} />
              إدخال العلامات
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════ VIEW TAB ══════════════════ */}
      {tab === 'view' && (
        <>
          {/* ── Admin: filters for all-grades table ── */}
          {user?.role === 'admin' && (
            <div className="school-card mb-4">
              <div className="row g-3 align-items-end">
                <div className="col-md-3">
                  <label className="school-label">الصف</label>
                  <select className="school-input" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
                    <option value="">جميع الصفوف</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="school-label">المادة</label>
                  <select className="school-input" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
                    <option value="">جميع المواد</option>
                    {filterSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="school-label">الفصل الدراسي</label>
                  <select className="school-input" value={semester} onChange={e => setSemester(e.target.value)}>
                    <option value="">جميع الفصول</option>
                    <option value="first">الأول</option>
                    <option value="second">الثاني</option>
                    <option value="final">النهائي</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="school-label">العام الدراسي</label>
                  <select className="school-input" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="">جميع الأعوام</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <button className="btn btn-school-primary w-100 d-flex align-items-center justify-content-center gap-1" onClick={handleSearch}>
                    <SearchIcon style={{ fontSize: 18 }} /> تصفية
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Teacher / Student: single-student filter ── */}
          {user?.role !== 'admin' && (
            <div className="school-card mb-4">
              <div className="row g-3 align-items-end">
                {user?.role === 'teacher' && (
                  <div className="col-md-5">
                    <label className="school-label">اختر الطالب</label>
                    <select className="school-input" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                      <option value="">— اختر طالباً —</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="col-md-3">
                  <label className="school-label">الفصل</label>
                  <select className="school-input" value={semester} onChange={e => setSemester(e.target.value)}>
                    <option value="">جميع الفصول</option>
                    <option value="first">الأول</option>
                    <option value="second">الثاني</option>
                    <option value="final">النهائي</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <button className="btn btn-school-primary w-100 d-flex align-items-center justify-content-center gap-1" onClick={handleSearch}>
                    <SearchIcon style={{ fontSize: 18 }} /> بحث
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Summary stats ── */}
          {grades.length > 0 && (
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-3">
                <div className="stat-card green">
                  <div className="stat-icon green"><GradeIcon style={{ fontSize: 26 }} /></div>
                  <div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--clr-dark)', fontFamily: 'Tajawal,sans-serif' }}>
                      {(grades.reduce((s, g) => s + (g.score / g.max_score) * 100, 0) / grades.length).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>المعدل العام</div>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="stat-card gold">
                  <div className="stat-icon gold"><GradeIcon style={{ fontSize: 26 }} /></div>
                  <div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--clr-dark)', fontFamily: 'Tajawal,sans-serif' }}>{grades.length}</div>
                    <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>{user?.role === 'admin' ? 'إجمالي العلامات' : 'عدد المواد'}</div>
                  </div>
                </div>
              </div>
              {user?.role === 'admin' && (
                <>
                  <div className="col-6 col-md-3">
                    <div className="stat-card green">
                      <div className="stat-icon green"><GradeIcon style={{ fontSize: 26 }} /></div>
                      <div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--clr-dark)', fontFamily: 'Tajawal,sans-serif' }}>
                          {new Set(grades.map(g => g.student_id)).size}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>عدد الطلاب</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="stat-card gold">
                      <div className="stat-icon gold"><GradeIcon style={{ fontSize: 26 }} /></div>
                      <div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--clr-dark)', fontFamily: 'Tajawal,sans-serif' }}>
                          {grades.filter(g => (g.score / g.max_score) >= 0.6).length}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>علامات ناجحة</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Table ── */}
          {loading ? <div className="text-center p-5"><div className="school-spinner" /></div>
            : grades.length > 0 ? (
              <div className="school-card p-0 overflow-hidden">
                <div className="table-wrapper">
                  <table className="table school-table mb-0">
                    <thead><tr>
                      {user?.role === 'admin' && <><th>الطالب</th><th>الصف</th></>}
                      {user?.role !== 'admin' && <th>الصف</th>}
                      <th>المادة</th>
                      <th>العلامة</th>
                      <th>من أصل</th>
                      <th>النسبة</th>
                      <th>الفصل</th>
                    </tr></thead>
                    <tbody>
                      {grades.map(g => {
                        const pct = ((g.score / g.max_score) * 100).toFixed(1);
                        return (
                          <tr key={g.id}>
                            {user?.role === 'admin' && (
                              <>
                                <td style={{ fontWeight: 700 }}>{g.student_name}</td>
                                <td style={{ fontWeight: 600, color: 'var(--clr-green)' }}>{g.class_name}</td>
                              </>
                            )}
                            {user?.role !== 'admin' && <td style={{ fontWeight: 600 }}>{g.class_name}</td>}
                            <td>{g.subject_name}</td>
                            <td style={{ fontWeight: 700, fontSize: '1.05rem' }}>{g.score}</td>
                            <td style={{ color: '#6b7280' }}>{g.max_score}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
                                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, transition: 'width 0.4s',
                                    background: pct >= 90 ? 'var(--clr-confirm)' : pct >= 75 ? 'var(--clr-green)' : pct >= 60 ? 'var(--clr-gold)' : 'var(--clr-red)' }} />
                                </div>
                                <span className={`badge-school ${getGradeColor(g.score, g.max_score)}`}>{pct}%</span>
                              </div>
                            </td>
                            <td>{SEMESTER_LABEL[g.semester]}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="school-card text-center p-5" style={{ color: '#9ca3af' }}>
                <GradeIcon style={{ fontSize: 52, opacity: 0.15, display: 'block', margin: '0 auto 12px' }} />
                <p style={{ fontFamily: 'Tajawal,sans-serif' }}>
                  {user?.role === 'admin' ? 'لا توجد علامات مسجلة' :
                   user?.role === 'student' || selectedStudent ? 'لا توجد علامات مسجلة' : 'اختر طالباً لعرض علاماته'}
                </p>
              </div>
            )}
        </>
      )}

      {/* ══════════════════ ENTRY TAB (teacher only) ══════════════════ */}
      {tab === 'entry' && isTeacher && (
        <>
          {/* Filters */}
          <div className="school-card mb-4">
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="school-label">الصف</label>
                <select className="school-input" value={entryClass} onChange={e => setEntryClass(e.target.value)}>
                  <option value="">— اختر الصف —</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="school-label">المادة</label>
                <select className="school-input" value={entrySubject} onChange={e => setEntrySubject(e.target.value)} disabled={!entryClass || subjects.length === 0}>
                  <option value="">— اختر المادة —</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {entryClass && subjects.length === 0 && !loadingClass && (
                  <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4, fontFamily: 'Tajawal,sans-serif' }}>
                    لا توجد مواد لهذا الصف — أضفها من إدارة الصفوف
                  </div>
                )}
              </div>
              <div className="col-md-2">
                <label className="school-label">الفصل الدراسي</label>
                <select className="school-input" value={entrySemester} onChange={e => setEntrySemester(e.target.value)}>
                  <option value="first">الأول</option>
                  <option value="second">الثاني</option>
                  <option value="final">النهائي</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="school-label">العلامة القصوى</label>
                <input type="number" className="school-input" min={1} max={200}
                  value={maxScore} onChange={e => setMaxScore(Number(e.target.value))} style={{ direction: 'ltr' }} />
              </div>
            </div>
          </div>

          {/* Student grade entry table */}
          {loadingClass ? (
            <div className="text-center p-5"><div className="school-spinner" /></div>
          ) : !entryClass ? (
            <div className="school-card text-center p-5" style={{ color: '#9ca3af', fontFamily: 'Tajawal,sans-serif' }}>
              <EditNoteIcon style={{ fontSize: 52, opacity: 0.15, display: 'block', margin: '0 auto 12px' }} />
              اختر الصف والمادة لبدء إدخال العلامات
            </div>
          ) : !entrySubject ? (
            <div className="school-card text-center p-5" style={{ color: '#9ca3af', fontFamily: 'Tajawal,sans-serif' }}>
              اختر المادة لعرض قائمة الطلاب
            </div>
          ) : entryStudents.length === 0 ? (
            <div className="school-card text-center p-5" style={{ color: '#9ca3af', fontFamily: 'Tajawal,sans-serif' }}>
              لا يوجد طلاب مسجلون في هذا الصف
            </div>
          ) : (
            <>
              <div className="school-card p-0 overflow-hidden mb-4">
                <div style={{ padding: '12px 18px', background: 'var(--clr-surface)', borderBottom: '1px solid var(--clr-border)',
                  display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Tajawal,sans-serif' }}>
                  <EditNoteIcon style={{ color: 'var(--clr-green)', fontSize: 20 }} />
                  <span style={{ fontWeight: 700 }}>
                    {subjects.find(s => String(s.id) === String(entrySubject))?.name} — فصل {SEMESTER_LABEL[entrySemester]}
                  </span>
                  <span style={{ marginRight: 'auto', fontSize: 13, color: '#9ca3af' }}>
                    {entryStudents.length} طالب — العلامة من {maxScore}
                  </span>
                </div>

                {entryStudents.map((s, idx) => {
                  const val = scores[s.id] ?? '';
                  const pct = val !== '' && maxScore > 0 ? ((Number(val) / maxScore) * 100).toFixed(0) : null;
                  const barColor = pct === null ? '#d1d5db'
                    : pct >= 90 ? 'var(--clr-confirm)'
                    : pct >= 75 ? 'var(--clr-green)'
                    : pct >= 60 ? 'var(--clr-gold)'
                    : 'var(--clr-red)';
                  return (
                    <div key={s.id} style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                      padding: '0.85rem 1.25rem',
                      background: idx % 2 === 0 ? '#fff' : '#f9fafb',
                      borderBottom: idx < entryStudents.length - 1 ? '1px solid #f3f4f6' : 'none',
                    }}>
                      {/* Number */}
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--clr-green), var(--clr-green-light))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 800, fontSize: '0.88rem', fontFamily: 'Tajawal,sans-serif',
                      }}>{idx + 1}</div>

                      {/* Name */}
                      <div style={{ flex: 1, minWidth: 120, fontWeight: 700, fontFamily: 'Tajawal,sans-serif' }}>
                        {s.name}
                      </div>

                      {/* Mini progress bar */}
                      {pct !== null && (
                        <div style={{ width: 80, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 3, transition: 'width 0.2s' }} />
                        </div>
                      )}

                      {/* Percentage badge */}
                      {pct !== null && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: barColor, minWidth: 38, textAlign: 'center',
                          fontFamily: 'monospace' }}>
                          {pct}%
                        </span>
                      )}

                      {/* Score input */}
                      <input
                        type="number"
                        min={0}
                        max={maxScore}
                        placeholder={`0 – ${maxScore}`}
                        value={val}
                        onChange={e => handleScoreChange(s.id, e.target.value)}
                        style={{
                          width: 90, padding: '0.4rem 0.6rem', borderRadius: 8, textAlign: 'center',
                          border: `1.5px solid ${val !== '' ? barColor : 'var(--clr-border)'}`,
                          fontWeight: 700, fontSize: '1rem', fontFamily: 'monospace',
                          outline: 'none', direction: 'ltr',
                          background: val !== '' ? `${barColor}10` : '#fff',
                          transition: 'border-color 0.15s, background 0.15s',
                          color: val !== '' ? barColor : 'var(--clr-dark)',
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Save button */}
              <div className="d-flex justify-content-between align-items-center">
                <span style={{ fontFamily: 'Tajawal,sans-serif', fontSize: 13, color: '#6b7280' }}>
                  تم إدخال {Object.values(scores).filter(v => v !== '' && v !== undefined).length} من {entryStudents.length} علامة
                </span>
                <button
                  className="btn btn-school-primary d-flex align-items-center gap-2"
                  onClick={handleSaveGrades}
                  disabled={saving}
                >
                  <SaveIcon style={{ fontSize: 18 }} />
                  {saving ? 'جارٍ الحفظ...' : 'حفظ العلامات'}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VerifiedIcon from '@mui/icons-material/Verified';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

const STATUS_CFG = {
  present: { label: 'حاضر',  Icon: CheckCircleIcon, color: '#1E7A2A', bg: 'rgba(30,122,42,0.12)',  border: 'rgba(30,122,42,0.35)'  },
  absent:  { label: 'غائب',  Icon: CancelIcon,      color: '#C0132A', bg: 'rgba(192,19,42,0.12)',   border: 'rgba(192,19,42,0.35)'   },
  late:    { label: 'متأخر', Icon: AccessTimeIcon,  color: '#D4A017', bg: 'rgba(212,160,23,0.12)',  border: 'rgba(212,160,23,0.35)'  },
  excused: { label: 'معذور', Icon: VerifiedIcon,    color: '#0d6efd', bg: 'rgba(13,110,253,0.12)', border: 'rgba(13,110,253,0.35)'  },
};
const STATUS_KEYS = ['present', 'absent', 'late', 'excused'];

export default function Attendance() {
  const { user } = useAuth();
  const [tab, setTab] = useState('mark');
  const [classes, setClasses] = useState([]);

  const [markClass, setMarkClass]     = useState('');
  const [markDate,  setMarkDate]      = useState(new Date().toISOString().slice(0, 10));
  const [students,  setStudents]      = useState([]);
  const [loadingSt, setLoadingSt]     = useState(false);
  const [saving,    setSaving]        = useState(false);

  const [repClass,  setRepClass]      = useState('');
  const [repFrom,   setRepFrom]       = useState('');
  const [repTo,     setRepTo]         = useState('');
  const [repData,   setRepData]       = useState([]);
  const [loadingRep,setLoadingRep]    = useState(false);

  const [sumClass,  setSumClass]      = useState('');
  const [sumData,   setSumData]       = useState([]);
  const [loadingSum,setLoadingSum]    = useState(false);

  useEffect(() => {
    const params = user?.role === 'teacher' ? { teacher_id: user.id } : {};
    api.get('/classes', { params }).then(r => setClasses(r.data || [])).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!markClass || !markDate) { setStudents([]); return; }
    setLoadingSt(true);
    api.get('/attendance', { params: { class_id: markClass, date: markDate } })
      .then(r => setStudents(r.data))
      .catch(() => toast.error('فشل تحميل قائمة الطلاب'))
      .finally(() => setLoadingSt(false));
  }, [markClass, markDate]);

  const setStatus = (studentId, status) =>
    setStudents(prev => prev.map(s => s.student_id === studentId ? { ...s, status } : s));

  const markAll = (status) =>
    setStudents(prev => prev.map(s => ({ ...s, status })));

  const handleSave = async () => {
    if (!markClass || !markDate || !students.length) return;
    setSaving(true);
    try {
      await api.post('/attendance/bulk', {
        class_id: markClass,
        date: markDate,
        records: students.map(s => ({ student_id: s.student_id, status: s.status })),
      });
      toast.success('تم حفظ الحضور بنجاح ✓');
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل الحفظ');
    } finally { setSaving(false); }
  };

  const loadReport = async () => {
    if (!repClass) return;
    setLoadingRep(true);
    setRepData([]);
    try {
      const { data } = await api.get('/attendance/report', {
        params: { class_id: repClass, from: repFrom || undefined, to: repTo || undefined },
      });
      setRepData(data);
    } catch { toast.error('فشل تحميل التقرير'); }
    finally { setLoadingRep(false); }
  };

  const loadSummary = async () => {
    if (!sumClass) return;
    setLoadingSum(true);
    setSumData([]);
    try {
      const { data } = await api.get('/attendance/summary', { params: { class_id: sumClass } });
      setSumData(data);
    } catch { toast.error('فشل تحميل الملخص'); }
    finally { setLoadingSum(false); }
  };

  const stats = STATUS_KEYS.reduce((acc, k) => {
    acc[k] = students.filter(s => s.status === k).length;
    return acc;
  }, {});

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
    transition: 'all 0.18s ease',
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">نظام الحضور والغياب</h1>
          <p className="page-breadcrumb">تسجيل ومتابعة حضور الطلاب</p>
        </div>
      </div>

      <div className="school-card mb-4 p-2">
        <div className="d-flex gap-2 flex-wrap">
          <button style={TAB_STYLE(tab === 'mark')}    onClick={() => setTab('mark')}>تسجيل الحضور</button>
          <button style={TAB_STYLE(tab === 'report')}  onClick={() => setTab('report')}>تقرير الحضور</button>
          <button style={TAB_STYLE(tab === 'summary')} onClick={() => setTab('summary')}>ملخص الطلاب</button>
        </div>
      </div>

      {tab === 'mark' && (
        <>
          <div className="school-card mb-4">
            <div className="row g-3 align-items-end">
              <div className="col-md-5">
                <label className="school-label">الصف الدراسي</label>
                <select className="school-input" value={markClass} onChange={e => setMarkClass(e.target.value)}>
                  <option value="">— اختر الصف —</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="school-label">التاريخ</label>
                <input
                  type="date"
                  className="school-input"
                  value={markDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={e => setMarkDate(e.target.value)}
                  style={{ direction: 'ltr' }}
                />
              </div>
            </div>
          </div>

          {markClass && (
            loadingSt ? (
              <div className="school-card p-5 text-center"><div className="school-spinner" /></div>
            ) : students.length === 0 ? (
              <div className="school-card text-center p-5" style={{ color: '#9ca3af', fontFamily: 'Tajawal,sans-serif' }}>
                لا يوجد طلاب مسجلون في هذا الصف
              </div>
            ) : (
              <>
                <div className="d-flex gap-3 flex-wrap mb-3">
                  {STATUS_KEYS.map(k => {
                    const cfg = STATUS_CFG[k];
                    return (
                      <div key={k} style={{
                        background: cfg.bg, border: `1px solid ${cfg.border}`,
                        borderRadius: 10, padding: '0.5rem 1.1rem',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}>
                        <cfg.Icon style={{ fontSize: 18, color: cfg.color }} />
                        <span style={{ fontWeight: 900, color: cfg.color, fontFamily: 'Tajawal,sans-serif', fontSize: '1.05rem' }}>{stats[k]}</span>
                        <span style={{ fontFamily: 'Tajawal,sans-serif', fontSize: '0.82rem', color: '#6b7280' }}>{cfg.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
                  <span style={{ fontFamily: 'Tajawal,sans-serif', fontSize: '0.85rem', color: '#6b7280' }}>تحديد الكل كـ:</span>
                  {STATUS_KEYS.map(k => {
                    const cfg = STATUS_CFG[k];
                    return (
                      <button key={k} onClick={() => markAll(k)} style={{
                        padding: '0.3rem 0.85rem', borderRadius: 8,
                        border: `1.5px solid ${cfg.border}`,
                        background: cfg.bg, color: cfg.color,
                        fontWeight: 700, fontSize: '0.8rem',
                        cursor: 'pointer', fontFamily: 'Tajawal,sans-serif',
                      }}>
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>

                <div className="school-card p-0 overflow-hidden mb-4">
                  {students.map((s, idx) => (
                    <div key={s.student_id} style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                      padding: '0.85rem 1.25rem',
                      background: idx % 2 === 0 ? '#fff' : '#f9fafb',
                      borderBottom: idx < students.length - 1 ? '1px solid #f3f4f6' : 'none',
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg,var(--clr-green),var(--clr-green-light))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 800, fontSize: '0.88rem', flexShrink: 0,
                        fontFamily: 'Tajawal,sans-serif',
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <div style={{ fontWeight: 700, fontFamily: 'Tajawal,sans-serif', fontSize: '0.95rem' }}>
                          {s.student_name}
                        </div>
                      </div>
                      <div className="d-flex gap-2 flex-wrap">
                        {STATUS_KEYS.map(k => {
                          const cfg = STATUS_CFG[k];
                          const active = s.status === k;
                          return (
                            <button key={k} onClick={() => setStatus(s.student_id, k)} style={{
                              padding: '0.32rem 0.75rem', borderRadius: 8,
                              border: `1.5px solid ${active ? cfg.color : '#e5e7eb'}`,
                              background: active ? cfg.bg : 'transparent',
                              color: active ? cfg.color : '#9ca3af',
                              fontWeight: active ? 800 : 500,
                              fontSize: '0.8rem', cursor: 'pointer',
                              fontFamily: 'Tajawal,sans-serif',
                              transition: 'all 0.15s ease',
                            }}>
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-school-primary d-flex align-items-center gap-2"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <SaveIcon style={{ fontSize: 18 }} />
                    {saving ? 'جارٍ الحفظ...' : `حفظ الحضور (${students.length} طالب)`}
                  </button>
                </div>
              </>
            )
          )}
        </>
      )}

      {tab === 'report' && (
        <>
          <div className="school-card mb-4">
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="school-label">الصف</label>
                <select className="school-input" value={repClass} onChange={e => setRepClass(e.target.value)}>
                  <option value="">— اختر الصف —</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="school-label">من تاريخ</label>
                <input type="date" className="school-input" value={repFrom}
                  onChange={e => setRepFrom(e.target.value)} style={{ direction: 'ltr' }} />
              </div>
              <div className="col-md-3">
                <label className="school-label">إلى تاريخ</label>
                <input type="date" className="school-input" value={repTo}
                  onChange={e => setRepTo(e.target.value)} style={{ direction: 'ltr' }} />
              </div>
              <div className="col-md-2">
                <button className="btn btn-school-primary w-100" onClick={loadReport}
                  disabled={loadingRep || !repClass}>
                  {loadingRep ? '...' : 'عرض'}
                </button>
              </div>
            </div>
          </div>

          {loadingRep && <div className="text-center p-4"><div className="school-spinner" /></div>}

          {!loadingRep && repClass && repData.length === 0 && (
            <div className="school-card text-center p-5" style={{ color: '#9ca3af', fontFamily: 'Tajawal,sans-serif' }}>
              لا توجد سجلات لهذه الفترة
            </div>
          )}

          {repData.length > 0 && (
            <div className="school-card p-0 overflow-hidden">
              <div className="table-wrapper">
                <table className="table school-table mb-0">
                  <thead>
                    <tr>
                      <th>الطالب</th>
                      <th>التاريخ</th>
                      <th>الحالة</th>
                      <th>ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repData.map((r, i) => {
                      const cfg = STATUS_CFG[r.status];
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{r.student_name}</td>
                          <td style={{ direction: 'ltr', fontFamily: 'monospace', fontSize: '0.88rem' }}>
                            {r.date?.slice(0, 10)}
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              background: cfg?.bg, color: cfg?.color,
                              border: `1px solid ${cfg?.border}`,
                              borderRadius: 8, padding: '2px 10px',
                              fontSize: '0.82rem', fontWeight: 700,
                              fontFamily: 'Tajawal,sans-serif',
                            }}>
                              {cfg?.label || r.status}
                            </span>
                          </td>
                          <td style={{ color: '#9ca3af', fontSize: '0.88rem' }}>{r.notes || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'summary' && (
        <>
          <div className="school-card mb-4">
            <div className="row g-3 align-items-end">
              <div className="col-md-5">
                <label className="school-label">الصف</label>
                <select className="school-input" value={sumClass} onChange={e => setSumClass(e.target.value)}>
                  <option value="">— اختر الصف —</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <button className="btn btn-school-primary" onClick={loadSummary}
                  disabled={loadingSum || !sumClass}>
                  {loadingSum ? '...' : 'عرض الملخص'}
                </button>
              </div>
            </div>
          </div>

          {loadingSum && <div className="text-center p-4"><div className="school-spinner" /></div>}

          {!loadingSum && sumClass && sumData.length === 0 && (
            <div className="school-card text-center p-5" style={{ color: '#9ca3af', fontFamily: 'Tajawal,sans-serif' }}>
              لا توجد بيانات حضور لهذا الصف
            </div>
          )}

          {sumData.length > 0 && (
            <div className="school-card p-0 overflow-hidden">
              <div className="table-wrapper">
                <table className="table school-table mb-0">
                  <thead>
                    <tr>
                      <th>الطالب</th>
                      <th style={{ color: STATUS_CFG.present.color }}>حاضر</th>
                      <th style={{ color: STATUS_CFG.absent.color }}>غائب</th>
                      <th style={{ color: STATUS_CFG.late.color }}>متأخر</th>
                      <th style={{ color: STATUS_CFG.excused.color }}>معذور</th>
                      <th>نسبة الحضور</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sumData.map(s => {
                      const pct = s.total_days > 0
                        ? Math.round((s.present_count / s.total_days) * 100) : 0;
                      const barColor = pct >= 75 ? 'var(--clr-green)' : pct >= 50 ? '#D4A017' : '#C0132A';
                      return (
                        <tr key={s.student_id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'rgba(30,122,42,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <PersonIcon style={{ fontSize: 17, color: 'var(--clr-green)' }} />
                              </div>
                              <span style={{ fontWeight: 600 }}>{s.student_name}</span>
                            </div>
                          </td>
                          <td><span className="badge-school badge-green">{s.present_count}</span></td>
                          <td><span className="badge-school badge-red">{s.absent_count}</span></td>
                          <td><span className="badge-school badge-gold">{s.late_count}</span></td>
                          <td><span className="badge-school badge-confirm">{s.excused_count}</span></td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div style={{
                                flex: 1, height: 8, background: '#f3f4f6',
                                borderRadius: 4, overflow: 'hidden', minWidth: 70,
                              }}>
                                <div style={{
                                  width: `${pct}%`, height: '100%',
                                  borderRadius: 4, background: barColor,
                                  transition: 'width 0.4s ease',
                                }} />
                              </div>
                              <span style={{
                                fontWeight: 800, fontSize: '0.88rem',
                                color: barColor, minWidth: 36, textAlign: 'left',
                              }}>{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

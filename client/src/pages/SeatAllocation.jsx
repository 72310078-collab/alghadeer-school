import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import AutoAwesomeIcon  from '@mui/icons-material/AutoAwesome';
import DeleteSweepIcon  from '@mui/icons-material/DeleteSweep';
import EventSeatIcon    from '@mui/icons-material/EventSeat';
import SchoolIcon       from '@mui/icons-material/School';
import VisibilityIcon   from '@mui/icons-material/Visibility';
import HearingIcon      from '@mui/icons-material/Hearing';
import AccessibleIcon   from '@mui/icons-material/Accessible';
import EditNoteIcon     from '@mui/icons-material/EditNote';
import SaveIcon         from '@mui/icons-material/Save';
import CloseIcon        from '@mui/icons-material/Close';
import SettingsIcon     from '@mui/icons-material/Settings';
import StarIcon         from '@mui/icons-material/Star';
import api              from '../services/api';
import toast            from 'react-hot-toast';
import '../styles/dashboard.css';

const HEALTH = {
  none:     { label: 'طبيعي',       color: '#1E7A2A', bg: 'rgba(30,122,42,0.10)',   Icon: EventSeatIcon,  hint: '' },
  vision:   { label: 'ضعف بصر',     color: '#0d6efd', bg: 'rgba(13,110,253,0.10)',  Icon: VisibilityIcon, hint: 'يُوضع في الصفوف الأمامية' },
  hearing:  { label: 'ضعف سمع',     color: '#fd7e14', bg: 'rgba(253,126,20,0.10)',  Icon: HearingIcon,    hint: 'يُوضع بالجانب أو الأمام' },
  mobility: { label: 'إعاقة حركية', color: '#9b5de5', bg: 'rgba(155,93,229,0.10)', Icon: AccessibleIcon, hint: 'يُوضع في ممر جانبي' },
  other:    { label: 'أخرى',        color: '#D4A017', bg: 'rgba(212,160,23,0.10)',  Icon: EditNoteIcon,   hint: 'موضع خاص حسب الحالة' },
};

const getLevel = (avg) => {
  if (avg === null || avg === undefined) return { label: '—', color: '#9ca3af', bg: '#f3f4f6' };
  if (avg < 50)  return { label: 'ضعيف',   color: '#ef4444', bg: '#fef2f2' };
  if (avg <= 75) return { label: 'متوسط',  color: '#f59e0b', bg: '#fffbeb' };
  return             { label: 'جيد',     color: '#16a34a', bg: '#f0fdf4' };
};

export default function SeatAllocation() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [classes,       setClasses]       = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [classroom,     setClassroom]     = useState(null);
  const [allocations,   setAllocations]   = useState([]);
  const [students,      setStudents]      = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [generating,    setGenerating]    = useState(false);
  const [aiStats,       setAiStats]       = useState(null);

  const [roomModal,  setRoomModal]  = useState(false);
  const [roomForm,   setRoomForm]   = useState({ rows_count: 5, cols_count: 6, notes: '' });
  const [savingRoom, setSavingRoom] = useState(false);

  const [healthModal,    setHealthModal]    = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [healthForm,     setHealthForm]     = useState({ health_type: 'none', health_note: '' });

  useEffect(() => {
    const params = user?.role === 'teacher' ? { teacher_id: user.id } : {};
    api.get('/classes', { params })
      .then(r => setClasses(r.data || []))
      .catch(() => toast.error('فشل تحميل الصفوف'));
  }, [user]);

  const loadClass = useCallback(async (cid) => {
    if (!cid) { setClassroom(null); setAllocations([]); setStudents([]); setAiStats(null); return; }
    setLoading(true);
    try {
      const [roomRes, allocRes, classRes] = await Promise.all([
        api.get(`/seats/classroom/${cid}`),
        api.get(`/seats/allocations/${cid}`),
        api.get(`/classes/${cid}`),
      ]);
      setClassroom(roomRes.data);
      const allocMap = {};
      (allocRes.data || []).forEach(a => { allocMap[a.student_id] = a; });
      const studs = (classRes.data.students || []).map(s => ({
        id:          s.id,
        name:        s.name,
        health_type: allocMap[s.id]?.health_type || 'none',
        health_note: allocMap[s.id]?.health_note || '',
        avg_score:   allocMap[s.id]?.avg_score ?? null,
      }));
      setStudents(studs);
      setAllocations(allocRes.data || []);
    } catch { toast.error('فشل تحميل البيانات'); }
    finally { setLoading(false); }
  }, []);

  const handleClassChange = (cid) => { setSelectedClass(cid); loadClass(cid); };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    setSavingRoom(true);
    try {
      const { data } = await api.post('/seats/classroom', {
        class_id:   parseInt(selectedClass),
        rows_count: parseInt(roomForm.rows_count),
        cols_count: parseInt(roomForm.cols_count),
        notes:      roomForm.notes,
      });
      setClassroom(data);
      toast.success('تم حفظ تخطيط الغرفة');
      setRoomModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل الحفظ');
    } finally { setSavingRoom(false); }
  };

  const openRoomModal = () => {
    setRoomForm({
      rows_count: classroom?.rows_count || 5,
      cols_count: classroom?.cols_count || 6,
      notes:      classroom?.notes || '',
    });
    setRoomModal(true);
  };

  const handleGenerate = async () => {
    if (!classroom) return toast.error('حدد تخطيط الغرفة أولاً');
    setGenerating(true);
    setAiStats(null);
    try {
      const { data } = await api.post('/seats/generate', {
        class_id: parseInt(selectedClass),
        students: students.map(s => ({
          id:          s.id,
          health_type: s.health_type,
          health_note: s.health_note,
        })),
      });
      setAiStats(data.stats || null);
      toast.success(`${data.message} — ${data.allocated} طالب`);
      loadClass(selectedClass);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل التوزيع');
    } finally { setGenerating(false); }
  };

  const handleClear = async () => {
    if (!window.confirm('هل تريد مسح توزيع المقاعد لهذا الصف؟')) return;
    try {
      await api.delete(`/seats/allocations/${selectedClass}`);
      toast.success('تم مسح التوزيع');
      setAllocations([]);
      setAiStats(null);
    } catch { toast.error('فشل المسح'); }
  };

  const openHealthModal = (student) => {
    setEditingStudent(student);
    setHealthForm({ health_type: student.health_type, health_note: student.health_note || '' });
    setHealthModal(true);
  };

  const saveHealthForm = () => {
    setStudents(prev => prev.map(s =>
      s.id === editingStudent.id
        ? { ...s, health_type: healthForm.health_type, health_note: healthForm.health_note }
        : s
    ));
    setHealthModal(false);
  };

  const rows     = classroom?.rows_count || 0;
  const cols     = classroom?.cols_count || 0;
  const grid     = {};
  allocations.forEach(a => { grid[`${a.row_num}-${a.col_num}`] = a; });
  const classObj = classes.find(c => String(c.id) === String(selectedClass));

  const usedRows   = allocations.length > 0
    ? Math.max(...allocations.map(a => a.row_num))
    : rows;
  const frontLimit = usedRows ? Math.max(1, Math.ceil(usedRows * 0.4)) : 0;
  const midLimit   = usedRows ? Math.max(frontLimit + 1, Math.ceil(usedRows * 0.7)) : 0;

  const getZoneLabel = (rowIdx) => {
    if (rowIdx < frontLimit) return { label: 'أمام', color: '#16a34a' };
    if (rowIdx < midLimit)   return { label: 'وسط',  color: '#d97706' };
    return                          { label: 'خلف',  color: '#9ca3af' };
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">توزيع مقاعد الصفوف</h1>
          <p className="page-breadcrumb">الذكاء الاصطناعي يوزع المقاعد حسب الحالة الصحية والمستوى الأكاديمي</p>
        </div>
      </div>

      <div className="school-card mb-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <SchoolIcon style={{ color: 'var(--clr-green)', fontSize: 22 }} />
          <label style={{ fontWeight: 700, fontFamily: 'Tajawal,sans-serif', whiteSpace: 'nowrap' }}>اختر الصف:</label>
          <select className="school-input" style={{ maxWidth: 280, flex: 1 }}
            value={selectedClass} onChange={e => handleClassChange(e.target.value)}>
            <option value="">— اختر صفاً —</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} — المرحلة {c.grade_level} ({c.student_count} طالب)
              </option>
            ))}
          </select>
          {selectedClass && (
            <button className="btn btn-ghost d-flex align-items-center gap-1" onClick={openRoomModal}
              style={{ fontFamily: 'Tajawal,sans-serif' }}>
              <SettingsIcon style={{ fontSize: 17 }} />
              {classroom ? 'تعديل تخطيط الغرفة' : 'إعداد تخطيط الغرفة'}
            </button>
          )}
        </div>
        {selectedClass && classroom && (
          <div style={{ marginTop: 10, fontSize: 13, color: '#6b7280', fontFamily: 'Tajawal,sans-serif' }}>
            تخطيط الغرفة: {classroom.rows_count} صفوف × {classroom.cols_count} أعمدة
            = {classroom.rows_count * classroom.cols_count} مقعد
            {classroom.notes && ` — ${classroom.notes}`}
          </div>
        )}
      </div>

      {!selectedClass ? (
        <div className="school-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: '#9ca3af' }}>
          <EventSeatIcon style={{ fontSize: 64, opacity: 0.2, marginBottom: 12 }} />
          <p style={{ fontFamily: 'Tajawal,sans-serif' }}>اختر صفاً لبدء توزيع المقاعد</p>
        </div>
      ) : loading ? (
        <div className="text-center p-5"><div className="school-spinner" /></div>
      ) : (
        <div className="row g-4">

          <div className="col-lg-4">
            <div className="school-card h-100" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, fontFamily: 'Tajawal,sans-serif' }}>
                الطلاب
                {students.length > 0 && (
                  <span style={{ marginRight: 8, background: 'var(--clr-green)', color: '#fff',
                    borderRadius: 20, padding: '1px 9px', fontSize: '0.72rem', fontWeight: 700 }}>
                    {students.length}
                  </span>
                )}
              </div>

              {students.length === 0 ? (
                <p style={{ color: '#9ca3af', fontFamily: 'Tajawal,sans-serif', textAlign: 'center', padding: '2rem 0' }}>
                  لا يوجد طلاب في هذا الصف
                </p>
              ) : (
                <div style={{ flex: 1, overflowY: 'auto', maxHeight: 380, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {students.map(s => {
                    const h     = HEALTH[s.health_type] || HEALTH.none;
                    const HIcon = h.Icon;
                    const lvl   = getLevel(s.avg_score);
                    return (
                      <div key={s.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '7px 10px', borderRadius: 9,
                          background: h.bg, border: `1px solid ${h.color}30`,
                          cursor: 'pointer', transition: 'opacity 0.15s',
                        }}
                        onClick={() => openHealthModal(s)}
                        title="انقر لتعديل الحالة الصحية">
                        <HIcon style={{ fontSize: 17, color: h.color, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, fontFamily: 'Tajawal,sans-serif',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {s.name}
                          </div>
                          {s.health_note && (
                            <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'Tajawal,sans-serif',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {s.health_note}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                          <span style={{ fontSize: 10, color: h.color, fontWeight: 600,
                            background: '#fff', borderRadius: 5, padding: '1px 6px',
                            border: `1px solid ${h.color}40`, fontFamily: 'Tajawal,sans-serif' }}>
                            {h.label}
                          </span>
                          <span style={{ fontSize: 10, color: lvl.color, fontWeight: 700,
                            background: lvl.bg, borderRadius: 5, padding: '1px 6px',
                            fontFamily: 'Tajawal,sans-serif' }}>
                            {s.avg_score !== null ? `${s.avg_score}%` : lvl.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(30,122,42,0.07)',
                borderRadius: 8, fontSize: 12, fontFamily: 'Tajawal,sans-serif', color: '#374151',
                borderRight: '3px solid var(--clr-green)' }}>
                <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--clr-green)' }}>
                  🤖 كيف يعمل الذكاء الاصطناعي؟
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {[
                    { dot: '#0d6efd', text: 'ضعف البصر → الصفوف الأمامية' },
                    { dot: '#fd7e14', text: 'ضعف السمع → الجانب أو الأمام' },
                    { dot: '#9b5de5', text: 'إعاقة حركية → ممر جانبي' },
                    { dot: '#ef4444', text: 'مستوى ضعيف → الأمام (اهتمام المعلم)' },
                    { dot: '#16a34a', text: 'مستوى جيد → الوسط والخلف' },
                  ].map(({ dot, text }) => (
                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {!classroom ? (
                  <button className="btn btn-school-primary d-flex align-items-center justify-content-center gap-2"
                    onClick={openRoomModal}>
                    <SettingsIcon style={{ fontSize: 18 }} /> إعداد تخطيط الغرفة أولاً
                  </button>
                ) : (
                  <button className="btn btn-school-primary d-flex align-items-center justify-content-center gap-2"
                    onClick={handleGenerate} disabled={generating || students.length === 0}
                    style={{
                      background: generating
                        ? '#9ca3af'
                        : 'linear-gradient(135deg, var(--clr-green-dark), var(--clr-green))',
                      border: 'none',
                    }}>
                    {generating ? (
                      <>
                        <span className="school-spinner" style={{ width: 16, height: 16, borderWidth: 2, flexShrink: 0 }} />
                        جارٍ التوزيع...
                      </>
                    ) : (
                      <>
                        <AutoAwesomeIcon style={{ fontSize: 18 }} />
                        توزيع المقاعد بالذكاء الاصطناعي
                      </>
                    )}
                  </button>
                )}
                {allocations.length > 0 && (
                  <button className="btn btn-school-danger d-flex align-items-center justify-content-center gap-2"
                    onClick={handleClear}>
                    <DeleteSweepIcon style={{ fontSize: 18 }} /> مسح التوزيع
                  </button>
                )}
              </div>

              {allocations.length > 0 && classroom && (
                <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--clr-surface)',
                  borderRadius: 8, fontSize: 13, fontFamily: 'Tajawal,sans-serif', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {[
                    { label: 'طلاب موزعون',    val: allocations.length,              max: students.length, clr: 'var(--clr-green)' },
                    { label: 'مقاعد مشغولة',   val: allocations.length,              max: rows * cols,    clr: '#0d6efd' },
                    { label: 'مقاعد فارغة',    val: rows * cols - allocations.length, max: rows * cols,    clr: '#9ca3af' },
                  ].map(({ label, val, max, clr }) => (
                    <div key={label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ color: '#6b7280', fontSize: 12 }}>{label}</span>
                        <span style={{ fontWeight: 700, color: clr, fontSize: 12 }}>{val}</span>
                      </div>
                      <div style={{ height: 5, background: '#e5e7eb', borderRadius: 99 }}>
                        <div style={{ height: '100%', width: `${(val / max) * 100}%`,
                          background: clr, borderRadius: 99, transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {aiStats && (
                <div style={{ marginTop: 8, padding: '10px 12px', background: 'rgba(30,122,42,0.07)',
                  borderRadius: 8, fontSize: 12, fontFamily: 'Tajawal,sans-serif' }}>
                  <div style={{ fontWeight: 700, color: 'var(--clr-green)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <StarIcon style={{ fontSize: 14 }} /> نتائج التوزيع
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[
                      { label: 'ضعف بصر',     val: aiStats.vision,   clr: '#0d6efd' },
                      { label: 'ضعف سمع',     val: aiStats.hearing,  clr: '#fd7e14' },
                      { label: 'إعاقة حركية', val: aiStats.mobility, clr: '#9b5de5' },
                      { label: 'أخرى',        val: aiStats.other,    clr: '#D4A017' },
                      { label: 'ضعيف',        val: aiStats.weak,     clr: '#ef4444' },
                      { label: 'متوسط',       val: aiStats.medium,   clr: '#f59e0b' },
                      { label: 'جيد',         val: aiStats.good,     clr: '#16a34a' },
                    ].filter(x => x.val > 0).map(({ label, val, clr }) => (
                      <span key={label} style={{
                        fontSize: 11, fontWeight: 700, color: clr,
                        background: '#fff', border: `1px solid ${clr}40`,
                        borderRadius: 6, padding: '2px 8px', fontFamily: 'Tajawal,sans-serif',
                      }}>
                        {label}: {val}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-8">
            <div className="school-card" style={{ position: 'relative' }}>
              {generating && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.88)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', zIndex: 10, borderRadius: 'var(--radius-xl)', gap: 12,
                }}>
                  <div className="school-spinner" style={{ width: 44, height: 44, borderWidth: 3 }} />
                  <p style={{ fontFamily: 'Tajawal,sans-serif', fontWeight: 800, color: 'var(--clr-green)', margin: 0, fontSize: 15 }}>
                    يقوم الذكاء الاصطناعي بتوزيع المقاعد...
                  </p>
                  <p style={{ fontFamily: 'Tajawal,sans-serif', fontSize: 12, color: '#9ca3af', margin: 0 }}>
                    يحلل الحالات الصحية والمستوى الأكاديمي
                  </p>
                </div>
              )}

              {!classroom ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: '48px 0' }}>
                  <SettingsIcon style={{ fontSize: 52, opacity: 0.2 }} />
                  <p style={{ marginTop: 12, fontFamily: 'Tajawal,sans-serif' }}>
                    لم يتم تعريف تخطيط الغرفة بعد. اضغط "إعداد تخطيط الغرفة".
                  </p>
                </div>
              ) : allocations.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>
                  <EventSeatIcon style={{ fontSize: 52, opacity: 0.2 }} />
                  <p style={{ marginTop: 12, fontFamily: 'Tajawal,sans-serif' }}>
                    لم يتم التوزيع بعد. اضغط "توزيع المقاعد بالذكاء الاصطناعي".
                  </p>
                  <div style={{ overflowX: 'auto', marginTop: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: cols * 72 }}>
                      {Array.from({ length: rows }, (_, r) => (
                        <div key={r} style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                          {Array.from({ length: cols }, (_, c) => (
                            <div key={c} style={{
                              width: 64, minHeight: 44, borderRadius: 6,
                              background: 'var(--clr-surface)', border: '1px solid var(--clr-border)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4,
                            }}>
                              <EventSeatIcon style={{ fontSize: 18, color: 'var(--clr-border)' }} />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {classObj && (
                    <div style={{ marginBottom: 14, padding: '8px 12px', background: 'var(--clr-surface)',
                      borderRadius: 8, fontFamily: 'Tajawal,sans-serif', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <SchoolIcon style={{ color: 'var(--clr-green)', fontSize: 18 }} />
                      <span style={{ fontWeight: 700 }}>{classObj.name}</span>
                      <span style={{ color: '#9ca3af', fontSize: 13 }}>المرحلة {classObj.grade_level}</span>
                      <span style={{ marginRight: 'auto', color: 'var(--clr-green)', fontSize: 13, fontWeight: 600 }}>
                        {allocations.length} / {rows * cols} مقعد
                      </span>
                    </div>
                  )}

                  <div style={{ textAlign: 'center', marginBottom: 14, padding: '8px 10px',
                    background: 'linear-gradient(135deg,#1b4332,#2d6a4f)', color: '#fff', borderRadius: 8,
                    fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', fontFamily: 'Tajawal,sans-serif' }}>
                    📋 اللوح — أمام الصف
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: cols * 88 + 50 }}>
                      {Array.from({ length: rows }, (_, r) => {
                        const zone = getZoneLabel(r);
                        const showZoneLabel = r === 0 || r === frontLimit || r === midLimit;
                        return (
                          <div key={r}>
                            {showZoneLabel && (
                              <div style={{
                                textAlign: 'center', fontSize: 10, fontWeight: 700, color: zone.color,
                                fontFamily: 'Tajawal,sans-serif', marginBottom: 4, marginTop: r > 0 ? 6 : 0,
                                letterSpacing: '0.08em', opacity: 0.8,
                              }}>
                                ── منطقة {zone.label} ──
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: 5, justifyContent: 'center', alignItems: 'center' }}>
                              <div style={{ width: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, color: '#9ca3af', fontFamily: 'Tajawal,sans-serif', flexShrink: 0 }}>
                                {r + 1}
                              </div>
                              {Array.from({ length: cols }, (_, c) => {
                                const cell  = grid[`${r + 1}-${c + 1}`];
                                const ht    = cell?.health_type || 'none';
                                const h     = HEALTH[ht] || HEALTH.none;
                                const HIcon = h.Icon;
                                const lvl   = cell ? getLevel(cell.avg_score) : null;
                                return (
                                  <div key={c}
                                    title={cell
                                      ? `${cell.student_name}${cell.avg_score != null ? ` | ${cell.avg_score}%` : ''}${cell.health_note ? ` | ${cell.health_note}` : ''}`
                                      : 'فارغ'}
                                    style={{
                                      width: 80, minHeight: 64, borderRadius: 8,
                                      background: cell ? h.bg : 'var(--clr-surface)',
                                      border: `1.5px solid ${cell ? h.color + '60' : 'var(--clr-border)'}`,
                                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                                      justifyContent: 'center', padding: '4px 5px',
                                      opacity: cell ? 1 : 0.3, transition: 'transform 0.1s',
                                      position: 'relative',
                                    }}>
                                    {cell ? (
                                      <>
                                        <HIcon style={{ fontSize: 13, color: h.color, opacity: 0.9 }} />
                                        <span style={{ fontSize: 10, color: h.color, fontWeight: 700,
                                          textAlign: 'center', lineHeight: 1.3, marginTop: 2,
                                          wordBreak: 'break-word', fontFamily: 'Tajawal,sans-serif' }}>
                                          {cell.student_name?.split(' ').slice(0, 2).join(' ')}
                                        </span>
                                        {lvl && (
                                          <div style={{
                                            position: 'absolute', bottom: 4, left: 5,
                                            width: 7, height: 7, borderRadius: '50%',
                                            background: lvl.color, border: '1px solid #fff',
                                          }} title={lvl.label} />
                                        )}
                                        <span style={{ fontSize: 9, color: h.color, opacity: 0.6,
                                          fontFamily: 'Tajawal,sans-serif', marginTop: 1 }}>
                                          م{cell.seat_number}
                                        </span>
                                      </>
                                    ) : (
                                      <EventSeatIcon style={{ fontSize: 18, color: 'var(--clr-border)' }} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ marginTop: 16, borderTop: '1px solid #f3f4f6', paddingTop: 12,
                    display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280',
                      fontFamily: 'Tajawal,sans-serif', width: '100%' }}>
                      الحالة الصحية:
                    </div>
                    {Object.entries(HEALTH).filter(([k]) => allocations.some(a => a.health_type === k)).map(([key, h]) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                        <div style={{ width: 11, height: 11, borderRadius: 3, background: h.color }} />
                        <span style={{ fontFamily: 'Tajawal,sans-serif', color: '#6b7280' }}>
                          {h.label} ({allocations.filter(a => a.health_type === key).length})
                        </span>
                      </div>
                    ))}
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280',
                      fontFamily: 'Tajawal,sans-serif', width: '100%', marginTop: 4 }}>
                      المستوى الأكاديمي (النقطة الصغيرة):
                    </div>
                    {[
                      { label: 'ضعيف (أقل من 50%)',  color: '#ef4444' },
                      { label: 'متوسط (50-75%)',       color: '#f59e0b' },
                      { label: 'جيد (أعلى من 75%)',   color: '#16a34a' },
                    ].map(({ label, color }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                        <span style={{ fontFamily: 'Tajawal,sans-serif', color: '#6b7280' }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {roomModal && (
        <div className="school-modal-overlay" onClick={() => setRoomModal(false)}>
          <div className="school-modal" onClick={e => e.stopPropagation()}>
            <div className="school-modal-header">
              <span className="school-modal-title">تخطيط غرفة الصف</span>
              <button className="school-modal-close" onClick={() => setRoomModal(false)}>
                <CloseIcon style={{ fontSize: 18 }} />
              </button>
            </div>
            <form onSubmit={handleSaveRoom}>
              <div className="school-modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="school-label">عدد الصفوف (من الأمام للخلف)</label>
                    <input className="school-input" type="number" min={1} max={15} required
                      value={roomForm.rows_count}
                      onChange={e => setRoomForm(p => ({ ...p, rows_count: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="school-label">عدد الأعمدة</label>
                    <input className="school-input" type="number" min={1} max={15} required
                      value={roomForm.cols_count}
                      onChange={e => setRoomForm(p => ({ ...p, cols_count: e.target.value }))} />
                  </div>
                  <div className="col-12">
                    <div style={{ padding: '10px 14px', background: 'rgba(30,122,42,0.08)',
                      borderRadius: 8, fontSize: 13, color: 'var(--clr-green)', fontFamily: 'Tajawal,sans-serif' }}>
                      الطاقة الاستيعابية: {roomForm.rows_count * roomForm.cols_count} مقعد
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="school-label">ملاحظات</label>
                    <input className="school-input"
                      value={roomForm.notes}
                      onChange={e => setRoomForm(p => ({ ...p, notes: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="school-modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setRoomModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-school-primary d-flex align-items-center gap-2" disabled={savingRoom}>
                  <SaveIcon style={{ fontSize: 17 }} />
                  {savingRoom ? 'جارٍ الحفظ...' : 'حفظ التخطيط'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {healthModal && editingStudent && (
        <div className="school-modal-overlay" onClick={() => setHealthModal(false)}>
          <div className="school-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="school-modal-header">
              <span className="school-modal-title">الحالة الصحية — {editingStudent.name}</span>
              <button className="school-modal-close" onClick={() => setHealthModal(false)}>
                <CloseIcon style={{ fontSize: 18 }} />
              </button>
            </div>
            <div className="school-modal-body">
              <div className="mb-3">
                <label className="school-label">نوع الاحتياج الصحي</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {Object.entries(HEALTH).map(([key, h]) => {
                    const HIcon    = h.Icon;
                    const selected = healthForm.health_type === key;
                    return (
                      <label key={key} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
                        background: selected ? h.bg : 'var(--clr-surface)',
                        border: `1.5px solid ${selected ? h.color : 'var(--clr-border)'}`,
                        transition: 'all 0.15s',
                      }}>
                        <input type="radio" name="health_type" value={key} checked={selected}
                          onChange={() => setHealthForm(p => ({ ...p, health_type: key }))}
                          style={{ accentColor: h.color }} />
                        <HIcon style={{ fontSize: 18, color: h.color }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: h.color, fontFamily: 'Tajawal,sans-serif' }}>{h.label}</div>
                          {h.hint && <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'Tajawal,sans-serif' }}>{h.hint}</div>}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="school-label">ملاحظة إضافية</label>
                <input className="school-input"
                  value={healthForm.health_note}
                  onChange={e => setHealthForm(p => ({ ...p, health_note: e.target.value }))} />
              </div>
            </div>
            <div className="school-modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setHealthModal(false)}>إلغاء</button>
              <button type="button" className="btn btn-school-primary d-flex align-items-center gap-2"
                onClick={saveHealthForm}>
                <SaveIcon style={{ fontSize: 17 }} /> حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

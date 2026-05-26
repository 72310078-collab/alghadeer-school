import { useState, useEffect } from 'react';
import EventSeatIcon  from '@mui/icons-material/EventSeat';
import SchoolIcon     from '@mui/icons-material/School';
import GridViewIcon   from '@mui/icons-material/GridView';
import { useAuth }    from '../context/AuthContext';
import api            from '../services/api';
import '../styles/dashboard.css';

const HEALTH = {
  none:     { color: '#1E7A2A', bg: 'rgba(30,122,42,0.1)'   },
  vision:   { color: '#0d6efd', bg: 'rgba(13,110,253,0.1)'  },
  hearing:  { color: '#fd7e14', bg: 'rgba(253,126,20,0.1)'  },
  mobility: { color: '#9b5de5', bg: 'rgba(155,93,229,0.1)'  },
  other:    { color: '#D4A017', bg: 'rgba(212,160,23,0.1)'  },
};

export default function MySeats() {
  const { user }   = useAuth();
  const [seat,     setSeat]    = useState(null);
  const [loading,  setLoading] = useState(true);

  useEffect(() => {
    api.get('/seats/my-seat')
      .then(r => setSeat(r.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="school-spinner" /></div>;

  const h      = HEALTH[seat?.health_type] || HEALTH.none;
  const rows   = seat?.rows_count || 0;
  const cols   = seat?.cols_count || 0;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">مقعدي في الصف</h1>
          <p className="page-breadcrumb">مقعدك الدائم في غرفة الدراسة</p>
        </div>
      </div>

      {!seat ? (
        <div className="school-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <EventSeatIcon style={{ fontSize: 72, color: '#d1d5db', marginBottom: '1.25rem' }} />
          <h3 style={{ fontWeight: 700, color: '#6b7280', fontFamily: 'Tajawal,sans-serif' }}>
            لم يتم تخصيص مقعد لك بعد
          </h3>
          <p style={{ color: '#9ca3af', fontFamily: 'Tajawal,sans-serif', maxWidth: 360, margin: '0 auto' }}>
            سيتم عرض مقعدك هنا بمجرد قيام الإدارة بتوزيع مقاعد صفك
          </p>
        </div>
      ) : (
        <div className="row g-4">

          <div className="col-lg-5">
            <div style={{
              background: `linear-gradient(135deg, ${h.color} 0%, ${h.color}cc 100%)`,
              borderRadius: 20, padding: '2.5rem 2rem', color: '#fff',
              boxShadow: `0 12px 40px ${h.color}40`,
              marginBottom: '1.25rem', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -20, left: -20, width: 130, height: 130,
                borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ position: 'absolute', bottom: -30, left: 60, width: 90, height: 90,
                borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <EventSeatIcon style={{ fontSize: 30 }} />
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, lineHeight: 1.1,
                    fontFamily: 'Tajawal,sans-serif' }}>
                    {seat.seat_number}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'الصف الأمامي ←', value: `صف ${seat.row_num}` },
                    { label: 'العمود',          value: `عمود ${seat.col_num}` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10,
                      padding: '0.75rem 1rem' }}>
                      <div style={{ fontSize: '0.72rem', opacity: 0.75, fontFamily: 'Tajawal,sans-serif' }}>{label}</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.2,
                        fontFamily: 'Tajawal,sans-serif' }}>{value}</div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            <div className="school-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(30,122,42,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <SchoolIcon style={{ fontSize: 26, color: 'var(--clr-green)' }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', fontFamily: 'Tajawal,sans-serif',
                  color: 'var(--clr-dark)' }}>
                  {seat.class_name}
                </div>
                <div style={{ fontSize: '0.83rem', color: '#6b7280', fontFamily: 'Tajawal,sans-serif' }}>
                  المرحلة الدراسية: {seat.grade_level}
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="school-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <GridViewIcon style={{ fontSize: 20, color: 'var(--clr-green)' }} />
                <h3 style={{ fontWeight: 800, fontSize: '1rem', margin: 0, fontFamily: 'Tajawal,sans-serif' }}>
                  موقعك في الغرفة
                </h3>
              </div>

              <div style={{ textAlign: 'center', marginBottom: 12, padding: '7px 10px',
                background: '#1b4332', color: '#fff', borderRadius: 8, fontSize: 13,
                fontWeight: 700, fontFamily: 'Tajawal,sans-serif' }}>
                اللوح — أمام الصف
              </div>

              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: cols * 52 }}>
                  {Array.from({ length: rows }, (_, r) => (
                    <div key={r} style={{ display: 'flex', gap: 5, justifyContent: 'center', alignItems: 'center' }}>
                      <div style={{ width: 18, fontSize: 10, color: '#9ca3af', textAlign: 'center',
                        fontFamily: 'Tajawal,sans-serif', flexShrink: 0 }}>
                        {r + 1}
                      </div>
                      {Array.from({ length: cols }, (_, c) => {
                        const isMe = (r + 1) === seat.row_num && (c + 1) === seat.col_num;
                        return (
                          <div key={c} style={{
                            width: 44, height: 38, borderRadius: 7,
                            background: isMe ? h.color : 'var(--clr-surface)',
                            border: isMe ? `2px solid ${h.color}` : '1.5px solid var(--clr-border)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: isMe ? `0 4px 16px ${h.color}50` : 'none',
                            transform: isMe ? 'scale(1.12)' : 'scale(1)',
                            transition: 'all 0.2s', zIndex: isMe ? 2 : 1, position: 'relative',
                          }}>
                            {isMe ? (
                              <>
                                <EventSeatIcon style={{ fontSize: 14, color: '#fff' }} />
                                <span style={{ fontSize: 8, color: '#fff', fontWeight: 800,
                                  fontFamily: 'Tajawal,sans-serif', lineHeight: 1 }}>أنت</span>
                              </>
                            ) : (
                              <EventSeatIcon style={{ fontSize: 14, color: 'var(--clr-border)' }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12,
                fontFamily: 'Tajawal,sans-serif', color: '#6b7280' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: h.color }} />
                  <span>مقعدك ({user?.name?.split(' ')[0]})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: 'var(--clr-surface)',
                    border: '1.5px solid var(--clr-border)' }} />
                  <span>مقاعد زملائك</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

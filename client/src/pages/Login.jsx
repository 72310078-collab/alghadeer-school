import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PeopleIcon from '@mui/icons-material/People';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import logo from '../logo.jpg';
import schoolImg from '../assets/School.jpg';
import '../styles/login.css';

const heroStats = [
  { Icon: PeopleIcon,          value: '42',   label: 'معلماً متخصصاً' },
  { Icon: WorkspacePremiumIcon, value: '95%',  label: 'نسبة النجاح' },
  { Icon: HistoryEduIcon,       value: '+30',  label: 'عاماً من التميز' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`مرحباً ${user.name}!`);
      if (user.role === 'teacher') navigate('/teacher-home');
      else navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        toast.error('❌ السيرفر غير متاح — تأكد من تشغيل');
      } else {
        toast.error(err.response?.data?.message || 'بيانات الدخول غير صحيحة');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-root">

      <div className="lp-hero">
        <img src={schoolImg} alt="" className="lp-hero-bg" />
        <div className="lp-hero-veil" />

        <div className="lp-hero-body">
          <div className="lp-hero-logo-wrap">
            <img src={logo} alt="شعار مدرسة الغدير" className="lp-hero-logo" />
          </div>
          <h1 className="lp-hero-name">مدرسة الغدير</h1>
          <p className="lp-hero-en">AL-GHADEER SCHOOL</p>
          <p className="lp-hero-tagline">
            نبني جيلاً واعياً متسلحاً بالعلم والإبداع
          </p>

          <div className="lp-hero-stats">
            {heroStats.map(({ Icon, value, label }) => (
              <div key={label} className="lp-hero-stat">
                <div className="lp-hero-stat-icon">
                  <Icon style={{ fontSize: 20 }} />
                </div>
                <div className="lp-hero-stat-num">{value}</div>
                <div className="lp-hero-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lp-hero-footer">
          العام الدراسي 2025 – 2026
        </div>
      </div>

      <div className="lp-panel">
        <div className="lp-card">

          <div className="lp-card-logo-wrap">
            <img src={logo} alt="شعار" className="lp-card-logo" />
          </div>

          <h2 className="lp-card-title">تسجيل الدخول</h2>
          <p className="lp-card-sub">أدخل بياناتك للوصول إلى المنصة الإدارية</p>

          <form onSubmit={handleSubmit} noValidate>

            <div className={`lp-field ${focused === 'email' ? 'lp-field--focus' : ''}`}>
              <label className="lp-label">البريد الإلكتروني</label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon lp-input-icon--r">
                  <EmailIcon style={{ fontSize: 18 }} />
                </span>
                <input
                  type="email"
                  dir="ltr"
                  className="lp-input"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  required
                />
              </div>
            </div>

            <div className={`lp-field ${focused === 'pass' ? 'lp-field--focus' : ''}`}>
              <label className="lp-label">كلمة المرور</label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon lp-input-icon--r">
                  <LockIcon style={{ fontSize: 18 }} />
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  dir="ltr"
                  className="lp-input lp-input--padl"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  onFocus={() => setFocused('pass')}
                  onBlur={() => setFocused('')}
                  required
                />
                <button
                  type="button"
                  className="lp-input-icon lp-input-icon--l lp-vis-btn"
                  onClick={() => setShowPass(p => !p)}
                  tabIndex={-1}
                >
                  {showPass
                    ? <VisibilityOffIcon style={{ fontSize: 18 }} />
                    : <VisibilityIcon   style={{ fontSize: 18 }} />}
                </button>
              </div>
            </div>

            <button type="submit" className="lp-btn" disabled={loading}>
              {loading
                ? <><span className="lp-spinner" /> جارٍ التحقق...</>
                : 'دخول إلى المنصة'}
            </button>
          </form>

          <div className="lp-divider" />

          <Link to="/" className="lp-back">
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>

    </div>
  );
}

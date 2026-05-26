import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import '../styles/navbar.css';
import logo from '../logo.jpg';

const roleLabel = { admin: 'المدير', teacher: 'معلم', student: 'طالب' };

const DASHBOARD_PATHS = [
  '/dashboard', '/teacher-home', '/users', '/teachers', '/classes',
  '/lectures', '/exams', '/seats', '/grades', '/my-grades', '/my-classes',
  '/announcements', '/events', '/profile', '/my-courses',
];

const publicNavLinks = [
  { href: '#about', label: 'عن المدرسة' },
  { href: '#gallery', label: 'معرض الصور' },
  { href: '#contact', label: 'اتصل بنا' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { menuOpen, setMenuOpen } = useLayout();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDashboard = DASHBOARD_PATHS.some(p => location.pathname.startsWith(p));
  const isHome = location.pathname === '/';

  const handleLogout = () => { logout(); navigate('/login'); setDropOpen(false); };
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <nav className="school-navbar">
        <div className="d-flex align-items-center gap-3">
          {user && isDashboard && (
            <button className="navbar-menu-btn" onClick={() => setMenuOpen(p => !p)}>
              {menuOpen ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
            </button>
          )}

          {!user && isHome && (
            <button
              className="navbar-menu-btn d-flex d-md-none"
              onClick={() => setMobileOpen(p => !p)}
              aria-label="فتح القائمة"
            >
              {mobileOpen ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
            </button>
          )}

          <Link
            to={user ? (user.role === 'teacher' ? '/teacher-home' : '/dashboard') : '/'}
            className="d-flex align-items-center gap-2 text-decoration-none"
          >
            <img src={logo} alt="مدرسة الغدير" className="logo-img" />
            <div>
              <div className="brand-name">مدرسة الغدير</div>
              <div className="brand-sub">AL-GHADEER SCHOOL</div>
            </div>
          </Link>
        </div>

        {!user && isHome && (
          <nav className="d-none d-md-flex align-items-center gap-1">
            {publicNavLinks.map(link => (
              <a key={link.href} href={link.href} className="navbar-pub-link">
                {link.label}
              </a>
            ))}
          </nav>
        )}

        <div className="d-flex align-items-center gap-2">
          {user ? (
            <>
              <div style={{ position: 'relative' }}>
                <button className="user-dropdown-btn" onClick={() => setDropOpen(p => !p)}>
                  <div className="user-avatar-circle">
                    <PersonIcon style={{ fontSize: 18 }} />
                  </div>
                  <div style={{ textAlign: 'right', lineHeight: 1.25 }}>
                    <div className="user-name-text">{user.name}</div>
                    <div className="user-role-text">{roleLabel[user.role]}</div>
                  </div>
                </button>

                {dropOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setDropOpen(false)} />
                    <div className="user-dropdown-menu" style={{ zIndex: 1000 }} onClick={() => setDropOpen(false)}>
                      <Link to="/profile" className="user-dropdown-item">
                        <PersonIcon style={{ fontSize: 18 }} /> الملف الشخصي
                      </Link>
                      <div style={{ height: '1px', background: '#f3f4f6' }} />
                      <button className="user-dropdown-item danger" onClick={handleLogout}>
                        <LogoutIcon style={{ fontSize: 18 }} /> تسجيل الخروج
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="btn-login-nav">
              <LoginIcon style={{ fontSize: 18 }} />
              <span className="d-none d-sm-inline">تسجيل الدخول</span>
            </Link>
          )}
        </div>
      </nav>

      {mobileOpen && !user && isHome && (
        <div className="navbar-mobile-menu">
          {publicNavLinks.map(link => (
            <a key={link.href} href={link.href} className="navbar-mobile-link" onClick={closeMobile}>
              {link.label}
            </a>
          ))}
          <Link to="/login" className="navbar-mobile-login" onClick={closeMobile}>
            <LoginIcon style={{ fontSize: 16 }} /> تسجيل الدخول
          </Link>
        </div>
      )}
    </>
  );
}

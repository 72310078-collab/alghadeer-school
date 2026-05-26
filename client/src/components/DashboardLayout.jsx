import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { useLayout } from '../context/LayoutContext';
import '../styles/dashboard.css';

function DashboardFooter() {
  return (
    <footer style={{
      borderTop: '1px solid #e5e7eb',
      background: '#fff',
      padding: '0.85rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.5rem',
    }}>
      <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontFamily: 'Tajawal,sans-serif' }}>
        © {new Date().getFullYear()} مدرسة الغدير — الخرايب، لبنان
      </span>
      <span style={{ fontSize: '0.78rem', color: '#d1d5db', fontFamily: 'Tajawal,sans-serif' }}>
        العام الدراسي 2025 – 2026
      </span>
    </footer>
  );
}

export default function DashboardLayout() {
  const { menuOpen, setMenuOpen } = useLayout();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50, #f9fafb)', display: 'flex', flexDirection: 'column' }}>
      <Sidebar open={menuOpen} />
      {menuOpen && (
        <div className="dash-sidebar-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <main className={`dash-main${menuOpen ? ' sidebar-open' : ''}`}>
        <div className="dash-main-inner">
          <Outlet />
        </div>
        <DashboardFooter />
      </main>
    </div>
  );
}

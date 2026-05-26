import { useEffect, useRef } from 'react';
import SchoolIcon from '@mui/icons-material/School';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import logo from '../logo.jpg';

const quickLinks = [
  { icon: SchoolIcon,      label: 'عن المدرسة' },
  { icon: PeopleIcon,      label: 'كادر المعلمين' },
  { icon: MenuBookIcon,    label: 'الصفوف الدراسية' },
  { icon: AssignmentIcon,  label: 'جدول الامتحانات' },
  { icon: CalendarMonthIcon,label: 'التقويم المدرسي' },
];

export default function Footer() {
  const colsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('footer-col--visible');
      }),
      { threshold: 0.15 }
    );
    colsRef.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addRef = (i) => (el) => { colsRef.current[i] = el; };

  return (
    <footer className="school-footer">
      <div className="footer-topbar" />
      <div className="container">
      
        <div className="row g-4 py-5">
          <div className="col-lg-4 col-md-6 footer-col" ref={addRef(0)}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <img src={logo} alt="مدرسة الغدير" className="footer-logo" />
              <div>
                <div className="footer-school-name">مدرسة الغدير - الخرايب</div>
                <div className="footer-school-en">AL-GHADEER SCHOOL · AL-KHARAYEB</div>
              </div>
            </div>
            <p className="footer-desc">
              منصة إدارية متكاملة تجمع الطلاب والمعلمين والإدارة في بيئة تعليمية رقمية حديثة، نحو مستقبل تعليمي أفضل.
            </p>
            <div className="footer-badge">
              <span className="footer-badge-dot" />
              العام الدراسي 2025 – 2026
            </div>
          </div>

          <div className="col-lg-3 col-md-6 footer-col" ref={addRef(1)}>
            <h6 className="footer-col-title">روابط سريعة</h6>
            <ul className="footer-links">
              {quickLinks.map(({ icon: Icon, label }) => (
                <li key={label} className="footer-link-item">
                  <Icon style={{ fontSize: 16, color: 'var(--clr-gold)', flexShrink: 0 }} />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-lg-5 col-md-12 footer-col" ref={addRef(2)}>
            <h6 className="footer-col-title">تواصل معنا</h6>
            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <div className="footer-contact-icon">
                  <LocationOnIcon style={{ fontSize: 18 }} />
                </div>
                <span>لبنان — الخرايب</span>
              </div>
              <div className="footer-contact-item">
                <div className="footer-contact-icon">
                  <PhoneIcon style={{ fontSize: 18 }} />
                </div>
                <span dir="ltr">07360384</span>
              </div>
              <div className="footer-contact-item">
                <div className="footer-contact-icon">
                  <EmailIcon style={{ fontSize: 18 }} />
                </div>
                <span dir="ltr">info@alghadeer.edu.lb</span>
              </div>
            </div>

            <div className="footer-stats-row row g-2 mt-4">
              {[
                { value: '+500', label: 'طالب' },
                { value: '42',   label: 'معلم' },
                { value: 'KG–9', label: 'مراحل دراسية' },
              ].map(s => (
                <div key={s.label} className="col-4">
                  <div className="footer-stat-box">
                    <div className="footer-stat-value">{s.value}</div>
                    <div className="footer-stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <hr className="footer-divider" />
        <div className="row align-items-center py-3 g-2">
          <div className="col-md-6 text-center text-md-start">
            <span className="footer-copy">
              © {new Date().getFullYear()} مدرسة الغدير — جميع الحقوق محفوظة
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

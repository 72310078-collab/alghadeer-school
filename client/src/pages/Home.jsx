import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import logo from '../logo.jpg';
import schoolImg from '../assets/School.jpg';
import playgroundImg from '../assets/playgroundSchool.jpg';
import footballImg from '../assets/footballSchool.jpg';
import tripImg from '../assets/trip.jpg';
import entertainmentImg from '../assets/Entertainment.jpg';
import parentsImg from '../assets/Parents.jpg';
import '../styles/home.css';

const stats = [
  { label: 'طالب وطالبة', value: '+500', Icon: PeopleIcon },
  { label: 'معلم متخصص', value: '42',   Icon: MenuBookIcon },
  { label: 'صف دراسي',    value: 'KG1–9', Icon: EmojiEventsIcon },
  { label: 'سنة خبرة',    value: '+30',  Icon: CalendarMonthIcon },
];

const features = [
  { Icon: MenuBookIcon,     title: 'منهج متميز',    desc: 'برامج أكاديمية متكاملة وفق أحدث المناهج التعليمية المعتمدة.' },
  { Icon: PeopleIcon,       title: 'كوادر تعليمية', desc: 'هيئة تدريسية متخصصة وذات خبرة عالية في مجالات التعليم المختلفة.' },
  { Icon: EmojiEventsIcon,  title: 'تميز وإنجاز',   desc: 'نتائج متميزة وإنجازات أكاديمية على المستوى المحلي والإقليمي.' },
  { Icon: CalendarMonthIcon,title: 'أنشطة متنوعة',  desc: 'برامج وأنشطة لا منهجية تنمي مهارات الطلاب وشخصياتهم.' },
];

const galleryRow2 = [
  { src: playgroundImg,    caption: 'الملعب المدرسي' },
  { src: entertainmentImg, caption: 'الأنشطة الترفيهية' },
  { src: parentsImg,       caption: 'اجتماعات الأهل' },
];

const subjectRates = [
  { subject: 'الرياضيات',     pct: 96 },
  { subject: 'اللغة العربية', pct: 98 },
  { subject: 'العلوم',        pct: 94 },
  { subject: 'اللغة الإنجليزية', pct: 92 },
  { subject: 'التاريخ والجغرافيا', pct: 97 },
];

const achievements = [
  { Icon: CheckCircleIcon,      value: '95%',  label: 'نسبة النجاح الإجمالية',       color: '#D4A017' },
  { Icon: WorkspacePremiumIcon, value: '100%', label: 'نجاح الصف التاسع (البريفيه)', color: '#4ade80' },
  { Icon: TrendingUpIcon,       value: '+30',  label: 'سنة من الإنجاز المتواصل',     color: '#60a5fa' },
];

const contacts = [
  { Icon: PhoneIcon,     label: 'الهاتف',            value: '07360384' },
  { Icon: EmailIcon,     label: 'البريد الإلكتروني', value: 'info@alghadeer.edu.lb' },
  { Icon: LocationOnIcon,label: 'العنوان',            value: 'لبنان — الخرايب' },
];

function useFadeIn() {
  const ref = useRef([]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('fade-in--visible'); }),
      { threshold: 0.12 }
    );
    ref.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return (i) => (el) => { ref.current[i] = el; };
}

export default function Home() {
  const addRef = useFadeIn();

  return (
    <div className="home-page">
      <section className="hero-split">
        <div className="hero-text-side d-flex align-items-center" style={{ padding: '5rem 3.5rem' }}>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
            <div className="hero-eyebrow d-inline-flex align-items-center gap-2 rounded-pill px-3 py-1 mb-4 fw-bold small">
              <span className="hero-eyebrow-dot" />
              العام الدراسي 2025 – 2026
            </div>
            <h1 className="hero-heading mb-3">
              مدرسة <span className="hero-heading-gold">الغدير</span><br />
              للتميز والإبداع
            </h1>
            <p className="hero-sub mb-4 fs-6">
              نبني جيلاً واعياً متسلحاً بالعلم والمعرفة، في بيئة تعليمية آمنة وحاضنة للإبداع.
            </p>
            <div className="d-flex gap-3 flex-wrap mb-4">
              <Link to="/login" className="btn-hero-primary d-inline-flex align-items-center gap-2 rounded-pill px-4 py-2 text-decoration-none">
                دخول المنصة <ArrowBackIcon style={{ fontSize: 18 }} />
              </Link>
              <a href="#about" className="btn-hero-ghost d-inline-flex align-items-center rounded-pill px-4 py-2 text-decoration-none">
                تعرف علينا
              </a>
            </div>
            <div className="hero-trust d-flex align-items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} style={{ fontSize: 16, color: '#D4A017' }} />
              ))}
              <span>مدرسة موثوقة منذ أكثر من 30 عاماً</span>
            </div>
          </div>
        </div>

        <div className="hero-photo-side">
          <img src={schoolImg} alt="مدرسة الغدير" className="hero-bg-photo" />
          <div className="hero-photo-veil" />
          <div className="hero-float-card d-flex align-items-center gap-3 rounded-3 p-3">
            <img src={logo} alt="شعار" className="hero-float-logo rounded-2" />
            <div>
              <div className="hero-float-title">مدرسة الغدير</div>
              <div className="hero-float-sub">الخرايب، لبنان</div>
            </div>
          </div>
        </div>
      </section>

      <div className="hero-stats-strip">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className="hero-stat-item d-flex flex-column align-items-center text-center py-3 px-2">
            <div className="hero-stat-icon d-flex align-items-center justify-content-center rounded-2 mb-2">
              <Icon style={{ fontSize: 22 }} />
            </div>
            <div className="hero-stat-num">{value}</div>
            <div className="hero-stat-label mt-1">{label}</div>
          </div>
        ))}
      </div>

      <section id="about" className="section-about py-5">
        <div className="container py-4">
          <div className="section-header text-center mb-5 fade-in" ref={addRef(0)}>
            <span className="section-tag d-inline-block rounded-pill px-3 py-1 mb-2 fw-bold">عن المدرسة</span>
            <h2 className="section-title">لماذا مدرسة الغدير؟</h2>
            <p className="section-desc mx-auto">نقدم بيئة تعليمية متكاملة تجمع بين الأصالة والحداثة</p>
          </div>
          <div className="row g-4">
            {features.map(({ Icon, title, desc }, i) => (
              <div key={title} className="col-md-6 fade-in" ref={addRef(i + 1)}>
                <div className="feature-card d-flex gap-3 align-items-start p-4 h-100 rounded-3">
                  <div className="feature-icon-wrap d-flex align-items-center justify-content-center rounded-3">
                    <Icon style={{ fontSize: 28 }} />
                  </div>
                  <div>
                    <h3 className="feature-title mb-2">{title}</h3>
                    <p className="feature-desc">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="success" className="section-success py-5">
        <div className="container py-4">

          <div className="section-header text-center mb-5 fade-in" ref={addRef(7)}>
            <span className="section-tag section-tag--light d-inline-block rounded-pill px-3 py-1 mb-2 fw-bold">
              نتائجنا الأكاديمية
            </span>
            <h2 className="section-title" style={{ color: '#fff' }}>إنجازات العام الدراسي 2024 – 2025</h2>
            <p className="section-desc mx-auto" style={{ color: 'rgba(255,255,255,0.72)' }}>
              أرقام حقيقية تعكس 30 عاماً من الجودة والتفاني في خدمة الطالب
            </p>
          </div>

          <div className="row g-4 align-items-center mb-5 fade-in" ref={addRef(8)}>
            <div className="col-lg-4 text-center">
              <div className="success-big-ring mx-auto">
                <div className="success-big-num">95%</div>
                <div className="success-big-label">نسبة النجاح</div>
              </div>
            </div>
            
            <div className="col-lg-8">
              <div className="row g-3">
                {achievements.map(({ Icon, value, label, color }) => (
                  <div key={label} className="col-md-4">
                    <div className="achieve-card text-center p-4 rounded-3">
                      <div className="achieve-icon d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                           style={{ background: color + '22', border: `2px solid ${color}55`, color }}>
                        <Icon style={{ fontSize: 28 }} />
                      </div>
                      <div className="achieve-value" style={{ color }}>{value}</div>
                      <div className="achieve-label">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

         

        </div>
      </section>

      <section id="gallery" className="section-gallery py-5">
        <div className="container py-4">
          <div className="section-header text-center mb-5 fade-in" ref={addRef(10)}>
            <span className="section-tag d-inline-block rounded-pill px-3 py-1 mb-2 fw-bold">معرض الصور</span>
            <h2 className="section-title">من حياتنا المدرسية</h2>
            <p className="section-desc mx-auto">لحظات وذكريات من مجتمع الغدير التعليمي</p>
          </div>

          <div className="gallery-grid-main fade-in" ref={addRef(11)}>
            <div className="gallery-item gallery-item--large rounded-3">
              <img src={schoolImg} alt="مبنى المدرسة" />
              <div className="gallery-overlay"><span>مبنى المدرسة</span></div>
            </div>
            <div className="gallery-item gallery-item--sm rounded-3">
              <img src={footballImg} alt="الأنشطة الرياضية" />
              <div className="gallery-overlay"><span>الأنشطة الرياضية</span></div>
            </div>
            <div className="gallery-item gallery-item--sm rounded-3">
              <img src={tripImg} alt="الرحلات المدرسية" />
              <div className="gallery-overlay"><span>الرحلات المدرسية</span></div>
            </div>
          </div>

          <div className="row g-3 mt-1 fade-in" ref={addRef(12)}>
            {galleryRow2.map(({ src, caption }) => (
              <div key={caption} className="col-md-4">
                <div className="gallery-item gallery-item--equal rounded-3">
                  <img src={src} alt={caption} />
                  <div className="gallery-overlay"><span>{caption}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="section-contact py-5">
        <div className="container py-4">
          <div className="section-header text-center mb-5 fade-in" ref={addRef(30)}>
            <span className="section-tag section-tag--light d-inline-block rounded-pill px-3 py-1 mb-2 fw-bold">
              تواصل معنا
            </span>
            <h2 className="section-title" style={{ color: '#fff' }}>نسعد بتواصلكم</h2>
            <p className="section-desc mx-auto" style={{ color: 'rgba(255,255,255,0.72)' }}>
              يسعدنا الرد على استفساراتكم في أي وقت
            </p>
          </div>

          <div className="row g-4">
            {contacts.map(({ Icon, label, value }) => (
              <div key={label} className="col-md-4">
                <div className="contact-card text-center p-4 rounded-3">
                  <div className="contact-icon-wrap d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3">
                    <Icon style={{ fontSize: 28 }} />
                  </div>
                  <div className="contact-label mb-1">{label}</div>
                  <div className="contact-value">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

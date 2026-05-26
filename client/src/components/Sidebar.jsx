import { NavLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CampaignIcon from '@mui/icons-material/Campaign';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GradeIcon from '@mui/icons-material/Grade';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import ChecklistIcon from '@mui/icons-material/Checklist';
import BadgeIcon from '@mui/icons-material/Badge';
import { useAuth } from '../context/AuthContext';
import '../styles/sidebar.css';

const adminLinks = [
  { to: '/dashboard',    icon: HomeIcon,          label: 'الرئيسية' },
  { to: '/students',     icon: BadgeIcon,         label: 'الطلاب' },
  { to: '/teachers',     icon: SchoolIcon,        label: 'المعلمون' },
  { to: '/classes',      icon: MenuBookIcon,      label: 'الصفوف' },
  { to: '/schedule',     icon: ScheduleIcon,      label: 'الجدول الأسبوعي' },
  { to: '/exams',        icon: AssignmentIcon,    label: 'جدول الامتحانات' },
  { to: '/grades',       icon: GradeIcon,         label: 'العلامات' },
  { to: '/seats',        icon: EventSeatIcon,     label: 'توزيع المقاعد' },
  { to: '/announcements',icon: CampaignIcon,      label: 'تعاميم مدرسية' },
  { to: '/events',       icon: CalendarMonthIcon, label: 'التقويم' },
];

const teacherLinks = [
  { to: '/teacher-home', icon: HomeIcon,           label: 'الرئيسية' },
  { to: '/schedule',     icon: ScheduleIcon,       label: 'الجدول الأسبوعي' },
  { to: '/classes',      icon: MenuBookIcon,       label: 'صفوفي' },
  { to: '/attendance',   icon: ChecklistIcon,      label: 'الحضور والغياب' },
  { to: '/grades',       icon: GradeIcon,          label: 'العلامات' },
  { to: '/exams',        icon: AssignmentIcon,     label: 'الامتحانات' },
  { to: '/seats',        icon: EventSeatIcon,      label: 'توزيع المقاعد' },
  { to: '/announcements',icon: CampaignIcon,       label: 'تعاميم مدرسية' },
  { to: '/events',       icon: CalendarMonthIcon,  label: 'التقويم' },
  { to: '/profile',      icon: PersonIcon,         label: 'ملفي' },
];

const studentLinks = [
  { to: '/dashboard',    icon: HomeIcon,          label: 'الرئيسية' },
  { to: '/my-courses',   icon: MenuBookIcon,      label: 'موادي' },
  { to: '/schedule',     icon: ScheduleIcon,      label: 'الجدول الأسبوعي' },
  { to: '/my-grades',    icon: GradeIcon,         label: 'علاماتي' },
  { to: '/exams',        icon: AssignmentIcon,    label: 'جدول الامتحانات' },
  { to: '/my-seats',     icon: EventSeatIcon,     label: 'مقعدي' },
  { to: '/announcements',icon: CampaignIcon,      label: 'تعاميم مدرسية' },
  { to: '/events',       icon: CalendarMonthIcon, label: 'التقويم' },
  { to: '/profile',      icon: PersonIcon,        label: 'ملفي' },
];

export default function Sidebar({ open }) {
  const { user } = useAuth();
  const links =
    user?.role === 'admin'   ? adminLinks   :
    user?.role === 'teacher' ? teacherLinks :
    studentLinks;

  return (
    <>
      <aside className={`school-sidebar ${open ? 'open' : 'closed'}`}>
        <div style={{ flex: 1, overflowY: 'auto', paddingTop: '0.5rem' }}>
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              end={to === '/dashboard' || to === '/teacher-home'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon style={{ fontSize: 20 }} />
              {label}
            </NavLink>
          ))}
        </div>
        <div className="sidebar-footer">مدرسة الغدير © 2026</div>
      </aside>
    </>
  );
}

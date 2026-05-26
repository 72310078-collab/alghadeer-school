import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LayoutProvider } from './context/LayoutContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import Grades from './pages/Grades';
import Announcements from './pages/Announcements';
import Events from './pages/Events';
import Profile from './pages/Profile';
import Teachers from './pages/Teachers';
import TeacherHome from './pages/TeacherHome';
import Schedule from './pages/Schedule';
import ExamAgenda from './pages/ExamAgenda';
import SeatAllocation from './pages/SeatAllocation';
import MySeats from './pages/MySeats';
import MyCourses from './pages/MyCourses';
import Attendance from './pages/Attendance';
import Students from './pages/Students';
import Materials from './pages/Materials';
import ClassMaterials from './pages/ClassMaterials';
import SubjectMaterials from './pages/SubjectMaterials';

import './styles/footer.css';

function AppShell() {
  const location = useLocation();
  const isPublic = location.pathname === '/' || location.pathname === '/login';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/teacher-home" element={
              <ProtectedRoute roles={['teacher']}>
                <TeacherHome />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={<Profile />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/events" element={<Events />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/my-grades" element={<Grades />} />
            <Route path="/my-classes" element={<Classes />} />
            <Route path="/exams" element={<ExamAgenda />} />
            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/attendance" element={
              <ProtectedRoute roles={['admin', 'teacher']}>
                <Attendance />
              </ProtectedRoute>
            } />
            <Route path="/students" element={
              <ProtectedRoute roles={['admin']}>
                <Students />
              </ProtectedRoute>
            } />

            <Route path="/teachers" element={
              <ProtectedRoute roles={['admin']}>
                <Teachers />
              </ProtectedRoute>
            } />
            <Route path="/classes" element={
              <ProtectedRoute roles={['admin', 'teacher']}>
                <Classes />
              </ProtectedRoute>
            } />
            <Route path="/schedule" element={
              <ProtectedRoute roles={['admin', 'teacher', 'student']}>
                <Schedule />
              </ProtectedRoute>
            } />
            <Route path="/seats" element={
              <ProtectedRoute roles={['admin', 'teacher']}>
                <SeatAllocation />
              </ProtectedRoute>
            } />
            <Route path="/my-seats" element={
              <ProtectedRoute roles={['student']}>
                <MySeats />
              </ProtectedRoute>
            } />
            <Route path="/materials" element={
              <ProtectedRoute roles={['teacher', 'student']}>
                <Materials />
              </ProtectedRoute>
            } />
            <Route path="/classes/:classId/materials" element={
              <ProtectedRoute roles={['teacher']}>
                <ClassMaterials />
              </ProtectedRoute>
            } />
            <Route path="/subjects/:subjectId/materials" element={
              <ProtectedRoute roles={['student']}>
                <SubjectMaterials />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {isPublic && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LayoutProvider>
          <AppShell />
          <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        </LayoutProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

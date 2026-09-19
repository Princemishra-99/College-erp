import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageStudents } from './pages/admin/ManageStudents';
import { ManageFaculty } from './pages/admin/ManageFaculty';
import { ManageAcademics } from './pages/admin/ManageAcademics';
import { ManageFees } from './pages/admin/ManageFees';

import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { MarkAttendance } from './pages/faculty/MarkAttendance';
import { UploadMarks } from './pages/faculty/UploadMarks';

import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentAttendance } from './pages/student/StudentAttendance';
import { StudentMarks } from './pages/student/StudentMarks';
import { StudentFees } from './pages/student/StudentFees';
import { StudentTimetable } from './pages/student/StudentTimetable';

import { NoticesPage } from './pages/common/NoticesPage';
import { ProfilePage } from './pages/common/ProfilePage';

// Role-based root redirect
const RootRedirect = () => {
  const { role, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<RootRedirect />} />

            {/* Admin-only Routes */}
            <Route
              path="admin/dashboard"
              element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>}
            />
            <Route
              path="admin/students"
              element={<ProtectedRoute allowedRoles={['admin']}><ManageStudents /></ProtectedRoute>}
            />
            <Route
              path="admin/faculty"
              element={<ProtectedRoute allowedRoles={['admin']}><ManageFaculty /></ProtectedRoute>}
            />
            <Route
              path="admin/academics"
              element={<ProtectedRoute allowedRoles={['admin']}><ManageAcademics /></ProtectedRoute>}
            />
            <Route
              path="admin/fees"
              element={<ProtectedRoute allowedRoles={['admin']}><ManageFees /></ProtectedRoute>}
            />

            {/* Faculty Routes (Admin can also access) */}
            <Route
              path="faculty/dashboard"
              element={<ProtectedRoute allowedRoles={['faculty', 'admin']}><FacultyDashboard /></ProtectedRoute>}
            />
            <Route
              path="faculty/students"
              element={<ProtectedRoute allowedRoles={['faculty', 'admin']}><ManageStudents /></ProtectedRoute>}
            />
            <Route
              path="faculty/attendance"
              element={<ProtectedRoute allowedRoles={['faculty', 'admin']}><MarkAttendance /></ProtectedRoute>}
            />
            <Route
              path="faculty/marks"
              element={<ProtectedRoute allowedRoles={['faculty', 'admin']}><UploadMarks /></ProtectedRoute>}
            />

            {/* Student-only Routes */}
            <Route
              path="student/dashboard"
              element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>}
            />
            <Route
              path="student/attendance"
              element={<ProtectedRoute allowedRoles={['student']}><StudentAttendance /></ProtectedRoute>}
            />
            <Route
              path="student/marks"
              element={<ProtectedRoute allowedRoles={['student']}><StudentMarks /></ProtectedRoute>}
            />
            <Route
              path="student/fees"
              element={<ProtectedRoute allowedRoles={['student']}><StudentFees /></ProtectedRoute>}
            />
            <Route
              path="student/timetable"
              element={<ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}><StudentTimetable /></ProtectedRoute>}
            />

            {/* Common Routes (all roles) */}
            <Route path="notices" element={<NoticesPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

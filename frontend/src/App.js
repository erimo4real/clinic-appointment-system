/**
 * =====================================================
 * MAIN APP COMPONENT
 * =====================================================
 * 
 * Root component with routing configuration.
 * Handles protected routes and role-based access.
 * 
 * @component App
 */

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider } from './components/ui/Theme';

import LandingPage from './shared/pages/LandingPage';
import AboutPage from './shared/pages/AboutPage';
import NotFoundPage from './shared/pages/NotFoundPage';
import LoginPage from './features/auth/components/LoginPage';
import RegisterPage from './features/auth/components/RegisterPage';
import ForgotPasswordPage from './features/auth/components/ForgotPasswordPage';
import ResetPasswordConfirmPage from './features/auth/components/ResetPasswordConfirmPage';
import BookingPage from './features/appointments/components/BookingPage';
import DoctorsPage from './features/doctors/components/DoctorsPage';
import ServicesPage from './features/services/components/ServicesPage';

import AdminLayout from './features/admin/components/AdminLayout';
import AdminDashboard from './features/admin/components/AdminDashboard';
import UserManagement from './features/admin/components/UserManagement';
import DoctorManagement from './features/admin/components/DoctorManagement';
import AppointmentManagement from './features/admin/components/AppointmentManagement';
import ServiceManagement from './features/admin/components/ServiceManagement';

import PatientProfile from './features/profile/components/PatientProfile';
import DoctorProfile from './features/profile/components/DoctorProfile';

import Header from './layout/Header';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        {children}
      </AdminLayout>
    </ProtectedRoute>
  );
};

const App = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const showHeader = isAuthenticated && !isAdminRoute;
  
  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'doctor':
        return '/profile';
      case 'receptionist':
        return '/dashboard';
      default:
        return '/profile';
    }
  };
  
  return (
    <ThemeProvider>
      <ToastProvider>
        {showHeader && <Header user={user} />}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to={getDashboardRoute()} replace /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to={getDashboardRoute()} replace /> : <RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordConfirmPage />} />
          <Route path="/booking" element={<BookingPage />} />
          
          {/* Patient Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              {user?.role === 'admin' ? <Navigate to="/admin" replace /> :
               user?.role === 'doctor' ? <Navigate to="/profile" replace /> : 
               user?.role === 'receptionist' ? <Navigate to="/admin" replace /> :
               <PatientProfile />}
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
          <Route path="/admin/doctors" element={<AdminRoute><DoctorManagement /></AdminRoute>} />
          <Route path="/admin/appointments" element={<AdminRoute><AppointmentManagement /></AdminRoute>} />
          <Route path="/admin/services" element={<AdminRoute><ServiceManagement /></AdminRoute>} />

          {/* Profile Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              {user?.role === 'doctor' ? <DoctorProfile /> : <PatientProfile />}
            </ProtectedRoute>
          } />

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
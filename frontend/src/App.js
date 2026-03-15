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
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Pages - moved to feature-based structure
import LandingPage from './shared/pages/LandingPage';
import AboutPage from './shared/pages/AboutPage';
import LoginPage from './features/auth/components/LoginPage';
import RegisterPage from './features/auth/components/RegisterPage';
import ForgotPasswordPage from './features/auth/components/ForgotPasswordPage';
import ResetPasswordConfirmPage from './features/auth/components/ResetPasswordConfirmPage';
import BookingPage from './features/appointments/components/BookingPage';
import DashboardPage from './features/appointments/components/DashboardPage';
import DoctorDashboard from './features/appointments/components/DoctorDashboard';
import PatientDashboard from './features/appointments/components/PatientDashboard';
import DoctorsPage from './features/doctors/components/DoctorsPage';
import ServicesPage from './features/services/components/ServicesPage';

// Admin Components
import AdminLayout from './features/admin/components/AdminLayout';
import AdminDashboard from './features/admin/components/AdminDashboard';
import UserManagement from './features/admin/components/UserManagement';
import DoctorManagement from './features/admin/components/DoctorManagement';
import AppointmentManagement from './features/admin/components/AppointmentManagement';
import ServiceManagement from './features/admin/components/ServiceManagement';

// Profile Components
import PatientProfile from './features/profile/components/PatientProfile';
import DoctorProfile from './features/profile/components/DoctorProfile';

/**
 * Protected Route Component
 * 
 * Restricts access based on authentication and roles
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string[]} [props.allowedRoles] - Allowed user roles
 */
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

/**
 * Admin Route Wrapper
 * 
 * Wraps admin routes with admin layout and protection
 */
const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        {children}
      </AdminLayout>
    </ProtectedRoute>
  );
};

/**
 * Main App Component
 * 
 * Defines all application routes
 */
const App = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/doctors" element={<DoctorsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordConfirmPage />} />
      <Route path="/booking" element={<BookingPage />} />
      
      {/* Protected Routes - Role-based */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          {user?.role === 'admin' ? <Navigate to="/admin" replace /> :
           user?.role === 'doctor' ? <DoctorDashboard /> : 
           <PatientDashboard />}
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      <Route path="/admin/users" element={
        <AdminRoute>
          <UserManagement />
        </AdminRoute>
      } />
      <Route path="/admin/doctors" element={
        <AdminRoute>
          <DoctorManagement />
        </AdminRoute>
      } />
      <Route path="/admin/appointments" element={
        <AdminRoute>
          <AppointmentManagement />
        </AdminRoute>
      } />
      <Route path="/admin/services" element={
        <AdminRoute>
          <ServiceManagement />
        </AdminRoute>
      } />

      {/* Profile Routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          {user?.role === 'doctor' ? <DoctorProfile /> : <PatientProfile />}
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default App;

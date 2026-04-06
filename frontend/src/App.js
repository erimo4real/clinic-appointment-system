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

import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentUser } from './features/auth/store/authSlice';

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
import DoctorProfilePage from './features/doctors/components/DoctorProfilePage';
import ServicesPage from './features/services/components/ServicesPage';

import AdminLayout from './features/admin/components/AdminLayout';
import AdminDashboard from './features/admin/components/AdminDashboard';
import UserManagement from './features/admin/components/UserManagement';
import DoctorManagement from './features/admin/components/DoctorManagement';
import AppointmentManagement from './features/admin/components/AppointmentManagement';
import ServiceManagement from './features/admin/components/ServiceManagement';
import CalendarView from './features/admin/components/CalendarView';
import DoctorSchedule from './features/admin/components/DoctorSchedule';
import ReceptionistDashboard from './features/admin/components/ReceptionistDashboard';
import ReportsPage from './features/admin/components/ReportsPage';
import ActivityLog from './features/admin/components/ActivityLog';
import SettingsPage from './features/admin/components/SettingsPage';
import WaitingRoom from './features/admin/components/WaitingRoom';

import PatientProfile from './features/profile/components/PatientProfile';
import ProfileSettings from './features/profile/components/ProfileSettings';
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

const ReceptionistRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
      <AdminLayout>
        {children}
      </AdminLayout>
    </ProtectedRoute>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [sessionChecked, setSessionChecked] = useState(false);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isPublicRoute = ['/', '/services', '/doctors', '/about', '/booking'].includes(location.pathname);
  const showHeader = isAuthenticated && !isAdminRoute && !isPublicRoute;

  useEffect(() => {
    const isLoginPage = location.pathname === '/login' || location.pathname === '/register';
    
    if (isLoginPage) {
      setSessionChecked(true);
      return;
    }
    
    if (isAuthenticated) {
      setSessionChecked(true);
      return;
    }
    
    // Only check session on mount, not on every navigation
    if (sessionChecked) return;
    
    const checkSession = async () => {
      try {
        await dispatch(fetchCurrentUser()).unwrap();
      } catch (err) {
        // User not logged in or token expired - clear cookie
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
      setSessionChecked(true);
    };
    
    checkSession();
  }, [dispatch, location.pathname, isAuthenticated, sessionChecked]);

  if (!sessionChecked) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 bg-teal-600 rounded-full mb-4"></div>
            <div className="text-teal-600 font-medium">Loading...</div>
          </div>
        </div>
      </ThemeProvider>
    );
  }
  
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
          <Route path="/doctors/:id" element={<DoctorProfilePage />} />
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
          <Route path="/admin/doctor-schedule" element={<AdminRoute><DoctorSchedule /></AdminRoute>} />
          <Route path="/admin/appointments" element={<AdminRoute><AppointmentManagement /></AdminRoute>} />
          <Route path="/admin/calendar" element={<AdminRoute><CalendarView /></AdminRoute>} />
          <Route path="/admin/services" element={<AdminRoute><ServiceManagement /></AdminRoute>} />
          <Route path="/admin/receptionist" element={<ReceptionistRoute><ReceptionistDashboard /></ReceptionistRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />
          <Route path="/admin/activity" element={<AdminRoute><ActivityLog /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
          <Route path="/admin/waiting-room" element={<AdminRoute><WaitingRoom /></AdminRoute>} />

          {/* Profile Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              {user?.role === 'doctor' ? <DoctorProfile /> : <PatientProfile />}
            </ProtectedRoute>
          } />
          <Route path="/profile/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;

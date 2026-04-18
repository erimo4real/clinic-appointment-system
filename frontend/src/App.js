import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentUser } from './features/auth/store/authSlice';

import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider } from './components/ui/Theme';

import LandingPage from './shared/pages/LandingPage';
import LoginPage from './features/auth/components/LoginPage';
import RegisterPage from './features/auth/components/RegisterPage';
import ServicesPage from './features/services/components/ServicesPage';
import DoctorsPage from './features/doctors/components/DoctorsPage';
import BookingPage from './features/appointments/components/BookingPage';
import AdminDashboard from './features/admin/components/AdminDashboard';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
  </div>
);

const App = () => {
  const dispatch = useDispatch();
  const { loading, isAuthenticated, user } = useSelector((state) => state.auth);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    dispatch(fetchCurrentUser()).finally(() => {
      setInitialLoad(false);
    });
  }, [dispatch]);

  if (initialLoad) return <LoadingScreen />;

  return (
    <ThemeProvider>
      <ToastProvider>
        <Routes>
          {/* Public Routes - no auth check needed */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/login" element={isAuthenticated && user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated && user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
          <Route path="/booking" element={<BookingPage />} />

          {/* All Logged-in Users - Same Dashboard */}
          <Route path="/dashboard" element={!isAuthenticated || !user ? <Navigate to="/login" replace /> : <AdminDashboard />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;

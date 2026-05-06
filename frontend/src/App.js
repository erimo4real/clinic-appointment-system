import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import dashboardTheme from './theme/dashboardTheme';
import { fetchCurrentUser } from './features/auth/store/authSlice';

import { ToastProvider } from './components/ui/Toast';

import LandingPage from './shared/pages/LandingPage';
import LoginPage from './features/auth/components/LoginPage';
import RegisterPage from './features/auth/components/RegisterPage';
import ServicesPage from './features/services/components/ServicesPage';
import DoctorsPage from './features/doctors/components/DoctorsPage';
import BookingPage from './features/appointments/components/BookingPage';
import AdminDashboard from './features/admin/components/AdminDashboard';
import DoctorsManagementPage from './features/doctors/components/DoctorsManagementPage';
import ServicesManagementPage from './features/services/components/ServicesManagementPage';
import AppointmentsManagementPage from './features/appointments/components/AppointmentsManagementPage';
import PatientsManagementPage from './features/patients/components/PatientsManagementPage';
import PrescriptionsManagementPage from './features/prescriptions/components/PrescriptionsManagementPage';
import FeedbackManagementPage from './features/feedback/components/FeedbackManagementPage';
import MedicalRecordsManagementPage from './features/medicalrecords/components/MedicalRecordsManagementPage';
import WaitlistManagementPage from './features/waitlist/components/WaitlistManagementPage';
import SettingsPage from './features/settings/components/SettingsPage';
import ProfilePage from './features/settings/components/ProfilePage';

const LoadingScreen = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
    <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid #e0e0e0', borderTopColor: '#1A73E8', animation: 'spin 1s linear infinite' }}></div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const RequireAuth = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  return children;
};

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
    <ThemeProvider theme={dashboardTheme}>
      <CssBaseline />
      <ToastProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/login" element={isAuthenticated && user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated && user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
          <Route path="/booking" element={<BookingPage />} />

          <Route path="/dashboard/*" element={
            <RequireAuth>
              <Routes>
                <Route path="" element={<AdminDashboard />} />
                <Route path="appointments" element={<AppointmentsManagementPage />} />
                <Route path="doctors" element={<DoctorsManagementPage />} />
                <Route path="patients" element={<PatientsManagementPage />} />
                <Route path="services" element={<ServicesManagementPage />} />
                <Route path="prescriptions" element={<PrescriptionsManagementPage />} />
                <Route path="feedback" element={<FeedbackManagementPage />} />
                <Route path="medical-records" element={<MedicalRecordsManagementPage />} />
                <Route path="waitlist" element={<WaitlistManagementPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Routes>
            </RequireAuth>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;

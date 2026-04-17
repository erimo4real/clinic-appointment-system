import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../auth/store/authSlice';
import { fetchMyAppointments } from '../../appointments/store/appointmentSlice';
import { fetchAllAppointments, fetchAllUsers, fetchAllDoctors, fetchAllServices } from '../../admin/store/adminSlice';

const NavIcon = ({ name, className }) => {
  const icons = {
    dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    doctor: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    services: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />,
    profile: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    logout: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    wallet: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    bell: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
    chevronRight: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />,
    arrowRight: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />,
    medical: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />,
    star: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
    location: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />,
    phone: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />,
    shield: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    menu: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />,
    close: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
  };
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[name]}</svg>;
};

const StatusBadge = ({ status }) => {
  const styles = {
    completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
    cancelled: { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' },
  };
  const style = styles[status] || styles.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const StatCard = ({ title, value, subtitle, icon, gradient, trend }) => (
  <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
    <div className={`absolute top-0 left-0 right-0 h-1 ${gradient}`}></div>
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              <span>{trend > 0 ? '+' : ''}{trend}%</span>
              <span className="text-gray-400">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${gradient.replace('bg-gradient-to-r', 'bg-gradient-to-br opacity-90')} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  </div>
);

const QuickActionCard = ({ icon, title, description, to, color }) => (
  <Link
    to={to}
    className="group relative overflow-hidden bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
  >
    <div className={`absolute top-0 right-0 w-20 h-20 ${color} opacity-5 rounded-bl-full`}></div>
    <div className="relative flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color.replace('bg-', 'bg-').replace('-500', '-50')} ${color.replace('bg-', 'text-').replace('-500', '-600')}`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">{title}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
        <NavIcon name="chevronRight" className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  </Link>
);

const AppointmentCard = ({ appointment, isPatient }) => {
  const getDateTime = (date, time) => {
    const d = new Date(date);
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return { date: dateStr, time: typeof time === 'string' ? time : time?.start_time || time };
  };
  
  const { date, time } = getDateTime(appointment.date, appointment.start_time || appointment.startTime);
  
  return (
    <div className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200">
      <div className="w-12 h-12 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-teal-100 group-hover:to-teal-200 transition-colors">
        <NavIcon name="calendar" className="w-6 h-6 text-teal-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900 truncate">
            {isPatient ? `Dr. ${appointment.doctor_name || 'Doctor'}` : appointment.patient_name || 'Patient'}
          </h4>
          <StatusBadge status={appointment.status} />
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <NavIcon name="medical" className="w-3.5 h-3.5" />
            {appointment.service_name || 'Service'}
          </span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-medium text-gray-900">{date}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
};

const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
      <NavIcon name={icon} className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-500 max-w-xs mb-4">{description}</p>
    {action}
  </div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { appointments } = useSelector((state) => state.appointments);
  const { users, doctors, appointments: adminAppointments, services } = useSelector((state) => state.admin);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const isAdmin = user?.role === 'admin';
  const isReceptionist = user?.role === 'receptionist';
  const isPatient = user?.role === 'patient';
  const isStaff = isAdmin || isReceptionist;

  useEffect(() => {
    if (isPatient) {
      dispatch(fetchMyAppointments());
    } else if (isStaff) {
      dispatch(fetchAllAppointments());
      dispatch(fetchAllDoctors());
      dispatch(fetchAllServices());
      if (isAdmin) {
        dispatch(fetchAllUsers());
      }
    }
  }, [dispatch, isPatient, isAdmin, isStaff]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const userName = user?.firstName || user?.first_name || user?.username || 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const totalAppointments = isPatient ? appointments.length : adminAppointments.length;
  const pendingAppointments = isPatient 
    ? appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length
    : adminAppointments.filter(a => a.status === 'pending').length;
  const completedAppointments = isPatient
    ? appointments.filter(a => a.status === 'completed').length
    : adminAppointments.filter(a => a.status === 'completed').length;
  const todayAppointments = isPatient
    ? appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length
    : adminAppointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length;

  const recentAppointments = (isPatient ? appointments : adminAppointments).slice(0, 5);

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { icon: 'plus', label: 'Book Appointment', path: '/booking' },
    { icon: 'doctor', label: 'Find Doctors', path: '/doctors' },
    { icon: 'services', label: 'Services', path: '/services' },
    { icon: 'profile', label: 'My Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm shadow-teal-200">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">MedBook Pro</span>
            </div>

            <div className="flex items-center gap-3">
              {isStaff && (
                <Link 
                  to="/booking"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <NavIcon name="plus" className="w-4 h-4" />
                  New Booking
                </Link>
              )}
              
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <NavIcon name="bell" className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>

              <div className="relative">
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm shadow-teal-200">
                    {userInitials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">{isAdmin ? 'Administrator' : isReceptionist ? 'Receptionist' : 'Patient'}</p>
                  </div>
                </button>

                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg shadow-gray-200 border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{userName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <NavIcon name="profile" className="w-4 h-4" />
                          My Profile
                        </Link>
                        {isStaff && (
                          <Link to="/admin" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <NavIcon name="chart" className="w-4 h-4" />
                            Dashboard
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-gray-100 py-1">
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <NavIcon name="logout" className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <NavIcon name={mobileMenuOpen ? 'close' : 'menu'} className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
            {navItems.map((item, i) => (
              <Link
                key={i}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <NavIcon name={item.icon} className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <NavIcon name="logout" className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        )}
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-100 overflow-y-auto">
        <nav className="p-4 space-y-1">
          {navItems.map((item, i) => (
            <Link
              key={i}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
            >
              <NavIcon name={item.icon} className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-3 px-4 py-3 text-gray-500">
            <NavIcon name="shield" className="w-4 h-4" />
            <span className="text-xs">Secure Connection</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {getGreeting()}, <span className="text-teal-600">{userName}</span>
            </h1>
            <p className="text-gray-500 mt-1">
              {isStaff 
                ? "Here's what's happening at your clinic today."
                : "Track your health appointments and records."
              }
            </p>
          </div>

          {/* Staff Dashboard */}
          {isStaff && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {isAdmin && (
                  <StatCard
                    title="Total Users"
                    value={users.length}
                    subtitle="Registered accounts"
                    gradient="bg-gradient-to-r from-teal-500 to-teal-600"
                    icon={<NavIcon name="users" className="w-6 h-6 text-white" />}
                  />
                )}
                <StatCard
                  title="Doctors"
                  value={doctors.length}
                  subtitle="Active specialists"
                  gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
                  icon={<NavIcon name="doctor" className="w-6 h-6 text-white" />}
                />
                <StatCard
                  title="Appointments"
                  value={totalAppointments}
                  subtitle={`${pendingAppointments} pending`}
                  gradient="bg-gradient-to-r from-blue-500 to-blue-600"
                  icon={<NavIcon name="calendar" className="w-6 h-6 text-white" />}
                />
                <StatCard
                  title="Services"
                  value={services.length}
                  subtitle="Available treatments"
                  gradient="bg-gradient-to-r from-violet-500 to-violet-600"
                  icon={<NavIcon name="services" className="w-6 h-6 text-white" />}
                />
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <QuickActionCard
                    icon={<NavIcon name="plus" className="w-5 h-5" />}
                    title="New Booking"
                    description="Create appointment"
                    to="/booking"
                    color="bg-teal-500"
                  />
                  <QuickActionCard
                    icon={<NavIcon name="doctor" className="w-5 h-5" />}
                    title="Add Doctor"
                    description="Register new doctor"
                    to="/admin"
                    color="bg-emerald-500"
                  />
                  <QuickActionCard
                    icon={<NavIcon name="services" className="w-5 h-5" />}
                    title="Add Service"
                    description="New treatment option"
                    to="/admin"
                    color="bg-violet-500"
                  />
                  <QuickActionCard
                    icon={<NavIcon name="calendar" className="w-5 h-5" />}
                    title="Appointments"
                    description="Manage bookings"
                    to="/admin"
                    color="bg-blue-500"
                  />
                </div>
              </div>

              {/* Recent Appointments */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
                  <Link to="/admin" className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
                    View All
                    <NavIcon name="chevronRight" className="w-4 h-4" />
                  </Link>
                </div>
                <div className="p-4">
                  {recentAppointments.length === 0 ? (
                    <EmptyState
                      icon="calendar"
                      title="No appointments yet"
                      description="Appointments will appear here once booked"
                      action={
                        <Link to="/booking" className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors">
                          Create First Booking
                        </Link>
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      {recentAppointments.map((apt, i) => (
                        <AppointmentCard key={apt.id || i} appointment={apt} isPatient={false} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Patient Dashboard */}
          {isPatient && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard
                  title="Total"
                  value={totalAppointments}
                  subtitle="All appointments"
                  gradient="bg-gradient-to-r from-blue-500 to-blue-600"
                  icon={<NavIcon name="calendar" className="w-5 h-5 text-white" />}
                />
                <StatCard
                  title="Upcoming"
                  value={pendingAppointments}
                  subtitle="Scheduled visits"
                  gradient="bg-gradient-to-r from-amber-500 to-amber-600"
                  icon={<NavIcon name="clock" className="w-5 h-5 text-white" />}
                />
                <StatCard
                  title="Completed"
                  value={completedAppointments}
                  subtitle="Past visits"
                  gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
                  icon={<NavIcon name="check" className="w-5 h-5 text-white" />}
                />
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <QuickActionCard
                    icon={<NavIcon name="plus" className="w-5 h-5" />}
                    title="Book Now"
                    description="Schedule appointment"
                    to="/booking"
                    color="bg-teal-500"
                  />
                  <QuickActionCard
                    icon={<NavIcon name="doctor" className="w-5 h-5" />}
                    title="Find Doctor"
                    description="Browse specialists"
                    to="/doctors"
                    color="bg-emerald-500"
                  />
                  <QuickActionCard
                    icon={<NavIcon name="services" className="w-5 h-5" />}
                    title="Services"
                    description="View treatments"
                    to="/services"
                    color="bg-violet-500"
                  />
                  <QuickActionCard
                    icon={<NavIcon name="profile" className="w-5 h-5" />}
                    title="My Profile"
                    description="Manage account"
                    to="/profile"
                    color="bg-blue-500"
                  />
                </div>
              </div>

              {/* Recent Appointments */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">My Appointments</h2>
                  <Link to="/booking" className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
                    Book New
                    <NavIcon name="chevronRight" className="w-4 h-4" />
                  </Link>
                </div>
                <div className="p-4">
                  {recentAppointments.length === 0 ? (
                    <EmptyState
                      icon="calendar"
                      title="No appointments yet"
                      description="Book your first appointment with our specialists"
                      action={
                        <Link to="/booking" className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors">
                          Book Appointment
                        </Link>
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      {recentAppointments.map((apt, i) => (
                        <AppointmentCard key={apt.id || i} appointment={apt} isPatient={true} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Health Tips Banner */}
              <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Stay Healthy</h3>
                    <p className="text-teal-100 text-sm max-w-md">
                      Regular check-ups help detect potential health issues early. Book an appointment with our specialists today.
                    </p>
                  </div>
                  <Link 
                    to="/booking"
                    className="flex items-center gap-2 px-4 py-2 bg-white text-teal-600 text-sm font-semibold rounded-lg hover:bg-teal-50 transition-colors"
                  >
                    Book Now
                    <NavIcon name="arrowRight" className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-100 bg-white px-4 sm:px-6 py-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">MedBook Pro - Clinic Appointment Management System</p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <NavIcon name="shield" className="w-4 h-4 text-emerald-500" />
                Secure
              </span>
              <span>•</span>
              <span>© 2024</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;

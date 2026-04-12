import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../auth/store/authSlice';
import { fetchMyAppointments } from '../../appointments/store/appointmentSlice';
import { fetchAllAppointments, fetchAllUsers, fetchAllDoctors, fetchAllServices } from '../../admin/store/adminSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { appointments } = useSelector((state) => state.appointments);
  const { users, doctors, appointments: adminAppointments, services } = useSelector((state) => state.admin);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const userName = user?.firstName || user?.first_name || user?.username || 'User';

  const navItems = isStaff ? [
    { icon: 'dashboard', label: 'Dashboard', path: '/admin' },
    ...(isAdmin ? [{ icon: 'users', label: 'Users', path: '/admin/users' }] : []),
    { icon: 'doctor', label: 'Doctors', path: '/admin/doctors' },
    { icon: 'calendar', label: 'Appointments', path: '/admin/appointments' },
    { icon: 'services', label: 'Services', path: '/admin/services' },
  ] : [
    { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { icon: 'plus', label: 'Book Appointment', path: '/booking' },
    { icon: 'doctor', label: 'Find Doctors', path: '/doctors' },
    { icon: 'services', label: 'Services', path: '/services' },
    { icon: 'profile', label: 'My Profile', path: '/profile' },
  ];

  const StatusBadge = ({ status }) => {
    const styles = {
      completed: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      confirmed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-rose-100 text-rose-700',
    };
    return <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">MedBook</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">MedBook</span>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item, i) => (
            <Link
              key={i}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-teal-50 hover:text-teal-600 rounded-xl transition-colors"
            >
              <NavIcon name={item.icon} className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
            <NavIcon name="logout" className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 flex-col">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">MedBook</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item, i) => (
            <Link
              key={i}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-teal-50 hover:text-teal-600 rounded-xl transition-colors"
            >
              <NavIcon name={item.icon} className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
            <NavIcon name="logout" className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {/* Desktop Header */}
        <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-end px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{getGreeting()}, {userName}</p>
                <p className="text-xs text-gray-500">{isAdmin ? 'Administrator' : isReceptionist ? 'Receptionist' : 'Patient'}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              {isStaff ? 'Admin Dashboard' : 'My Dashboard'}
            </h1>
            <p className="text-sm lg:text-base text-gray-500">
              {isStaff ? 'Manage your clinic operations' : 'Track your appointments and health'}
            </p>
          </div>

          {/* Admin/Receptionist Content */}
          {isStaff && (
            <div className="space-y-6">
              <div className={`grid gap-4 lg:gap-6 ${isAdmin ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-3'}`}>
                {isAdmin && (
                  <StatCard title="Users" value={users?.length || 0} icon={<NavIcon name="users" className="w-7 h-7 text-teal-600" />} bgColor="bg-teal-50" />
                )}
                <StatCard title="Doctors" value={doctors?.length || 0} icon={<NavIcon name="doctor" className="w-7 h-7 text-green-600" />} bgColor="bg-green-50" />
                <StatCard title="Appointments" value={adminAppointments?.length || 0} icon={<NavIcon name="calendar" className="w-7 h-7 text-blue-600" />} bgColor="bg-blue-50" />
                <StatCard title="Services" value={services?.length || 0} icon={<NavIcon name="services" className="w-7 h-7 text-purple-600" />} bgColor="bg-purple-50" />
              </div>

              <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Appointments</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="text-left text-xs lg:text-sm text-gray-500 border-b">
                        <th className="pb-3 font-medium">Patient</th>
                        <th className="pb-3 font-medium">Doctor</th>
                        <th className="pb-3 font-medium hidden sm:table-cell">Service</th>
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminAppointments?.slice(0, 5).map((apt, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0">
                          <td className="py-3 text-sm">{apt.patient_name || 'N/A'}</td>
                          <td className="py-3 text-sm">Dr. {apt.doctor_name || 'N/A'}</td>
                          <td className="py-3 text-sm hidden sm:table-cell">{apt.service_name || 'N/A'}</td>
                          <td className="py-3 text-sm">{apt.date || 'N/A'}</td>
                          <td className="py-3"><StatusBadge status={apt.status} /></td>
                        </tr>
                      ))}
                      {!adminAppointments?.length && (
                        <tr><td colSpan="5" className="py-8 text-center text-gray-400 text-sm">No appointments yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Patient Content */}
          {isPatient && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3 lg:gap-6">
                <StatCard title="Total" value={appointments?.length || 0} icon={<NavIcon name="calendar" className="w-6 h-6 lg:w-7 lg:h-7 text-blue-600" />} bgColor="bg-blue-50" compact />
                <StatCard title="Done" value={appointments?.filter(a => a.status === 'completed').length || 0} icon={<NavIcon name="check" className="w-6 h-6 lg:w-7 lg:h-7 text-green-600" />} bgColor="bg-green-50" compact />
                <StatCard title="Upcoming" value={appointments?.filter(a => a.status === 'pending' || a.status === 'confirmed').length || 0} icon={<NavIcon name="clock" className="w-6 h-6 lg:w-7 lg:h-7 text-amber-600" />} bgColor="bg-amber-50" compact />
              </div>

              <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">My Appointments</h2>
                <div className="space-y-3 lg:space-y-4">
                  {appointments?.slice(0, 5).map((apt, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 lg:p-4 border border-gray-100 rounded-xl gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <NavIcon name="calendar" className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm lg:text-base">Dr. {apt.doctor_name || 'N/A'}</p>
                          <p className="text-xs lg:text-sm text-gray-500">{apt.service_name || 'N/A'} • {apt.date || 'N/A'}</p>
                        </div>
                      </div>
                      <StatusBadge status={apt.status} />
                    </div>
                  ))}
                  {!appointments?.length && (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-4 text-sm">No appointments yet</p>
                      <Link to="/booking" className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 text-sm">Book Now</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-4 lg:px-6 py-4">
          <p className="text-center text-xs lg:text-sm text-gray-500">MedBook Pro - Clinic Appointment Management System</p>
        </footer>
      </main>
    </div>
  );
};

const NavIcon = ({ name, className }) => {
  const icons = {
    dashboard: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    users: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    doctor: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    calendar: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    services: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    plus: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    profile: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    logout: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    check: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    clock: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  };
  return icons[name] || null;
};

const StatCard = ({ title, value, icon, bgColor, compact }) => (
  <div className={`${bgColor} rounded-xl lg:rounded-2xl p-4 lg:p-6`}>
    <div className={`flex items-center ${compact ? 'gap-3' : 'gap-4'}`}>
      <div className={`${compact ? 'w-10 h-10 lg:w-14 lg:h-14' : 'w-14 h-14'} rounded-xl lg:rounded-2xl bg-white flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className={`${compact ? 'text-xl lg:text-2xl' : 'text-2xl lg:text-3xl'} font-bold text-gray-900`}>{value}</p>
        <p className="text-xs lg:text-sm text-gray-500">{title}</p>
      </div>
    </div>
  </div>
);

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardStats, fetchAllAppointments, fetchAllUsers, fetchAllDoctors, fetchAllServices, createUser, updateUser, deleteUser, createDoctor, updateDoctor, deleteDoctor, createService, updateService, deleteService } from '../store/adminSlice';
import { logoutUser, updateProfile, fetchCurrentUser } from '../../auth/store/authSlice';
import { fetchAllAppointments as fetchAppointments, fetchMyAppointments } from '../../appointments/store/appointmentSlice';
import { useToast } from '../../../components/ui/Toast';
import api from '../../../shared/services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const NavIcon = ({ name, className }) => {
  const icons = {
    dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    doctor: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    medical: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    services: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />,
    logout: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
    bell: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
    menu: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />,
    close: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
    edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    shield: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    prescription: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />,
    profile: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    home: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    settings: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.3-.92 1.273-1.317 2.053-.658l1.092.873c.67.537 1.432 1.05 2.07 1.05 1.795 0 3.454-2.155 3.454-4.04a4.325 4.325 0 00-4.04-4.278c-.92-.3-1.317 1.273-.658 2.053l-.873 1.092c-.537.67-1.05 1.432-1.05 2.07 0 1.795-2.155 3.454-4.04 3.454-.638 0-1.252-.16-1.8-.443m-6.338 4.855c.3.92 1.273 1.317 2.053.658l1.092-.873c.67-.537 1.432-1.05 2.07-1.05 1.795 0 3.454 2.155 3.454 4.04 0 .864-.293 1.65-.79 2.258" />,
    folder: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />,
    currency: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0-1v-1m0 1h-2.599M5.316 11.383a9 9 0 011.828 0M5.316 11.383l-.707.707m0 0l.707.707m-.707-.707l-.707-.707m.707.707l.707.707" />,
    document: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    flask: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />,
    badge: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />,
    star: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
  };
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[name]}</svg>;
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
  </div>
);

const MainDashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { appointments, users, doctors, services } = useSelector((state) => state.admin);
  const role = user?.role;

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = appointments.filter(a => a.date === dateStr).length;
      weekData.push({ day: days[date.getDay()], appointments: count });
    }
    return weekData;
  };

  const todayAppointments = appointments.filter(a => a.date === new Date().toISOString().split('T')[0]);
  const pendingAppts = appointments.filter(a => a.status === 'pending');
  const completedAppts = appointments.filter(a => a.status === 'completed');

  const StatCard = ({ title, value, icon, color, gradient, subtitle, trend }) => (
    <div className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-2xl ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <NavIcon name={icon} className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          Live
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(role === 'admin' || role === 'receptionist') && (
          <>
            <StatCard title="Total Users" value={users.length} icon="users" gradient="bg-gradient-to-br from-teal-500 to-teal-600" subtitle="Registered accounts" />
            <StatCard title="Doctors" value={doctors.length} icon="doctor" gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" subtitle="Active staff" />
            <StatCard title="Appointments" value={appointments.length} icon="calendar" gradient="bg-gradient-to-br from-blue-500 to-blue-600" subtitle="Total scheduled" />
            <StatCard title="Services" value={services.length} icon="services" gradient="bg-gradient-to-br from-violet-500 to-violet-600" subtitle="Available" />
          </>
        )}
        {role === 'patient' && (
          <>
            <StatCard title="My Appointments" value={appointments.length} icon="calendar" gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
            <StatCard title="Pending" value={pendingCount} icon="calendar" gradient="bg-gradient-to-br from-amber-500 to-amber-600" subtitle="Awaiting confirmation" />
            <StatCard title="Completed" value={completedCount} icon="check" gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" subtitle="Seen by doctor" />
          </>
        )}
        {role === 'doctor' && (
          <>
            <StatCard title="Today's Patients" value={todayAppointments.length} icon="calendar" gradient="bg-gradient-to-br from-blue-500 to-blue-600" subtitle="Scheduled today" />
            <StatCard title="Pending Consults" value={pendingCount} icon="calendar" gradient="bg-gradient-to-br from-amber-500 to-amber-600" subtitle="Awaiting you" />
            <StatCard title="Completed" value={completedCount} icon="check" gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" subtitle="This month" />
            <StatCard title="Patients" value={doctors.length} icon="users" gradient="bg-gradient-to-br from-violet-500 to-violet-600" subtitle="Total seen" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Appointment Trends</h3>
            <span className="text-xs text-gray-400">Last 7 days</span>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={getWeeklyData()}>
                <defs>
                  <linearGradient id="colorWeek" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [value, 'Appointments']}
                />
                <Area type="monotone" dataKey="appointments" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorWeek)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Appointments</h3>
            <span className="text-xs text-gray-400">{appointments.length} total</span>
          </div>
          <div className="p-4 max-h-80 overflow-y-auto">
            {appointments.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-gray-400">
                <NavIcon name="calendar" className="w-12 h-12 mb-3 text-gray-200" />
                <p className="text-sm">No appointments yet</p>
                <p className="text-xs mt-1">Schedule your first appointment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 6).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {(apt.patient_name || 'P')[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{apt.patient_name}</p>
                        <p className="text-xs text-gray-500">Dr. {apt.doctor_name} • {apt.date}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      apt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      apt.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{apt.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-5 text-white">
          <h4 className="font-semibold text-teal-100 text-sm">Pending Appointments</h4>
          <p className="text-3xl font-bold mt-2">{pendingCount}</p>
          <p className="text-teal-100 text-sm mt-1">Awaiting confirmation</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
          <h4 className="font-semibold text-emerald-100 text-sm">Completed</h4>
          <p className="text-3xl font-bold mt-2">{completedCount}</p>
          <p className="text-emerald-100 text-sm mt-1">This month</p>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-5 text-white">
          <h4 className="font-semibold text-rose-100 text-sm">Cancelled</h4>
          <p className="text-3xl font-bold mt-2">{cancelledCount}</p>
          <p className="text-rose-100 text-sm mt-1">No show/cancelled</p>
        </div>
      </div>

      {role === 'patient' && (
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Need to see a doctor?</h3>
              <p className="text-teal-100 mt-1">Book an appointment with one of our specialists</p>
            </div>
            <button onClick={() => window.dispatchEvent(new CustomEvent('navigateToMenu', { detail: 'book' }))} className="px-6 py-3 bg-white text-teal-600 rounded-xl font-medium hover:bg-teal-50 transition-colors">
              Book Appointment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const UsersManagement = ({ openModal, handleDelete, isAdmin }) => {
  const { users, usersLoading } = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredUsers = users.filter(u => 
    (u.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700',
    doctor: 'bg-emerald-100 text-emerald-700',
    receptionist: 'bg-blue-100 text-blue-700',
    patient: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <NavIcon name="search" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
        </div>
        {isAdmin && (
          <button onClick={() => openModal('user')} className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm hover:shadow transition-all">
            <NavIcon name="plus" className="w-5 h-5" /> Add User
          </button>
        )}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {usersLoading ? <LoadingSpinner /> : filteredUsers.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <NavIcon name="users" className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No users found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((u, idx) => (
                <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-sm">{(u.first_name || 'U')[0]}{(u.last_name || '')[0]}</div>
                      <div>
                        <p className="font-medium text-gray-900">{u.first_name} {u.last_name}</p>
                        <p className="text-xs text-gray-400">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{u.email}</p>
                    <p className="text-xs text-gray-400">{u.phone || 'No phone'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${roleColors[u.role] || 'bg-gray-100 text-gray-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal('user', u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <NavIcon name="edit" className="w-4 h-4" />
                      </button>
                      {isAdmin && <button onClick={() => handleDelete('user', u.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                        <NavIcon name="trash" className="w-4 h-4" />
                      </button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const DoctorsManagement = ({ openModal, handleDelete }) => {
  const { doctors, doctorsLoading } = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredDoctors = doctors.filter(d =>
    (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.specialty || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const doctorName = (d) => d.first_name || d.last_name ? `${d.first_name || ''} ${d.last_name || ''}`.trim() : d.name || 'Doctor';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <NavIcon name="search" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search doctors..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
        </div>
        <button onClick={() => openModal('doctor')} className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm hover:shadow transition-all">
          <NavIcon name="plus" className="w-5 h-5" /> Add Doctor
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {doctorsLoading ? <LoadingSpinner /> : filteredDoctors.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <NavIcon name="doctor" className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No doctors found</p>
            <p className="text-sm text-gray-400 mt-1">Add your first doctor to get started</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Specialty</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Consultation</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredDoctors.map((d, idx) => (
                <tr key={d.id} className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {d.profileImage ? (
                        <img src={d.profileImage} alt="Doctor" className="w-11 h-11 rounded-xl object-cover shadow-sm" />
                      ) : (
                        <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                          {(d.first_name || d.user?.firstName || 'D')[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">Dr. {doctorName(d)}</p>
                        <p className="text-xs text-gray-400">{d.qualification || 'No qualification'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
                      {d.specialty || 'General Medicine'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-emerald-600">₦{(d.consultation_fee || d.consultationFee || 5000).toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    {d.isAvailable ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-xs font-medium">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                        Unavailable
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal('doctor', d)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <NavIcon name="edit" className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete('doctor', d.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                        <NavIcon name="trash" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const ServicesManagement = ({ openModal, handleDelete }) => {
  const { services, servicesLoading } = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredServices = services.filter(s =>
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <NavIcon name="search" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search services..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
        </div>
        <button onClick={() => openModal('service')} className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm hover:shadow transition-all">
          <NavIcon name="plus" className="w-5 h-5" /> Add Service
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {servicesLoading ? <LoadingSpinner /> : filteredServices.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <NavIcon name="services" className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No services found</p>
            <p className="text-sm text-gray-400 mt-1">Add clinic services to offer</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredServices.map((s, idx) => (
                <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{s.name}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{s.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                      <NavIcon name="calendar" className="w-3 h-3" />
                      {s.duration} min
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-violet-600">₦{(s.price || 0).toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal('service', s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <NavIcon name="edit" className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete('service', s.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                        <NavIcon name="trash" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const AppointmentsManagement = () => {
  const { appointments, appointmentsLoading } = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredAppointments = appointments.filter(apt =>
    searchTerm === '' ||
    (apt.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (apt.doctor_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusStyles = {
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <NavIcon name="search" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search appointments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
          {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {appointmentsLoading ? <LoadingSpinner /> : filteredAppointments.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <NavIcon name="calendar" className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No appointments found</p>
            <p className="text-sm text-gray-400 mt-1">Schedule appointments to see them here</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAppointments.map((apt, idx) => (
                <tr key={apt.id} className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-semibold">
                        {(apt.patient_name || 'P')[0]}
                      </div>
                      <p className="font-medium text-gray-900">{apt.patient_name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-700">Dr. {apt.doctor_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-700">{apt.service_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700">{apt.date}</p>
                    <p className="text-xs text-gray-400">{apt.start_time}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusStyles[apt.status] || 'bg-gray-100 text-gray-700'}`}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const BookAppointmentPage = ({ user, onBookComplete }) => {
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, servicesRes] = await Promise.all([
          api.get('/doctors'),
          api.get('/services')
        ]);
        setDoctors(doctorsRes.data || []);
        setServices(servicesRes.data || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBook = async () => {
    if (!selectedDoctor || !selectedService || !selectedDate || !selectedTime) {
      return;
    }
    setBooking(true);
    try {
      await api.post('/appointments', {
        doctor_id: selectedDoctor.id,
        service_id: selectedService.id,
        date: selectedDate,
        start_time: selectedTime,
        notes
      });
      toast.success('Appointment booked successfully!');
      onBookComplete?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  const availableDoctors = doctors.filter(d => d.isAvailable);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Book Appointment</h2>
        <p className="text-gray-500 text-sm mb-6">Schedule a visit with one of our specialists</p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableDoctors.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoctor(doc)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedDoctor?.id === doc.id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {doc.profileImage ? (
                      <img src={doc.profileImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-semibold">
                        {(doc.first_name || doc.name || 'D')[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">Dr. {doc.first_name || doc.last_name || doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.specialty}</p>
                      <p className="text-sm text-emerald-600 font-medium">₦{(doc.consultation_fee || doc.consultationFee || 5000).toLocaleString()}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {availableDoctors.length === 0 && (
              <p className="text-gray-500 text-center py-8">No doctors available</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Service</label>
            <select
              value={selectedService?.id || ''}
              onChange={(e) => setSelectedService(services.find(s => s.id === e.target.value) || null)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="">Select a service</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} - ₦{s.price?.toLocaleString()}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="">Select time</option>
                {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Describe your symptoms or reason for visit..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <button
            onClick={handleBook}
            disabled={booking || !selectedDoctor || !selectedService || !selectedDate || !selectedTime}
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium disabled:opacity-50 hover:from-teal-600 hover:to-teal-700 transition-all"
          >
            {booking ? 'Booking...' : `Book Appointment - ₦${(selectedDoctor?.consultation_fee || selectedDoctor?.consultationFee || 0).toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
};

const PrescriptionsPage = ({ user }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await api.get('/appointments/prescriptions');
        setPrescriptions(res.data || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">My Prescriptions</h2>
        <p className="text-gray-500 text-sm mb-6">View your prescriptions from appointments</p>

        {prescriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <NavIcon name="shield" className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No prescriptions yet</p>
            <p className="text-sm text-gray-400 mt-1">Prescriptions will appear after your appointments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">Dr. {rx.doctor_name}</p>
                    <p className="text-xs text-gray-500">{rx.date}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    Completed
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{rx.prescription || 'No prescription details'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MyPatientsPage = ({ user }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get('/appointments/patients');
        setPatients(res.data || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'doctor') {
      fetchPatients();
    }
  }, [user?.role]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">My Patients</h2>
        <p className="text-gray-500 text-sm mb-6">Patients you've treated</p>

        {patients.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <NavIcon name="users" className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No patients yet</p>
            <p className="text-sm text-gray-400 mt-1">Patients will appear after appointments</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patients.map((patient) => (
              <div key={patient.id} className="p-4 bg-gray-50 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white font-semibold">
                  {(patient.patient_name || 'P')[0]}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{patient.patient_name}</p>
                  <p className="text-xs text-gray-500">{patient.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DoctorSchedulePage = ({ user }) => {
  const [schedule, setSchedule] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    setSchedule(user?.doctorProfile?.schedule || {});
  }, [user?.doctorProfile?.schedule]);

  const handleToggleDay = (day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day]?.available === false ? { available: true, start: '09:00', end: '17:00' } : { available: false }
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', { working_hours: schedule });
      toast.success('Schedule updated');
    } catch (error) {
      toast.error('Failed to update schedule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">My Schedule</h2>
        <p className="text-gray-500 text-sm mb-6">Set your availability for each day</p>

        <div className="space-y-3">
          {days.map((day) => (
            <div key={day} className={`p-4 rounded-xl border ${schedule[day]?.available ? 'bg-gray-50 border-gray-200' : 'bg-gray-50/50 border-gray-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={schedule[day]?.available !== false}
                    onChange={() => handleToggleDay(day)}
                    className="w-5 h-5 text-teal-600 rounded"
                  />
                  <span className="font-medium text-gray-900">{day}</span>
                </div>
                {schedule[day]?.available !== false && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={schedule[day]?.start || '09:00'}
                      onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="time"
                      value={schedule[day]?.end || '17:00'}
                      onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>
    </div>
  );
};

const WritePrescriptionPage = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescription, setPrescription] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments?status=completed');
        setAppointments(res.data || []);
      } catch (error) {
      }
    };
    if (user?.role === 'doctor') {
      fetchAppointments();
    }
  }, [user?.role]);

  const handleSavePrescription = async () => {
    if (!selectedAppointment || !prescription) return;
    setSaving(true);
    try {
      await api.put(`/appointments/${selectedAppointment.id}`, {
        prescription,
        status: 'completed'
      });
      toast.success('Prescription saved');
      setSelectedAppointment(null);
      setPrescription('');
    } catch (error) {
      toast.error('Failed to save prescription');
    } finally {
      setSaving(false);
    }
  };

  const completedAppointments = appointments.filter(a => !a.prescription);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Write Prescription</h2>
        <p className="text-gray-500 text-sm mb-6">Select an appointment to write prescription</p>

        {completedAppointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <NavIcon name="medical" className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No appointments pending</p>
            <p className="text-sm text-gray-400 mt-1">All completed appointments have prescriptions</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {completedAppointments.map((apt) => (
                <button
                  key={apt.id}
                  onClick={() => {
                    setSelectedAppointment(apt);
                    setPrescription(apt.prescription || '');
                  }}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedAppointment?.id === apt.id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{apt.patient_name}</p>
                      <p className="text-sm text-gray-500">{apt.date} at {apt.start_time}</p>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Pending</span>
                  </div>
                </button>
              ))}
            </div>

            {selectedAppointment && (
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Prescription Details</label>
                <textarea
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  rows={6}
                  placeholder="Enter prescription details, medications, dosage, instructions..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <button
                  onClick={handleSavePrescription}
                  disabled={saving || !prescription}
                  className="mt-4 w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Prescription'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const PatientsListPage = () => {
  const { appointments } = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  
  const patients = appointments.reduce((acc, apt) => {
    if (!acc.find(p => p.patient_name === apt.patient_name)) {
      acc.push({ name: apt.patient_name, email: apt.patient_email, phone: apt.patient_phone });
    }
    return acc;
  }, []);

  const filteredPatients = patients.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Patients</h2>
        <p className="text-gray-500 text-sm mb-6">All registered patients</p>
        
        <div className="relative flex-1 max-w-md mb-6">
          <NavIcon name="search" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search patients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
        </div>

        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <NavIcon name="users" className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No patients found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPatients.map((patient, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-white font-semibold">
                  {(patient.name || 'P')[0]}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{patient.name}</p>
                  <p className="text-xs text-gray-500">{patient.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ReportsPage = () => {
  const { appointments, users, doctors, services } = useSelector((state) => state.admin);
  const [dateRange, setDateRange] = useState('week');
  
  const totalRevenue = appointments.filter(a => a.status === 'completed').length * 5000;
  const pendingAppts = appointments.filter(a => a.status === 'pending').length;
  const completedAppts = appointments.filter(a => a.status === 'completed').length;
  
  const ReportCard = ({ title, value, subtitle, color }) => (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white`}>
      <p className="text-white/80 text-sm">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      <p className="text-white/70 text-sm mt-1">{subtitle}</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reports</h2>
          <p className="text-gray-500 text-sm">Clinic performance overview</p>
        </div>
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-xl">
          <option value="week">Last 7 Days</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard title="Total Users" value={users.length} subtitle="Registered" color="from-teal-500 to-teal-600" />
        <ReportCard title="Doctors" value={doctors.length} subtitle="Active staff" color="from-emerald-500 to-emerald-600" />
        <ReportCard title="Completed" value={completedAppts} subtitle="Appointments" color="from-blue-500 to-blue-600" />
        <ReportCard title="Pending" value={pendingAppts} subtitle="Awaiting" color="from-amber-500 to-amber-600" />
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-900">{services.length}</p>
            <p className="text-sm text-gray-500">Services</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
            <p className="text-sm text-gray-500">Total Appointments</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-900">₦{totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Est. Revenue</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-900">{users.length > 0 ? Math.round((completedAppts / users.length) * 100) : 0}%</p>
            <p className="text-sm text-gray-500">Visit Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const toast = useToast();
  const [clinicName, setClinicName] = useState('MedBook Pro');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      toast.success('Settings saved');
      setSaving(false);
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Settings</h2>
        <p className="text-gray-500 text-sm mb-6">Configure clinic settings</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
            <input type="text" value={clinicName} onChange={(e) => setClinicName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Consultation Fee (₦)</label>
            <input type="number" defaultValue={5000} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours</label>
            <div className="grid grid-cols-2 gap-4">
              <input type="time" defaultValue="09:00" className="px-4 py-2.5 border border-gray-200 rounded-xl" />
              <input type="time" defaultValue="17:00" className="px-4 py-2.5 border border-gray-200 rounded-xl" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-5 h-5 text-teal-600 rounded" />
            <label className="text-sm text-gray-700">Enable email notifications</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-5 h-5 text-teal-600 rounded" />
            <label className="text-sm text-gray-700">Enable SMS notifications</label>
          </div>
        </div>
        
        <button onClick={handleSave} disabled={saving} className="mt-6 w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

const MedicalRecordsPage = ({ user }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ allergies: '', conditions: '', medications: '', notes: '' });
  const toast = useToast();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await api.get('/medical-records');
        setRecords(res.data || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const handleSave = async () => {
    try {
      if (selectedPatient?.id) {
        await api.put(`/medical-records/${selectedPatient.id}`, formData);
        toast.success('Medical record updated');
      } else {
        await api.post('/medical-records', formData);
        toast.success('Medical record created');
      }
      setShowModal(false);
      const res = await api.get('/medical-records');
      setRecords(res.data || []);
    } catch (error) {
      toast.error('Failed to save record');
    }
  };

  const openRecord = (record) => {
    setSelectedPatient(record);
    setFormData({
      allergies: record?.allergies || '',
      conditions: record?.conditions || '',
      medications: record?.medications || '',
      notes: record?.notes || ''
    });
    setShowModal(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Medical Records</h2>
            <p className="text-gray-500 text-sm">Patient medical history and health info</p>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <NavIcon name="folder" className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No medical records</p>
            <p className="text-sm text-gray-400 mt-1">Records will appear after appointments</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {records.map((record) => (
              <div key={record.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center text-white font-semibold">
                    {(record.patient_name || 'P')[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{record.patient_name}</p>
                    <p className="text-xs text-gray-500">Last visit: {record.last_visit || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {record.allergies && <p className="text-rose-600"><span className="font-medium">Allergies:</span> {record.allergies}</p>}
                  {record.conditions && <p className="text-amber-600"><span className="font-medium">Conditions:</span> {record.conditions}</p>}
                  {record.medications && <p className="text-blue-600"><span className="font-medium">Medications:</span> {record.medications}</p>}
                </div>
                <button onClick={() => openRecord(record)} className="mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium">
                  View/Edit →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-4">
              <button onClick={() => setShowModal(false)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-white/80 hover:text-white">
                <NavIcon name="close" className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-white">Medical Record</h2>
              <p className="text-rose-100 text-sm">{selectedPatient?.patient_name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                <textarea value={formData.allergies} onChange={(e) => setFormData({...formData, allergies: e.target.value})} rows={2} placeholder="List any allergies..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
                <textarea value={formData.conditions} onChange={(e) => setFormData({...formData, conditions: e.target.value})} rows={2} placeholder="Diabetes, Hypertension, etc..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications</label>
                <textarea value={formData.medications} onChange={(e) => setFormData({...formData, medications: e.target.value})} rows={2} placeholder="Current medications..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={3} placeholder="Additional notes..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
              </div>
              <button onClick={handleSave} className="w-full py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-medium">
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/payments');
        setPayments(res.data || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filteredPayments = filter === 'all' ? payments : payments.filter(p => p.status === filter);
  const totalAmount = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidAmount = filteredPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingAmount = filteredPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-5 text-white">
          <p className="text-white/80 text-sm">Total Transactions</p>
          <p className="text-3xl font-bold mt-1">₦{totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
          <p className="text-white/80 text-sm">Paid</p>
          <p className="text-3xl font-bold mt-1">₦{paidAmount.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white">
          <p className="text-white/80 text-sm">Pending</p>
          <p className="text-3xl font-bold mt-1">₦{pendingAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-xl">
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <NavIcon name="currency" className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{payment.patient_name}</td>
                    <td className="px-4 py-3 text-gray-600">{payment.service_name}</td>
                    <td className="px-4 py-3 font-medium text-emerald-600">₦{(payment.amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">{payment.date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                        payment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await api.get('/invoices');
        setInvoices(res.data || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Invoices</h2>
        <p className="text-gray-500 text-sm mb-6">Billing and invoices</p>

        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <NavIcon name="document" className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No invoices yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
                    #
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">INV-{invoice.id?.slice(-6)}</p>
                    <p className="text-sm text-gray-500">{invoice.patient_name} • {invoice.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₦{(invoice.amount || 0).toLocaleString()}</p>
                  <p className={`text-xs ${invoice.paid ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {invoice.paid ? 'Paid' : 'Pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const LabResultsPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ patient_name: '', test_type: '', results: '', file: null });
  const toast = useToast();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get('/lab-results');
        setResults(res.data || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const handleUpload = async () => {
    try {
      await api.post('/lab-results', formData);
      toast.success('Lab result uploaded');
      setShowModal(false);
      const res = await api.get('/lab-results');
      setResults(res.data || []);
    } catch (error) {
      toast.error('Failed to upload');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Lab Results</h2>
            <p className="text-gray-500 text-sm">Upload and view lab reports</p>
          </div>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">
            Upload Result
          </button>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <NavIcon name="flask" className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No lab results</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((r) => (
              <div key={r.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-violet-600 rounded-lg flex items-center justify-center text-white">
                    <NavIcon name="flask" className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{r.patient_name}</p>
                    <p className="text-xs text-gray-500">{r.test_type} • {r.date}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">{r.results}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Upload Lab Result</h3>
            <input type="text" placeholder="Patient Name" value={formData.patient_name} onChange={(e) => setFormData({...formData, patient_name: e.target.value})} className="w-full mb-3 px-4 py-2 border rounded-xl" />
            <input type="text" placeholder="Test Type (e.g. Blood Test)" value={formData.test_type} onChange={(e) => setFormData({...formData, test_type: e.target.value})} className="w-full mb-3 px-4 py-2 border rounded-xl" />
            <textarea placeholder="Results" value={formData.results} onChange={(e) => setFormData({...formData, results: e.target.value})} className="w-full mb-3 px-4 py-2 border rounded-xl" rows={3} />
            <div className="flex gap-3">
              <button onClick={handleUpload} className="flex-1 py-2 bg-teal-500 text-white rounded-xl">Upload</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const WaitlistPage = () => {
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWaitlist = async () => {
      try {
        const res = await api.get('/waitlist');
        setWaitlist(res.data || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchWaitlist();
  }, []);

  const handleRemove = async (id) => {
    try {
      await api.delete(`/waitlist/${id}`);
      setWaitlist(waitlist.filter(w => w.id !== id));
    } catch (error) {}
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Waitlist</h2>
        <p className="text-gray-500 text-sm mb-6">Patients waiting for available slots</p>

        {waitlist.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <NavIcon name="clock" className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No one on waitlist</p>
          </div>
        ) : (
          <div className="space-y-3">
            {waitlist.map((w) => (
              <div key={w.id} className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{w.patient_name}</p>
                  <p className="text-sm text-gray-500">{w.preferred_date} • {w.service}</p>
                </div>
                <button onClick={() => handleRemove(w.id)} className="text-rose-600 hover:bg-rose-50 px-3 py-1 rounded-lg text-sm">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StaffManagementPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ email: '', role: 'receptionist', firstName: '', lastName: '' });
  const toast = useToast();

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await api.get('/users?role=receptionist');
        setStaff(res.data || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const handleInvite = async () => {
    try {
      await api.post('/auth/invite-staff', formData);
      toast.success('Invitation sent');
      setShowModal(false);
      setFormData({ email: '', role: 'receptionist', firstName: '', lastName: '' });
    } catch (error) {
      toast.error('Failed to send invite');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Staff Management</h2>
            <p className="text-gray-500 text-sm">Manage clinic staff</p>
          </div>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">Add Staff</button>
        </div>

        {staff.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <NavIcon name="badge" className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No staff members</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staff.map((s) => (
              <div key={s.id} className="p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
                  {(s.first_name || s.email || 'S')[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{s.first_name} {s.last_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{s.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Invite Staff</h3>
            <input type="text" placeholder="First Name" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full mb-3 px-4 py-2 border rounded-xl" />
            <input type="text" placeholder="Last Name" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full mb-3 px-4 py-2 border rounded-xl" />
            <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full mb-3 px-4 py-2 border rounded-xl" />
            <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full mb-4 px-4 py-2 border rounded-xl">
              <option value="receptionist">Receptionist</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex gap-3">
              <button onClick={handleInvite} className="flex-1 py-2 bg-teal-500 text-white rounded-xl">Send Invite</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NotificationsPage = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}`, { read: true });
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {}
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Notifications</h2>
        <p className="text-gray-500 text-sm mb-6">Your recent notifications</p>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <NavIcon name="bell" className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-4 rounded-xl cursor-pointer ${n.read ? 'bg-gray-50' : 'bg-teal-50 border-l-4 border-teal-500'}`}>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{n.title}</p>
                  <span className="text-xs text-gray-500">{n.time}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const FeedbackPage = ({ user }) => {
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const toast = useToast();

  const handleSubmit = async () => {
    try {
      await api.post('/feedback', { rating, comment, userId: user?.id });
      toast.success('Thank you for your feedback!');
      setSubmitted(true);
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <NavIcon name="check" className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Thank You!</h2>
          <p className="text-gray-500 mt-2">Your feedback has been submitted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Rate Your Visit</h2>
        <p className="text-gray-500 text-sm mb-6">Help us improve our service</p>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Rating</p>
          <div className="flex gap-2">
            {[1,2,3,4,5].map((star) => (
              <button key={star} onClick={() => setRating(star)} className="p-2">
                <NavIcon name="star" className={`w-8 h-8 ${rating >= star ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Comments (Optional)</p>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="Tell us about your experience..." className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
        </div>

        <button onClick={handleSubmit} className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium">
          Submit Feedback
        </button>
      </div>
    </div>
  );
};

const ProfileView = ({ user, userName, userInitials, updateProfile, toast, dispatch }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    username: user?.username || '',
    first_name: user?.firstName || '',
    last_name: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    date_of_birth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    gender: user?.gender || '',
    emergency_contact_name: user?.emergencyContactName || '',
    emergency_contact_phone: user?.emergencyContactPhone || '',
    emergency_contact_relationship: user?.emergencyContactRelationship || '',
    specialty: user?.doctorProfile?.specialty || '',
    qualification: user?.doctorProfile?.qualification || '',
    experience: user?.doctorProfile?.experience || '',
    consultationFee: user?.doctorProfile?.consultationFee || '',
    bio: user?.doctorProfile?.bio || '',
    isAvailable: user?.doctorProfile?.isAvailable !== false,
    working_hours: user?.doctorProfile?.schedule || {},
  });
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    setFormData({
      username: user?.username || '',
      first_name: user?.firstName || '',
      last_name: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      date_of_birth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      gender: user?.gender || '',
      emergency_contact_name: user?.emergencyContactName || '',
      emergency_contact_phone: user?.emergencyContactPhone || '',
      emergency_contact_relationship: user?.emergencyContactRelationship || '',
      specialty: user?.doctorProfile?.specialty || '',
      qualification: user?.doctorProfile?.qualification || '',
      experience: user?.doctorProfile?.experience || '',
      consultationFee: user?.doctorProfile?.consultationFee || '',
      bio: user?.doctorProfile?.bio || '',
      isAvailable: user?.doctorProfile?.isAvailable !== false,
      working_hours: user?.doctorProfile?.schedule || {},
    });
    setImagePreview(user?.profileImage || null);
  }, [user]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setImagePreview(reader.result);
        setUploadingImage(true);
        try {
          await updateProfile({ profileImage: reader.result });
          dispatch(fetchCurrentUser());
          toast.success('Profile image updated');
        } catch (error) {
          toast.error('Failed to update profile image');
          setImagePreview(user?.profileImage || null);
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setChangingPassword(true);
    try {
      await api.put('/auth/change-password', passwordForm);
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const roleColors = {
    admin: 'from-purple-500 to-purple-600',
    doctor: 'from-emerald-500 to-emerald-600',
    receptionist: 'from-blue-500 to-blue-600',
    patient: 'from-teal-500 to-teal-600',
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: 'profile' },
    { id: 'medical', label: 'Medical Info', icon: 'medical' },
    { id: 'security', label: 'Security', icon: 'shield' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className={`bg-gradient-to-r ${roleColors[user?.role] || 'from-teal-500 to-teal-600'} px-6 py-8`}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg" />
              ) : (
                <div className="w-32 h-32 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-bold text-white border-4 border-white">
                  {userInitials}
                </div>
              )}
              <label className={`absolute -bottom-1 -right-1 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploadingImage} />
                {uploadingImage ? (
                  <svg className="w-4 h-4 text-teal-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </label>
            </div>
            <div className="text-center md:text-left text-white flex-1">
              <h2 className="text-2xl font-bold">{userName}</h2>
              <p className="opacity-80">{user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm capitalize">{user?.role}</span>
            </div>
            <div className="flex gap-2">
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center gap-2">
                  <NavIcon name="edit" className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-b border-gray-100">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'security') {
                    setShowPasswordModal(true);
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium">
                Edit Profile
              </button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Enter phone number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
              </div>
<div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Enter address" />
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Emergency Contact</h4>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" value={formData.emergency_contact_name} onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Contact name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" value={formData.emergency_contact_phone} onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="+234..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                    <input type="text" value={formData.emergency_contact_relationship} onChange={(e) => setFormData({ ...formData, emergency_contact_relationship: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. Spouse, Parent" />
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <button type="button" onClick={() => setShowPasswordModal(true)} className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                    Change Password
                  </button>
                </div>
              
              {user?.role === 'doctor' && (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Doctor Information</h4>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                    <select value={formData.specialty || ''} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none">
                      <option value="">Select Specialty</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Ophthalmology">Ophthalmology</option>
                      <option value="ENT">ENT</option>
                      <option value="Gynecology">Gynecology</option>
                      <option value="Psychiatry">Psychiatry</option>
                      <option value="Oncology">Oncology</option>
                      <option value="Gastroenterology">Gastroenterology</option>
                      <option value="Pulmonology">Pulmonology</option>
                      <option value="Urology">Urology</option>
                      <option value="Nephrology">Nephrology</option>
                      <option value="Endocrinology">Endocrinology</option>
                      <option value="Rheumatology">Rheumatology</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                      <input type="text" value={formData.qualification || ''} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. MBBS, MD" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                      <input type="number" value={formData.experience || ''} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" min="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₦)</label>
                      <input type="number" value={formData.consultationFee || ''} onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" min="0" />
                    </div>
                    <div className="flex items-center pt-6">
                      <input type="checkbox" id="isAvailable" checked={formData.isAvailable} onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })} className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500" />
                      <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">Available for appointments</label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea value={formData.bio || ''} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Brief description about yourself..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <div key={day} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
                          <input type="checkbox" id={`${day}_available`} checked={formData.working_hours?.[day]?.available !== false} onChange={(e) => setFormData({ ...formData, working_hours: { ...formData.working_hours, [day]: { ...formData.working_hours?.[day], available: e.target.checked } } })} className="w-4 h-4 text-teal-600 rounded" />
                          <label htmlFor={`${day}_available`} className="text-sm w-20">{day}</label>
                          {formData.working_hours?.[day]?.available !== false && (
                            <>
                              <input type="time" value={formData.working_hours?.[day]?.start || '09:00'} onChange={(e) => setFormData({ ...formData, working_hours: { ...formData.working_hours, [day]: { ...formData.working_hours?.[day], start: e.target.value } } })} className="text-xs px-1 py-1 border border-gray-200 rounded" />
                              <span className="text-xs">-</span>
                              <input type="time" value={formData.working_hours?.[day]?.end || '17:00'} onChange={(e) => setFormData({ ...formData, working_hours: { ...formData.working_hours, [day]: { ...formData.working_hours?.[day], end: e.target.value } } })} className="text-xs px-1 py-1 border border-gray-200 rounded" />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors font-medium disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => { setIsEditing(false); setImagePreview(user?.profileImage || null); }} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
    <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500">Username</span>
                <span className="font-medium">{user?.username || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500">First Name</span>
                <span className="font-medium">{user?.firstName || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500">Last Name</span>
                <span className="font-medium">{user?.lastName || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium">{user?.phone || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500">Date of Birth</span>
                <span className="font-medium">{user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500">Gender</span>
                <span className="font-medium capitalize">{user?.gender || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500">Address</span>
                <span className="font-medium">{user?.address || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500">Account Created</span>
                <span className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not set'}</span>
              </div>
              {user?.lastLoginAt && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">Last Login</span>
                  <span className="font-medium">{new Date(user.lastLoginAt).toLocaleString()}</span>
                </div>
              )}
              
              {(user?.emergencyContactName || user?.emergencyContactPhone) && (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Emergency Contact</h4>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium">{user?.emergencyContactName || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium">{user?.emergencyContactPhone || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500">Relationship</span>
                    <span className="font-medium">{user?.emergencyContactRelationship || 'Not set'}</span>
                  </div>
                </>
              )}
              
              {user?.role === 'doctor' && user?.doctorProfile && (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Doctor Information</h4>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500">Specialty</span>
                    <span className="font-medium">{user.doctorProfile.specialty || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500">Qualification</span>
                    <span className="font-medium">{user.doctorProfile.qualification || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500">Experience</span>
                    <span className="font-medium">{user.doctorProfile.experience ? `${user.doctorProfile.experience} years` : 'Not set'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500">Consultation Fee</span>
                    <span className="font-medium text-teal-600">₦{user.doctorProfile.consultationFee?.toLocaleString() || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.doctorProfile.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.doctorProfile.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  {user.doctorProfile.bio && (
                    <div className="py-3">
                      <span className="text-gray-500 text-sm">Bio</span>
                      <p className="font-medium mt-1">{user.doctorProfile.bio}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-900">
              <button onClick={() => setShowPasswordModal(false)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors">
                <NavIcon name="close" className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-white">Change Password</h2>
              <p className="text-gray-300 text-sm mt-1">Ensure your account stays secure</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handlePasswordChange}
                  disabled={changingPassword || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password}
                  className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium disabled:opacity-50 hover:from-teal-600 hover:to-teal-700 transition-all"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MainDashboardWrapper = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  return <MainDashboard />;
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { appointments, users, doctors, services, loading, usersLoading, doctorsLoading, appointmentsLoading, servicesLoading } = useSelector((state) => state.admin);

  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});

  const isLoading = loading || usersLoading || doctorsLoading || appointmentsLoading || servicesLoading;
  const userName = user?.firstName || user?.first_name || user?.username || 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const isAdmin = user?.role === 'admin';
  const isReceptionist = user?.role === 'receptionist';
  const isStaff = isAdmin || isReceptionist;

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(fetchDashboardStats());
    dispatch(fetchAllAppointments());
    dispatch(fetchAllUsers());
    dispatch(fetchAllDoctors());
    dispatch(fetchAllServices());
  }, [dispatch, isAuthenticated]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard', roles: ['admin', 'receptionist', 'doctor', 'patient'] },
    { id: 'book', icon: 'plus', label: 'Book Appointment', roles: ['patient'] },
    { id: 'book-appointment', icon: 'plus', label: 'New Appointment', roles: ['admin', 'receptionist'] },
    { id: 'waitlist', icon: 'clock', label: 'Waitlist', roles: ['admin', 'receptionist'] },
    { id: 'prescriptions', icon: 'plus', label: 'Write Prescription', roles: ['doctor'] },
    { id: 'my-patients', icon: 'users', label: 'My Patients', roles: ['doctor'] },
    { id: 'schedule', icon: 'calendar', label: 'My Schedule', roles: ['doctor'] },
    { id: 'medical-records', icon: 'folder', label: 'Medical Records', roles: ['admin', 'receptionist', 'doctor'] },
    { id: 'lab-results', icon: 'flask', label: 'Lab Results', roles: ['admin', 'receptionist', 'doctor'] },
    { id: 'payments', icon: 'currency', label: 'Payments', roles: ['admin', 'receptionist'] },
    { id: 'invoices', icon: 'document', label: 'Invoices', roles: ['admin', 'receptionist'] },
    { id: 'prescriptions', icon: 'shield', label: 'Prescriptions', roles: ['patient'] },
    { id: 'feedback', icon: 'star', label: 'Feedback', roles: ['patient'] },
    { id: 'users', icon: 'users', label: 'Users', roles: ['admin'] },
    { id: 'doctors', icon: 'doctor', label: 'Doctors', roles: ['admin', 'receptionist'] },
    { id: 'patients', icon: 'users', label: 'Patients', roles: ['admin', 'receptionist'] },
    { id: 'staff', icon: 'badge', label: 'Staff', roles: ['admin'] },
    { id: 'services', icon: 'services', label: 'Services', roles: ['admin', 'receptionist'] },
    { id: 'appointments', icon: 'calendar', label: 'Appointments', roles: ['admin', 'receptionist', 'doctor', 'patient'] },
    { id: 'notifications', icon: 'bell', label: 'Notifications', roles: ['admin', 'receptionist', 'doctor', 'patient'] },
    { id: 'reports', icon: 'chart', label: 'Reports', roles: ['admin'] },
    { id: 'settings', icon: 'settings', label: 'Settings', roles: ['admin'] },
    { id: 'profile', icon: 'profile', label: 'My Profile', roles: ['admin', 'receptionist', 'doctor', 'patient'] },
  ];

  const clockIcon = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />;
  const flaskIcon = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />;
  const badgeIcon = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />;
  const starIcon = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />;

  const chartIcon = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v6m2-10h2a2 2 0 012 2v2m-4-6V5a2 2 0 00-2-2h-2" />;
  const settingsIcon = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.3-.92 1.273-1.317 2.053-.658l1.092.873c.67.537 1.432 1.05 2.07 1.05 1.795 0 3.454-2.155 3.454-4.04a4.325 4.325 0 00-4.04-4.278c-.92-.3-1.317 1.273-.658 2.053l-.873 1.092c-.537.67-1.05 1.432-1.05 2.07 0 1.795-2.155 3.454-4.04 3.454-.638 0-1.252-.16-1.8-.443m-6.338 4.855c.3.92 1.273 1.317 2.053.658l1.092-.873c.67-.537 1.432-1.05 2.07-1.05 1.795 0 3.454 2.155 3.454 4.04 0 .864-.293 1.65-.79 2.258" />;

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (item) {
      if (type === 'user') {
        setFormData({ 
          username: item.username || '', 
          first_name: item.first_name || item.firstName || '', 
          last_name: item.last_name || item.lastName || '', 
          email: item.email || '', 
          phone: item.phone || '', 
          role: item.role || 'patient',
          address: item.address || '',
          date_of_birth: item.dateOfBirth || item.date_of_birth || '',
          isActive: item.isActive !== false
        });
      } else if (type === 'doctor') {
        setFormData({ 
          first_name: item.first_name || item.user?.firstName || '',
          last_name: item.last_name || item.user?.lastName || '',
          email: item.email || item.user?.email || '',
          specialty: item.specialty || '',
          qualification: item.qualification || '',
          experience: item.experience || '',
          consultationFee: item.consultationFee || '',
          bio: item.bio || '',
          isAvailable: item.isAvailable !== false
        });
      } else if (type === 'service') {
        setFormData({ name: item.name || '', description: item.description || '', duration: item.duration || '', price: item.price || '' });
      }
    } else {
      if (type === 'user') {
        setFormData({ username: '', password: '', first_name: '', last_name: '', email: '', phone: '', role: 'patient', address: '', date_of_birth: '', isActive: true });
      } else if (type === 'doctor') {
        setFormData({ first_name: '', last_name: '', email: '', specialty: '', qualification: '', experience: '', consultationFee: '', bio: '', isAvailable: true });
      } else if (type === 'service') {
        setFormData({ name: '', description: '', duration: '', price: '' });
      } else {
        setFormData({});
      }
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'user') {
        if (editingItem) {
          await dispatch(updateUser({ id: editingItem.id, data: formData })).unwrap();
          toast.success('User updated');
        } else {
          await dispatch(createUser(formData)).unwrap();
          toast.success('User created');
        }
        dispatch(fetchAllUsers());
      } else if (modalType === 'doctor') {
        if (editingItem) {
          await dispatch(updateDoctor({ id: editingItem.id, data: formData })).unwrap();
          toast.success('Doctor updated');
        } else {
          try {
            const result = await dispatch(createDoctor(formData)).unwrap();
            dispatch(fetchAllDoctors());
            if (result.password) {
              toast.success(<div><p className="font-semibold">Doctor created!</p><p className="text-sm mt-1">Password: <span className="font-mono bg-white/20 px-1 rounded">{result.password}</span></p><p className="text-xs mt-1 opacity-80">Share these credentials with the doctor</p></div>);
            } else {
              toast.success('Doctor created successfully');
            }
          } catch (error) {
            toast.error(error?.message || 'Failed to create doctor');
          }
        }
      } else if (modalType === 'service') {
        if (editingItem) {
          await dispatch(updateService({ id: editingItem.id, data: formData })).unwrap();
          toast.success('Service updated');
        } else {
          await dispatch(createService(formData)).unwrap();
          toast.success('Service created');
        }
        dispatch(fetchAllServices());
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      toast.error(error?.message || 'Error');
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    try {
      if (type === 'user') {
        await dispatch(deleteUser(id)).unwrap();
        dispatch(fetchAllUsers());
      } else if (type === 'doctor') {
        await dispatch(deleteDoctor(id)).unwrap();
        dispatch(fetchAllDoctors());
      } else if (type === 'service') {
        await dispatch(deleteService(id)).unwrap();
        dispatch(fetchAllServices());
      }
      toast.success(`${type} deleted`);
    } catch (error) {
      toast.error(`Error: ${error?.message || error}`);
    }
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      users: 'User Management',
      doctors: 'Doctor Management',
      services: 'Service Management',
      appointments: 'Appointments',
      profile: 'My Profile',
    };
    return titles[activeMenu] || 'Dashboard';
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'users': return <UsersManagement openModal={openModal} handleDelete={handleDelete} isAdmin={isAdmin} />;
      case 'doctors': return <DoctorsManagement openModal={openModal} handleDelete={handleDelete} />;
      case 'services': return <ServicesManagement openModal={openModal} handleDelete={handleDelete} />;
      case 'patients': return isAdmin || isReceptionist ? <PatientsListPage /> : <MainDashboard />;
      case 'appointments': return <AppointmentsManagement />;
      case 'profile': return <ProfileView user={user} userName={userName} userInitials={userInitials} updateProfile={(data) => dispatch(updateProfile(data)).unwrap()} toast={toast} dispatch={dispatch} />;
      case 'book': return <BookAppointmentPage user={user} onBookComplete={() => setActiveMenu('appointments')} />;
      case 'book-appointment': return <BookAppointmentPage user={user} onBookComplete={() => setActiveMenu('appointments')} />;
      case 'reports': return isAdmin ? <ReportsPage /> : <MainDashboard />;
      case 'settings': return isAdmin ? <SettingsPage /> : <MainDashboard />;
      case 'medical-records': return isAdmin || isReceptionist || role === 'doctor' ? <MedicalRecordsPage user={user} /> : <MainDashboard />;
      case 'lab-results': return isAdmin || isReceptionist || role === 'doctor' ? <LabResultsPage /> : <MainDashboard />;
      case 'payments': return isAdmin || isReceptionist ? <PaymentsPage /> : <MainDashboard />;
      case 'invoices': return isAdmin || isReceptionist ? <InvoicesPage /> : <MainDashboard />;
      case 'waitlist': return isAdmin || isReceptionist ? <WaitlistPage /> : <MainDashboard />;
      case 'staff': return isAdmin ? <StaffManagementPage /> : <MainDashboard />;
      case 'notifications': return <NotificationsPage user={user} />;
      case 'feedback': return user?.role === 'patient' ? <FeedbackPage user={user} /> : <MainDashboard />;
      case 'prescriptions': return user?.role === 'doctor' ? <WritePrescriptionPage user={user} /> : <PrescriptionsPage user={user} />;
      case 'my-patients': return <MyPatientsPage user={user} />;
      case 'schedule': return <DoctorSchedulePage user={user} />;
      default: return <MainDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col w-64 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">MedBook Pro</span>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveMenu(item.id); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeMenu === item.id
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25'
                  : 'text-gray-600 hover:bg-teal-50 hover:text-teal-700 hover:shadow-sm'
              }`}
            >
              <NavIcon name={item.icon} className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {activeMenu === item.id && (
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all"
          >
            <NavIcon name="logout" className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  <NavIcon name="menu" className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="relative">
                <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">{userInitials}</div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">{userName}</span>
                </button>
                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{userName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <button onClick={() => { setActiveMenu('profile'); setProfileDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Profile</button>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50">Logout</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-sm text-gray-500">MedBook Pro - Clinic Appointment System</p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <NavIcon name="shield" className="w-4 h-4 text-emerald-500" />
                Secure
              </span>
              <span>•</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="relative px-6 py-5 bg-gradient-to-r from-teal-500 to-teal-600">
              <button onClick={() => setShowModal(false)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors">
                <NavIcon name="close" className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-white pr-8">{editingItem ? 'Edit' : 'Add'} {modalType === 'user' ? 'User' : modalType === 'doctor' ? 'Doctor' : 'Service'}</h2>
              <p className="text-teal-100 text-sm mt-1">{editingItem ? 'Update existing record' : 'Fill in the details below'}</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {modalType === 'user' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input type="text" value={formData.username || ''} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" required={!editingItem} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input type="password" value={formData.password || ''} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" required={!editingItem} placeholder={editingItem ? "Leave blank to keep" : "Minimum 6 characters"} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input type="text" value={formData.first_name || ''} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input type="text" value={formData.last_name || ''} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" required={!editingItem} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input type="tel" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. +2348012345678" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input type="date" value={formData.date_of_birth ? formData.date_of_birth.split('T')[0] : ''} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Enter full address" />
                  </div>
                  {isAdmin && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select value={formData.role || 'patient'} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none">
                          <option value="patient">Patient</option>
                          <option value="receptionist">Receptionist</option>
                          <option value="doctor">Doctor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="isActive" checked={formData.isActive !== false} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500" />
                        <label htmlFor="isActive" className="text-sm text-gray-700">Account Active</label>
                      </div>
                    </>
                  )}
                </>
              )}
              {modalType === 'doctor' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input type="text" value={formData.first_name || ''} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input type="text" value={formData.last_name || ''} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" required={!editingItem} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                    <select value={formData.specialty || ''} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" required>
                      <option value="">Select Specialty</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Ophthalmology">Ophthalmology</option>
                      <option value="ENT">ENT</option>
                      <option value="Gynecology">Gynecology</option>
                      <option value="Psychiatry">Psychiatry</option>
                      <option value="Oncology">Oncology</option>
                      <option value="Gastroenterology">Gastroenterology</option>
                      <option value="Pulmonology">Pulmonology</option>
                      <option value="Urology">Urology</option>
                      <option value="Nephrology">Nephrology</option>
                      <option value="Endocrinology">Endocrinology</option>
                      <option value="Rheumatology">Rheumatology</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                      <input type="text" value={formData.qualification || ''} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. MBBS, MD, MS" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                      <input type="number" value={formData.experience || ''} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" min="0" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₦)</label>
                    <input type="number" value={formData.consultationFee || ''} onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" required min="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Description</label>
                    <textarea value={formData.bio || ''} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Brief description about the doctor..." />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="isAvailable" checked={formData.isAvailable !== false} onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })} className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500" />
                    <label htmlFor="isAvailable" className="text-sm text-gray-700">Available for appointments</label>
                  </div>
                </>
              )}
              {modalType === 'service' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                    <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                      <input type="number" value={formData.duration || ''} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                      <input type="number" value={formData.price || ''} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" required />
                    </div>
                  </div>
                </>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingItem(null); setFormData({}); }} className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-gray-700">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 font-medium shadow-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

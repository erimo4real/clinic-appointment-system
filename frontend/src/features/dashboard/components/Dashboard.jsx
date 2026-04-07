import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchDashboardStats, fetchAllAppointments, fetchAllUsers, fetchAllDoctors, fetchAllServices } from '../../admin/store/adminSlice';
import { fetchMyAppointments } from '../../appointments/store/appointmentSlice';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';

const COLORS = ['#14b8a6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

const StatCard = ({ title, value, subtitle, gradient, icon }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
    <div className={`h-1 ${gradient}`}></div>
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${gradient}`}>
          {icon}
        </div>
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      {status}
    </span>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { stats, appointments, users, doctors, services, loading, error } = useSelector((state) => state.admin);

  const isAdmin = user?.role === 'admin';
  const isReceptionist = user?.role === 'receptionist';
  const isDoctor = user?.role === 'doctor';
  const isPatient = user?.role === 'patient';

  useEffect(() => {
    console.log('Dashboard loaded, role:', user?.role);
    
    // Admin and Receptionist: Fetch all data
    if (isAdmin || isReceptionist) {
      dispatch(fetchDashboardStats());
      dispatch(fetchAllAppointments());
      if (isAdmin) {
        dispatch(fetchAllUsers());
        dispatch(fetchAllDoctors());
        dispatch(fetchAllServices());
      }
    }
    
    // Patient: Fetch their appointments
    if (isPatient) {
      dispatch(fetchMyAppointments());
    }
  }, [dispatch, user?.role]);

  const isLoading = loading;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Loading...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==================== ADMIN / RECEPTIONIST DASHBOARD ====================
  if (isAdmin || isReceptionist) {
    const pendingCount = appointments.filter(a => a.status === 'pending').length;
    const completedCount = appointments.filter(a => a.status === 'completed').length;
    const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;

    const appointmentStatusData = [
      { name: 'Pending', value: pendingCount, color: '#f59e0b' },
      { name: 'Confirmed', value: confirmedCount, color: '#3b82f6' },
      { name: 'Completed', value: completedCount, color: '#10b981' },
    ].filter(d => d.value > 0);

    const recentAppointments = appointments.slice(0, 5);

    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? 'Admin Dashboard' : 'Receptionist Dashboard'}
          </h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your clinic.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={isAdmin ? users.length : 'N/A'}
            subtitle="Registered accounts"
            gradient="bg-gradient-to-r from-teal-500 to-teal-600"
            icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          />
          <StatCard
            title="Total Doctors"
            value={isAdmin ? doctors.length : 'N/A'}
            subtitle="Active medical staff"
            gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
            icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
          <StatCard
            title="Total Appointments"
            value={appointments.length}
            subtitle={`${pendingCount} pending`}
            gradient="bg-gradient-to-r from-violet-500 to-violet-600"
            icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
          <StatCard
            title="Total Revenue"
            value={`₦${(stats.totalRevenue || 0).toLocaleString()}`}
            subtitle={`${completedCount} completed`}
            gradient="bg-gradient-to-r from-amber-500 to-orange-500"
            icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {isAdmin && (
              <>
                <Link to="/admin/users" className="flex flex-col items-center p-4 rounded-xl bg-teal-50 hover:bg-teal-100 transition-colors">
                  <svg className="w-8 h-8 text-teal-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  <span className="text-sm font-medium text-teal-700">Users</span>
                </Link>
                <Link to="/admin/doctors" className="flex flex-col items-center p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                  <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-sm font-medium text-green-700">Doctors</span>
                </Link>
                <Link to="/admin/services" className="flex flex-col items-center p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
                  <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  <span className="text-sm font-medium text-purple-700">Services</span>
                </Link>
              </>
            )}
            <Link to="/admin/appointments" className="flex flex-col items-center p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="text-sm font-medium text-blue-700">Appointments</span>
            </Link>
            <Link to="/admin/calendar" className="flex flex-col items-center p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors">
              <svg className="w-8 h-8 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="text-sm font-medium text-orange-700">Calendar</span>
            </Link>
            <Link to="/admin/reports" className="flex flex-col items-center p-4 rounded-xl bg-red-50 hover:bg-red-100 transition-colors">
              <svg className="w-8 h-8 text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span className="text-sm font-medium text-red-700">Reports</span>
            </Link>
          </div>
        </div>

        {/* Charts and Recent Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Appointments Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointments by Status</h2>
            {appointmentStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={appointmentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {appointmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">No appointment data</div>
            )}
          </div>

          {/* Recent Appointments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
              <Link to="/admin/appointments" className="text-teal-600 text-sm hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {recentAppointments.length > 0 ? recentAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{apt.patient_name || 'Patient'}</p>
                    <p className="text-sm text-gray-500">Dr. {apt.doctor_name} - {apt.service_name}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={apt.status} />
                    <p className="text-xs text-gray-400 mt-1">{apt.date}</p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-400 text-center py-8">No appointments yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== PATIENT DASHBOARD ====================
  if (isPatient) {
    const myAppointments = appointments || [];
    const upcomingAppointments = myAppointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
    const pastAppointments = myAppointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.firstName || user?.first_name || 'Patient'}!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Upcoming Appointments"
            value={upcomingAppointments.length}
            subtitle="Scheduled visits"
            gradient="bg-gradient-to-r from-blue-500 to-blue-600"
            icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
          <StatCard
            title="Past Appointments"
            value={pastAppointments.length}
            subtitle="Visit history"
            gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
            icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            title="Medical Records"
            value="View"
            subtitle="Your history"
            gradient="bg-gradient-to-r from-purple-500 to-purple-600"
            icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/booking" className="flex flex-col items-center p-4 rounded-xl bg-teal-50 hover:bg-teal-100 transition-colors">
              <svg className="w-8 h-8 text-teal-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              <span className="text-sm font-medium text-teal-700">Book Appointment</span>
            </Link>
            <Link to="/doctors" className="flex flex-col items-center p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="text-sm font-medium text-blue-700">Find Doctors</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
              <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span className="text-sm font-medium text-purple-700">My Profile</span>
            </Link>
            <Link to="/services" className="flex flex-col items-center p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors">
              <svg className="w-8 h-8 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <span className="text-sm font-medium text-orange-700">Services</span>
            </Link>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Dr. {apt.doctor_name}</p>
                      <p className="text-sm text-gray-500">{apt.service_name}</p>
                      <p className="text-sm text-gray-500">{apt.date} at {apt.start_time}</p>
                    </div>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No upcoming appointments</p>
              <Link to="/booking" className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                Book an Appointment
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== DEFAULT / FALLBACK ====================
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome!</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
        <p className="text-gray-500">Select an option from the menu to get started.</p>
      </div>
    </div>
  );
};

export default Dashboard;

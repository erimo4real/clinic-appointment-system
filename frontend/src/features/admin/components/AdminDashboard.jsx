import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchDashboardStats, fetchAllAppointments, fetchAllUsers, fetchAllDoctors, fetchAllServices } from '../store/adminSlice';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, appointments, users, doctors, services, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchAllAppointments());
    dispatch(fetchAllUsers());
    dispatch(fetchAllDoctors());
    dispatch(fetchAllServices());
  }, [dispatch]);

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const recentAppointments = appointments.slice(0, 5);

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to load data</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to your clinic management dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={users.length || 0}
          subtitle="Registered accounts"
          color="bg-gradient-to-br from-teal-400 to-teal-600"
          icon={
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Doctors"
          value={doctors.length || 0}
          subtitle="Active medical staff"
          color="bg-gradient-to-br from-emerald-400 to-emerald-600"
          icon={
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Appointments"
          value={appointments.length || 0}
          subtitle={`${pendingCount} pending`}
          color="bg-gradient-to-br from-violet-400 to-violet-600"
          icon={
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          title="Total Revenue"
          value={`₦${(stats.totalRevenue || 0).toLocaleString()}`}
          subtitle={`${completedCount} completed`}
          color="bg-gradient-to-br from-amber-400 to-orange-500"
          icon={
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Appointment Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Appointment Overview</h2>
            <Link to="/admin/appointments" className="text-sm text-teal-600 hover:text-teal-700 font-medium">View All</Link>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-900">Pending</span>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold">{pendingCount}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-900">Confirmed</span>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">{confirmedCount}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-medium text-gray-900">Completed</span>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold">{completedCount}</span>
            </div>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Recent Appointments</h2>
            <Link to="/admin/appointments" className="text-sm text-teal-600 hover:text-teal-700 font-medium">View All</Link>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-600 border-t-transparent"></div>
              </div>
            ) : recentAppointments.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 font-medium">No appointments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold">
                        {(apt.patient_name || 'P').charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{apt.patient_name || 'Patient'}</p>
                        <p className="text-sm text-gray-500">Dr. {apt.doctor_name} • {apt.date}</p>
                      </div>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link to="/admin/users" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-teal-200 hover:shadow-lg transition-all group">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900">Users</h3>
          <p className="text-sm text-gray-500 mt-1">{users.length} registered</p>
        </Link>
        <Link to="/admin/doctors" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all group">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900">Doctors</h3>
          <p className="text-sm text-gray-500 mt-1">{doctors.length} active</p>
        </Link>
        <Link to="/admin/services" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-violet-200 hover:shadow-lg transition-all group">
          <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-violet-100 transition-colors">
            <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900">Services</h3>
          <p className="text-sm text-gray-500 mt-1">{services.length} available</p>
        </Link>
        <Link to="/booking" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all group">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900">Book</h3>
          <p className="text-sm text-gray-500 mt-1">New appointment</p>
        </Link>
      </div>

      {/* Doctors List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Our Doctors</h2>
          <Link to="/admin/doctors" className="text-sm text-teal-600 hover:text-teal-700 font-medium">View All</Link>
        </div>
        <div className="p-6">
          {doctors.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-gray-500 font-medium">No doctors added yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                    {(doctor.name || 'D').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{doctor.name}</p>
                    <p className="text-sm text-gray-500 truncate">{doctor.specialty}</p>
                    <p className="text-xs text-gray-400 mt-1">₦{doctor.consultation_fee?.toLocaleString()} • {doctor.experience}yrs exp</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${doctor.is_available ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

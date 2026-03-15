import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats, fetchTodayAppointments } from '../store/appointmentSlice';
import { logout } from '../../auth/store/authSlice';

const DoctorDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { todayAppointments, stats } = useSelector((state) => state.appointments);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchTodayAppointments());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-green-100 text-green-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 bg-gray-900 min-h-screen p-4">
        <div className="mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-medical-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">MedBook Pro</span>
          </Link>
        </div>
        
        <nav className="space-y-2">
          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-medical-600 text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Dashboard</span>
          </div>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center space-x-3 px-4 py-3 bg-gray-800 rounded-lg mb-3">
            <div className="w-10 h-10 bg-medical-600 rounded-full flex items-center justify-center text-white font-medium">
              {user?.first_name?.[0] || 'D'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-gray-400">Doctor</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full px-4 py-2 text-gray-400 hover:text-white text-left">
            Logout
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-8 ml-64">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
            <p className="text-gray-500">Welcome, Dr. {user?.first_name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Today's Appointments</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.today_appointments || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">{stats?.pending_appointments || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Completed Today</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats?.completed_appointments || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {todayAppointments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No appointments scheduled for today
              </div>
            ) : (
              todayAppointments.map((apt) => (
                <div key={apt.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                      👤
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{apt.patient?.first_name} {apt.patient?.last_name}</p>
                      <p className="text-sm text-gray-500">{apt.service?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{apt.start_time}</p>
                      <p className="text-sm text-gray-500">{apt.date}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(apt.status)}`}>
                      {apt.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

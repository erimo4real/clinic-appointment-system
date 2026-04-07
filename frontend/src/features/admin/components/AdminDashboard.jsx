import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchDashboardStats, fetchAllAppointments, fetchAllUsers, fetchAllDoctors, fetchAllServices } from '../store/adminSlice';
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

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, appointments, users, doctors, services, loading, usersLoading, doctorsLoading, appointmentsLoading, servicesLoading, error } = useSelector((state) => state.admin);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log('AdminDashboard mounted, isAuthenticated:', isAuthenticated, 'user role:', user?.role);
    if (isAuthenticated) {
      console.log('Fetching admin data...');
      dispatch(fetchDashboardStats())
        .unwrap()
        .then(data => console.log('Stats fetched:', data))
        .catch(err => console.error('Stats error:', err));
      dispatch(fetchAllAppointments())
        .unwrap()
        .then(data => console.log('Appointments fetched:', data?.length))
        .catch(err => console.error('Appointments error:', err));
      dispatch(fetchAllUsers())
        .unwrap()
        .then(data => console.log('Users fetched:', data?.length))
        .catch(err => console.error('Users error:', err));
      dispatch(fetchAllDoctors())
        .unwrap()
        .then(data => console.log('Doctors fetched:', data?.length))
        .catch(err => console.error('Doctors error:', err));
      dispatch(fetchAllServices())
        .unwrap()
        .then(data => console.log('Services fetched:', data?.length))
        .catch(err => console.error('Services error:', err));
    }
  }, [dispatch, isAuthenticated, user]);
  
  const isLoading = loading || usersLoading || doctorsLoading || appointmentsLoading || servicesLoading;
  
  // Show debug info
  console.log('Redux state - users:', users.length, 'doctors:', doctors.length, 'appointments:', appointments.length, 'services:', services.length, 'error:', error);

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;
  const recentAppointments = appointments.slice(0, 5);

  // Chart Data - Appointments by Status
  const appointmentStatusData = [
    { name: 'Pending', value: pendingCount, color: '#f59e0b' },
    { name: 'Confirmed', value: confirmedCount, color: '#3b82f6' },
    { name: 'Completed', value: completedCount, color: '#10b981' },
    { name: 'Cancelled', value: cancelledCount, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Chart Data - Monthly Appointments (computed from real data)
  const getMonthlyData = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthlyStats = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthCount = appointments.filter(a => a.date?.startsWith(monthStr)).length;
      const monthRevenue = services.reduce((total, service) => {
        return total + appointments.filter(a => 
          a.date?.startsWith(monthStr) && 
          a.service_id === service.id && 
          a.status === 'completed'
        ).length * (service.price || 0);
      }, 0);
      
      monthlyStats.push({
        month: monthNames[date.getMonth()],
        appointments: monthCount,
        revenue: monthRevenue,
      });
    }
    return monthlyStats;
  };

  const monthlyData = getMonthlyData();

  // Chart Data - Doctors by Specialty
  const specialtyData = doctors.reduce((acc, doctor) => {
    const specialty = doctor.specialty || 'General';
    const existing = acc.find(item => item.name === specialty);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ name: specialty, count: 1 });
    }
    return acc;
  }, []);

  // Chart Data - Revenue Trend
  const revenueData = monthlyData.map(item => ({
    month: item.month,
    revenue: item.revenue
  }));

  // Chart Data - Services Distribution
  const serviceData = services.reduce((acc, service) => {
    const count = appointments.filter(a => a.service_id === service.id).length;
    if (count > 0) {
      acc.push({ name: service.name, value: count, price: service.price });
    }
    return acc;
  }, []);

  // Chart Data - Weekly Appointments
  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = appointments.filter(a => a.date === dateStr).length;
      weekData.push({
        day: days[date.getDay()],
        appointments: count,
        date: dateStr,
      });
    }
    return weekData;
  };

  const weeklyData = getWeeklyData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? (entry.name.toLowerCase().includes('revenue') ? `₦${entry.value.toLocaleString()}` : entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Loading dashboard data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-red-800 mb-2">Unable to load dashboard</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button 
            onClick={() => {
              if (isAuthenticated) {
                dispatch(fetchDashboardStats());
                dispatch(fetchAllAppointments());
                dispatch(fetchAllUsers());
                dispatch(fetchAllDoctors());
                dispatch(fetchAllServices());
              }
            }} 
            className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-bold text-yellow-800 mb-2">Session Required</h3>
          <p className="text-yellow-600 text-sm">Please log in to view the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your clinic today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={users.length}
          subtitle="Registered accounts"
          gradient="bg-gradient-to-r from-teal-500 to-teal-600"
          icon={<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />
        <StatCard
          title="Total Doctors"
          value={doctors.length}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* Appointments by Status - Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Appointments by Status</h3>
          {appointmentStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={appointmentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {appointmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>No appointment data available</p>
            </div>
          )}
        </div>

        {/* Weekly Appointments - Line Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">This Week's Appointments</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorWeek" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="appointments" stroke="#14b8a6" fillOpacity={1} fill="url(#colorWeek)" name="Appointments" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Services Distribution - Donut Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Services Popularity</h3>
          {serviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>No service data available</p>
            </div>
          )}
        </div>

        {/* Monthly Appointments - Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Monthly Appointments</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="appointments" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Appointments" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend - Area Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Revenue Trend (₦)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `₦${(value/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Doctors by Specialty - Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Doctors by Specialty</h3>
          {specialtyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={specialtyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} name="Doctors" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>No doctor data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Recent Appointments</h2>
          <Link to="/admin/appointments" className="text-sm text-teal-600 hover:text-teal-700 font-semibold">View All</Link>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-600 border-t-transparent"></div>
            </div>
          ) : recentAppointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-gray-500 font-medium">No appointments yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                    <th className="pb-4">Patient</th>
                    <th className="pb-4">Doctor</th>
                    <th className="pb-4">Service</th>
                    <th className="pb-4">Date</th>
                    <th className="pb-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentAppointments.map((apt, index) => (
                    <tr key={apt.id || index} className="hover:bg-gray-50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold">
                            {(apt.patient_name || 'P').charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{apt.patient_name || 'Patient'}</span>
                        </div>
                      </td>
                      <td className="py-4 text-gray-600">Dr. {apt.doctor_name || '-'}</td>
                      <td className="py-4 text-gray-600">{apt.service_name || '-'}</td>
                      <td className="py-4 text-gray-600">{apt.date || '-'}</td>
                      <td className="py-4"><StatusBadge status={apt.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/admin/users" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-teal-200 hover:shadow-lg transition-all group">
          <div className="w-12 h-12 bg-teal-50 group-hover:bg-teal-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <h3 className="font-bold text-gray-900">Users</h3>
          <p className="text-sm text-gray-500 mt-1">{users.length} registered</p>
        </Link>
        <Link to="/admin/doctors" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all group">
          <div className="w-12 h-12 bg-emerald-50 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <h3 className="font-bold text-gray-900">Doctors</h3>
          <p className="text-sm text-gray-500 mt-1">{doctors.length} active</p>
        </Link>
        <Link to="/admin/services" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-violet-200 hover:shadow-lg transition-all group">
          <div className="w-12 h-12 bg-violet-50 group-hover:bg-violet-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
            <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <h3 className="font-bold text-gray-900">Services</h3>
          <p className="text-sm text-gray-500 mt-1">{services.length} available</p>
        </Link>
        <Link to="/booking" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all group">
          <div className="w-12 h-12 bg-amber-50 group-hover:bg-amber-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </div>
          <h3 className="font-bold text-gray-900">Book</h3>
          <p className="text-sm text-gray-500 mt-1">New appointment</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchDashboardStats, fetchAllAppointments, fetchAllUsers, fetchAllDoctors, fetchAllServices, createUser, updateUser, deleteUser, createDoctor, updateDoctor, deleteDoctor, createService, updateService, deleteService } from '../store/adminSlice';
import { logoutUser } from '../../auth/store/authSlice';
import { fetchAllAppointments as fetchAppointments, updateAppointment, deleteAppointment } from '../../appointments/store/appointmentSlice';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';

const NavIcon = ({ name, className }) => {
  const icons = {
    dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    doctor: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    services: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />,
    logout: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
    bell: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
    menu: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />,
    close: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
    edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
  };
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[name]}</svg>;
};

const COLORS = ['#14b8a6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="font-semibold text-gray-900">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color || entry.fill }}>
            {entry.name}: {typeof entry.value === 'number' ? (entry.name.toLowerCase().includes('revenue') ? `₦${entry.value.toLocaleString()}` : entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
  </div>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { stats, appointments, users, doctors, services, loading, usersLoading, doctorsLoading, appointmentsLoading, servicesLoading } = useSelector((state) => state.admin);
  const { appointments: patientAppointments } = useSelector((state) => state.appointments);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});

  const isLoading = loading || usersLoading || doctorsLoading || appointmentsLoading || servicesLoading;
  const userName = user?.firstName || user?.first_name || user?.username || 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const isAdmin = user?.role === 'admin';
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchAllAppointments());
    dispatch(fetchAllUsers());
    dispatch(fetchAllDoctors());
    dispatch(fetchAllServices());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  const sidebarItems = [
    { id: 'dashboard', icon: 'chart', label: 'Dashboard' },
    ...(isAdmin ? [{ id: 'users', icon: 'users', label: 'Users' }] : []),
    { id: 'doctors', icon: 'doctor', label: 'Doctors' },
    { id: 'services', icon: 'services', label: 'Services' },
    { id: 'appointments', icon: 'calendar', label: 'Book' },
  ];

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (item) {
      if (type === 'user') {
        setFormData({ first_name: item.first_name || '', last_name: item.last_name || '', email: item.email || '', phone: item.phone || '', role: item.role || 'patient' });
      } else if (type === 'doctor') {
        setFormData({ name: item.name || '', specialty: item.specialty || '', qualification: item.qualification || '', experience: item.experience || '', consultation_fee: item.consultation_fee || '', services: item.services || [] });
      } else if (type === 'service') {
        setFormData({ name: item.name || '', description: item.description || '', duration: item.duration || '', price: item.price || '' });
      }
    } else {
      setFormData(type === 'doctor' ? { services: [] } : {});
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modalType === 'user') {
      if (editingItem) {
        await dispatch(updateUser({ id: editingItem.id, data: formData }));
      } else {
        await dispatch(createUser(formData));
      }
      dispatch(fetchAllUsers());
    } else if (modalType === 'doctor') {
      if (editingItem) {
        await dispatch(updateDoctor({ id: editingItem.id, data: formData }));
      } else {
        await dispatch(createDoctor(formData));
      }
      dispatch(fetchAllDoctors());
    } else if (modalType === 'service') {
      if (editingItem) {
        await dispatch(updateService({ id: editingItem.id, data: formData }));
      } else {
        await dispatch(createService(formData));
      }
      dispatch(fetchAllServices());
    }
    setShowModal(false);
    setEditingItem(null);
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    if (type === 'user') {
      await dispatch(deleteUser(id));
      dispatch(fetchAllUsers());
    } else if (type === 'doctor') {
      await dispatch(deleteDoctor(id));
      dispatch(fetchAllDoctors());
    } else if (type === 'service') {
      await dispatch(deleteService(id));
      dispatch(fetchAllServices());
    }
  };

  const filteredUsers = users.filter(u => 
    (u.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredDoctors = doctors.filter(d =>
    (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.specialty || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredServices = services.filter(s =>
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

  const appointmentStatusData = [
    { name: 'Pending', value: pendingCount, color: '#f59e0b' },
    { name: 'Confirmed', value: confirmedCount, color: '#3b82f6' },
    { name: 'Completed', value: completedCount, color: '#10b981' },
    { name: 'Cancelled', value: cancelledCount, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = appointments.filter(a => a.date === dateStr).length;
      weekData.push({ day: days[date.getDay()], appointments: count, date: dateStr });
    }
    return weekData;
  };

  const weeklyData = getWeeklyData();

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

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Doctors</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{doctors.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Appointments</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{appointments.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Services</p>
          <p className="text-3xl font-bold text-violet-600 mt-1">{services.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Appointments by Status</h3>
          {appointmentStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={appointmentStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {appointmentStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">No appointment data</div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">This Week's Appointments</h3>
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Doctors by Specialty</h3>
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
            <div className="h-64 flex items-center justify-center text-gray-500">No doctor data</div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Appointments</h3>
          {appointments.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">No appointments yet</div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {appointments.slice(0, 8).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{apt.patient_name}</p>
                    <p className="text-sm text-gray-500">Dr. {apt.doctor_name} - {apt.service_name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                    apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{apt.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const [roleFilter, setRoleFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');

  const uniqueSpecialties = [...new Set(doctors.map(d => d.specialty).filter(Boolean))];

  const filteredByRole = roleFilter === 'all' ? filteredUsers : filteredUsers.filter(u => u.role === roleFilter);
  const filteredBySpecialty = specialtyFilter === 'all' ? filteredDoctors : filteredDoctors.filter(d => d.specialty === specialtyFilter);
  const filteredByStatus = statusFilter === 'all' ? filteredServices : filteredServices.filter(s => s.is_active === (statusFilter === 'active'));

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = filterSearch === '' ||
      (apt.patient_name || '').toLowerCase().includes(filterSearch.toLowerCase()) ||
      (apt.doctor_name || '').toLowerCase().includes(filterSearch.toLowerCase()) ||
      (apt.service_name || '').toLowerCase().includes(filterSearch.toLowerCase());
    const matchesStatus = appointmentStatusFilter === 'all' || apt.status === appointmentStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const usersTotalPages = Math.ceil(filteredByRole.length / ITEMS_PER_PAGE);
  const doctorsTotalPages = Math.ceil(filteredBySpecialty.length / ITEMS_PER_PAGE);
  const servicesTotalPages = Math.ceil(filteredByStatus.length / ITEMS_PER_PAGE);
  const appointmentsTotalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);

  const getCurrentPageData = (data, totalPages) => {
    const page = Math.min(Math.max(1, currentPage), totalPages || 1);
    return data.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  };

  const renderPagination = (totalPages, currentTotal, filteredTotal, section) => {
    if (totalPages <= 1) return null;
    const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const end = Math.min(currentPage * ITEMS_PER_PAGE, filteredTotal);
    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
        <p className="text-sm text-gray-500">
          Showing {filteredTotal === 0 ? 0 : start}-{end} of {filteredTotal} {section}
        </p>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 px-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
          {[...Array(Math.min(totalPages, 5))].map((_, i) => {
            let page = i + 1;
            if (totalPages > 5) {
              if (currentPage > 3) page = currentPage - 2 + i;
              if (currentPage > totalPages - 2) page = totalPages - 4 + i;
            }
            return (
              <button key={page} onClick={() => setCurrentPage(page)} className={`p-2 px-3 text-sm border rounded-lg ${currentPage === page ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-300 hover:bg-gray-100'}`}>{page}</button>
            );
          })}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 px-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    const paginated = getCurrentPageData(filteredByRole, usersTotalPages);
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm">
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="receptionist">Receptionist</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>
          </div>
          {isAdmin && (
            <button onClick={() => openModal('user')} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
              <NavIcon name="plus" className="w-5 h-5" /> Add User
            </button>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <NavIcon name="search" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
            </div>
          </div>
          {isLoading ? (
            <LoadingSpinner />
          ) : filteredByRole.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No users found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-16">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginated.map((u, index) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-gray-500 text-sm">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                        <td className="px-4 py-4 font-medium text-gray-900">{u.first_name} {u.last_name}</td>
                        <td className="px-4 py-4 text-gray-600">{u.email}</td>
                        <td className="px-4 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium capitalize">{u.role}</span></td>
                        <td className="px-4 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => openModal('user', u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><NavIcon name="edit" className="w-4 h-4" /></button>
                            {isAdmin && <button onClick={() => handleDelete('user', u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><NavIcon name="trash" className="w-4 h-4" /></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {renderPagination(usersTotalPages, filteredByRole.length, filteredByRole.length, 'users')}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderDoctors = () => {
    const paginated = getCurrentPageData(filteredBySpecialty, doctorsTotalPages);
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <select value={specialtyFilter} onChange={(e) => { setSpecialtyFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm">
              <option value="all">All Specialties</option>
              {uniqueSpecialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={() => openModal('doctor')} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <NavIcon name="plus" className="w-5 h-5" /> Add Doctor
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <NavIcon name="search" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search doctors..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
            </div>
          </div>
          {doctorsLoading ? (
            <LoadingSpinner />
          ) : filteredBySpecialty.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No doctors found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-16">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Doctor</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Specialty</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Services</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fee</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginated.map((d, index) => {
                      const doctorServices = (d.services || []).map(sId => services.find(s => s.id === sId)?.name).filter(Boolean);
                      return (
                        <tr key={d.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-gray-500 text-sm">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                          <td className="px-4 py-4 font-medium text-gray-900">{d.name}</td>
                          <td className="px-4 py-4 text-gray-600">{d.specialty}</td>
                          <td className="px-4 py-4">
                            {doctorServices.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {doctorServices.map((svc, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs rounded-full">{svc}</span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">No services</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-gray-600 font-semibold text-green-600">₦{d.consultation_fee?.toLocaleString()}</td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <button onClick={() => openModal('doctor', d)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><NavIcon name="edit" className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete('doctor', d.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><NavIcon name="trash" className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {renderPagination(doctorsTotalPages, filteredBySpecialty.length, filteredBySpecialty.length, 'doctors')}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderServices = () => {
    const paginated = getCurrentPageData(filteredByStatus, servicesTotalPages);
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button onClick={() => openModal('service')} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <NavIcon name="plus" className="w-5 h-5" /> Add Service
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <NavIcon name="search" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search services..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
            </div>
          </div>
          {servicesLoading ? (
            <LoadingSpinner />
          ) : filteredByStatus.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No services found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-16">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Service</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Duration</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginated.map((s, index) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-gray-500 text-sm">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-900">{s.name}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">{s.description}</p>
                        </td>
                        <td className="px-4 py-4 text-gray-700">{s.duration} min</td>
                        <td className="px-4 py-4 text-gray-700 font-semibold text-green-600">₦{s.price?.toLocaleString()}</td>
                        <td className="px-4 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => openModal('service', s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><NavIcon name="edit" className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete('service', s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><NavIcon name="trash" className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {renderPagination(servicesTotalPages, filteredByStatus.length, filteredByStatus.length, 'services')}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderAppointments = () => {
    const paginated = filteredAppointments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <select value={appointmentStatusFilter} onChange={(e) => { setAppointmentStatusFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <NavIcon name="search" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search appointments..." value={filterSearch} onChange={(e) => { setFilterSearch(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
            </div>
          </div>
          {appointmentsLoading ? (
            <LoadingSpinner />
          ) : filteredAppointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No appointments found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-16">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Doctor</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Service</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginated.map((apt, index) => (
                      <tr key={apt.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-gray-500 text-sm">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                        <td className="px-4 py-4 font-medium text-gray-900">{apt.patient_name}</td>
                        <td className="px-4 py-4 text-gray-700">Dr. {apt.doctor_name}</td>
                        <td className="px-4 py-4 text-gray-700">{apt.service_name}</td>
                        <td className="px-4 py-4 text-gray-700">{apt.date}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                            apt.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>{apt.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {renderPagination(appointmentsTotalPages, filteredAppointments.length, filteredAppointments.length, 'appointments')}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'users': return renderUsers();
      case 'doctors': return renderDoctors();
      case 'services': return renderServices();
      case 'appointments': return renderAppointments();
      default: return renderDashboard();
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'users': return 'User Management';
      case 'doctors': return 'Doctor Management';
      case 'services': return 'Service Management';
      case 'appointments': return 'Appointments';
      default: return 'Admin Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <NavIcon name={sidebarOpen ? 'close' : 'menu'} className="w-6 h-6" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">MedBook Pro</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {userInitials}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">{userName}</span>
                </button>

                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{userName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          My Profile
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 py-1">
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50">
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 pt-16">
          <nav className="flex-1 px-4 py-6 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <NavIcon name={item.icon} className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <span className="text-lg font-bold text-gray-900">Menu</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <NavIcon name="close" className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === item.id
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <NavIcon name={item.icon} className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-h-[calc(100vh-4rem)]">
          <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{getTitle()}</h1>
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingItem ? 'Edit' : 'Add'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {modalType === 'user' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input type="text" value={formData.first_name || ''} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input type="text" value={formData.last_name || ''} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required={!editingItem} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="text" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                  {isAdmin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select value={formData.role || 'patient'} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                        <option value="patient">Patient</option>
                        <option value="receptionist">Receptionist</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  )}
                </>
              )}
              {modalType === 'doctor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                    <select value={formData.specialty || ''} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                    <input type="text" value={formData.qualification || ''} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Services (select up to 3)</label>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
                      {services.length === 0 ? (
                        <p className="text-sm text-gray-500 p-2">No services available. Please add services first.</p>
                      ) : (
                        services.map((service) => {
                          const selectedServices = formData.services || [];
                          const isChecked = selectedServices.includes(service.id);
                          const isDisabled = !isChecked && selectedServices.length >= 3;
                          return (
                            <label key={service.id} className={`flex items-center gap-2 p-2 rounded cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isDisabled}
                                onChange={(e) => {
                                  let newServices = [...(formData.services || [])];
                                  if (e.target.checked) {
                                    if (newServices.length < 3) {
                                      newServices.push(service.id);
                                    }
                                  } else {
                                    newServices = newServices.filter(id => id !== service.id);
                                  }
                                  setFormData({ ...formData, services: newServices });
                                }}
                                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                              />
                              <span className="text-sm text-gray-700">{service.name}</span>
                              <span className="text-xs text-gray-400 ml-auto">₦{service.price?.toLocaleString()}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{(formData.services || []).length}/3 services selected</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                      <input type="number" value={formData.experience || ''} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₦)</label>
                      <input type="number" value={formData.consultation_fee || ''} onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
                    </div>
                  </div>
                </>
              )}
              {modalType === 'service' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                    <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                      <input type="number" value={formData.duration || ''} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                      <input type="number" value={formData.price || ''} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
                    </div>
                  </div>
                </>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingItem(null); }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

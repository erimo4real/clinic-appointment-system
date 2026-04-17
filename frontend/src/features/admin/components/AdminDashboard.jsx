import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardStats, fetchAllAppointments, fetchAllUsers, fetchAllDoctors, fetchAllServices, createUser, updateUser, deleteUser, createDoctor, updateDoctor, deleteDoctor, createService, updateService, deleteService } from '../store/adminSlice';
import { logoutUser } from '../../auth/store/authSlice';
import { fetchAllAppointments as fetchAppointments, fetchMyAppointments } from '../../appointments/store/appointmentSlice';
import { useToast } from '../../../components/ui/Toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

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
    shield: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    profile: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    home: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  };
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[name]}</svg>;
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
  </div>
);

const MainDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { appointments, users, doctors, services } = useSelector((state) => state.admin);
  const role = user?.role;

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  const appointmentStatusData = [
    { name: 'Pending', value: pendingCount, color: '#f59e0b' },
    { name: 'Completed', value: completedCount, color: '#10b981' },
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
      weekData.push({ day: days[date.getDay()], appointments: count });
    }
    return weekData;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(role === 'admin' || role === 'receptionist') && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
                <NavIcon name="users" className="w-5 h-5 text-teal-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                <NavIcon name="doctor" className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-600">{doctors.length}</p>
              <p className="text-sm text-gray-500">Doctors</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <NavIcon name="calendar" className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-600">{appointments.length}</p>
              <p className="text-sm text-gray-500">Appointments</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
                <NavIcon name="services" className="w-5 h-5 text-violet-600" />
              </div>
              <p className="text-3xl font-bold text-violet-600">{services.length}</p>
              <p className="text-sm text-gray-500">Services</p>
            </div>
          </>
        )}
        {(role === 'doctor' || role === 'patient') && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <NavIcon name="calendar" className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-600">{appointments.length}</p>
              <p className="text-sm text-gray-500">Total Appointments</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
                <NavIcon name="calendar" className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                <NavIcon name="check" className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-600">{completedCount}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">This Week</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={getWeeklyData()}>
                <defs>
                  <linearGradient id="colorWeek" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="appointments" stroke="#14b8a6" fillOpacity={1} fill="url(#colorWeek)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Recent Appointments</h3>
          </div>
          <div className="p-4 max-h-72 overflow-y-auto">
            {appointments.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-500">No appointments</div>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 6).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">{apt.patient_name}</p>
                      <p className="text-sm text-gray-500">Dr. {apt.doctor_name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <NavIcon name="search" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
        </div>
        {isAdmin && (
          <button onClick={() => openModal('user')} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2">
            <NavIcon name="plus" className="w-5 h-5" /> Add User
          </button>
        )}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {usersLoading ? <LoadingSpinner /> : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No users found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-teal-50/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">{(u.first_name || 'U')[0]}{(u.last_name || '')[0]}</div>
                      <span className="font-medium text-gray-900">{u.first_name} {u.last_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium capitalize text-gray-700">{u.role}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openModal('user', u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><NavIcon name="edit" className="w-4 h-4" /></button>
                      {isAdmin && <button onClick={() => handleDelete('user', u.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><NavIcon name="trash" className="w-4 h-4" /></button>}
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <NavIcon name="search" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search doctors..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
        </div>
        <button onClick={() => openModal('doctor')} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2">
          <NavIcon name="plus" className="w-5 h-5" /> Add Doctor
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {doctorsLoading ? <LoadingSpinner /> : filteredDoctors.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No doctors found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Specialty</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fee</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDoctors.map((d) => (
                <tr key={d.id} className="hover:bg-teal-50/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">{(d.name || 'D')[0]}</div>
                      <span className="font-medium text-gray-900">Dr. {d.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">{d.specialty || 'General'}</span></td>
                  <td className="px-6 py-4 text-emerald-600 font-semibold">₦{d.consultation_fee?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openModal('doctor', d)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><NavIcon name="edit" className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete('doctor', d.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><NavIcon name="trash" className="w-4 h-4" /></button>
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
        <button onClick={() => openModal('service')} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2">
          <NavIcon name="plus" className="w-5 h-5" /> Add Service
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {servicesLoading ? <LoadingSpinner /> : filteredServices.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No services found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredServices.map((s) => (
                <tr key={s.id} className="hover:bg-teal-50/30">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{s.name}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{s.description}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{s.duration} min</td>
                  <td className="px-6 py-4 text-emerald-600 font-semibold">₦{s.price?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openModal('service', s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><NavIcon name="edit" className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete('service', s.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><NavIcon name="trash" className="w-4 h-4" /></button>
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <NavIcon name="search" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search appointments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {appointmentsLoading ? <LoadingSpinner /> : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No appointments found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-teal-50/30">
                  <td className="px-6 py-4 font-medium text-gray-900">{apt.patient_name}</td>
                  <td className="px-6 py-4 text-gray-700">Dr. {apt.doctor_name}</td>
                  <td className="px-6 py-4 text-gray-700">{apt.service_name}</td>
                  <td className="px-6 py-4 text-gray-700">{apt.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      apt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      apt.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{apt.status}</span>
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

const ProfileView = ({ user, userName, userInitials }) => {
  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-8 text-white text-center">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
            {userInitials}
          </div>
          <h2 className="text-2xl font-bold">{userName}</h2>
          <p className="opacity-80">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm capitalize">{user?.role}</span>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-500">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-500">Phone</span>
            <span className="font-medium">{user?.phone || 'Not set'}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-500">Role</span>
            <span className="font-medium capitalize">{user?.role}</span>
          </div>
        </div>
      </div>
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
  const { user } = useSelector((state) => state.auth);
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

  const menuItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard', roles: ['admin', 'receptionist', 'doctor', 'patient'] },
    { id: 'users', icon: 'users', label: 'Users', roles: ['admin'] },
    { id: 'doctors', icon: 'doctor', label: 'Doctors', roles: ['admin', 'receptionist'] },
    { id: 'services', icon: 'services', label: 'Services', roles: ['admin', 'receptionist'] },
    { id: 'appointments', icon: 'calendar', label: 'Appointments', roles: ['admin', 'receptionist', 'doctor', 'patient'] },
    { id: 'profile', icon: 'profile', label: 'My Profile', roles: ['admin', 'receptionist', 'doctor', 'patient'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (item) {
      if (type === 'user') {
        setFormData({ first_name: item.first_name || '', last_name: item.last_name || '', email: item.email || '', phone: item.phone || '', role: item.role || 'patient' });
      } else if (type === 'doctor') {
        setFormData({ name: item.name || '', email: item.email || '', phone: item.phone || '' });
      } else if (type === 'service') {
        setFormData({ name: item.name || '', description: item.description || '', duration: item.duration || '', price: item.price || '' });
      }
    } else {
      setFormData({});
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
          const result = await dispatch(createDoctor(formData)).unwrap();
          dispatch(fetchAllDoctors());
          if (result.password) {
            toast.success(<div><p>Doctor created!</p><p className="text-sm">Password: {result.password}</p></div>);
          } else {
            toast.success('Doctor created');
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
      case 'appointments': return <AppointmentsManagement />;
      case 'profile': return <ProfileView user={user} userName={userName} userInitials={userInitials} />;
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

        <nav className="flex-1 p-4 space-y-1">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveMenu(item.id); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeMenu === item.id
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-teal-50 hover:text-teal-700'
              }`}
            >
              <NavIcon name={item.icon} className="w-5 h-5" />
              <span>{item.label}</span>
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
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <NavIcon name="menu" className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
              </div>
              <div className="relative">
                <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100">
                  <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">{userInitials}</div>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">{editingItem ? 'Edit' : 'Add'} {modalType}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalType === 'user' && (
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
                  {isAdmin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select value={formData.role || 'patient'} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none">
                        <option value="patient">Patient</option>
                        <option value="receptionist">Receptionist</option>
                        <option value="doctor">Doctor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  )}
                </>
              )}
              {modalType === 'doctor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" required />
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

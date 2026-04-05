import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllAppointments, fetchAllUsers, fetchAllDoctors, fetchAllServices } from '../store/adminSlice';
import { useToast } from '../../../components/ui/Toast';
import { ChartSkeleton } from '../../../components/ui/Skeleton';

const ReportsPage = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { appointments, users, doctors, services, loading } = useSelector((state) => state.admin);
  const [reportType, setReportType] = useState('appointments');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    dispatch(fetchAllAppointments());
    dispatch(fetchAllUsers());
    dispatch(fetchAllDoctors());
    dispatch(fetchAllServices());
  }, [dispatch]);

  const filteredAppointments = appointments.filter(apt => {
    if (!dateFrom && !dateTo) return true;
    const aptDate = apt.date || '';
    if (dateFrom && aptDate < dateFrom) return false;
    if (dateTo && aptDate > dateTo) return false;
    return true;
  });

  const exportToCSV = () => {
    let data = [];
    let filename = '';
    let headers = [];

    if (reportType === 'appointments') {
      filename = 'appointments_report.csv';
      headers = ['ID', 'Patient', 'Doctor', 'Service', 'Date', 'Time', 'Status', 'Phone'];
      data = filteredAppointments.map(apt => [
        apt.id,
        apt.patient_name || '',
        apt.doctor_name || '',
        apt.service_name || '',
        apt.date || '',
        apt.start_time || '',
        apt.status || '',
        apt.patient_phone || '',
      ]);
    } else if (reportType === 'users') {
      filename = 'users_report.csv';
      headers = ['ID', 'Name', 'Email', 'Role', 'Phone', 'Status', 'Created'];
      data = users.map(user => [
        user.id,
        `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        user.email || '',
        user.role || '',
        user.phone || '',
        user.is_active ? 'Active' : 'Inactive',
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
      ]);
    } else if (reportType === 'doctors') {
      filename = 'doctors_report.csv';
      headers = ['ID', 'Name', 'Email', 'Specialty', 'Experience', 'Fee', 'Status'];
      data = doctors.map(doc => [
        doc.id,
        doc.name || '',
        doc.email || '',
        doc.specialty || '',
        doc.experience || 0,
        doc.consultation_fee || 0,
        doc.is_available ? 'Available' : 'Unavailable',
      ]);
    } else if (reportType === 'services') {
      filename = 'services_report.csv';
      headers = ['ID', 'Name', 'Description', 'Duration (min)', 'Price', 'Status'];
      data = services.map(svc => [
        svc.id,
        svc.name || '',
        svc.description || '',
        svc.duration || 0,
        svc.price || 0,
        svc.is_active ? 'Active' : 'Inactive',
      ]);
    }

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    toast.success('Report downloaded successfully!');
  };

  const stats = {
    totalAppointments: filteredAppointments.length,
    completedAppointments: filteredAppointments.filter(a => a.status === 'completed').length,
    pendingAppointments: filteredAppointments.filter(a => a.status === 'pending').length,
    cancelledAppointments: filteredAppointments.filter(a => a.status === 'cancelled').length,
    totalUsers: users.length,
    totalDoctors: doctors.length,
    totalServices: services.length,
    totalRevenue: filteredAppointments
      .filter(a => a.status === 'completed')
      .reduce((sum, apt) => {
        const service = services.find(s => s.id === apt.service_id);
        return sum + (service?.price || 0);
      }, 0),
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports & Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Generate and export reports</p>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            >
              <option value="appointments">Appointments</option>
              <option value="users">Users</option>
              <option value="doctors">Doctors</option>
              <option value="services">Services</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Appointments</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAppointments}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.completedAppointments}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pendingAppointments}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Cancelled</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.cancelledAppointments}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Users</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-2xl font-bold text-teal-600 mt-1">₦{stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">
            {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
          </h2>
        </div>
        <div className="overflow-x-auto max-h-96">
          {reportType === 'appointments' && (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.slice(0, 100).map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">{apt.patient_name || '-'}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">Dr. {apt.doctor_name || '-'}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{apt.service_name || '-'}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{apt.date || '-'}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {reportType === 'users' && (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">{user.first_name} {user.last_name}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{user.email}</td>
                    <td className="px-6 py-3 text-sm text-gray-700 capitalize">{user.role}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {reportType === 'doctors' && (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Specialty</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">Dr. {doc.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{doc.specialty}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{doc.experience} years</td>
                    <td className="px-6 py-3 text-sm text-gray-700">₦{doc.consultation_fee?.toLocaleString()}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${doc.is_available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {doc.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {reportType === 'services' && (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {services.map((svc) => (
                  <tr key={svc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">{svc.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{svc.duration} min</td>
                    <td className="px-6 py-3 text-sm text-gray-700">₦{svc.price?.toLocaleString()}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${svc.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {svc.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {filteredAppointments.length > 100 && (
          <div className="px-6 py-3 border-t border-gray-100 text-sm text-gray-500">
            Showing 100 of {filteredAppointments.length} records. Export to CSV for full data.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;

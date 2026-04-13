import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllAppointments, updateAppointment, deleteAppointment } from '../store/adminSlice';
import AdminLayout from './AdminLayout';

const ITEMS_PER_PAGE = 10;

const NavIcon = ({ name, className }) => {
  const icons = {
    search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
  };
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[name]}</svg>;
};

const AppointmentManagement = () => {
  const dispatch = useDispatch();
  const { appointments, appointmentsLoading } = useSelector((state) => state.admin);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({ status: 'pending', notes: '' });
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    dispatch(fetchAllAppointments());
  }, [dispatch]);

  const handleStatusChange = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({ status: appointment.status || 'pending', notes: appointment.notes || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(updateAppointment({ id: editingAppointment.id, data: formData }));
    setShowModal(false);
    setEditingAppointment(null);
    dispatch(fetchAllAppointments());
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      dispatch(deleteAppointment(id));
      dispatch(fetchAllAppointments());
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedAppointments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedAppointments.map(apt => apt.id));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) return;
    
    if (bulkAction === 'delete') {
      if (window.confirm(`Delete ${selectedIds.length} appointments?`)) {
        for (const id of selectedIds) {
          await dispatch(deleteAppointment(id));
        }
        dispatch(fetchAllAppointments());
        setSelectedIds([]);
      }
    } else {
      for (const id of selectedIds) {
        await dispatch(updateAppointment({ id, data: { status: bulkAction } }));
      }
      dispatch(fetchAllAppointments());
      setSelectedIds([]);
    }
    setBulkAction('');
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === 'all' || appointment.status === filter;
    const matchesSearch = 
      appointment.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.date?.includes(searchTerm);
    const matchesDateFrom = !dateFrom || appointment.date >= dateFrom;
    const matchesDateTo = !dateTo || appointment.date <= dateTo;
    return matchesFilter && matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);
  const paginatedAppointments = filteredAppointments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${variants[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
  };

  const statusCounts = {
    all: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  return (
    <AdminLayout title="Appointment Management" subtitle="View and manage all appointments">

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button key={status} onClick={() => setFilter(status)} className={`bg-white rounded-xl p-4 text-left border transition-all hover:shadow-md ${filter === status ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-100'}`}>
            <p className="text-sm text-gray-500 capitalize">{status}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Search by patient, doctor, service or date..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" placeholder="From" />
              <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" placeholder="To" />
              {(dateFrom || dateTo) && (
                <button onClick={() => { setDateFrom(''); setDateTo(''); setCurrentPage(1); }} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  Clear Dates
                </button>
              )}
            </div>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="p-3 bg-teal-50 border-b border-teal-100 flex items-center justify-between">
            <span className="text-sm font-medium text-teal-800">{selectedIds.length} selected</span>
            <div className="flex gap-2">
              <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
                <option value="">Bulk Action</option>
                <option value="confirmed">Mark Confirmed</option>
                <option value="completed">Mark Completed</option>
                <option value="cancelled">Mark Cancelled</option>
                <option value="delete">Delete Selected</option>
              </select>
              <button onClick={handleBulkAction} disabled={!bulkAction} className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
                Apply
              </button>
              <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
                Clear
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {appointmentsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500">No appointments found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.length === paginatedAppointments.length && paginatedAppointments.length > 0} onChange={handleSelectAll} className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedAppointments.map((apt) => (
                  <tr key={apt.id} className={`hover:bg-gray-50 ${selectedIds.includes(apt.id) ? 'bg-teal-50' : ''}`}>
                    <td className="px-4 py-4">
                      <input type="checkbox" checked={selectedIds.includes(apt.id)} onChange={() => handleSelectOne(apt.id)} className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{apt.patient_name || 'Patient'}</p>
                        <p className="text-sm text-gray-500">{apt.patient_phone || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">Dr. {apt.doctor_name || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">{apt.service_name || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">{apt.date || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">{apt.start_time || '-'}</td>
                    <td className="px-6 py-4">{getStatusBadge(apt.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleStatusChange(apt)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(apt.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAppointments.length)} of {filteredAppointments.length} appointments
            </p>
            <div className="flex gap-2">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => handlePageChange(page)} className={`px-3 py-1 rounded-lg border text-sm font-medium ${currentPage === page ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-300 hover:bg-gray-50'}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Update Appointment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" placeholder="Add notes..." />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingAppointment(null); }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AppointmentManagement;

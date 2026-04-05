import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllAppointments, fetchAllDoctors, fetchAllServices, updateAppointment } from '../store/adminSlice';
import { Link } from 'react-router-dom';

const ReceptionistDashboard = () => {
  const dispatch = useDispatch();
  const { appointments, appointmentsLoading, doctors, services } = useSelector((state) => state.admin);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ status: '', notes: '' });

  useEffect(() => {
    dispatch(fetchAllAppointments());
    dispatch(fetchAllDoctors());
    dispatch(fetchAllServices());
  }, [dispatch]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayApts = appointments.filter(apt => apt.date === today);
    setTodayAppointments(todayApts);
  }, [appointments]);

  const handleStatusUpdate = (apt) => {
    setSelectedAppointment(apt);
    setFormData({ status: apt.status || 'pending', notes: apt.notes || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateAppointment({ id: selectedAppointment.id, data: formData }));
    dispatch(fetchAllAppointments());
    setShowModal(false);
    setSelectedAppointment(null);
  };

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${variants[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
  };

  const quickBookAppointment = async (patientName, doctorId, serviceId, date, time) => {
    const appointmentData = {
      patient_name: patientName,
      doctor_id: doctorId,
      service_id: serviceId,
      date: date,
      start_time: time,
      end_time: time,
      status: 'confirmed',
      notes: 'Booked by receptionist',
    };
    try {
      const response = await fetch('https://clinic-appointment-system-88np.onrender.com/api/appointments', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1] || ''}`,
        },
        body: JSON.stringify(appointmentData),
      });
      if (response.ok) {
        dispatch(fetchAllAppointments());
        alert('Appointment booked successfully!');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Receptionist Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage appointments and patient check-ins</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Appointments</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{todayAppointments.length}</p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Confirmed</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{confirmedCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{completedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Today's Appointments</h2>
              <Link to="/admin/appointments" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                View All
              </Link>
            </div>
            <div className="p-6">
              {appointmentsLoading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500">No appointments for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((apt) => (
                    <div key={apt.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-semibold">
                            {(apt.patient_name || 'P').charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{apt.patient_name}</p>
                            <p className="text-sm text-gray-500">
                              Dr. {apt.doctor_name} - {apt.service_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{apt.start_time}</p>
                            <p className="text-sm text-gray-500">{apt.date}</p>
                          </div>
                          {getStatusBadge(apt.status)}
                          <button
                            onClick={() => handleStatusUpdate(apt)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/admin/appointments"
                className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
              >
                <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">New Appointment</p>
                  <p className="text-sm text-gray-500">Book a new appointment</p>
                </div>
              </Link>
              <Link
                to="/admin/calendar"
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Calendar</p>
                  <p className="text-sm text-gray-500">Check schedule</p>
                </div>
              </Link>
              <Link
                to="/admin/users"
                className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Register Patient</p>
                  <p className="text-sm text-gray-500">Add new patient</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Available Doctors</h3>
            <div className="space-y-3">
              {doctors.filter(d => d.is_available).slice(0, 5).map((doctor) => (
                <div key={doctor.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                    {doctor.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Dr. {doctor.name}</p>
                    <p className="text-sm text-gray-500">{doctor.specialty}</p>
                  </div>
                  <span className="text-xs text-green-600 font-medium">Available</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Update Appointment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="Add notes..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setSelectedAppointment(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllAppointments, fetchAllDoctors } from '../store/adminSlice';
import { useToast } from '../../../components/ui/Toast';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import EmptyState from '../../../components/ui/EmptyState';

const WaitingRoom = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { appointments, doctors, appointmentsLoading } = useSelector((state) => state.admin);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [markingArrived, setMarkingArrived] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInData, setCheckInData] = useState({ appointmentId: null, arrivedAt: '', status: 'waiting' });

  useEffect(() => {
    dispatch(fetchAllAppointments());
    dispatch(fetchAllDoctors());
  }, [dispatch]);

  const todayAppointments = appointments.filter(apt => {
    const matchesDate = apt.date === selectedDate;
    const matchesDoctor = selectedDoctor === 'all' || apt.doctor_id === selectedDoctor;
    return matchesDate && matchesDoctor && (apt.status === 'confirmed' || apt.status === 'pending');
  });

  const checkedIn = todayAppointments.filter(apt => apt.checkedIn);
  const waiting = todayAppointments.filter(apt => !apt.checkedIn);
  const withDoctor = todayAppointments.filter(apt => apt.status === 'with_doctor');
  const completed = todayAppointments.filter(apt => apt.status === 'completed');

  const handleCheckIn = async (apt) => {
    toast.success(`${apt.patient_name} checked in!`);
    setShowCheckInModal(false);
  };

  const getStatusColor = (apt) => {
    if (apt.status === 'completed') return 'bg-green-100 border-green-200';
    if (apt.status === 'with_doctor') return 'bg-blue-100 border-blue-200';
    if (apt.checkedIn) return 'bg-yellow-100 border-yellow-200';
    return 'bg-white border-gray-200';
  };

  const getStatusText = (apt) => {
    if (apt.status === 'completed') return 'Completed';
    if (apt.status === 'with_doctor') return 'With Doctor';
    if (apt.checkedIn) return 'In Waiting Room';
    return 'Not Arrived';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Waiting Room</h1>
          <p className="text-gray-600 mt-1">Manage patient check-ins and queue</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="all">All Doctors</option>
            {doctors.map(doc => (
              <option key={doc.id} value={doc.id}>Dr. {doc.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Today</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{todayAppointments.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Waiting</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{waiting.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">With Doctor</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{withDoctor.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{completed.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 bg-red-50">
            <h2 className="font-bold text-gray-900">Not Arrived ({waiting.length})</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {waiting.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No patients waiting</div>
            ) : (
              waiting.map(apt => (
                <div key={apt.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                      {apt.patient_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{apt.patient_name}</p>
                      <p className="text-sm text-gray-500">{apt.start_time} - {apt.service_name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setCheckInData({ appointmentId: apt.id }); setShowCheckInModal(true); }}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                  >
                    Check In
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 bg-green-50">
            <h2 className="font-bold text-gray-900">In Clinic ({withDoctor.length})</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {withDoctor.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No patients with doctor</div>
            ) : (
              withDoctor.map(apt => (
                <div key={apt.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      {apt.patient_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{apt.patient_name}</p>
                      <p className="text-sm text-gray-500">Dr. {apt.doctor_name}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    With Doctor
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;

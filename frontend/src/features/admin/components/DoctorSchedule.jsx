import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllDoctors, updateDoctor } from '../store/adminSlice';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const timeSlots = [];
for (let hour = 8; hour <= 18; hour++) {
  for (let min = 0; min < 60; min += 30) {
    const h = hour.toString().padStart(2, '0');
    const m = min.toString().padStart(2, '0');
    timeSlots.push(`${h}:${m}`);
  }
}

const DoctorSchedule = () => {
  const dispatch = useDispatch();
  const { doctors, doctorsLoading } = useSelector((state) => state.admin);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [schedule, setSchedule] = useState({});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchAllDoctors());
  }, [dispatch]);

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    const existingSchedule = doctor.schedule || {};
    const defaultSchedule = {};
    daysOfWeek.forEach((day) => {
      defaultSchedule[day] = existingSchedule[day] || {
        available: day !== 'Sunday',
        start: existingSchedule[day]?.start || '09:00',
        end: existingSchedule[day]?.end || '17:00',
      };
    });
    setSchedule(defaultSchedule);
    setShowModal(true);
  };

  const handleToggleDay = (day) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        available: !prev[day].available,
      },
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSaveSchedule = async () => {
    if (selectedDoctor) {
      await dispatch(updateDoctor({
        id: selectedDoctor.id,
        data: { schedule },
      }));
      dispatch(fetchAllDoctors());
      setShowModal(false);
    }
  };

  const getDayBadge = (doctor) => {
    if (!doctor.schedule) return null;
    const availableDays = daysOfWeek.filter((day) => doctor.schedule[day]?.available);
    if (availableDays.length === 0) {
      return <span className="text-xs text-red-600">No schedule set</span>;
    }
    return (
      <span className="text-xs text-gray-500">
        {availableDays.length} days/week
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Doctor Schedules</h1>
        <p className="text-gray-600 mt-1">Manage doctor availability and working hours</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {doctorsLoading ? (
          <div className="col-span-full flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          </div>
        ) : doctors.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">No doctors found</p>
          </div>
        ) : (
          doctors.map((doctor) => (
            <div
              key={doctor.id}
              onClick={() => handleDoctorSelect(doctor)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition-all hover:border-teal-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">
                    {doctor.name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Dr. {doctor.name}</h3>
                    <p className="text-sm text-gray-500">{doctor.specialty}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${doctor.is_available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {doctor.is_available ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Experience:</span> {doctor.experience} years
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Consultation:</span> ₦{doctor.consultation_fee?.toLocaleString()}
                </p>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-2">Schedule:</p>
                  {getDayBadge(doctor)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Set Schedule</h2>
                <p className="text-gray-500">Dr. {selectedDoctor.name}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className={`p-4 rounded-lg border ${
                    schedule[day]?.available
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={schedule[day]?.available || false}
                        onChange={() => handleToggleDay(day)}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <span className={`font-medium ${schedule[day]?.available ? 'text-gray-900' : 'text-gray-400'}`}>
                        {day}
                      </span>
                    </div>
                    {schedule[day]?.available && (
                      <div className="flex items-center gap-2">
                        <select
                          value={schedule[day]?.start || '09:00'}
                          onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                          {timeSlots.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                        <span className="text-gray-400">to</span>
                        <select
                          value={schedule[day]?.end || '17:00'}
                          onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                          {timeSlots.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Toggle days to mark them as working or non-working days. Set the start and end time for each working day.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSchedule}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;

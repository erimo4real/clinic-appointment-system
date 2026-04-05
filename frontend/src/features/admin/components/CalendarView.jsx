import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllAppointments } from '../store/adminSlice';

const CalendarView = () => {
  const dispatch = useDispatch();
  const { appointments, appointmentsLoading } = useSelector((state) => state.admin);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month');

  useEffect(() => {
    dispatch(fetchAllAppointments());
  }, [dispatch]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay, year, month };
  };

  const { daysInMonth, startingDay, year, month } = getDaysInMonth(currentDate);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getAppointmentsForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter(apt => apt.date === dateStr);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || colors.pending;
  };

  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const calendarDays = [];
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar View</h1>
          <p className="text-gray-600 mt-1">View appointments in calendar format</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToToday} className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors">
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {monthNames[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dayAppointments = day ? getAppointmentsForDate(day) : [];
              const hasAppointments = dayAppointments.length > 0;
              
              return (
                <div
                  key={index}
                  onClick={() => day && setSelectedDate(day)}
                  className={`
                    min-h-24 p-2 border border-gray-100 rounded-lg cursor-pointer transition-all
                    ${day ? 'hover:bg-gray-50' : 'bg-gray-50'}
                    ${selectedDate === day ? 'ring-2 ring-teal-500 bg-teal-50' : ''}
                    ${isToday(day) ? 'bg-blue-50 border-blue-200' : ''}
                  `}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${isToday(day) ? 'text-blue-600' : 'text-gray-700'}`}>
                        {day}
                        {isToday(day) && <span className="ml-1 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">Today</span>}
                      </div>
                      {hasAppointments && (
                        <div className="space-y-1">
                          {dayAppointments.slice(0, 2).map((apt) => (
                            <div
                              key={apt.id}
                              className={`text-xs px-2 py-1 rounded truncate ${getStatusColor(apt.status)}`}
                            >
                              {apt.start_time} - {apt.patient_name}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayAppointments.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {selectedDate ? `${monthNames[month]} ${selectedDate}, ${year}` : 'Select a date'}
          </h3>
          
          {selectedDate ? (
            selectedDateAppointments.length > 0 ? (
              <div className="space-y-3">
                {selectedDateAppointments.map((apt) => (
                  <div key={apt.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{apt.patient_name || 'Patient'}</p>
                        <p className="text-sm text-gray-500">{apt.patient_phone || 'No phone'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">Doctor:</span> Dr. {apt.doctor_name}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Service:</span> {apt.service_name}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Time:</span> {apt.start_time} - {apt.end_time}
                      </p>
                      {apt.notes && (
                        <p className="text-gray-500 italic">
                          <span className="font-medium">Notes:</span> {apt.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">No appointments for this date</p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <p className="text-gray-500">Click on a date to view appointments</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></span>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></span>
                <span className="text-sm text-gray-600">Confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-green-100 border border-green-200 rounded"></span>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-red-100 border border-red-200 rounded"></span>
                <span className="text-sm text-gray-600">Cancelled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

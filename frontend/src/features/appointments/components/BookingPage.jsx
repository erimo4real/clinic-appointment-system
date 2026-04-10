import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors, fetchAvailableSlots, fetchServices } from '../../doctors/store/doctorSlice';
import { createAppointment } from '../store/appointmentSlice';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Card, CardContent } from '../../../components/ui/Card';

const NavIcon = ({ name, className }) => {
  const icons = {
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
    arrowLeft: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  };
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[name]}</svg>;
};

const Header = () => (
  <header className="bg-white border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <span className="text-xl font-bold text-gray-900">MedBook Pro</span>
      </Link>
      <Link to="/login" className="px-4 py-2 text-teal-600 font-medium hover:text-teal-700">Sign In</Link>
    </div>
  </header>
);

const BookingPage = () => {
  const dispatch = useDispatch();
  const { doctors, availableSlots, services, loading } = useSelector((state) => state.doctors);
  
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    doctor: null,
    service: null,
    date: '',
    timeSlot: null,
    notes: '',
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchDoctors());
    dispatch(fetchServices());
  }, [dispatch]);

  useEffect(() => {
    if (bookingData.doctor && bookingData.date) {
      dispatch(fetchAvailableSlots({ doctorId: bookingData.doctor.id, date: bookingData.date }));
    }
  }, [dispatch, bookingData.doctor, bookingData.date]);

  const getDoctorName = (doctor) => {
    if (doctor.user) {
      return `Dr. ${doctor.user.firstName || ''} ${doctor.user.lastName || ''}`.trim();
    }
    return doctor.name || doctor.fullName || 'Doctor';
  };

  // Get services offered by selected doctor
  const getDoctorServices = () => {
    if (!bookingData.doctor) return services;
    const doctorServiceIds = bookingData.doctor.services || [];
    // If doctor has services linked, filter them
    if (doctorServiceIds.length > 0) {
      return services.filter(s => 
        doctorServiceIds.includes(s.id) || 
        doctorServiceIds.includes(s._id)
      );
    }
    // Fallback: return all services if no link exists
    return services;
  };

  const doctorServices = getDoctorServices();

  const handleDoctorSelect = (doctor) => {
    setBookingData({ ...bookingData, doctor, timeSlot: null });
    setStep(2);
  };

  const handleServiceSelect = (service) => {
    setBookingData({ ...bookingData, service });
    setStep(3);
  };

  const handleDateChange = (e) => {
    setBookingData({ ...bookingData, date: e.target.value, timeSlot: null });
  };

  const handleTimeSelect = (slot) => {
    setBookingData({ ...bookingData, timeSlot: slot });
  };

  const handleContinue = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBook = async () => {
    const appointmentData = {
      doctor: bookingData.doctor.id,
      service: bookingData.service.id,
      date: bookingData.date,
      start_time: bookingData.timeSlot.start_time,
      notes: bookingData.notes,
    };
    
    const result = await dispatch(createAppointment(appointmentData));
    if (createAppointment.fulfilled.match(result)) {
      setSuccess(true);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto py-16 px-4 text-center">
          <Card className="p-12">
            <CardContent className="pt-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <NavIcon name="check" className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Appointment Booked!</h2>
              <p className="text-gray-600 mb-6">
                Your appointment with {getDoctorName(bookingData.doctor)} has been scheduled for{' '}
                {new Date(bookingData.date).toLocaleDateString()} at {bookingData.timeSlot?.start_time}.
              </p>
              <div className="space-y-3">
                <Link to="/login" className="inline-block px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-teal-700">
                  Sign In to View Appointments
                </Link>
                <Link to="/" className="block text-gray-600 hover:text-teal-600">Back to Home</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {['Doctor', 'Service', 'Date & Time', 'Confirm'].map((label, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  step > index + 1 ? 'bg-teal-600 text-white' :
                  step === index + 1 ? 'bg-teal-100 text-teal-600 border-2 border-teal-600' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step > index + 1 ? <NavIcon name="check" className="w-5 h-5" /> : index + 1}
                </div>
                <span className={`ml-2 hidden sm:inline ${step >= index + 1 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  {label}
                </span>
                {index < 3 && <div className={`w-12 sm:w-24 h-1 mx-2 ${step > index + 1 ? 'bg-teal-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Doctor</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading doctors...</div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No doctors available</p>
                  <Link to="/" className="text-teal-600 hover:underline">Return to Home</Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {doctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => handleDoctorSelect(doctor)}
                      className={`p-4 rounded-xl border-2 text-left transition-all hover:border-teal-500 ${
                        bookingData.doctor?.id === doctor.id ? 'border-teal-600 bg-teal-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <NavIcon name="user" className="w-8 h-8 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{getDoctorName(doctor)}</h3>
                          <p className="text-teal-600 text-sm">{doctor.specialty || 'General'}</p>
                          <p className="text-gray-500 text-sm">₦{(doctor.consultation_fee || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
                <NavIcon name="arrowLeft" className="w-5 h-5" /> Back to Doctors
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Service</h2>
              <p className="text-gray-500 text-sm mb-6">
                Services offered by {getDoctorName(bookingData.doctor)}
              </p>
              <div className="space-y-3">
                {doctorServices.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No services available for this doctor.</p>
                ) : (
                  doctorServices.map((service) => (
                    <button
                      key={service.id || service._id}
                      onClick={() => handleServiceSelect(service)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:border-teal-500 ${
                        bookingData.service?.id === service.id || bookingData.service?._id === service._id ? 'border-teal-600 bg-teal-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-gray-900">{service.name}</h3>
                          <p className="text-gray-500 text-sm">{service.duration} minutes</p>
                        </div>
                        <span className="text-teal-600 font-semibold">₦{(service.price || 0).toLocaleString()}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <button onClick={() => setStep(2)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
                <NavIcon name="arrowLeft" className="w-5 h-5" /> Back to Services
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Date & Time</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <Input
                  type="date"
                  value={bookingData.date}
                  onChange={handleDateChange}
                  min={getMinDate()}
                />
              </div>
              {bookingData.date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
                  {availableSlots.length === 0 ? (
                    <p className="text-gray-500 py-4">No available slots for this date.</p>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => handleTimeSelect(slot)}
                          disabled={!slot.available}
                          className={`p-2 rounded-lg text-sm font-medium transition-all ${
                            !slot.available ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                            bookingData.timeSlot?.start_time === slot.start_time ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-teal-100'
                          }`}
                        >
                          {slot.start_time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {bookingData.timeSlot && (
                <Button onClick={handleContinue} className="mt-6">
                  Continue to Confirm
                </Button>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <button onClick={() => setStep(3)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
                <NavIcon name="arrowLeft" className="w-5 h-5" /> Back to Date & Time
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm Appointment</h2>
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Doctor</span>
                    <span className="font-medium text-gray-900">{getDoctorName(bookingData.doctor)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service</span>
                    <span className="font-medium text-gray-900">{bookingData.service?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium text-gray-900">{new Date(bookingData.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium text-gray-900">{bookingData.timeSlot?.start_time}</span>
                  </div>
                  <div className="flex justify-between border-t pt-4">
                    <span className="text-gray-500">Total</span>
                    <span className="font-bold text-teal-600 text-xl">₦{(bookingData.service?.price || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                <Textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  className="h-24"
                  placeholder="Any symptoms or concerns..."
                />
              </div>
              <Button onClick={handleBook} className="w-full">
                Confirm Booking
              </Button>
            </div>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingPage;

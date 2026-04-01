import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors, fetchAvailableSlots, fetchServices } from '../../doctors/store/doctorSlice';
import { createAppointment } from '../store/appointmentSlice';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Card, CardContent } from '../../../components/ui/Card';

const Header = () => (
  <header className="bg-white border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <span className="text-xl font-bold text-gray-900">MedBook Pro</span>
      </Link>
      <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">Sign In</Link>
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
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Appointment Booked!</h2>
              <p className="text-gray-600 mb-6">
                Your appointment with {bookingData.doctor?.name} has been scheduled for{' '}
                {new Date(bookingData.date).toLocaleDateString()} at {bookingData.timeSlot?.start_time}.
              </p>
              <div className="space-y-3">
                <Link to="/login" className="btn-primary inline-block">
                  Sign In to View Appointments
                </Link>
                <Link to="/" className="block text-gray-600 hover:text-blue-600">
                  Back to Home
                </Link>
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
                  step > index + 1 ? 'bg-blue-600 text-white' :
                  step === index + 1 ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step > index + 1 ? '✓' : index + 1}
                </div>
                <span className={`ml-2 hidden sm:inline ${step >= index + 1 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  {label}
                </span>
                {index < 3 && <div className={`w-12 sm:w-24 h-1 mx-2 ${step > index + 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />}
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
                <div className="text-center py-8">Loading doctors...</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {doctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => handleDoctorSelect(doctor)}
                      className={`p-4 rounded-xl border-2 text-left transition-all hover:border-blue-500 ${
                        bookingData.doctor?.id === doctor.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-2xl">
                          👨‍⚕️
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                          <p className="text-blue-600 text-sm">{doctor.specialty}</p>
                          <p className="text-gray-500 text-sm">₦{doctor.consultation_fee?.toLocaleString()}</p>
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
              <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-700 mb-4">
                ← Back to Doctors
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Service</h2>
              <div className="space-y-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:border-blue-500 ${
                      bookingData.service?.id === service.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        <p className="text-gray-500 text-sm">{service.duration} minutes</p>
                      </div>
                      <span className="text-blue-600 font-semibold">₦{service.price?.toLocaleString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <button onClick={() => setStep(2)} className="text-gray-500 hover:text-gray-700 mb-4">
                ← Back to Services
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
                            bookingData.timeSlot?.start_time === slot.start_time ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
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
              <button onClick={() => setStep(3)} className="text-gray-500 hover:text-gray-700 mb-4">
                ← Back to Date & Time
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm Appointment</h2>
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Doctor</span>
                    <span className="font-medium text-gray-900">{bookingData.doctor?.name}</span>
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
                    <span className="font-bold text-blue-600 text-xl">₦{bookingData.service?.price?.toLocaleString()}</span>
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

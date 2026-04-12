import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors, fetchAvailableSlots, fetchServices } from '../../doctors/store/doctorSlice';
import { register } from '../../auth/store/authSlice';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Card, CardContent } from '../../../components/ui/Card';
import api from '../../../shared/services/api';

const BOOKING_STORAGE_KEY = 'pending_booking_data';

const NavIcon = ({ name, className }) => {
  const icons = {
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
    arrowLeft: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    medical: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />,
    shield: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    star: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
  };
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[name]}</svg>;
};

const specialties = [
  'All Specialties',
  'General Medicine',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Dermatology',
  'Ophthalmology',
  'ENT',
  'Gynecology',
  'Psychiatry',
  'Oncology',
  'Gastroenterology',
  'Pulmonology',
  'Urology',
  'Endocrinology',
  'Rheumatology',
];

const Header = () => (
  <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <span className="text-xl font-bold text-gray-900">MedBook Pro</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/doctors" className="text-gray-600 hover:text-teal-600 font-medium hidden sm:block">View Doctors</Link>
        <Link to="/login" className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors">Sign In</Link>
      </div>
    </div>
  </header>
);

const HeroSection = () => (
  <div className="bg-gradient-to-br from-teal-600 via-teal-500 to-teal-400 text-white py-12 px-4">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">Book Your Appointment</h1>
      <p className="text-teal-50 text-lg mb-8">Quality healthcare made simple and accessible</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <NavIcon name="user" className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold mb-1">1. Choose Doctor</h3>
          <p className="text-sm text-teal-100">Browse our specialists</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <NavIcon name="medical" className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold mb-1">2. Select Service</h3>
          <p className="text-sm text-teal-100">Pick your treatment</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <NavIcon name="calendar" className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold mb-1">3. Pick Time</h3>
          <p className="text-sm text-teal-100">Schedule your visit</p>
        </div>
      </div>
    </div>
  </div>
);

const ProgressSteps = ({ currentStep }) => {
  const steps = [
    { num: 1, label: 'Doctor', desc: 'Choose specialist' },
    { num: 2, label: 'Service', desc: 'Select treatment' },
    { num: 3, label: 'Schedule', desc: 'Pick date & time' },
    { num: 4, label: 'Confirm', desc: 'Review & book' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.num}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                currentStep > step.num 
                  ? 'bg-teal-600 text-white' 
                  : currentStep === step.num 
                    ? 'bg-teal-100 text-teal-600 border-2 border-teal-600' 
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {currentStep > step.num ? (
                  <NavIcon name="check" className="w-5 h-5" />
                ) : (
                  step.num
                )}
              </div>
              <span className={`text-xs mt-1 hidden sm:block ${currentStep >= step.num ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {step.label}
              </span>
              <span className="text-xs text-gray-400 hidden md:block">{step.desc}</span>
            </div>
            {index < 3 && (
              <div className={`flex-1 h-1 mx-2 rounded ${currentStep > step.num ? 'bg-teal-600' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const DoctorCard = ({ doctor, isSelected, onSelect }) => {
  const getDoctorName = (doctor) => {
    if (doctor.user) {
      return `Dr. ${doctor.user.firstName || ''} ${doctor.user.lastName || ''}`.trim();
    }
    return doctor.name || doctor.fullName || 'Doctor';
  };

  const serviceNames = doctor.services?.slice(0, 3).map(s => s.name) || [];

  return (
    <button
      onClick={() => onSelect(doctor)}
      className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-lg ${
        isSelected 
          ? 'border-teal-600 bg-teal-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-teal-400 hover:bg-teal-50/50'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          {doctor.profileImage ? (
            <img src={doctor.profileImage} alt={getDoctorName(doctor)} className="w-full h-full object-cover rounded-full" />
          ) : (
            <NavIcon name="user" className="w-10 h-10 text-teal-600" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-lg">{getDoctorName(doctor)}</h3>
          <span className="inline-block px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs font-medium mt-1">
            {doctor.specialty || 'General'}
          </span>
          
          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <NavIcon name="star" className="w-4 h-4 text-amber-400" />
              {doctor.experience || 0} years exp
            </span>
            <span className="text-gray-300">|</span>
            <span className="font-semibold text-teal-600">
              ₦{(doctor.consultationFee || doctor.consultation_fee || 0).toLocaleString()}
            </span>
          </div>

          {serviceNames.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {serviceNames.map((name, i) => (
                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                  {name}
                </span>
              ))}
              {doctor.services?.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                  +{doctor.services.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
        
        {isSelected && (
          <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
            <NavIcon name="check" className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </button>
  );
};

const BookingSuccessPage = ({ bookingData, onCreateAccount, onSignIn, onBackHome, isRegistering, registerForm, setRegisterForm, handleRegister, registerLoading, registerError }) => {
  const getDoctorName = (doctor) => {
    if (doctor.user) {
      return `Dr. ${doctor.user.firstName || ''} ${doctor.user.lastName || ''}`.trim();
    }
    return doctor.name || doctor.fullName || 'Doctor';
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-6 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <NavIcon name="check" className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Almost Done!</h2>
          <p className="text-teal-100 mt-1">Create an account to save your booking</p>
        </div>
        
        <CardContent className="p-6">
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{getDoctorName(bookingData.doctor)}</h3>
            <p className="text-sm text-gray-600">{bookingData.service?.name}</p>
            <p className="text-sm text-gray-600">
              {new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-sm text-gray-600">at {typeof bookingData.timeSlot === 'string' ? bookingData.timeSlot : bookingData.timeSlot?.start_time}</p>
          </div>

          {isRegistering ? (
            <div>
              <h3 className="font-bold text-gray-900 mb-2 text-center">Create Your Account</h3>
              <p className="text-sm text-gray-500 mb-4 text-center">Your booking will be saved to your account</p>
              
              {registerError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{registerError}</p>
                </div>
              )}
              
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={registerForm.firstName}
                    onChange={(e) => setRegisterForm({...registerForm, firstName: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={registerForm.lastName}
                    onChange={(e) => setRegisterForm({...registerForm, lastName: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
                <input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {registerLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account & Save Booking'
                  )}
                </button>
                <button
                  type="button"
                  onClick={onBackHome}
                  className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm"
                >
                  Continue as Guest (booking won't be saved)
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={onCreateAccount}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all"
              >
                Create Account to Save Booking
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>
              
              <button
                onClick={onSignIn}
                className="w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                Sign In to Existing Account
              </button>
              
              <button
                onClick={onBackHome}
                className="w-full py-2 text-gray-500 hover:text-gray-600 text-sm"
              >
                Continue as Guest
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const BookingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { doctors, availableSlots, services, loading } = useSelector((state) => state.doctors);
  
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All Specialties');
  const [bookingData, setBookingData] = useState({
    doctor: null,
    service: null,
    date: '',
    timeSlot: null,
    notes: '',
  });
  const [success, setSuccess] = useState(false);
  const [booking, setBooking] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  useEffect(() => {
    dispatch(fetchDoctors());
    dispatch(fetchServices());
  }, [dispatch]);

  useEffect(() => {
    if (bookingData.doctor && bookingData.date) {
      dispatch(fetchAvailableSlots({ doctorId: getId(bookingData.doctor), date: bookingData.date }));
    }
  }, [dispatch, bookingData.doctor, bookingData.date]);

  const getDoctorName = (doctor) => {
    if (doctor.user) {
      return `Dr. ${doctor.user.firstName || ''} ${doctor.user.lastName || ''}`.trim();
    }
    return doctor.name || doctor.fullName || 'Doctor';
  };

  const getDoctorServices = () => {
    if (!bookingData.doctor) return services;
    const doctorServiceIds = bookingData.doctor.services?.map(s => s.id || s._id) || [];
    if (doctorServiceIds.length > 0) {
      return services.filter(s => doctorServiceIds.includes(s.id) || doctorServiceIds.includes(s._id));
    }
    return services;
  };

  const getId = (obj) => obj?.id || obj?._id;
  const doctorServices = getDoctorServices();

  const filteredDoctors = doctors.filter(doctor => {
    const name = getDoctorName(doctor).toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesSpecialty = specialtyFilter === 'All Specialties' || doctor.specialty === specialtyFilter;
    return matchesSearch && matchesSpecialty;
  });

  const handleDoctorSelect = (doctor) => {
    setBookingData({ ...bookingData, doctor, service: null, timeSlot: null });
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

  const handleConfirmBooking = () => {
    setStep(4);
  };

  const handleBookAndSave = async () => {
    setBooking(true);
    
    try {
      const timeSlot = typeof bookingData.timeSlot === 'string' ? bookingData.timeSlot : bookingData.timeSlot?.start_time;
      const [hours, minutes] = timeSlot.split(':');
      const endHour = parseInt(hours) + 1;
      const endTime = `${endHour.toString().padStart(2, '0')}:${minutes}`;
      
      const appointmentData = {
        doctor: getId(bookingData.doctor),
        service: getId(bookingData.service),
        date: bookingData.date,
        startTime: timeSlot,
        endTime: endTime,
        notes: bookingData.notes,
      };
      
      await api.post('/appointments', appointmentData);
      setSuccess(true);
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterLoading(true);

    try {
      const result = await dispatch(register({
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        email: registerForm.email,
        phone: registerForm.phone,
        password: registerForm.password,
        role: 'patient',
      }));

      if (register.fulfilled.match(result)) {
        const pendingBooking = JSON.parse(localStorage.getItem(BOOKING_STORAGE_KEY) || 'null');
        
        if (pendingBooking) {
          try {
            await api.post('/appointments', pendingBooking);
            localStorage.removeItem(BOOKING_STORAGE_KEY);
          } catch (bookingError) {
            console.error('Failed to create booking:', bookingError);
          }
        }
        
        navigate('/dashboard');
      } else {
        setRegisterError(result.payload || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setRegisterError(error.message || 'Registration failed. Please try again.');
    } finally {
      setRegisterLoading(false);
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
        <div className="max-w-4xl mx-auto py-12 px-4">
          <BookingSuccessPage
            bookingData={bookingData}
            onCreateAccount={() => {
              const timeSlot = typeof bookingData.timeSlot === 'string' ? bookingData.timeSlot : bookingData.timeSlot?.start_time;
              const [hours, minutes] = timeSlot.split(':');
              const endHour = parseInt(hours) + 1;
              const endTime = `${endHour.toString().padStart(2, '0')}:${minutes}`;
              
              const pendingBooking = {
                doctor: getId(bookingData.doctor),
                service: getId(bookingData.service),
                date: bookingData.date,
                startTime: timeSlot,
                endTime: endTime,
                notes: bookingData.notes,
              };
              localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(pendingBooking));
              setIsRegistering(true);
            }}
            onSignIn={() => {
              const timeSlot = typeof bookingData.timeSlot === 'string' ? bookingData.timeSlot : bookingData.timeSlot?.start_time;
              const [hours, minutes] = timeSlot.split(':');
              const endHour = parseInt(hours) + 1;
              const endTime = `${endHour.toString().padStart(2, '0')}:${minutes}`;
              
              localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify({
                doctor: getId(bookingData.doctor),
                service: getId(bookingData.service),
                date: bookingData.date,
                startTime: timeSlot,
                endTime: endTime,
                notes: bookingData.notes,
              }));
              navigate('/login');
            }}
            onBackHome={() => {
              localStorage.removeItem(BOOKING_STORAGE_KEY);
              navigate('/');
            }}
            isRegistering={isRegistering}
            registerForm={registerForm}
            setRegisterForm={setRegisterForm}
            handleRegister={handleRegister}
            registerLoading={registerLoading}
            registerError={registerError}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ProgressSteps currentStep={step} />

        <Card>
          <CardContent className="p-6">
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Your Doctor</h2>
                
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className="flex-1 relative">
                    <NavIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search doctors by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>
                  <select
                    value={specialtyFilter}
                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                  >
                    {specialties.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading doctors...</p>
                  </div>
                ) : filteredDoctors.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <NavIcon name="user" className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-2">No doctors found</p>
                    <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 mb-4">{filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} available</p>
                    {filteredDoctors.map((doctor) => (
                      <DoctorCard
                        key={doctor.id}
                        doctor={doctor}
                        isSelected={bookingData.doctor?.id === doctor.id}
                        onSelect={handleDoctorSelect}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <button 
                  onClick={() => setStep(1)} 
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                >
                  <NavIcon name="arrowLeft" className="w-5 h-5" /> Back to Doctors
                </button>
                
                <div className="bg-teal-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center">
                      <NavIcon name="user" className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{getDoctorName(bookingData.doctor)}</p>
                      <p className="text-sm text-teal-600">{bookingData.doctor.specialty}</p>
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2"> Select a Service</h2>
                <p className="text-gray-500 text-sm mb-6">Choose from {doctorServices.length} available service{doctorServices.length !== 1 ? 's' : ''}</p>
                
                <div className="space-y-3">
                  {doctorServices.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No services available for this doctor.</p>
                    </div>
                  ) : (
                    doctorServices.map((service) => (
                      <button
                        key={service.id || service._id}
                        onClick={() => handleServiceSelect(service)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                          bookingData.service?.id === service.id || bookingData.service?._id === service._id 
                            ? 'border-teal-600 bg-teal-50' 
                            : 'border-gray-200 bg-white hover:border-teal-400'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-gray-900">{service.name}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <NavIcon name="clock" className="w-4 h-4" />
                              {service.duration} minutes
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="block text-teal-600 font-bold text-lg">₦{service.price?.toLocaleString()}</span>
                            {bookingData.service?.id === service.id || bookingData.service?._id === service._id ? (
                              <span className="text-xs text-teal-600 font-medium">Selected</span>
                            ) : (
                              <span className="text-xs text-gray-400">Click to select</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <button 
                  onClick={() => setStep(2)} 
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                >
                  <NavIcon name="arrowLeft" className="w-5 h-5" /> Back to Services
                </button>
                
                <h2 className="text-xl font-bold text-gray-900 mb-6">Select Date & Time</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Choose a Date</label>
                  <Input
                    type="date"
                    value={bookingData.date}
                    onChange={handleDateChange}
                    min={getMinDate()}
                    className="max-w-xs"
                  />
                </div>
                
                {bookingData.date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Available Time Slots for {new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </label>
                    {Array.isArray(availableSlots) && availableSlots.length === 0 ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-700">
                        <p className="flex items-center gap-2">
                          <NavIcon name="clock" className="w-5 h-5" />
                          No available slots for this date. Please try another date.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {(Array.isArray(availableSlots) ? availableSlots : []).map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => handleTimeSelect(typeof slot === 'string' ? slot : slot.start_time)}
                            className={`p-3 rounded-lg text-sm font-medium transition-all ${
                              bookingData.timeSlot === slot || bookingData.timeSlot === slot.start_time
                                ? 'bg-teal-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-teal-100 hover:text-teal-700'
                            }`}
                          >
                            {typeof slot === 'string' ? slot : slot.start_time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {bookingData.timeSlot && (
                  <div className="mt-6 p-4 bg-teal-50 rounded-lg">
                    <p className="text-sm text-teal-700">
                      <span className="font-semibold">Selected:</span> {new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {bookingData.timeSlot}
                    </p>
                    <Button onClick={handleConfirmBooking} className="mt-4 w-full">
                      Continue to Confirm
                    </Button>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div>
                <button 
                  onClick={() => setStep(3)} 
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                >
                  <NavIcon name="arrowLeft" className="w-5 h-5" /> Back to Schedule
                </button>
                
                <h2 className="text-xl font-bold text-gray-900 mb-6">Confirm Your Appointment</h2>
                
                <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <NavIcon name="user" className="w-8 h-8 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{getDoctorName(bookingData.doctor)}</h3>
                      <p className="text-sm text-teal-600">{bookingData.doctor.specialty}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-teal-200 pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 flex items-center gap-2">
                        <NavIcon name="medical" className="w-4 h-4" />
                        Service
                      </span>
                      <span className="font-medium text-gray-900">{bookingData.service?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 flex items-center gap-2">
                        <NavIcon name="calendar" className="w-4 h-4" />
                        Date
                      </span>
                      <span className="font-medium text-gray-900">
                        {new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 flex items-center gap-2">
                        <NavIcon name="clock" className="w-4 h-4" />
                        Time
                      </span>
                      <span className="font-medium text-gray-900">{bookingData.timeSlot}</span>
                    </div>
                    <div className="flex justify-between border-t border-teal-200 pt-3">
                      <span className="text-gray-600 font-medium">Total</span>
                      <span className="font-bold text-teal-600 text-xl">₦{bookingData.service?.price?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                  <Textarea
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    className="h-24"
                    placeholder="Any symptoms, concerns, or special requests..."
                  />
                </div>
                
                <Button 
                  onClick={handleBookAndSave} 
                  className="w-full py-4 text-lg" 
                  disabled={booking}
                >
                  {booking ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Booking...
                    </span>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
                
                <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                  <NavIcon name="shield" className="w-4 h-4" />
                  Your information is secure and encrypted
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingPage;

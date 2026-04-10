import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/authSlice';
import api from '../../../shared/services/api';

const BOOKING_STORAGE_KEY = 'pending_booking_data';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [hasPendingBooking, setHasPendingBooking] = useState(false);
  const [bookingInfo, setBookingInfo] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    const pendingBooking = localStorage.getItem(BOOKING_STORAGE_KEY);
    if (pendingBooking) {
      try {
        const booking = JSON.parse(pendingBooking);
        setHasPendingBooking(true);
        setBookingInfo({
          doctor: booking.doctor,
          service: booking.service,
          date: booking.date,
          time: booking.start_time,
        });
      } catch (e) {
        localStorage.removeItem(BOOKING_STORAGE_KEY);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(formData));
    if (login.fulfilled.match(result)) {
      const pendingBooking = localStorage.getItem(BOOKING_STORAGE_KEY);
      
      if (pendingBooking) {
        try {
          const bookingData = JSON.parse(pendingBooking);
          await api.post('/appointments', bookingData);
          localStorage.removeItem(BOOKING_STORAGE_KEY);
        } catch (bookingError) {
          console.error('Failed to create booking:', bookingError);
        }
      }
      
      const userRole = result.payload?.user?.role;
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'doctor') {
        navigate('/profile');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-6 lg:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg mb-3 lg:mb-4">
            <svg className="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">MedBook Pro</h1>
          <p className="text-gray-500 mt-1 text-sm lg:text-base">Clinic Appointment System</p>
        </div>
        
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl border border-gray-100 p-6 lg:p-8">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">Welcome Back</h2>
          <p className="text-gray-500 mb-5 lg:mb-6 text-sm lg:text-base">
            {hasPendingBooking 
              ? 'Sign in to save your appointment' 
              : 'Sign in to your account to continue'
            }
          </p>

          {hasPendingBooking && bookingInfo && (
            <div className="mb-5 p-4 bg-teal-50 border border-teal-200 rounded-xl">
              <p className="text-sm text-teal-700 font-medium mb-2">You have a pending appointment:</p>
              <p className="text-sm text-teal-600">
                {new Date(bookingInfo.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {bookingInfo.time}
              </p>
              <p className="text-xs text-teal-500 mt-1">Sign in to save this booking to your account</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
            {error && (
              <div className="p-3 lg:p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 lg:gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-base"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-base"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : hasPendingBooking ? 'Sign In & Save Booking' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-5 lg:mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-teal-600 font-semibold hover:text-teal-700">
                Create one
              </Link>
            </p>
          </div>
        </div>
        
        <Link to="/" className="block text-center mt-5 lg:mt-6 text-gray-500 hover:text-teal-600 transition-colors text-sm">
          <span className="inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </span>
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;

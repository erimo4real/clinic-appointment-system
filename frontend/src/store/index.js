/**
 * =====================================================
 * REDUX STORE CONFIGURATION
 * =====================================================
 * 
 * Central Redux store that combines all feature reducers.
 * This is the single source of truth for application state.
 * 
 * @store Redux Store
 * 
 * =====================================================
 * STATE STRUCTURE:
 * {
 *   auth: { user, isAuthenticated, loading, error },
 *   appointments: { appointments, todayAppointments, stats, loading, error },
 *   doctors: { doctors, currentDoctor, schedule, availableSlots, services, loading, error }
 * }
 * =====================================================
 */

import { configureStore } from '@reduxjs/toolkit';

/**
 * Feature Reducers
 * Each feature has its own slice of state
 */
import authReducer from '../features/auth/store/authSlice';
import appointmentReducer from '../features/appointments/store/appointmentSlice';
import doctorReducer from '../features/doctors/store/doctorSlice';
import adminReducer from '../features/admin/store/adminSlice';
import feedbackReducer from '../features/feedback/store/feedbackSlice';

/**
 * Configure and create the Redux store
 * 
 * @function configureStore
 * @returns {Store} Redux store instance
 */
export const store = configureStore({
  reducer: {
    /**
     * Authentication state
     * Contains: user, isAuthenticated, loading, error
     */
    auth: authReducer,
    
    /**
     * Appointments state
     * Contains: appointments[], todayAppointments[], stats, loading, error
     */
    appointments: appointmentReducer,
    
    /**
     * Doctors state
     * Contains: doctors[], currentDoctor, schedule, availableSlots, services[], loading, error
     */
    doctors: doctorReducer,

    /**
     * Admin state
     * Contains: users[], doctors[], appointments[], services[], stats, loading, error
     */
    admin: adminReducer,

    /**
     * Feedback state
     * Contains: patientFeedback[], doctorFeedback[], adminFeedback[], loading, error
     */
    feedback: feedbackReducer,
  },
  
  /**
   * Redux DevTools configuration
   * Enable in development for debugging
   */
  devTools: process.env.NODE_ENV !== 'production',
});

/**
 * =====================================================
 * STATE SELECTORS
 * =====================================================
 * Quick access to commonly used state slices
 */

// Get auth state
export const selectAuth = (state) => state.auth;

// Get appointments state  
export const selectAppointments = (state) => state.appointments;

// Get doctors state
export const selectDoctors = (state) => state.doctors;

// Get current user
export const selectCurrentUser = (state) => state.auth.user;

// Check if user is authenticated
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

// Get all appointments
export const selectAllAppointments = (state) => state.appointments.appointments;

// Get today's appointments
export const selectTodayAppointments = (state) => state.appointments.todayAppointments;

// Get dashboard stats
export const selectDashboardStats = (state) => state.appointments.stats;

// Get all doctors
export const selectAllDoctors = (state) => state.doctors.doctors;

// Get current doctor profile
export const selectCurrentDoctor = (state) => state.doctors.currentDoctor;

// Get available services
export const selectServices = (state) => state.doctors.services;

// Get available slots for booking
export const selectAvailableSlots = (state) => state.doctors.availableSlots;

// Get loading states
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAppointmentsLoading = (state) => state.appointments.loading;
export const selectDoctorsLoading = (state) => state.doctors.loading;

// Get error states
export const selectAuthError = (state) => state.auth.error;
export const selectAppointmentsError = (state) => state.appointments.error;
export const selectDoctorsError = (state) => state.doctors.error;

/**
 * =====================================================
 * DEBUGGING TIPS
 * =====================================================
 * 
 * 1. Install Redux DevTools browser extension
 * 2. In browser console, access store:
 *    - import store from './store'
 * 3. To inspect state:
 *    - store.getState()
 * 4. To dispatch actions:
 *    - store.dispatch({ type: 'auth/login/pending' })
 * 5. Subscribe to changes:
 *    - store.subscribe(() => store.getState())
 * 
 * =====================================================
 */

export default store;

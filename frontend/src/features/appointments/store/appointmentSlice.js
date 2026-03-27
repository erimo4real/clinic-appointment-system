/**
 * =====================================================
 * APPOINTMENT SLICE - Appointments State Management
 * =====================================================
 * 
 * Manages appointments state including:
 * - User's appointments
 * - Today's appointments
 * - Dashboard statistics
 * - Create/Update/Cancel appointments
 * 
 * @feature Appointments
 * @state { appointments, todayAppointments, stats, loading, error }
 * 
 * =====================================================
 * STATE STRUCTURE:
 * {
 *   appointments: Appointment[],
 *   todayAppointments: Appointment[],
 *   stats: { total, pending, completed, cancelled } | null,
 *   loading: boolean,
 *   error: string | null
 * }
 * =====================================================
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../shared/services/api';

/**
 * =====================================================
 * ASYNC THUNKS - API CALLS
 * =====================================================
 */

/**
 * Fetch all appointments (filtered by user role)
 * 
 * @asyncThunk fetchAppointments
 * @returns {Promise} Array of appointments
 * 
 * @calls GET /api/appointments
 * @sideEffects Updates appointments array in state
 * 
 * @note Role-based: patients see own, doctors see assigned, admin sees all
 */
export const fetchAppointments = createAsyncThunk('appointments/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/appointments');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to fetch appointments' });
  }
});

/**
 * Fetch today's appointments
 * 
 * @asyncThunk fetchTodayAppointments
 * @returns {Promise} Array of today's appointments
 * 
 * @calls GET /api/appointments?date=YYYY-MM-DD
 * @sideEffects Updates todayAppointments in state
 */
export const fetchTodayAppointments = createAsyncThunk('appointments/fetchToday', async (_, { rejectWithValue }) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await api.get(`/appointments?date=${today}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to fetch today appointments' });
  }
});

/**
 * Fetch dashboard statistics
 * 
 * @asyncThunk fetchDashboardStats
 * @returns {Promise} Dashboard stats object
 * 
 * @calls GET /api/appointments/stats
 * @sideEffects Updates stats in state
 */
export const fetchDashboardStats = createAsyncThunk('appointments/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/appointments/stats');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to fetch stats' });
  }
});

/**
 * Create new appointment
 * 
 * @asyncThunk createAppointment
 * @param {Object} appointmentData - { doctor, service, date, startTime, endTime, notes }
 * @returns {Promise} Created appointment
 * 
 * @calls POST /api/appointments
 * @sideEffects Adds new appointment to appointments array
 * 
 * @example
 * dispatch(createAppointment({
 *   doctor: 'doctor-id',
 *   service: 'service-id',
 *   date: '2024-01-15',
 *   startTime: '09:00',
 *   endTime: '09:30'
 * }))
 */
export const createAppointment = createAsyncThunk('appointments/create', async (appointmentData, { rejectWithValue }) => {
  try {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to create appointment' });
  }
});

/**
 * Update appointment
 * 
 * @asyncThunk updateAppointment
 * @param {Object} params - { id, ...updateData }
 * @returns {Promise} Updated appointment
 * 
 * @calls PUT /api/appointments/:id
 * @sideEffects Updates appointment in appointments array
 */
export const updateAppointment = createAsyncThunk('appointments/update', async ({ id, ...data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to update appointment' });
  }
});

/**
 * Cancel appointment
 * 
 * @asyncThunk cancelAppointment
 * @param {string} id - Appointment ID to cancel
 * @returns {Promise} Cancellation confirmation
 * 
 * @calls DELETE /api/appointments/:id
 * @sideEffects Removes or updates appointment status to cancelled
 */
export const cancelAppointment = createAsyncThunk('appointments/cancel', async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/appointments/${id}`);
    return { id, ...response.data };
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to cancel appointment' });
  }
});

export const fetchDoctorAppointments = createAsyncThunk('appointments/fetchDoctor', async (doctorId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/appointments/doctor/${doctorId}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to fetch doctor appointments' });
  }
});

export const fetchMyAppointments = createAsyncThunk('appointments/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/appointments');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to fetch my appointments' });
  }
});

/**
 * =====================================================
 * SLICE DEFINITION
 * =====================================================
 */

const appointmentSlice = createSlice({
  name: 'appointments',
  
  initialState: {
    appointments: [],      // All appointments
    todayAppointments: [], // Today's appointments
    stats: null,         // Dashboard statistics
    loading: false,      // Loading state
    error: null,         // Error message
  },
  
  reducers: {
    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // ==================
      // FETCH APPOINTMENTS
      // ==================
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.payload?.message;
      })
      
      // ==================
      // FETCH TODAY
      // ==================
      .addCase(fetchTodayAppointments.fulfilled, (state, action) => {
        state.todayAppointments = action.payload;
      })
      
      // ==================
      // FETCH STATS
      // ==================
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      
      // ==================
      // CREATE
      // ==================
      .addCase(createAppointment.fulfilled, (state, action) => {
        // Add new appointment to the beginning of the array
        state.appointments.unshift(action.payload);
      })
      
      // ==================
      // UPDATE
      // ==================
      .addCase(updateAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      
      // ==================
      // CANCEL
      // ==================
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        // Remove cancelled appointment from list or update status
        state.appointments = state.appointments.filter(a => a._id !== action.payload.id);
      })
      
      // ==================
      // FETCH DOCTOR APPOINTMENTS
      // ==================
      .addCase(fetchDoctorAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchDoctorAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.payload?.message;
      })
      
      // ==================
      // FETCH MY APPOINTMENTS
      // ==================
      .addCase(fetchMyAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchMyAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.payload?.message;
      });
  },
});

/**
 * =====================================================
 * EXPORTS
 * =====================================================
 */

export const { clearError } = appointmentSlice.actions;
export default appointmentSlice.reducer;

/**
 * =====================================================
 * DEBUGGING GUIDE
 * =====================================================
 * 
 * In browser console:
 * 
 * 1. Import:
 *    import store from './store';
 * 
 * 2. Fetch all appointments:
 *    store.dispatch(fetchAppointments())
 * 
 * 3. Fetch today's appointments:
 *    store.dispatch(fetchTodayAppointments())
 * 
 * 4. Get all appointments:
 *    store.getState().appointments.appointments
 * 
 * 5. Create appointment:
 *    store.dispatch(createAppointment({
 *      doctor: 'doctor-id',
 *      service: 'service-id',
 *      date: '2024-01-15',
 *      startTime: '09:00',
 *      endTime: '09:30'
 *    }))
 * 
 * 6. Cancel appointment:
 *    store.dispatch(cancelAppointment('appointment-id'))
 * 
 * 7. Check stats:
 *    store.dispatch(fetchDashboardStats())
 *    store.getState().appointments.stats
 * 
 * =====================================================
 */

/**
 * =====================================================
 * DOCTOR SLICE - Doctors & Services State Management
 * =====================================================
 * 
 * Manages doctors and services state including:
 * - List of doctors
 * - Doctor profile details
 * - Doctor schedules
 * - Available appointment slots
 * - Clinic services
 * 
 * @feature Doctors
 * @state { doctors, currentDoctor, schedule, availableSlots, services, loading, error }
 * 
 * =====================================================
 * STATE STRUCTURE:
 * {
 *   doctors: Doctor[],
 *   currentDoctor: Doctor | null,
 *   schedule: Schedule[],
 *   availableSlots: TimeSlot[],
 *   services: Service[],
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
 * Fetch all doctors
 * 
 * @asyncThunk fetchDoctors
 * @param {string} [specialty] - Optional specialty filter
 * @returns {Promise} Array of doctors
 * 
 * @calls GET /api/doctors?specialty=...
 * @sideEffects Updates doctors array in state
 */
export const fetchDoctors = createAsyncThunk('doctors/fetchAll', async (specialty, { rejectWithValue }) => {
  try {
    const params = specialty ? `?specialty=${specialty}` : '';
    const response = await api.get(`/doctors${params}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to fetch doctors' });
  }
});

/**
 * Fetch single doctor by ID
 * 
 * @asyncThunk fetchDoctorById
 * @param {string} id - Doctor's MongoDB ObjectId
 * @returns {Promise} Doctor details
 * 
 * @calls GET /api/doctors/:id
 * @sideEffects Updates currentDoctor in state
 */
export const fetchDoctorById = createAsyncThunk('doctors/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to fetch doctor' });
  }
});

/**
 * Fetch all clinic services
 * 
 * @asyncThunk fetchServices
 * @returns {Promise} Array of services
 * 
 * @calls GET /api/services
 * @sideEffects Updates services array in state
 */
export const fetchServices = createAsyncThunk('doctors/fetchServices', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get(`/services`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to fetch services' });
  }
});

/**
 * Fetch doctor schedule
 * 
 * @asyncThunk fetchDoctorSchedule
 * @param {string} id - Doctor's MongoDB ObjectId
 * @returns {Promise} Doctor's working schedule
 * 
 * @calls GET /api/doctors/:id/schedule
 * @sideEffects Updates schedule in state
 */
export const fetchDoctorSchedule = createAsyncThunk('doctors/fetchSchedule', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/doctors/${id}/schedule`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to fetch schedule' });
  }
});

/**
 * Fetch available appointment slots
 * 
 * @asyncThunk fetchAvailableSlots
 * @param {Object} params - { doctorId, date }
 * @returns {Promise} Array of available time slots
 * 
 * @calls GET /api/doctors/:doctorId/available-slots?date=...
 * @sideEffects Updates availableSlots in state
 */
export const fetchAvailableSlots = createAsyncThunk('doctors/fetchSlots', async ({ doctorId, date }, { rejectWithValue }) => {
  try {
    const response = await api.get(`/doctors/${doctorId}/available-slots?date=${date}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to fetch slots' });
  }
});

/**
 * =====================================================
 * SLICE DEFINITION
 * =====================================================
 */

const doctorSlice = createSlice({
  name: 'doctors',
  
  initialState: {
    doctors: [],           // List of all doctors
    currentDoctor: null,   // Currently selected doctor
    schedule: [],         // Doctor's working schedule
    availableSlots: [],    // Available appointment slots
    services: [],         // Clinic services
    loading: false,       // Loading state
    error: null,          // Error message
  },
  
  reducers: {
    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = null;
    },
    
    /**
     * Clear current doctor selection
     * Resets: currentDoctor, schedule, availableSlots
     */
    clearCurrentDoctor: (state) => {
      state.currentDoctor = null;
      state.schedule = [];
      state.availableSlots = [];
    },
  },
  
  extraReducers: (builder) => {
    builder
      // ==================
      // FETCH DOCTORS
      // ==================
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error;
      })
      
      // ==================
      // FETCH DOCTOR BY ID
      // ==================
      .addCase(fetchDoctorById.fulfilled, (state, action) => {
        state.currentDoctor = action.payload;
      })
      
      // ==================
      // FETCH SCHEDULE
      // ==================
      .addCase(fetchDoctorSchedule.fulfilled, (state, action) => {
        state.schedule = action.payload;
      })
      
      // ==================
      // FETCH AVAILABLE SLOTS
      // ==================
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.availableSlots = action.payload;
      })
      
      // ==================
      // FETCH SERVICES
      // ==================
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.services = action.payload;
      });
  },
});

/**
 * =====================================================
 * EXPORTS
 * =====================================================
 */

export const { clearError, clearCurrentDoctor } = doctorSlice.actions;
export default doctorSlice.reducer;

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
 * 2. Fetch all doctors:
 *    store.dispatch(fetchDoctors())
 * 
 * 3. Fetch by specialty:
 *    store.dispatch(fetchDoctors('Cardiology'))
 * 
 * 4. Get state:
 *    store.getState().doctors
 * 
 * 5. Check services:
 *    store.dispatch(fetchServices())
 *    store.getState().doctors.services
 * 
 * =====================================================
 */

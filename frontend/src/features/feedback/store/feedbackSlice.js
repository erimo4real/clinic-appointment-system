import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../shared/services/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Submit feedback for a doctor
export const submitFeedback = createAsyncThunk('feedback/submit', async (feedbackData, { rejectWithValue }) => {
  try {
    const response = await api.post(`${API_URL}/feedback`, feedbackData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to submit feedback' });
  }
});

// Get patient's feedback history
export const fetchPatientFeedback = createAsyncThunk('feedback/patient', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get(`${API_URL}/feedback/patient`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to fetch feedback' });
  }
});

// Get feedback for a doctor
export const fetchDoctorFeedback = createAsyncThunk('feedback/doctor', async (doctorId, { rejectWithValue }) => {
  try {
    const response = await api.get(`${API_URL}/feedback/doctor/${doctorId}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to fetch feedback' });
  }
});

// Doctor responds to feedback
export const respondToFeedback = createAsyncThunk('feedback/respond', async ({ feedbackId, response }, { rejectWithValue }) => {
  try {
    const res = await api.put(`${API_URL}/feedback/${feedbackId}/respond`, { response });
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to respond' });
  }
});

// Admin: Get all feedback
export const fetchAllFeedback = createAsyncThunk('feedback/adminAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get(`${API_URL}/feedback/admin/all`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to fetch feedback' });
  }
});

// Admin: Update feedback status
export const updateFeedbackStatus = createAsyncThunk('feedback/adminUpdate', async ({ feedbackId, status, adminNotes }, { rejectWithValue }) => {
  try {
    const response = await api.put(`${API_URL}/feedback/admin/${feedbackId}`, { status, adminNotes });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to update feedback' });
  }
});

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState: {
    patientFeedback: [],
    doctorFeedback: [],
    doctorStats: null,
    adminFeedback: [],
    loading: false,
    error: null,
    submitSuccess: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSubmitSuccess: (state) => {
      state.submitSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit feedback
      .addCase(submitFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitFeedback.fulfilled, (state) => {
        state.loading = false;
        state.submitSuccess = true;
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to submit feedback';
      })
      
      // Patient feedback
      .addCase(fetchPatientFeedback.fulfilled, (state, action) => {
        state.patientFeedback = action.payload;
      })
      
      // Doctor feedback
      .addCase(fetchDoctorFeedback.fulfilled, (state, action) => {
        state.doctorFeedback = action.payload.feedback;
        state.doctorStats = action.payload.stats;
      })
      
      // Admin feedback
      .addCase(fetchAllFeedback.fulfilled, (state, action) => {
        state.adminFeedback = action.payload;
      });
  },
});

export const { clearError, clearSubmitSuccess } = feedbackSlice.actions;
export default feedbackSlice.reducer;

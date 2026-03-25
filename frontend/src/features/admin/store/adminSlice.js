import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../shared/services/api';

export const fetchAllUsers = createAsyncThunk('admin/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to fetch users' });
  }
});

export const fetchAllDoctors = createAsyncThunk('admin/fetchDoctors', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/doctors');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to fetch doctors' });
  }
});

export const fetchAllAppointments = createAsyncThunk('admin/fetchAppointments', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/appointments');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to fetch appointments' });
  }
});

export const fetchAllServices = createAsyncThunk('admin/fetchServices', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/services');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to fetch services' });
  }
});

export const fetchDashboardStats = createAsyncThunk('admin/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to fetch stats' });
  }
});

export const createUser = createAsyncThunk('admin/createUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post(`/admin/users`, userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to create user' });
  }
});

export const updateUser = createAsyncThunk('admin/updateUser', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to update user' });
  }
});

export const deleteUser = createAsyncThunk('admin/deleteUser', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/admin/users/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to delete user' });
  }
});

export const createDoctor = createAsyncThunk('admin/createDoctor', async (doctorData, { rejectWithValue }) => {
  try {
    const response = await api.post(`/admin/doctors`, doctorData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to create doctor' });
  }
});

export const updateDoctor = createAsyncThunk('admin/updateDoctor', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/admin/doctors/${id}`, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to update doctor' });
  }
});

export const deleteDoctor = createAsyncThunk('admin/deleteDoctor', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/admin/doctors/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to delete doctor' });
  }
});

export const createService = createAsyncThunk('admin/createService', async (serviceData, { rejectWithValue }) => {
  try {
    const response = await api.post(`/admin/services`, serviceData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to create service' });
  }
});

export const updateService = createAsyncThunk('admin/updateService', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/admin/services/${id}`, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to update service' });
  }
});

export const deleteService = createAsyncThunk('admin/deleteService', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/admin/services/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to delete service' });
  }
});

export const updateAppointment = createAsyncThunk('admin/updateAppointment', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/admin/appointments/${id}`, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to update appointment' });
  }
});

export const deleteAppointment = createAsyncThunk('admin/deleteAppointment', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/admin/appointments/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to delete appointment' });
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    doctors: [],
    appointments: [],
    services: [],
    stats: {
      totalUsers: 0,
      totalDoctors: 0,
      totalAppointments: 0,
      totalRevenue: 0,
      pendingAppointments: 0,
      completedAppointments: 0,
    },
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(fetchAllDoctors.fulfilled, (state, action) => {
        state.doctors = action.payload;
      })
      .addCase(fetchAllAppointments.fulfilled, (state, action) => {
        state.appointments = action.payload;
      })
      .addCase(fetchAllServices.fulfilled, (state, action) => {
        state.services = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) state.users[index] = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload);
      })
      .addCase(createDoctor.fulfilled, (state, action) => {
        state.doctors.push(action.payload);
      })
      .addCase(updateDoctor.fulfilled, (state, action) => {
        const index = state.doctors.findIndex(d => d.id === action.payload.id);
        if (index !== -1) state.doctors[index] = action.payload;
      })
      .addCase(deleteDoctor.fulfilled, (state, action) => {
        state.doctors = state.doctors.filter(d => d.id !== action.payload);
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.services.push(action.payload);
      })
      .addCase(updateService.fulfilled, (state, action) => {
        const index = state.services.findIndex(s => s.id === action.payload.id);
        if (index !== -1) state.services[index] = action.payload;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.services = state.services.filter(s => s.id !== action.payload);
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) state.appointments[index] = action.payload;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.appointments = state.appointments.filter(a => a.id !== action.payload);
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;

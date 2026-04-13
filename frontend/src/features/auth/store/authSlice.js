import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../shared/services/api';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    document.cookie = 'token=;max-age=0;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT';
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      document.cookie = `token=${response.data.token};max-age=${7 * 24 * 60 * 60};path=/;SameSite=Lax`;
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      document.cookie = `token=${response.data.token};max-age=${7 * 24 * 60 * 60};path=/;SameSite=Lax`;
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue, getState }) => {
  const localToken = localStorage.getItem('token');
  const cookies = document.cookie.split(';');
  let cookieToken = null;
  for (const cookie of cookies) {
    const parts = cookie.trim().split('=');
    if (parts[0] === 'token' && parts[1]) {
      cookieToken = decodeURIComponent(parts.slice(1).join('='));
      break;
    }
  }
  
  if (!localToken && !cookieToken) {
    return rejectWithValue('No token found');
  }
  
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    localStorage.removeItem('token');
    document.cookie = 'token=;max-age=0;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT';
    return rejectWithValue(error.response?.data?.message || 'Session expired');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
  }
  document.cookie = 'token=;max-age=0;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT';
  document.cookie = 'auth_token=;max-age=0;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT';
  localStorage.removeItem('token');
  localStorage.removeItem('auth_token');
  sessionStorage.clear();
  return { success: true };
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Profile update failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
    sessionId: 0,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.sessionId += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      
      .addCase(logoutUser.pending, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.sessionId += 1;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, logout } = authSlice.actions;
export default authSlice.reducer;

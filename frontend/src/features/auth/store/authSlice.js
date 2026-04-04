/**
 * =====================================================
 * AUTH SLICE - Authentication State Management
 * =====================================================
 * 
 * Manages authentication state including:
 * - User login/logout
 * - User registration
 * - Current user profile
 * - JWT token management
 * 
 * @feature Auth
 * @state { user, isAuthenticated, loading, error }
 * 
 * =====================================================
 * STATE STRUCTURE:
 * {
 *   user: { id, username, email, role, firstName, lastName } | null,
 *   isAuthenticated: boolean,
 *   loading: boolean,
 *   error: string | null
 * }
 * =====================================================
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../shared/services/api';
import { deleteCookie } from '../../../shared/utils/cookieUtils';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Login failed' });
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Registration failed' });
  }
});

/**
 * Fetch current user profile
 * 
 * @asyncThunk fetchCurrentUser
 * @returns {Promise} User profile data
 * 
 * @calls GET /api/auth/me
 * @requires Valid JWT token in Authorization header
 */
export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to fetch user' });
  }
});

/**
 * Update user profile
 */
export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { error: 'Failed to update profile' });
  }
});

/**
 * Logout user
 */
export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
  }
  deleteCookie('auth_token');
  return { success: true };
});

/**
 * =====================================================
 * SLICE DEFINITION
 * =====================================================
 */

const authSlice = createSlice({
  name: 'auth', // Must match reducer key in store
  
  /**
   * Initial state
   * - user: null (not logged in)
   * - isAuthenticated: false
   * - loading: false
   * - error: null
   */
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  
  /**
   * Synchronous reducers (state mutations)
   */
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  
  /**
   * Async reducers (handle async thunk results)
   * Maps thunk results to state updates
   */
  extraReducers: (builder) => {
    builder
      // ==================
      // LOGIN HANDLERS
      // ==================
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
        state.error = action.payload?.message || 'Login failed';
      })
      
      // ==================
      // REGISTER HANDLERS
      // ==================
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
        state.error = action.payload?.message || 'Registration failed';
      })
      
      // ==================
      // FETCH USER HANDLERS
      // ==================
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      
      // ==================
      // LOGOUT HANDLER
      // ==================
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

/**
 * =====================================================
 * EXPORTS
 * =====================================================
 */

// Action creators
export const { clearError, logout, setCredentials } = authSlice.actions;

// Reducer (default export)
export default authSlice.reducer;

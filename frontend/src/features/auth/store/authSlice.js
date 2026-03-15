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

// API Base URL - Change here if backend URL changes
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * =====================================================
 * ASYNC THUNKS - API CALLS
 * =====================================================
 */

/**
 * Login user
 * 
 * @asyncThunk login
 * @param {Object} credentials - { username, password }
 * @returns {Promise} User data and tokens on success
 * 
 * @calls POST /api/auth/login
 * @sideEffects Sets accessToken and refreshToken in localStorage
 * 
 * @example
 * const result = await dispatch(login({ username: 'john', password: 'pass123' }));
 * if (login.fulfilled.match(result)) {
 *   console.log('Logged in:', result.payload.user);
 * }
 */
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    console.log('[Auth Slice] Attempting login for:', credentials.username);
    
    const response = await api.post(`${API_URL}/auth/login`, credentials, { withCredentials: true });
    
    console.log('[Auth Slice] Login successful:', response.data.user);
    return response.data;
    
  } catch (error) {
    console.error('[Auth Slice] Login failed:', error.response?.data || error.message);
    return rejectWithValue(error.response?.data || { error: 'Login failed' });
  }
});

/**
 * Register new user
 * 
 * @asyncThunk register
 * @param {Object} userData - { username, email, password, firstName, lastName, role }
 * @returns {Promise} User data and tokens on success
 * 
 * @calls POST /api/auth/register
 * @sideEffects Sets accessToken and refreshToken in localStorage
 */
export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    console.log('[Auth Slice] Attempting registration for:', userData.email);
    
    const response = await api.post(`${API_URL}/auth/register`, userData, { withCredentials: true });
    
    console.log('[Auth Slice] Registration successful:', response.data.user);
    return response.data;
    
  } catch (error) {
    console.error('[Auth Slice] Registration failed:', error.response?.data || error.message);
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
    console.log('[Auth Slice] Fetching current user profile');
    
    const response = await api.get(`${API_URL}/auth/me`);
    
    console.log('[Auth Slice] Current user fetched:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('[Auth Slice] Fetch user failed:', error.response?.data || error.message);
    return rejectWithValue(error.response?.data || { error: 'Failed to fetch user' });
  }
});

/**
 * Update user profile
 */
export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    console.log('[Auth Slice] Updating profile:', profileData);
    
    const response = await api.put(`${API_URL}/auth/profile`, profileData);
    
    console.log('[Auth Slice] Profile updated:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('[Auth Slice] Update profile failed:', error.response?.data || error.message);
    return rejectWithValue(error.response?.data || { error: 'Failed to update profile' });
  }
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
    /**
     * Logout user
     * 
     * @action logout
     * @sideEffects Removes tokens from localStorage
     */
    logout: (state) => {
      console.log('[Auth Slice] Logging out user');
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    
    /**
     * Clear authentication error
     * 
     * @action clearError
     */
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
        console.log('[Auth Slice] Login pending...');
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log('[Auth Slice] Login fulfilled:', action.payload.user);
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        console.log('[Auth Slice] Login rejected:', action.payload);
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      
      // ==================
      // REGISTER HANDLERS
      // ==================
      .addCase(register.pending, (state) => {
        console.log('[Auth Slice] Registration pending...');
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        console.log('[Auth Slice] Registration fulfilled:', action.payload.user);
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        console.log('[Auth Slice] Registration rejected:', action.payload);
        state.loading = false;
        state.error = action.payload?.message || 'Registration failed';
      })
      
      // ==================
      // FETCH USER HANDLERS
      // ==================
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        console.log('[Auth Slice] User profile fetched:', action.payload);
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        console.log('[Auth Slice] Fetch user rejected:', action.payload);
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

/**
 * =====================================================
 * EXPORTS
 * =====================================================
 */

// Action creators
export const { logout, clearError } = authSlice.actions;

// Reducer (default export)
export default authSlice.reducer;

/**
 * =====================================================
 * DEBUGGING GUIDE
 * =====================================================
 * 
 * In browser console:
 * 
 * 1. Import store:
 *    import store from './store';
 * 
 * 2. Check current auth state:
 *    store.getState().auth
 * 
 * 3. Dispatch login:
 *    store.dispatch(login({ username: 'test', password: 'pass123' }))
 * 
 * 4. Subscribe to changes:
 *    store.subscribe(() => console.log('State changed:', store.getState().auth))
 * 
 * 5. Check localStorage tokens:
 *    localStorage.getItem('accessToken')
 *    localStorage.getItem('refreshToken')
 * 
 * =====================================================
 */

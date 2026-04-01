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
    const response = await api.post('/auth/login', credentials, { withCredentials: true });
    return response.data;
  } catch (error) {
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
    const response = await api.post('/auth/register', userData, { withCredentials: true });
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    await api.post('/auth/logout');
    return { success: true };
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return rejectWithValue(error.response?.data || { error: 'Logout failed' });
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
     * Set auth state from localStorage
     */
    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    
    /**
     * Logout user
     * 
     * @action logout
     * @sideEffects Removes tokens from localStorage
     */
    logout: (state) => {
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
export const { clearError, setAuth, logout } = authSlice.actions;
export { logoutUser };

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
 *    store.subscribe(() => store.getState().auth)
 * 
 * 5. Check localStorage tokens:
 *    localStorage.getItem('accessToken')
 *    localStorage.getItem('refreshToken')
 * 
 * =====================================================
 */

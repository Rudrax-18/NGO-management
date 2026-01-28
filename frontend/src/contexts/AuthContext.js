import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        isAuthenticated: true,
        error: null,
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload,
        loading: false,
        isAuthenticated: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from token on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      // Test mode for demonstration - create a test user
      if (process.env.NODE_ENV === 'development' && !token) {
        const testUser = {
          _id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
          phone: '9876543210',
          role: 'donor',
          kycStatus: 'pending',
          totalDonations: 17500,
          donationCount: 12,
          createdAt: new Date().toISOString()
        };
        
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
          payload: testUser,
        });
        return;
      }
      
      // Test admin user - uncomment to test admin features
      if (process.env.NODE_ENV === 'development' && localStorage.getItem('testAdmin') === 'true') {
        const testAdmin = {
          _id: 'test-admin-id',
          name: 'Test Admin',
          email: 'admin@example.com',
          phone: '9876543211',
          role: 'admin',
          kycStatus: 'verified',
          totalDonations: 0,
          donationCount: 0,
          createdAt: new Date().toISOString()
        };
        
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
          payload: testAdmin,
        });
        return;
      }
      
      if (token) {
        try {
          dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });
          const response = await api.get('/auth/profile');
          
          if (response.data.success) {
            dispatch({
              type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
              payload: response.data.data.user,
            });
          } else {
            dispatch({
              type: AUTH_ACTIONS.LOAD_USER_FAILURE,
              payload: 'Failed to load user profile',
            });
          }
        } catch (error) {
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_FAILURE,
            payload: error.response?.data?.message || 'Failed to load user',
          });
        }
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_FAILURE,
          payload: null,
        });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: response.data.data,
        });
        
        toast.success('Login successful!');
        return { success: true };
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: response.data.message || 'Login failed',
        });
        toast.error(response.data.message || 'Login failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: message,
      });
      toast.error(message);
      return { success: false, message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START });
      
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        dispatch({
          type: AUTH_ACTIONS.REGISTER_SUCCESS,
          payload: response.data.data,
        });
        
        toast.success('Registration successful! Welcome to Impact Foundation!');
        return { success: true };
      } else {
        dispatch({
          type: AUTH_ACTIONS.REGISTER_FAILURE,
          payload: response.data.message || 'Registration failed',
        });
        toast.error(response.data.message || 'Registration failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      let message = 'Registration failed. Please try again.';
      
      if (error.response) {
        if (error.response.data?.errors) {
          // Show validation errors
          const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
          message = validationErrors;
        } else {
          message = error.response.data?.message || message;
        }
      }
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: message,
      });
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token on server
      if (state.token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out successfully');
    }
  };

  // Update user profile
  const updateUser = async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      
      if (response.data.success) {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: response.data.data.user,
        });
        toast.success('Profile updated successfully!');
        return { success: true };
      } else {
        toast.error(response.data.message || 'Profile update failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

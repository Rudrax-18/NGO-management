import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error cases
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          localStorage.removeItem('token');
          // Redirect to login page if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        
        case 403:
          // Forbidden - insufficient permissions
          console.error('Access forbidden:', data.message);
          break;
        
        case 404:
          // Not found
          console.error('Resource not found:', data.message);
          break;
        
        case 429:
          // Too many requests
          console.error('Rate limit exceeded:', data.message);
          break;
        
        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;
        
        default:
          console.error('API error:', data.message || 'Unknown error');
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message);
    } else {
      // Other error
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API service functions
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  submitKYC: (kycData) => api.post('/auth/kyc', kycData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  logout: () => api.post('/auth/logout'),
};

export const donationAPI = {
  createOrder: (orderData) => api.post('/donations/create-order', orderData),
  verifyPayment: (paymentData) => api.post('/donations/verify-payment', paymentData),
  getMyDonations: (params) => api.get('/donations/my-donations', { params }),
  getDonation: (donationId) => api.get(`/donations/${donationId}`),
  getReceipt: (donationId) => api.get(`/donations/receipt/${donationId}`),
  getPublicStats: () => api.get('/donations/stats/public'),
};

export const userAPI = {
  getDashboard: () => api.get('/user/dashboard'),
  getRecurringDonations: () => api.get('/user/recurring-donations'),
  updateRecurringDonation: (donationId, data) => api.put(`/user/recurring-donations/${donationId}`, data),
  getTaxCertificates: (year) => api.get('/user/tax-certificates', { params: { year } }),
  getTaxCertificate: (year) => api.get(`/user/tax-certificate/${year}`),
  getImpact: () => api.get('/user/impact'),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getDonations: (params) => api.get('/admin/donations', { params }),
  updateDonationStatus: (donationId, data) => api.put(`/admin/donations/${donationId}/status`, data),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserKYC: (userId, data) => api.put(`/admin/users/${userId}/kyc`, data),
  getFraudReport: () => api.get('/admin/fraud-report'),
  getLocationStats: () => api.get('/admin/location-stats'),
};

// Utility functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Intl.DateTimeFormat('en-IN', { ...defaultOptions, ...options }).format(
    new Date(date)
  );
};

export const formatDateTime = (date) => {
  return formatDate(date, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now - targetDate) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date);
  }
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone);
};

export const validatePAN = (pan) => {
  const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return re.test(pan);
};

export const validateAadhaar = (aadhaar) => {
  const re = /^\d{12}$/;
  return re.test(aadhaar);
};

export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, { responseType: 'blob' });
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    return true;
  } catch (error) {
    console.error('Copy to clipboard error:', error);
    return false;
  }
};

export default api;

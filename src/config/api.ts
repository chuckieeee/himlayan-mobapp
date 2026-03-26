// API Configuration
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL
export const API_BASE_URL = 'https://himlayangpilipino.com/api';

// Google Maps API Key
export const GOOGLE_MAPS_API_KEY = 'AIzaSyCMzGhdFY7p7pbNGJnZo4GoAMS10-DyE9E';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  CURRENT_USER: 'current_user',
};

// API Endpoints
export const API_ENDPOINTS = {
  LOGIN: '/login',
  LOGOUT: '/logout',
  USER: '/user',
  CHANGE_PASSWORD: '/auth/change-password',
  PLOTS: '/plots',
  PLOT_BY_ID: (id: number) => `/plots/${id}`,
  PLOT_SUMMARY: '/plots/summary',
  AVAILABLE_PLOTS: '/plots/available',
  BURIAL_RECORDS: '/burial-records',
  BURIAL_RECORD_BY_ID: (id: number) => `/burial-records/${id}`,
  MY_BURIAL_RECORDS: '/my-burial-records',
  SEARCH: '/public/search',
  SEARCH_BY_NAME: '/public/search/name',
  SEARCH_BY_PLOT: '/public/search/plot',
  QR_CODES: '/qr-codes',
  QR_CODE_BY_ID: (id: string) => `/qr-codes/${id}`,
  PUBLIC_GRAVE: (code: string) => `/public/grave/${code}`,
  ANNOUNCEMENTS: '/announcements',
  ANNOUNCEMENT_BY_ID: (id: number) => `/announcements/${id}`,
  DASHBOARD: '/dashboard',
  MEMBER_PLOTS: '/member/my-plots',
  MEMBER_BURIAL_RECORDS: '/member/my-burial-records',
};

// API Request Helper
export const apiRequest = async <T = any>(
  endpoint: string,
  options?: { method?: string; body?: any }
): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const method = options?.method || 'GET';

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    if (options?.body) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    // ⚠️ Handle token expiration/invalidation (401 Unauthorized)
    if (response.status === 401) {
      console.log('Token expired or invalid - logging out');
      // Clear auth data
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.CURRENT_USER,
      ]);
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getErrorMessage = (error: any): string => {
  return error instanceof Error ? error.message : String(error);
};
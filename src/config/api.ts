// API Configuration
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for the API - Update this to your actual backend URL
export const API_BASE_URL = 'https://malty-kandice-unwinded.ngrok-free.dev/api';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  CURRENT_USER: 'current_user',
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/login',
  LOGOUT: '/logout',
  REGISTER: '/register',
  ME: '/user',

  // Plots
  PLOTS: '/plots',
  PLOT_BY_ID: (id: number) => `/plots/${id}`,
  PLOT_SUMMARY: '/plots',
  PLOT_AVAILABLE: '/plots/available',
  PLOT_STATISTICS: '/plots/statistics',

  // Burial Records
  BURIAL_RECORDS: '/burial-records',
  BURIAL_RECORD_BY_ID: (id: number) => `/burial-records/${id}`,
  BURIAL_RECORD_SEARCH: '/burial-records/search',
  BURIAL_RECORD_STATISTICS: '/burial-records/statistics',

  // QR Codes
  QR_CODES: '/qr-codes',
  QR_CODE_BY_CODE: (code: string) => `/qr-codes/${code}`,
  QR_CODE_GENERATE: (burialId: number) => `/qr-codes/generate/${burialId}`,

  // Search
  SEARCH: '/public/search',
  SEARCH_BY_NAME: '/public/search',
  SEARCH_BY_PLOT: '/public/search',

  // Public
  PUBLIC_GRAVE: (code: string) => `/public/grave/${code}`,

  // Dashboard
  DASHBOARD: '/dashboard',
};

// HTTP Methods
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API Request options
export interface APIRequestOptions {
  method?: HTTPMethod;
  headers?: Record<string, string>;
  body?: any;
  requiresAuth?: boolean;
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T>(
  endpoint: string,
  options: APIRequestOptions = {}
): Promise<T> {
  const { method = 'GET', headers = {}, body, requiresAuth = true } = options;

  // Build request headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
  };

  // Add auth token if required
  if (requiresAuth) {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Build request config
  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // Add body if present
  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      if (response.ok) {
        return {} as T;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!response.ok) {
      // Handle API errors
      throw {
        status: response.status,
        message: data.message || 'An error occurred',
        errors: data.errors || {},
      };
    }

    return data as T;
  } catch (error: any) {
    console.error('API Request Error:', error);
    throw error;
  }
}

/**
 * Handle API errors and return user-friendly messages
 */
export function getErrorMessage(error: any): string {
  if (error.message) {
    return error.message;
  }

  if (error.errors && typeof error.errors === 'object') {
    const firstError = Object.values(error.errors)[0];
    if (Array.isArray(firstError) && firstError.length > 0) {
      return firstError[0] as string;
    }
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Check if the error is an authentication error
 */
export function isAuthError(error: any): boolean {
  return error.status === 401 || error.status === 403;
}

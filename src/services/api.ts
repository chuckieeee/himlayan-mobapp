import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, API_BASE_URL } from '@/config/api';

const AUTH_TOKEN_KEY = STORAGE_KEYS.AUTH_TOKEN;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

class ApiClient {

  private async getHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const text = await response.text();

    let data: any;

    try {
      data = JSON.parse(text);
    } catch {
      console.error('❌ Non-JSON response from server:', text);
      return { success: false, message: 'Server returned invalid response' };
    }

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Request failed',
      };
    }

    return data;
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      return await this.handleResponse<T>(response);

    } catch (error) {
      console.error('API GET Error:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async post<T = any>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      return await this.handleResponse<T>(response);

    } catch (error) {
      console.error('API POST Error:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async put<T = any>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      return await this.handleResponse<T>(response);

    } catch (error) {
      console.error('API PUT Error:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers,
      });

      return await this.handleResponse<T>(response);

    } catch (error) {
      console.error('API DELETE Error:', error);
      return { success: false, message: 'Network error' };
    }
  }
}

export const api = new ApiClient();
export default api;
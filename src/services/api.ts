import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = "https://malty-kandice-unwinded.ngrok-free.dev/api";
const AUTH_TOKEN_KEY = '@himlayan_auth_token';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

class ApiClient {
  private async getHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });
      return await response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async post<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async put<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      return await response.json();
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
      return await response.json();
    } catch (error) {
      console.error('API DELETE Error:', error);
      return { success: false, message: 'Network error' };
    }
  }
}

export const api = new ApiClient();
export default api;

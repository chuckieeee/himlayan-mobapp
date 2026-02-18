import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/config/api';
import type { User } from '@/types/database';
import { API_BASE_URL } from '@/config/api';

export class AuthService {
  static async login(email: string, password: string): Promise<User> {
    console.log('Attempting API login for:', email);
    console.log('Calling URL:', `${API_BASE_URL}/login`);

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    console.log('LOGIN RESPONSE:', data); // debug

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // ✅ FIX — read correct Laravel structure
    const user = data.data?.user;
    const token = data.data?.token;

    if (!user || !token) {
      throw new Error('Invalid server response');
    }

    // Role restriction
    if (user.role === 'admin' || user.role === 'staff') {
      throw {
        message: 'Staff/Admin accounts not supported on mobile',
        code: 'ROLE_NOT_ALLOWED',
      };
    }

    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

    return user;
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  static async logout(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.CURRENT_USER,
    ]);
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return token !== null;
  }
}

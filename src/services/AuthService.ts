import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/config/api';
import type { User } from '@/types/database';
import { API_BASE_URL } from '@/config/api';
console.log("CURRENT API BASE URL:", API_BASE_URL);
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

    const text = await response.text();
    console.log("RAW LOGIN RESPONSE:");
    console.log(text);

    let data;

    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log("❌ Response is NOT JSON");
      throw new Error("Server returned non-JSON response");
    }

console.log("LOGIN RESPONSE:", data);

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

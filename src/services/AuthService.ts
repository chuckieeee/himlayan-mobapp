import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/config/api';
import type { User } from '@/types/database';
import { API_BASE_URL } from '@/config/api';
import { getExpoPushToken, getFCMToken } from '@services/PushNotificationService';

console.log("CURRENT API BASE URL:", API_BASE_URL);

// Storage keys for refresh token functionality
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRES_AT_KEY = 'token_expires_at';

export class AuthService {
  /**
   * Auto-refresh token if it's about to expire (within 5 minutes)
   */
  static async ensureValidToken(): Promise<string | null> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const expiresAtStr = await AsyncStorage.getItem(TOKEN_EXPIRES_AT_KEY);

    if (!token || !expiresAtStr) {
      return token;
    }

    const expiresAt = new Date(expiresAtStr).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    const fiveMinutesMs = 5 * 60 * 1000;

    // If token expires within 5 minutes, try to refresh it
    if (timeUntilExpiry < fiveMinutesMs) {
      console.log('⏰ Token expiring soon, refreshing...');
      const refreshed = await this.refreshAccessToken();
      return refreshed ? await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) : token;
    }

    return token;
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        console.log('❌ No refresh token available');
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();

      if (!response.ok || !data.data?.access_token) {
        console.log('❌ Token refresh failed:', data.message);
        // Refresh failed, log out user
        await this.logout();
        return false;
      }

      const newToken = data.data.access_token;
      const expiresInSeconds = data.data.access_token_expires_in || 7200; // default 2 hours
      const newExpiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

      // Store new access token and expiry
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
      await AsyncStorage.setItem(TOKEN_EXPIRES_AT_KEY, newExpiresAt);

      console.log('✅ Token refreshed successfully');
      return true;
    } catch (error) {
      console.log('❌ Refresh token error:', error);
      // On network error, let user continue but mark for logout later
      return false;
    }
  }

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

    // If backend returns an error message, throw it
    if (data.message && !data.data?.user) {
      throw new Error(data.message);
    }

    // ✅ FIX — read correct Laravel structure
    const user = data.data?.user;
    const token = data.data?.token;
    const refreshToken = data.data?.refresh_token;
    const accessTokenExpiresIn = data.data?.access_token_expires_in || 7200; // default 2 hours

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

    // Calculate token expiry time
    const tokenExpiresAt = new Date(Date.now() + accessTokenExpiresIn * 1000).toISOString();

    // Store tokens and user
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    await AsyncStorage.setItem(TOKEN_EXPIRES_AT_KEY, tokenExpiresAt);
    
    if (refreshToken) {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    // -------------------------------------------------
    // REGISTER PUSH NOTIFICATION TOKENS (Both Expo and FCM)
    // -------------------------------------------------
    try {
      const expoToken = await getExpoPushToken();
      const fcmToken = await getFCMToken();

      if (expoToken || fcmToken) {
        const tokenData: any = {};
        if (expoToken) tokenData.expo_push_token = expoToken;
        if (fcmToken) tokenData.fcm_token = fcmToken;

        await fetch(`${API_BASE_URL}/save-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(tokenData),
        });

        console.log('Push tokens saved to server:', { expoToken: !!expoToken, fcmToken: !!fcmToken });
      }
    } catch (error) {
      console.log('Failed to register push tokens:', error);
    }

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
      REFRESH_TOKEN_KEY,
      TOKEN_EXPIRES_AT_KEY,
    ]);
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return token !== null;
  }
}
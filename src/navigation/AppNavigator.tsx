import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthService } from '@services/AuthService';
import type { User } from '@/types/database';


// Import screens
import LoginScreen from '@screens/LoginScreen';
import RegisterScreen from '@screens/RegisterScreen';
import GraveDetailsScreen from '@screens/customer/GraveDetailsScreen';
import GoogleMaps from '@screens/customer/GoogleMaps';
import GraveMapScreen from '@screens/customer/GraveMapScreen';


// Import bottom tab navigator
import BottomTabNavigator from './BottomTabNavigator';

import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
    
    // Check auth status every 500ms to detect login/logout
    const interval = setInterval(checkAuthStatus, 500);
    
    return () => clearInterval(interval);
  }, []);

  const checkAuthStatus = async () => {
    const currentUser = await AuthService.getCurrentUser();
    
    // ⚠️ SECURITY: Block admin/staff from navigation
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff')) {
      console.log('🚫 Security: Admin/Staff detected in navigation, logging out');
      await AuthService.clearAuthData();
      setUser(null);
    } else {
      setUser(currentUser);
    }
    
    setLoading(false);
  };

  if (loading) {
    return null; // You can add a loading screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        {!user ? (
          // Auth screens when not authenticated
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Customer/Visitor screens only (admin/staff blocked at AuthService level)
          <>
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
            <Stack.Screen name="GraveDetails" component={GraveDetailsScreen} />
            <Stack.Screen name="Map" component={GoogleMaps} />
            <Stack.Screen name="GraveMap" component={GraveMapScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

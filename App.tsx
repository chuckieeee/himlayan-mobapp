import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { setupNotificationChannel } from './src/services/PushNotificationService';
import messaging from '@react-native-firebase/messaging';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize Firebase
    messaging()
      .getToken()
      .then(token => {
        console.log('✅ Firebase initialized, token:', token);
      })
      .catch(error => {
        console.log('⚠️ Firebase init error:', error);
      });

    setupNotificationChannel();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="#2E7D32" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
};

export default App;

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { setupNotificationChannel } from './src/services/PushNotificationService';
import ErrorBoundary from './src/ErrorBoundary';
import firebase from '@react-native-firebase/app';

const App: React.FC = () => {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        
        // Initialize Firebase first
        if (!firebase.apps.length) {
          await firebase.initializeApp();
        }
        
        await setupNotificationChannel();
      } catch (error) {
        console.error('❌ App initialization error:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" backgroundColor="#2E7D32" />
        <AppNavigator />
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

export default App;

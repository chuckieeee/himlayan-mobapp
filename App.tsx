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
        console.log('🚀 App initializing...');
        
        // Initialize Firebase first
        if (!firebase.apps.length) {
          await firebase.initializeApp();
          console.log('✅ Firebase initialized');
        }
        
        await setupNotificationChannel();
        console.log('✅ App initialized successfully');
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

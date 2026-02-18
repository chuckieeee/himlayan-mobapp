import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { colors } from '@styles/theme';

// Import screens
import CustomerDashboardScreen from '@screens/customer/CustomerDashboardScreen';
import GraveSearchScreen from '@screens/customer/GraveSearchScreen';
import QRScannerScreen from '@screens/customer/QRScannerScreen';
import PaymentsScreen from '@screens/customer/PaymentsScreen';
import NotificationsScreen from '@screens/customer/NotificationsScreen';
import GoogleMaps from '@screens/customer/GoogleMaps';

import { BottomTabParamList } from './types';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tab.Screen
        name="Dashboard"
        component={CustomerDashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Text style={{ fontSize: 24 }}>{focused ? '🏠' : '🏘️'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={GraveSearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ focused, color }) => (
            <Text style={{ fontSize: 24 }}>{focused ? '🔍' : '🔎'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Scanner"
        component={QRScannerScreen}
        options={{
          tabBarLabel: 'QR Scan',
          tabBarIcon: ({ focused, color }) => (
            <Text style={{ fontSize: 24 }}>{focused ? '📷' : '📸'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{
          tabBarLabel: 'Payments',
          tabBarIcon: ({ focused, color }) => (
            <Text style={{ fontSize: 24 }}>{focused ? '💳' : '💰'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ focused, color }) => (
            <Text style={{ fontSize: 24 }}>{focused ? '🔔' : '🔕'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={GoogleMaps}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 24 }}>{focused ? '🗺️' : '🗺'}</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

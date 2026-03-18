import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { apiRequest } from '@/config/api';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/types';

import { colors, spacing, typography } from '@styles/theme';
import { commonStyles } from '@styles/commonStyles';

type NavigationProp = StackNavigationProp<RootStackParamList>;

// Cemetery center coordinates
const CEMETERY_CENTER = {
  latitude: 14.682462,
  longitude: 121.0530409,
};

const GoogleMaps: React.FC = () => {

  const navigation = useNavigation<NavigationProp>();

  const [location, setLocation] = useState<any>(null);
  const [landmarks, setLandmarks] = useState<any[]>([]);

  useEffect(() => {
    getLocation();
    loadLandmarks();
  }, []);

  const getLocation = async () => {
    try {

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission required.');
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      setLocation(coords);

    } catch (err) {
      console.log('Location error:', err);
    }
  };

  const loadLandmarks = async () => {
    try {
      const res = await apiRequest('/map/markers');

      // Filter to only show landmarks
      const allMarkers = res?.data || [];
      const landmarkArray = allMarkers.filter((marker: any) => marker.type === 'landmark');

      setLandmarks(landmarkArray);
    } catch (err) {
      console.log('Landmark fetch error:', err);
    }
  };

  if (!location) {
    return (
      <View style={commonStyles.centeredContainer}>
        <Text>Getting location...</Text>
      </View>
    );
  }

  return (

    <View style={commonStyles.container}>

      {/* HEADER */}
      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>
            ← Back
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Cemetery Map
        </Text>

      </View>

      {/* MAP */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: CEMETERY_CENTER.latitude,
          longitude: CEMETERY_CENTER.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
      >

        {/* Landmark Markers */}
        {landmarks.map(landmark => (

          <Marker
            key={landmark.id}
            coordinate={{
              latitude: Number(landmark.latitude),
              longitude: Number(landmark.longitude),
            }}
            title={landmark.name}
            pinColor="#183a67"
          />

        ))}

      </MapView>

    </View>

  );
};

export default GoogleMaps;

const styles = StyleSheet.create({

  header: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    paddingTop: 50,
  },

  backButton: {
    marginBottom: spacing.sm,
  },

  backButtonText: {
    ...typography.body1,
    color: colors.surface,
  },

  headerTitle: {
    ...typography.h3,
    color: colors.surface,
  },

  map: {
    flex: 1,
  },

});
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

const GoogleMaps: React.FC = () => {

  const navigation = useNavigation<NavigationProp>();

  const [location, setLocation] = useState<any>(null);
  const [plots, setPlots] = useState<any[]>([]);

  useEffect(() => {
    getLocation();
    loadPlots();
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

  const loadPlots = async () => {
    try {

      const res = await apiRequest('/plots');

      console.log('PLOT RESPONSE:', res);

      const plotArray = res?.data?.data ?? [];

      setPlots(plotArray);

    } catch (err) {
      console.log('Plot fetch error:', err);
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
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        showsMyLocationButton
      >

        {/* User Marker */}
        <Marker
          coordinate={location}
          title="You are here"
        />

        {/* Cemetery Plot Markers */}
        {plots.map(plot => (

          <Marker
            key={plot.id}
            coordinate={{
              latitude: Number(plot.latitude),
              longitude: Number(plot.longitude),
            }}
            title={`Plot ${plot.plot_number}`}
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
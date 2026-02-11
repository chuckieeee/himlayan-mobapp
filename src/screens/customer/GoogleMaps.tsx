import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { apiRequest } from '@/config/api';

const GoogleMaps: React.FC = () => {
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

      console.log("PLOT RESPONSE:", res);

      // ✅ extract nested Laravel pagination data
      const plotArray = res?.data?.data ?? [];

      setPlots(plotArray);

    } catch (err) {
      console.log('Plot fetch error:', err);
    }
  };



  if (!location) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          Getting location...
        </Text>
      </View>
    );
  }

  return (
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
      {/* User marker */}
      <Marker
        coordinate={location}
        title="You are here"
      />

      {/* Cemetery plots */}
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
  );
};

export default GoogleMaps;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

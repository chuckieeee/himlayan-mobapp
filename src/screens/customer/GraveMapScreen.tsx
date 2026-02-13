import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

const GraveMapScreen = ({ route }) => {
  const { plot } = route.params;
console.log("Plot received:", plot);
  const latitude = Number(plot.latitude);
  const longitude = Number(plot.longitude);

  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);

  // 📏 Distance calculator (meters)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const toRad = (deg) => deg * Math.PI / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  // 📍 Live GPS tracking + distance updates
  useEffect(() => {
    let subscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1,
        },
        (loc) => {
          const coords = loc.coords;
          setUserLocation(coords);

          const dist = calculateDistance(
            coords.latitude,
            coords.longitude,
            latitude,
            longitude
          );

          setDistance(dist);
        }
      );
    })();

    return () => subscription?.remove();
  }, []);

  if (!latitude || !longitude) {
    return <Text>No location data available</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Distance indicator */}
      {distance && (
        <View style={styles.distanceBox}>
          <Text style={styles.distanceText}>
            You are {distance.toFixed(0)} meters away
          </Text>
        </View>
      )}

      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        }}
        showsUserLocation
      >
        {/* Grave marker */}
        <Marker
          coordinate={{ latitude, longitude }}
          title={`Plot ${plot.plot_number}`}
          description={`Section ${plot.section}`}
        />

        {/* Navigation line */}
        {userLocation && (
          <Polyline
            coordinates={[
              {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              },
              { latitude, longitude },
            ]}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}
      </MapView>
    </View>
  );
};

export default GraveMapScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  distanceBox: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    zIndex: 10,
  },

  distanceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/types';
import { GOOGLE_MAPS_API_KEY } from '@/config/api';

interface Plot {
  latitude: string | number;
  longitude: string | number;
  plot_number: string;
  section: string;
}

interface Props {
  route: {
    params: {
      plot: Plot;
    };
  };
}

interface Step {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  html_instructions: string;
  start_location: { latitude: number; longitude: number };
  end_location: { latitude: number; longitude: number };
}

const GraveMapScreen: React.FC<Props> = ({ route }) => {

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { plot } = route.params;

  const latitude = Number(plot.latitude);
  const longitude = Number(plot.longitude);

  const mapRef = useRef<MapView>(null);

  const [userLocation, setUserLocation] =
    useState<Location.LocationObjectCoords | null>(null);

  const [distance, setDistance] = useState<number | null>(null);

  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [region, setRegion] = useState<Region | null>(null);

  const [isFollowing, setIsFollowing] = useState(true);

  const cleanInstruction = (html: string) => {
    let text = html.replace(/<[^>]+>/g, '');
    text = text.replace(/Restricted usage road/gi, '');
    return text.replace(/\s+/g, ' ').trim();
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371e3;
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  useEffect(() => {
    let subscription: Location.LocationSubscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation(loc.coords);

      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1,
        },
        loc => {
          const coords = loc.coords;
          setUserLocation(coords);

          const dist = calculateDistance(
            coords.latitude,
            coords.longitude,
            latitude,
            longitude
          );

          setDistance(dist);
          updateCurrentStep(coords);

          if (isFollowing) {
            mapRef.current?.animateCamera({
              center: {
                latitude: coords.latitude,
                longitude: coords.longitude,
              },
              zoom: 18,
            });
          }
        }
      );
    })();

    return () => subscription?.remove();
  }, [steps, isFollowing]);

  const updateCurrentStep = (coords: Location.LocationObjectCoords) => {
    if (!steps.length) return;

    const step = steps[currentStepIndex];
    if (!step) return;

    const distToStepEnd = calculateDistance(
      coords.latitude,
      coords.longitude,
      step.end_location.latitude,
      step.end_location.longitude
    );

    if (distToStepEnd < 10 && currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const currentStep = steps[currentStepIndex];

  if (!latitude || !longitude) {
    return (
      <View style={styles.center}>
        <Text>No location data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Navigate to Grave</Text>
      </View>

      {/* NAV BOX */}
      {currentStep && (
        <View style={styles.navBox}>
          <Text style={styles.navText}>
            {cleanInstruction(currentStep.html_instructions)}
          </Text>
          <Text style={styles.navDistance}>
            in {currentStep.distance.text}
          </Text>
        </View>
      )}

      {/* DISTANCE + BUTTON */}
      {distance !== null && (
        <>
          <View style={styles.distanceBox}>
            <Text style={styles.distanceText}>
              {distance.toFixed(0)} meters away
            </Text>
          </View>

          <TouchableOpacity
            style={styles.recenterButton}
            onPress={() => {
              if (!userLocation) return;

              setIsFollowing(true);

              mapRef.current?.animateCamera({
                center: {
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                },
                zoom: 18,
              });
            }}
          >
            <Text style={styles.recenterText}>Re-center</Text>
          </TouchableOpacity>
        </>
      )}

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={
          region || {
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }
        }
        onPanDrag={() => setIsFollowing(false)}
      >
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="You are here"
          >
            <View style={styles.userLocationMarker}>
              <View style={styles.userLocationDot} />
            </View>
          </Marker>
        )}

        <Marker
          coordinate={{ latitude, longitude }}
          title={`Plot ${plot.plot_number}`}
          description={`Section ${plot.section}`}
        />

        {userLocation && (
          <MapViewDirections
            origin={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            destination={{ latitude, longitude }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={6}
            strokeColor="#4285F4"
            mode="DRIVING"
            onReady={result => {
              const routeSteps = result.legs[0].steps as unknown as Step[];
              setSteps(routeSteps);
            }}
            onError={err => console.log('Directions error:', err)}
          />
        )}
      </MapView>
    </View>
  );
};

export default GraveMapScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    backgroundColor: '#1E4D2B',
    padding: 15,
    paddingTop: 50,
  },

  backButtonText: {
    color: 'white',
    fontSize: 16,
  },

  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },

  navBox: {
    position: 'absolute',
    top: 130,
    left: 10,
    right: 10,
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 12,
    zIndex: 100,
    elevation: 5,
  },

  navText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  navDistance: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
  },

  distanceBox: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 5,
    zIndex: 100,
  },

  distanceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  recenterButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 5,
    zIndex: 100,
  },

  recenterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },

  userLocationMarker: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  userLocationDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    borderWidth: 2,
    borderColor: 'white',
  },
});
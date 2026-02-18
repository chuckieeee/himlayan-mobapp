import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAFLUi1PfE9oqHFHV6f2NazYgW8HpRRa9k';

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
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  html_instructions: string;
  start_location: {
    latitude: number;
    longitude: number;
  };
  end_location: {
    latitude: number;
    longitude: number;
  };
}

const GraveMapScreen: React.FC<Props> = ({ route }) => {
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

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]+>/g, '');
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
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

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

          mapRef.current?.animateCamera({
            center: {
              latitude: coords.latitude,
              longitude: coords.longitude,
            },
            zoom: 18,
          });
        }
      );
    })();

    return () => subscription?.remove();
  }, [steps]);

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
      {/* TURN BY TURN NAV BOX */}
      {currentStep && (
        <View style={styles.navBox}>
          <Text style={styles.navText}>
            {stripHtml(currentStep.html_instructions)}
          </Text>

          <Text style={styles.navDistance}>in {currentStep.distance.text}</Text>
        </View>
      )}

      {/* DISTANCE BOX */}
      {distance !== null && (
        <View style={styles.distanceBox}>
          <Text style={styles.distanceText}>
            {distance.toFixed(0)} meters away
          </Text>
        </View>
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
        showsUserLocation
        followsUserLocation>
        <Marker
          coordinate={{
            latitude,
            longitude,
          }}
          title={`Plot ${plot.plot_number}`}
          description={`Section ${plot.section}`}
        />

        {userLocation && (
          <MapViewDirections
            origin={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            destination={{
              latitude,
              longitude,
            }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={6}
            strokeColor="#4285F4"
            mode="WALKING"
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
  container: {
    flex: 1,
  },

  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  navBox: {
    position: 'absolute',
    top: 60,
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
    bottom: 40,
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
});

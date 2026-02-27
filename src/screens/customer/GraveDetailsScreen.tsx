import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { GraveService } from '@services/GraveService';
import { Grave } from '@data/mockData';
import { colors, spacing, typography } from '@styles/theme';
import { commonStyles } from '@styles/commonStyles';
import MapView, { Marker } from 'react-native-maps';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type GraveDetailsRouteProp = RouteProp<RootStackParamList, 'GraveDetails'>;

const GraveDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GraveDetailsRouteProp>();

  const { graveId, burialRecord } = route.params as any;

  const [grave, setGrave] = useState<Grave | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (burialRecord) {
      // QR flow (already has data)
      mapAndSetGrave(burialRecord);
    } else if (graveId) {
      // Search flow (needs fetch)
      loadGraveDetails();
    } else {
      setLoading(false);
    }
  }, [graveId, burialRecord]);

  const mapAndSetGrave = (apiGrave: any) => {
    const mappedGrave: Grave = {
      deceasedName: apiGrave.deceased_name,
      section: apiGrave.plot.section,
      lotNumber: apiGrave.plot.plot_number,
      birthDate: apiGrave.birth_date,
      deathDate: apiGrave.death_date,
      burialDate: apiGrave.burial_date,
      familyContact: apiGrave.contact_name,
      qrCode: apiGrave.qr_code?.code ?? 'N/A',

      location: {
        latitude: Number(apiGrave.plot.latitude),
        longitude: Number(apiGrave.plot.longitude),
      },
    };

    console.log('Mapped grave:', mappedGrave);

    setGrave(mappedGrave);
    setLoading(false);
  };

  const loadGraveDetails = async () => {
    setLoading(true);

    const apiGrave = await GraveService.getGraveById(graveId);

    if (!apiGrave) {
      setGrave(null);
      setLoading(false);
      return;
    }

    mapAndSetGrave(apiGrave);
  };

  const handleNavigate = () => {
    if (!grave) return;

    navigation.navigate('GraveMap', {
      plot: {
        latitude: grave.location.latitude,
        longitude: grave.location.longitude,
        plot_number: grave.lotNumber,
        section: grave.section,
      },
    });
  };

  if (loading) {
    return (
      <View style={commonStyles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!grave) {
    return (
      <View style={commonStyles.centeredContainer}>
        <Text style={styles.errorText}>Grave not found</Text>
        <TouchableOpacity
          style={commonStyles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={commonStyles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return '—';
    const date = new Date(isoDate);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grave Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Info */}
        <View style={[commonStyles.card, styles.mainCard]}>
          <Text style={styles.monumentIcon}>🏛️</Text>
          <Text style={styles.deceasedName}>{grave.deceasedName}</Text>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{grave.section}</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Information</Text>

          <DetailRow label="Lot Number" value={grave.lotNumber} />
          <DetailRow label="Birth Date" value={formatDate(grave.birthDate)} />
          <DetailRow label="Death Date" value={formatDate(grave.deathDate)} />
          <DetailRow label="Burial Date" value={formatDate(grave.burialDate)} />
          <DetailRow label="Contact" value={grave.familyContact || '—'} />
        </View>

        {/* Location Card */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Location</Text>

          <MapView
            style={styles.previewMap}
            initialRegion={{
              latitude: grave.location.latitude,
              longitude: grave.location.longitude,
              latitudeDelta: 0.002,
              longitudeDelta: 0.002,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: grave.location.latitude,
                longitude: grave.location.longitude,
              }}
              title={grave.deceasedName}
              description={`Plot ${grave.lotNumber}`}
            />
          </MapView>

          <Text style={styles.coordinatesText}>
            {grave.location.latitude.toFixed(4)}, {grave.location.longitude.toFixed(4)}
          </Text>

          <TouchableOpacity
            style={[commonStyles.button, styles.navigateButton]}
            onPress={handleNavigate}
          >
            <Text style={commonStyles.buttonText}>
              📍 Navigate to Location
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const DetailRow = ({ label, value }: any) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    paddingTop: spacing.lg,
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
  scrollContent: {
    padding: spacing.md,
  },
  mainCard: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
  },
  monumentIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  deceasedName: {
    ...typography.h2,
    color: colors.surface,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  sectionBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  sectionBadgeText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.body1,
    fontWeight: '500',
  },
  previewMap: {
    height: 200,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  coordinatesText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  navigateButton: {
    backgroundColor: colors.info,
  },
  errorText: {
    ...typography.h4,
    color: colors.error,
    marginBottom: spacing.md,
  },
});

export default GraveDetailsScreen;
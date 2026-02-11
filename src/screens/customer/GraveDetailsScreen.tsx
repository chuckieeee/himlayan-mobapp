import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { GraveService } from '@services/GraveService';
import { Grave } from '@data/mockData';
import { colors, spacing, typography } from '@styles/theme';
import { commonStyles } from '@styles/commonStyles';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type GraveDetailsRouteProp = RouteProp<RootStackParamList, 'GraveDetails'>;

const GraveDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GraveDetailsRouteProp>();
  const { graveId } = route.params;
  
  const [grave, setGrave] = useState<Grave | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGraveDetails();
  }, [graveId]);

  const loadGraveDetails = async () => {
    setLoading(true);
    const graveData = await GraveService.getGraveById(graveId);
    setGrave(graveData);
    setLoading(false);
  };

  const handleNavigate = () => {
    if (grave) {
      Alert.alert(
        'Navigation',
        `GPS Navigation to ${grave.deceasedName}\n\nCoordinates:\nLat: ${grave.location.latitude}\nLng: ${grave.location.longitude}\n\nThis would open maps app in production.`,
        [{ text: 'OK' }]
      );
    }
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
          onPress={() => navigation.goBack()}>
          <Text style={commonStyles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grave Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Info Card */}
        <View style={[commonStyles.card, styles.mainCard]}>
          <Text style={styles.monumentIcon}>🏛️</Text>
          <Text style={styles.deceasedName}>{grave.deceasedName}</Text>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{grave.section}</Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Information</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Lot Number:</Text>
            <Text style={styles.detailValue}>{grave.lotNumber}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Birth Date:</Text>
            <Text style={styles.detailValue}>{grave.birthDate}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Death Date:</Text>
            <Text style={styles.detailValue}>{grave.deathDate}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Burial Date:</Text>
            <Text style={styles.detailValue}>{grave.burialDate}</Text>
          </View>
          
          {grave.familyContact && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Contact:</Text>
              <Text style={styles.detailValue}>{grave.familyContact}</Text>
            </View>
          )}
        </View>

        {/* Location Card */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapIcon}>🗺️</Text>
            <Text style={styles.mapText}>Map Preview</Text>
            <Text style={styles.coordinatesText}>
              {grave.location.latitude.toFixed(4)}, {grave.location.longitude.toFixed(4)}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[commonStyles.button, styles.navigateButton]}
            onPress={handleNavigate}>
            <Text style={commonStyles.buttonText}>📍 Navigate to Location</Text>
          </TouchableOpacity>
        </View>

        {/* QR Code Card */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>QR Code</Text>
          
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrIcon}>QR</Text>
            <Text style={styles.qrText}>{grave.qrCode}</Text>
          </View>
          
          <Text style={styles.qrNote}>
            Scan this QR code at the monument for quick access
          </Text>
        </View>

        {/* Heritage Info */}
        <View style={[commonStyles.card, styles.heritageCard]}>
          <Text style={styles.heritageTitle}>🇵🇭 Filipino Heritage</Text>
          <Text style={styles.heritageText}>
            This monument is part of Himlayang Pilipino's cultural heritage
            preservation initiative, honoring Filipino heroes and their
            contributions to our nation's history.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

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
    fontWeight: '500',
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
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '500',
  },
  mapPlaceholder: {
    backgroundColor: colors.background,
    height: 200,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  mapIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  mapText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  coordinatesText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  navigateButton: {
    backgroundColor: colors.info,
  },
  qrPlaceholder: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    height: 150,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  qrIcon: {
    ...typography.h2,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  qrText: {
    ...typography.body2,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  qrNote: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  heritageCard: {
    backgroundColor: colors.secondary,
  },
  heritageTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  heritageText: {
    ...typography.body2,
    color: colors.text,
    lineHeight: 20,
  },
  errorText: {
    ...typography.h4,
    color: colors.error,
    marginBottom: spacing.md,
  },
});

export default GraveDetailsScreen;

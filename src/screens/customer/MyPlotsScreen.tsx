import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '@styles/theme';
import { commonStyles } from '@styles/commonStyles';
import api from '@services/api';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface PlotItem {
  id: number;
  plot_number: string;
  section: string;
  status: string;
  burial_record?: {
    id: number;
    deceased_name: string;
    death_date: string;
    burial_date: string;
  };
}

const MyPlotsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [plots, setPlots] = useState<PlotItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlots();
  }, []);

  const loadPlots = async () => {
    setLoading(true);
    try {
      const response = await api.get('/member/my-plots');
      if (response.success) {
        setPlots(response.data || []);
      }
    } catch (error) {
      console.log('Error loading plots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlotPress = (plot: PlotItem) => {
    if (plot.burial_record?.id) {
      navigation.navigate('GraveDetails', {
        graveId: plot.burial_record.id.toString(),
      });
    }
  };

  const renderPlotCard = ({ item }: { item: PlotItem }) => {
    const deceased = item.burial_record;

    return (
      <TouchableOpacity
        style={styles.plotCard}
        onPress={() => handlePlotPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.plotHeader}>
          <Text style={styles.plotNumber}>{item.plot_number}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.sectionText}>Section: {item.section}</Text>

        {deceased && (
          <>
            <View style={styles.deceasedSection}>
              <Text style={styles.deceasedName}>{deceased.deceased_name}</Text>
              <Text style={styles.deceasedDate}>
                 {new Date(deceased.death_date).toLocaleDateString('en-PH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </>
        )}

        <Text style={styles.viewMoreText}>Tap to view details →</Text>
      </TouchableOpacity>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'occupied':
        return colors.primary;
      case 'available':
        return colors.success;
      case 'reserved':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={commonStyles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Plots</Text>
        <Text style={styles.headerSubtitle}>
          {plots.length} plot{plots.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {plots.length === 0 ? (
        <View style={commonStyles.centeredContainer}>
          <Text style={styles.emptyText}>No plots found</Text>
        </View>
      ) : (
        <FlatList
          data={plots}
          renderItem={renderPlotCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    paddingTop: 50,
  },
  backButton: {
    color: colors.surface,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.surface,
  },
  headerSubtitle: {
    ...typography.body2,
    color: colors.surface,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  plotCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  plotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  plotNumber: {
    ...typography.h4,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  deceasedSection: {
    backgroundColor: '#f5f5f5',
    padding: spacing.sm,
    borderRadius: 8,
    marginVertical: spacing.sm,
  },
  deceasedName: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  deceasedDate: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  viewMoreText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  emptyText: {
    ...typography.body1,
    color: colors.textSecondary,
  },
});

export default MyPlotsScreen;

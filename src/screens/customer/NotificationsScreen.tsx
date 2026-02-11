import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '../../navigation/types';
import api from '@services/api';
import { colors, spacing, typography } from '@styles/theme';
import { commonStyles } from '@styles/commonStyles';

type NavigationProp = BottomTabNavigationProp<BottomTabParamList, 'Profile'>;

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  type?: string;
  priority?: 'high' | 'medium' | 'low';
}

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await api.get('/announcements');
      if (response.success && response.data) {
        setAnnouncements(response.data);
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🔵';
      default:
        return '⚪';
    }
  };

  const filteredAnnouncements = filter === 'all' 
    ? announcements 
    : announcements.filter(a => a.priority === filter);

  if (loading) {
    return (
      <View style={commonStyles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications & Announcements</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}>
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All ({announcements.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, filter === 'high' && styles.filterButtonActive]}
            onPress={() => setFilter('high')}>
            <Text style={[styles.filterText, filter === 'high' && styles.filterTextActive]}>
              🔴 High
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, filter === 'medium' && styles.filterButtonActive]}
            onPress={() => setFilter('medium')}>
            <Text style={[styles.filterText, filter === 'medium' && styles.filterTextActive]}>
              🟡 Medium
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, filter === 'low' && styles.filterButtonActive]}
            onPress={() => setFilter('low')}>
            <Text style={[styles.filterText, filter === 'low' && styles.filterTextActive]}>
              🔵 Low
            </Text>
          </TouchableOpacity>
        </View>

        {/* Announcements List */}
        {filteredAnnouncements.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📢</Text>
            <Text style={styles.emptyText}>No announcements</Text>
            <Text style={styles.emptySubtext}>
              Check back later for updates
            </Text>
          </View>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <View
              key={announcement.id}
              style={[
                styles.announcementCard,
                { borderLeftColor: getPriorityColor(announcement.priority) },
              ]}>
              {/* Header */}
              <View style={styles.announcementHeader}>
                <Text style={styles.priorityIcon}>
                  {getPriorityIcon(announcement.priority)}
                </Text>
                <View style={styles.announcementHeaderText}>
                  <Text style={styles.announcementTitle}>
                    {announcement.title}
                  </Text>
                  <Text style={styles.announcementMeta}>
                    {announcement.date}
                  </Text>
                </View>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(announcement.priority) },
                  ]}>
                  <Text style={styles.priorityText}>
                    {announcement.priority?.toUpperCase() || 'INFO'}
                  </Text>
                </View>
              </View>

              {/* Message */}
              <Text style={styles.announcementMessage}>
                {announcement.content}
              </Text>

              {/* Footer */}
              <View style={styles.announcementFooter}>
                <Text style={styles.announcementId}>{announcement.id}</Text>
              </View>
            </View>
          ))
        )}

        {/* Info Note */}
        <View style={[commonStyles.card, styles.infoCard]}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Stay Updated</Text>
            <Text style={styles.infoText}>
              Important announcements about cemetery hours, special events, and
              maintenance schedules will appear here.
            </Text>
          </View>
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
  filterContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  filterButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.body2,
    color: colors.text,
  },
  filterTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  announcementCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    elevation: 2,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  priorityIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  announcementHeaderText: {
    flex: 1,
  },
  announcementTitle: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  announcementMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  priorityText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
    fontSize: 10,
  },
  announcementMessage: {
    ...typography.body2,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  announcementFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  announcementId: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.body1,
    color: colors.surface,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.body2,
    color: colors.surface,
    lineHeight: 20,
  },
});

export default NotificationsScreen;

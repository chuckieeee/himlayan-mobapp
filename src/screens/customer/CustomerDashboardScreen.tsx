import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '../../navigation/types';
import { AuthService } from '@services/AuthService';
import { User } from '@data/mockData';
import { colors, spacing, typography } from '@styles/theme';
import { commonStyles } from '@styles/commonStyles';
import api from '@services/api';

type NavigationProp = BottomTabNavigationProp<BottomTabParamList, 'Dashboard'>;

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  type: string;
}

interface Plot {
  id: number;
  plot_number: string;
  section: string;
  deceased_name?: string;
}

const CustomerDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [user, setUser] = useState<User | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [myPlots, setMyPlots] = useState<Plot[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadUser();
    loadAnnouncements();
    loadMyPlots();

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadUser = async () => {
    const currentUser = await AuthService.getCurrentUser();
    setUser(currentUser);
  };

  const loadAnnouncements = async () => {
    try {
      const response = await api.get('/announcements');
      if (response.success) {
        setAnnouncements(response.data || []);
      }
    } catch (err) {
      // Fallback announcements
      setAnnouncements([
        {
          id: 1,
          title: 'Cemetery Open for All Saints Day',
          content: 'Oct 31 - Nov 2: Open 24 hours for visitors.',
          date: '2025-10-25',
          type: 'important',
        },
        {
          id: 2,
          title: 'New Memorial Garden',
          content: 'A new section of the memorial garden is now open.',
          date: '2025-10-01',
          type: 'info',
        },
        {
          id: 3,
          title: 'Online Payment Available',
          content: 'You can now pay your dues online.',
          date: '2025-09-15',
          type: 'success',
        },
      ]);
    }
  };

  const loadMyPlots = async () => {
    try {
      const response = await api.get('/member/my-plots');
      if (response.success) {
        setMyPlots(response.data || []);
      }
    } catch (err) {
      console.log('No plots found or API not ready');
      setMyPlots([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadAnnouncements(), loadMyPlots()]);
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-PH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLogout = async () => {
    // Use window.confirm for web, Alert.alert for native
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        await AuthService.logout();
      }
    } else {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await AuthService.logout();
            // Navigation will be handled automatically
          },
        },
      ]);
    }
  };

  const menuItems = [
    {
      id: 1,
      title: 'Grave Search & Navigation',
      description: 'Find and navigate to grave locations',
      icon: '🗺️',
      onPress: () => navigation.navigate('Search'),
    },
    {
      id: 2,
      title: 'QR Code Scanner',
      description: 'Scan QR codes on monuments',
      icon: '📷',
      onPress: () => navigation.navigate('Scanner'),
    },
    {
      id: 3,
      title: 'Check Balances & Payments',
      description: 'View payment history and dues',
      icon: '💳',
      onPress: () => navigation.navigate('Payments'),
    },
    {
      id: 4,
      title: 'Notifications & Announcements',
      description: 'View latest updates and news',
      icon: '📢',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      id: 5,
      title: 'View Map',
      description: 'See the memorial park on the map',
      icon: '🗺️',
      onPress: () => navigation.navigate('Map'), // new map screen
    },
  ];

  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()},</Text>
        <Text style={styles.headerTitle}>{user?.name || 'Visitor'}!</Text>
        <Text style={styles.headerSubtitle}>
          Himlayang Pilipino Memorial Park
        </Text>
        <Text style={styles.dateTime}>{formatDate()}</Text>
        <Text style={styles.time}>{formatTime()}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* My Plots Section */}
        {myPlots.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Plots</Text>
            {myPlots.slice(0, 3).map(plot => (
              <View key={plot.id} style={styles.plotCard}>
                <Text style={styles.plotNumber}>{plot.plot_number}</Text>
                <Text style={styles.plotSection}>Section: {plot.section}</Text>
                {plot.deceased_name && (
                  <Text style={styles.plotDeceased}>{plot.deceased_name}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.menuContainer}>
            {menuItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuCard}
                onPress={item.onPress}>
                <View style={styles.menuIcon}>
                  <Text style={styles.menuIconText}>{item.icon}</Text>
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Announcements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Announcements</Text>
          {announcements.slice(0, 3).map(announcement => (
            <View key={announcement.id} style={styles.announcementCard}>
              <View
                style={[
                  styles.announcementBadge,
                  {
                    backgroundColor:
                      announcement.type === 'important'
                        ? colors.error
                        : colors.info,
                  },
                ]}>
                <Text style={styles.announcementBadgeText}>
                  {announcement.type?.toUpperCase() || 'GENERAL'}
                </Text>
              </View>
              <Text style={styles.announcementTitle}>{announcement.title}</Text>
              <Text style={styles.announcementContent}>
                {announcement.content}
              </Text>
              <Text style={styles.announcementDate}>{announcement.date}</Text>
            </View>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{myPlots.length}</Text>
            <Text style={styles.statLabel}>My Plots</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{announcements.length}</Text>
            <Text style={styles.statLabel}>Announcements</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>24/7</Text>
            <Text style={styles.statLabel}>Support</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[commonStyles.button, styles.logoutButton]}
          onPress={handleLogout}>
          <Text style={commonStyles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  greeting: {
    ...typography.body1,
    color: colors.surface,
    opacity: 0.9,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.surface,
    marginBottom: spacing.xs,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...typography.body2,
    color: colors.surface,
    opacity: 0.9,
  },
  dateTime: {
    ...typography.caption,
    color: colors.surface,
    opacity: 0.8,
    marginTop: spacing.sm,
  },
  time: {
    ...typography.caption,
    color: colors.surface,
    opacity: 0.8,
  },
  scrollContent: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  plotCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    elevation: 2,
  },
  plotNumber: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
  },
  plotSection: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  plotDeceased: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  menuContainer: {
    marginTop: spacing.sm,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  menuIcon: {
    width: 60,
    height: 60,
    backgroundColor: colors.primary50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuIconText: {
    fontSize: 32,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  menuDescription: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  announcementCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    elevation: 2,
  },
  announcementBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  announcementBadgeText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  announcementTitle: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  announcementContent: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  announcementDate: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    elevation: 2,
  },
  statValue: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.xs,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: colors.error,
    marginTop: spacing.md,
  },
});

export default CustomerDashboardScreen;

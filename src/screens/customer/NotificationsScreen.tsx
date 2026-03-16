import React, { useState, useEffect } from 'react';
import {
View,
Text,
StyleSheet,
ScrollView,
ActivityIndicator,
TouchableOpacity,
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
}

const NotificationsScreen: React.FC = () => {
const navigation = useNavigation<NavigationProp>();
const [announcements, setAnnouncements] = useState<Announcement[]>([]);
const [loading, setLoading] = useState(true);

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

const getBadgeStyle = (type?: string) => {
switch (type) {
case 'urgent':
return { backgroundColor: '#4F7DD3' };
case 'success':
return { backgroundColor: '#4F7DD3' };
default:
return { backgroundColor: '#4F7DD3' };
}
};

if (loading) {
return ( <View style={commonStyles.centeredContainer}> 
  <ActivityIndicator size="large" color={colors.primary} /> 
</View>
);
}

return ( <View style={commonStyles.container}>


  {/* Header */}
<View style={styles.header}>

  <TouchableOpacity
    onPress={() => navigation.navigate("Dashboard")}
    style={styles.backButton}
  >
    <Text style={styles.backButtonText}>
      ← Back
    </Text>
  </TouchableOpacity>

  <Text style={styles.headerTitle}>
    Announcements
  </Text>

</View>
  <ScrollView contentContainerStyle={styles.scrollContent}>

    {announcements.length === 0 ? (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No announcements</Text>
        <Text style={styles.emptySubtext}>
          Check back later for updates
        </Text>
      </View>
    ) : (
      announcements.map((announcement) => (
        <View key={announcement.id} style={styles.announcementCard}>

          {/* Badge */}
          {announcement.type && (
            <View style={[styles.badge, getBadgeStyle(announcement.type)]}>
              <Text style={styles.badgeText}>
                {announcement.type.toUpperCase()}
              </Text>
            </View>
          )}

          {/* Title */}
          <Text style={styles.announcementTitle}>
            {announcement.title}
          </Text>

          {/* Date */}
          <Text style={styles.announcementMeta}>
            {announcement.date}
          </Text>

          {/* Content */}
          <Text style={styles.announcementMessage}>
            {announcement.content}
          </Text>

        </View>
      ))
    )}

    {/* Info Note */}
    <View style={[commonStyles.card, styles.infoCard]}>
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
scrollContent: {
padding: spacing.md,
},
announcementCard: {
backgroundColor: colors.surface,
borderRadius: 12,
padding: spacing.md,
marginBottom: spacing.md,
elevation: 2,
},
badge: {
alignSelf: 'flex-start',
paddingHorizontal: 12,
paddingVertical: 4,
borderRadius: 20,
marginBottom: spacing.sm,
},
badgeText: {
color: '#fff',
fontSize: 12,
fontWeight: '600',
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
marginBottom: spacing.sm,
},
announcementMessage: {
...typography.body2,
color: colors.text,
lineHeight: 20,
},
emptyContainer: {
alignItems: 'center',
padding: spacing.xl,
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
marginTop: spacing.md,
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

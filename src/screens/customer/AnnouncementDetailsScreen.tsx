import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '@styles/theme';
import { commonStyles } from '@styles/commonStyles';

const AnnouncementDetailsScreen = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const { announcement } = route.params;

    const getBadgeStyle = () => {
    return { backgroundColor: '#4F7DD3' };
    };

  return (
    <View style={commonStyles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Announcement
        </Text>
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.content}>

        {/* BADGE */}
        {announcement.type && (
          <View style={[styles.badge, getBadgeStyle(announcement.type)]}>
            <Text style={styles.badgeText}>
              {announcement.type.toUpperCase()}
            </Text>
          </View>
        )}

        {/* TITLE */}
        <Text style={styles.title}>
          {announcement.title}
        </Text>

        {/* DATE */}
        <Text style={styles.date}>
          {announcement.date}
        </Text>

        {/* BODY */}
        <Text style={styles.body}>
          {announcement.content}
        </Text>

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
    color: colors.surface,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.surface,
  },
  content: {
    padding: spacing.md,
  },

  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: spacing.sm,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  title: {
    ...typography.h3,
    marginBottom: spacing.xs,
    color: colors.text,
  },
  date: {
    ...typography.caption,
    marginBottom: spacing.md,
    color: colors.textSecondary,
  },
  body: {
    ...typography.body1,
    lineHeight: 24,
    color: colors.text,
  },
});

export default AnnouncementDetailsScreen;
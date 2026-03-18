import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { API_BASE_URL } from '@/config/api';

const LAST_ANNOUNCEMENT_ID_KEY = 'last_announcement_id';
const POLLING_INTERVAL_MS = 30000; // Poll every 30 seconds

let pollingInterval: NodeJS.Timeout | null = null;

export class AnnouncementPollingService {
  /**
   * Start polling for new announcements
   * Call this after user logs in
   */
  static async startPolling(authToken: string): Promise<void> {
    console.log('🔄 Starting announcement polling...');

    // Stop any existing polling
    this.stopPolling();

    // Poll immediately first
    await this.checkForNewAnnouncements(authToken);

    // Then set up interval
    pollingInterval = setInterval(async () => {
      await this.checkForNewAnnouncements(authToken);
    }, POLLING_INTERVAL_MS);

    console.log('✅ Announcement polling started (every 30 seconds)');
  }

  /**
   * Stop polling
   * Call this when user logs out
   */
  static stopPolling(): void {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
      console.log('⏸️ Announcement polling stopped');
    }
  }

  /**
   * Check for new announcements and show notifications
   */
  private static async checkForNewAnnouncements(authToken: string): Promise<void> {
    try {
      // Get last announcement ID we've already shown
      const lastSeenId = await AsyncStorage.getItem(LAST_ANNOUNCEMENT_ID_KEY);

      // Fetch announcements from API
      const response = await fetch(`${API_BASE_URL}/announcements?per_page=5`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        console.log('⚠️ Failed to fetch announcements:', response.status);
        return;
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        console.log('⚠️ Invalid announcement response');
        return;
      }

      const announcements = data.data;

      // Check for new announcements
      for (const announcement of announcements) {
        // If this announcement is newer than our last seen one, show notification
        if (!lastSeenId || announcement.id > parseInt(lastSeenId)) {
          await this.showNotification(announcement);
        }
      }

      // Update last seen ID if we got announcements
      if (announcements.length > 0) {
        const newestId = Math.max(...announcements.map((a: any) => a.id));
        await AsyncStorage.setItem(LAST_ANNOUNCEMENT_ID_KEY, newestId.toString());
        console.log(`✅ Announcement polling: Found ${announcements.length} announcements`);
      }
    } catch (error) {
      console.error('❌ Error checking announcements:', error);
    }
  }

  /**
   * Show local notification for announcement
   */
  private static async showNotification(announcement: any): Promise<void> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: announcement.title || 'New Announcement',
          body: announcement.content || 'Check the announcements section for details.',
          badge: 1,
          sound: 'default',
          data: {
            announcement_id: announcement.id,
            type: announcement.type || 'info',
          },
        },
        trigger: null, // Show immediately
      });

      console.log(`📬 Local notification shown for announcement ID: ${announcement.id}`);
    } catch (error) {
      console.error('❌ Failed to show notification:', error);
    }
  }

  /**
   * Reset last seen announcement (useful for debugging/testing)
   */
  static async resetLastSeenAnnouncement(): Promise<void> {
    await AsyncStorage.removeItem(LAST_ANNOUNCEMENT_ID_KEY);
    console.log('🔄 Last seen announcement reset');
  }
}

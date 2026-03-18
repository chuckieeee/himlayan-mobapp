import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import messaging from '@react-native-firebase/messaging';

// Store subscriptions globally so they don't get garbage collected
let notificationReceivedSubscription: Notifications.EventSubscription | null = null;
let notificationResponseSubscription: Notifications.EventSubscription | null = null;

// Setup notification channel with app name
export async function setupNotificationChannel(): Promise<void> {
  try {
    console.log('🔧 Starting notification setup...');

    // Set default notification behavior FIRST
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        console.log('🔔 Handler processing notification:', {
          title: notification.request.content.title,
          body: notification.request.content.body,
        });
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        };
      },
    });

    console.log('✅ Notification handler configured');

    // Create Android notification channel with app name
    if (Device.isDevice && Device.osName === 'Android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Himlayang Pilipino',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2E7D32',
        sound: 'default',
        enableVibrate: true,
      });
      console.log('✅ Android notification channel created');
    }

    // Set up listeners AFTER handler is configured
    // Remove old subscriptions if they exist
    if (notificationReceivedSubscription) {
      notificationReceivedSubscription.remove();
    }
    if (notificationResponseSubscription) {
      notificationResponseSubscription.remove();
    }

    // Listen for incoming notifications while app is in foreground
    notificationReceivedSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received in foreground:', {
        title: notification.request.content.title,
        body: notification.request.content.body,
        data: notification.request.content.data,
      });
    });

    // Listen for notification responses (when user taps notification)
    notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 User tapped notification:', {
        title: response.notification.request.content.title,
        body: response.notification.request.content.body,
      });
    });

    console.log('✅ Notification listeners registered');

  } catch (error) {
    console.error('❌ Failed to setup notification channel:', error);
  }
}

export async function getExpoPushToken(): Promise<string | null> {

  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== 'granted') {
    console.log('Notification permission not granted');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  console.log('Expo Push Token:', token);

  return token;
}

export async function getFCMToken(): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      console.log('FCM token requires a physical device');
      return null;
    }

    const status = await messaging().requestPermission();
    if (status === messaging.AuthorizationStatus.AUTHORIZED || 
        status === messaging.AuthorizationStatus.PROVISIONAL) {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('FCM permission not granted');
      return null;
    }
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
}
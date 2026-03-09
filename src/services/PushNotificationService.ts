import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

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
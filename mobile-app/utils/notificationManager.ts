import AsyncStorage from '@react-native-async-storage/async-storage';

let Notifications: any = null;
let notificationsAvailable = false;

try {
  Notifications = require('expo-notifications');
  notificationsAvailable = true;
} catch (e) {
  console.warn('expo-notifications not available:', e);
}

const NOTIFICATION_PREFS_KEY = '@rideshare_notification_prefs';

interface NotificationPreferences {
  muted: boolean;
  rideRequests: boolean;
  rideUpdates: boolean;
  messages: boolean;
  safetyAlerts: boolean;
  promotional: boolean;
  ratings: boolean;
}

const defaultPreferences: NotificationPreferences = {
  muted: false,
  rideRequests: true,
  rideUpdates: true,
  messages: true,
  safetyAlerts: true,
  promotional: false,
  ratings: true,
};

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading notification preferences:', error);
  }
  return defaultPreferences;
}

export async function shouldSendNotification(type: keyof NotificationPreferences): Promise<boolean> {
  const prefs = await getNotificationPreferences();
  
  if (prefs.muted) return false;
  
  return prefs[type] || false;
}

export async function sendLocalNotification({
  title,
  body,
  data,
}: {
  title: string;
  body: string;
  data?: any;
}) {
  if (!notificationsAvailable || !Notifications) {
    console.log('Notifications not available, skipping local notification');
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
        priority: Notifications.AndroidNotificationPriority?.HIGH || 'high',
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error sending local notification:', error);
  }
}

export async function sendRideRequestNotification(requesterName: string, destination: string) {
  const shouldSend = await shouldSendNotification('rideRequests');
  if (!shouldSend) return;

  await sendLocalNotification({
    title: 'New Join Request',
    body: `${requesterName} wants to join your ride to ${destination}`,
    data: {
      type: 'success',
      icon: 'user-plus',
      title: 'New Join Request',
      description: `${requesterName} wants to join your ride to ${destination}`,
      category: 'rideRequest',
    },
  });
}

export async function sendRideUpdateNotification(rideStatus: string, destination: string) {
  const shouldSend = await shouldSendNotification('rideUpdates');
  if (!shouldSend) return;

  await sendLocalNotification({
    title: 'Ride Update',
    body: `Your ride to ${destination} has been ${rideStatus}`,
    data: {
      type: 'info',
      icon: 'bicycle',
      title: 'Ride Update',
      description: `Your ride to ${destination} has been ${rideStatus}`,
      category: 'rideUpdate',
    },
  });
}

export async function sendMessageNotification(senderName: string, message: string) {
  const shouldSend = await shouldSendNotification('messages');
  if (!shouldSend) return;

  await sendLocalNotification({
    title: `New message from ${senderName}`,
    body: message,
    data: {
      type: 'success',
      icon: 'chatbubble',
      title: `New message from ${senderName}`,
      description: message,
      category: 'message',
    },
  });
}

export async function sendSafetyAlertNotification(alertType: string, message: string) {
  const shouldSend = await shouldSendNotification('safetyAlerts');
  if (!shouldSend) return;

  await sendLocalNotification({
    title: `Safety Alert: ${alertType}`,
    body: message,
    data: {
      type: 'warning',
      icon: 'shield-checkmark',
      title: `Safety Alert: ${alertType}`,
      description: message,
      category: 'safetyAlert',
    },
  });
}

export async function sendRatingNotification(raterName: string, rating: number) {
  const shouldSend = await shouldSendNotification('ratings');
  if (!shouldSend) return;

  await sendLocalNotification({
    title: 'New Rating',
    body: `${raterName} rated you ${rating} stars`,
    data: {
      type: 'success',
      icon: 'star',
      title: 'New Rating',
      description: `${raterName} rated you ${rating} stars`,
      category: 'rating',
    },
  });
}

export async function sendPromotionalNotification(title: string, message: string) {
  const shouldSend = await shouldSendNotification('promotional');
  if (!shouldSend) return;

  await sendLocalNotification({
    title,
    body: message,
    data: {
      type: 'info',
      icon: 'megaphone',
      title,
      description: message,
      category: 'promotional',
    },
  });
}

export async function sendRideCancelledNotification(posterName: string, destination: string) {
  const shouldSend = await shouldSendNotification('rideUpdates');
  if (!shouldSend) return;

  await sendLocalNotification({
    title: 'Ride Cancelled',
    body: `${posterName} cancelled the ride to ${destination}`,
    data: {
      type: 'error',
      icon: 'times-circle',
      title: 'Ride Cancelled',
      description: `${posterName} cancelled the ride to ${destination}`,
      category: 'rideUpdate',
    },
  });
}

export async function sendRideAcceptedNotification(posterName: string, destination: string) {
  const shouldSend = await shouldSendNotification('rideRequests');
  if (!shouldSend) return;

  await sendLocalNotification({
    title: 'Request Accepted',
    body: `${posterName} accepted your request to ${destination}`,
    data: {
      type: 'success',
      icon: 'check-circle',
      title: 'Request Accepted',
      description: `${posterName} accepted your request to ${destination}`,
      category: 'rideRequest',
    },
  });
}

export async function sendRideClosingSoonNotification(destination: string, closesIn: string) {
  const shouldSend = await shouldSendNotification('rideUpdates');
  if (!shouldSend) return;

  await sendLocalNotification({
    title: 'Ride Closing Soon',
    body: `Your posted ride to ${destination} closes in ${closesIn}`,
    data: {
      type: 'warning',
      icon: 'clock',
      title: 'Ride Closing Soon',
      description: `Your posted ride to ${destination} closes in ${closesIn}`,
      category: 'rideUpdate',
    },
  });
}

export async function sendSafetyVerifiedNotification(rideId: string) {
  const shouldSend = await shouldSendNotification('safetyAlerts');
  if (!shouldSend) return;

  await sendLocalNotification({
    title: 'Safety Verified',
    body: `Your Safety PIN was confirmed for ride #${rideId}`,
    data: {
      type: 'success',
      icon: 'shield-halved',
      title: 'Safety Verified',
      description: `Your Safety PIN was confirmed for ride #${rideId}`,
      category: 'safetyAlert',
    },
  });
}
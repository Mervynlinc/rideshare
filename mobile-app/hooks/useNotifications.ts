import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthProvider';

let Notifications: any = null;
let expoDevice: any = null;
let notificationsAvailable = false;

try {
  Notifications = require('expo-notifications');
  expoDevice = require('expo-device');
  notificationsAvailable = true;
  
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch (e) {
  console.warn('expo-notifications/expo-device not available:', e);
}

export function useNotifications() {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || !notificationsAvailable) return;
    
    registerForPushNotifications();
    
    try {
      const subscription = Notifications.addNotificationResponseReceivedListener(
        (response: any) => {
          const data = response.notification.request.content.data;
          if (data?.chatId) {
            router.push(`/chat/${data.chatId}`);
          } else if (data?.rideId) {
            router.push(`/ride/${data.rideId}`);
          } else if (data?.screen === 'profile') {
            router.push('/(app)/(tabs)/profile');
          }
        }
      );

      return () => subscription.remove();
    } catch (e) {
      console.warn('Error setting up notification listener:', e);
    }
  }, [user]);

  const registerForPushNotifications = async () => {
    if (!notificationsAvailable || !Notifications || !expoDevice) {
      console.log('Notifications not available, skipping registration');
      return;
    }

    try {
      if (!expoDevice.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return;
      }

      if (!user) {
        console.log('User not authenticated, skipping push notification registration');
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;
      setPushToken(token);

      await upsertPushToken(token);
      setIsRegistered(true);
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const upsertPushToken = async (token: string) => {
    if (!user) {
      console.log('User not authenticated, cannot upsert push token');
      return;
    }

    try {
      const { error } = await supabase
        .from('push_tokens')
        .upsert(
          {
            user_id: user.id,
            token: token,
          },
          {
            onConflict: 'user_id,token',
          }
        );

      if (error) {
        console.error('Error upserting push token:', error);
      } else {
        console.log('Push token registered successfully');
      }
    } catch (error) {
      console.error('Error upserting push token:', error);
    }
  };

  return {
    pushToken,
    isRegistered,
  };
}
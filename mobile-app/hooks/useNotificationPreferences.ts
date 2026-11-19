import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthProvider';

let Notifications: any = null;
let notificationsAvailable = false;

try {
  Notifications = require('expo-notifications');
  notificationsAvailable = true;
} catch (e) {
  console.warn('expo-notifications not available:', e);
}

interface NotificationPreferences {
  push_enabled: boolean;
  ride_requests: boolean;
  ride_updates: boolean;
  messages: boolean;
  safety_alerts: boolean;
  promotional: boolean;
  ratings: boolean;
}

const defaultPreferences: NotificationPreferences = {
  push_enabled: true,
  ride_requests: true,
  ride_updates: true,
  messages: true,
  safety_alerts: true,
  promotional: false,
  ratings: true,
};

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching notification preferences:', error);
        setLoading(false);
        return;
      }

      if (!data) {
        await createDefaultPreferences();
      } else {
        setPreferences({
          push_enabled: data.push_enabled,
          ride_requests: data.ride_requests,
          ride_updates: data.ride_updates,
          messages: data.messages,
          safety_alerts: data.safety_alerts,
          promotional: data.promotional,
          ratings: data.ratings,
        });
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: user.id,
          ...defaultPreferences,
        });

      if (error) {
        console.error('Error creating default notification preferences:', error);
      }
    } catch (error) {
      console.error('Error creating default notification preferences:', error);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!user) return;

    const updated = { ...preferences, [key]: value };
    setPreferences(updated);

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...updated,
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error updating notification preferences:', error);
        setPreferences(preferences);
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      setPreferences(preferences);
    }

    if (key === 'push_enabled') {
      if (!value) {
        await disableNotifications();
      } else {
        await enableNotifications();
      }
    }
  };

  const disableNotifications = async () => {
    if (!user) return;

    try {
      if (notificationsAvailable && Notifications) {
        await Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: false,
            shouldShowList: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
          }),
        });
      }

      const { error } = await supabase
        .from('push_tokens')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting push tokens:', error);
      }
    } catch (error) {
      console.error('Error disabling notifications:', error);
    }
  };

  const enableNotifications = async () => {
    if (!notificationsAvailable || !Notifications) return;

    try {
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    } catch (error) {
      console.error('Error enabling notifications:', error);
    }
  };

  return {
    preferences,
    updatePreference,
    loading,
  };
}
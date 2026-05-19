import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

class CustomStorageAdapter {
  private securePrefix = 'secure_';
  private asyncPrefix = 'async_';

  async getItem(key: string): Promise<string | null> {
    // Try SecureStore first for sensitive data
    try {
      const secureValue = await SecureStore.getItemAsync(this.securePrefix + key);
      if (secureValue) return secureValue;
    } catch (error) {
      console.log('SecureStore not available, falling back to AsyncStorage');
    }

    // Fall back to AsyncStorage for larger data
    return await AsyncStorage.getItem(this.asyncPrefix + key);
  }

  async setItem(key: string, value: string): Promise<void> {
    // Check if value is small enough for SecureStore
    const valueSize = new Blob([value]).size;
    
    if (valueSize <= 2048) {
      try {
        await SecureStore.setItemAsync(this.securePrefix + key, value);
        return;
      } catch (error) {
        console.log('SecureStore failed, using AsyncStorage');
      }
    }

    // Use AsyncStorage for larger data
    await AsyncStorage.setItem(this.asyncPrefix + key, value);
  }

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.securePrefix + key);
    } catch (error) {
      // Ignore if SecureStore fails
    }
    await AsyncStorage.removeItem(this.asyncPrefix + key);
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: new CustomStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
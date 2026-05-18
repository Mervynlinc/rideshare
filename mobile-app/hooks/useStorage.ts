import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

type StorageType = 'async' | 'secure';

interface UseStorageOptions {
  key: string;
  type?: StorageType;
  defaultValue?: string | null;
}

interface UseStorageReturn {
  value: string | null;
  isLoading: boolean;
  setValue: (value: string | null) => Promise<void>;
  removeValue: () => Promise<void>;
}

export function useStorage({
  key,
  type = 'async',
  defaultValue = null,
}: UseStorageOptions): UseStorageReturn {
  const [value, setValueState] = useState<string | null>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadValue();
  }, [key, type]);

  const loadValue = async () => {
    try {
      const storedValue =
        type === 'secure'
          ? await SecureStore.getItemAsync(key)
          : await AsyncStorage.getItem(key);
      setValueState(storedValue ?? defaultValue);
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      setValueState(defaultValue);
    } finally {
      setIsLoading(false);
    }
  };

  const setValue = useCallback(
    async (newValue: string | null) => {
      try {
        if (newValue === null) {
          if (type === 'secure') {
            await SecureStore.deleteItemAsync(key);
          } else {
            await AsyncStorage.removeItem(key);
          }
        } else {
          if (type === 'secure') {
            await SecureStore.setItemAsync(key, newValue);
          } else {
            await AsyncStorage.setItem(key, newValue);
          }
        }
        setValueState(newValue);
      } catch (error) {
        console.error(`Error setting ${key}:`, error);
      }
    },
    [key, type]
  );

  const removeValue = useCallback(async () => {
    await setValue(null);
  }, [setValue]);

  return { value, isLoading, setValue, removeValue };
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem('hasSeenOnboarding', 'true');
}

export async function getOnboardingStatus(): Promise<boolean> {
  const status = await AsyncStorage.getItem('hasSeenOnboarding');
  return status === 'true';
}

export async function setSessionToken(token: string): Promise<void> {
  await SecureStore.setItemAsync('session_token', token);
}

export async function getSessionToken(): Promise<string | null> {
  return await SecureStore.getItemAsync('session_token');
}

export async function clearSessionToken(): Promise<void> {
  await SecureStore.deleteItemAsync('session_token');
}

export async function setUserData(userData: object): Promise<void> {
  await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
}

export async function getUserData<T>(): Promise<T | null> {
  const data = await SecureStore.getItemAsync('user_data');
  return data ? JSON.parse(data) : null;
}

export async function clearUserData(): Promise<void> {
  await SecureStore.deleteItemAsync('user_data');
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  gender?: string;
  campus?: string;
  hostel?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isFirstTime: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  gender?: string;
  campus?: string;
  hostel?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'session_token';
const USER_KEY = 'user_data';
const ONBOARDING_KEY = 'hasSeenOnboarding';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const [onboardingComplete, storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_KEY),
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);

      const hasCompletedOnboarding = onboardingComplete === 'true';
      setIsFirstTime(!hasCompletedOnboarding);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUserState(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, _password: string) => {
    const mockUser: User = {
      id: '1',
      email,
      name: 'Test User',
    };
    const mockToken = 'mock-session-token';

    await SecureStore.setItemAsync(TOKEN_KEY, mockToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(mockUser));

    setToken(mockToken);
    setUserState(mockUser);
    setIsAuthenticated(true);
  };

  const signup = async (data: SignupData) => {
    const mockUser: User = {
      id: '1',
      email: data.email,
      name: data.name,
      gender: data.gender,
      campus: data.campus,
      hostel: data.hostel,
    };
    const mockToken = 'mock-session-token';

    await SecureStore.setItemAsync(TOKEN_KEY, mockToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(mockUser));

    setToken(mockToken);
    setUserState(mockUser);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);

    setToken(null);
    setUserState(null);
    setIsAuthenticated(false);
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setIsFirstTime(false);
  };

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser));
    } else {
      SecureStore.deleteItemAsync(USER_KEY);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...data };
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));
    setUserState(updatedUser);
  };

  const updatePassword = async (newPassword: string) => {
    if (!user) return;

    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isFirstTime,
        isLoading,
        user,
        token,
        login,
        signup,
        logout,
        completeOnboarding,
        setUser,
        updateUser,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

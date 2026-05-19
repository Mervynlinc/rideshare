import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  isFirstTime: boolean;
  isLoading: boolean;
  user: User | null;
  session: Session | null;
  sendSignupOTP: (data: SignupData) => Promise<void>;
  verifyAndCreateAccount: (email: string, code: string, signupData: SignupData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  isResettingPassword: boolean;
  setResettingPassword: (v: boolean) => void;
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

const ONBOARDING_KEY = 'hasSeenOnboarding';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUserState] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isResettingPassword, setResettingPassword] = useState(false);
  const resettingRef = useRef(false);

  useEffect(() => {
    initializeAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);

        if (resettingRef.current) return;

        if (session?.user) {
          const userData = await fetchUserProfile(session.user.id);
          if (userData) {
            setUserState(userData);
            setIsAuthenticated(true);
          } else {
            console.log('No user profile found for auth state change user');
            setUserState(null);
            setIsAuthenticated(false);
          }
        } else {
          setUserState(null);
          setIsAuthenticated(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const initializeAuth = async () => {
    try {
      const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_KEY);
      const hasCompletedOnboarding = onboardingComplete === 'true';
      setIsFirstTime(!hasCompletedOnboarding);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setSession(session);
        const userData = await fetchUserProfile(session.user.id);
        if (userData) {
          setUserState(userData);
          setIsAuthenticated(true);
        } else {
          console.log('No user profile found for session user');
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      if (!data) {
        console.log('User profile not found for ID:', userId);
        return null;
      }
      
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        gender: data.gender as 'Male' | 'Female' | 'Other',
        campus: data.campus_short || '',
        campusShort: data.campus_short || '',
        universityId: data.university_id || '',
        hostel: data.hostel || '',
        verified: data.verified || false,
        trust: data.trust_score ? Number(data.trust_score) : 0,
        ridesCompleted: data.rides_completed || 0,
        ridesPosted: data.rides_posted || 0,
        ridesJoined: data.rides_joined || 0,
        avatarUrl: data.avatar_url || undefined,
        createdAt: new Date(data.created_at || Date.now()),
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const getUniversityId = async (campusCode: string): Promise<string | null> => {
    if (!campusCode) return null;
    
    try {
      const { data, error } = await supabase
        .from('universities')
        .select('id')
        .eq('code', campusCode)
        .maybeSingle();

      if (error) {
        console.error('Error fetching university ID:', error);
        return null;
      }
      
      return data?.id || null;
    } catch (error) {
      console.error('Error fetching university ID:', error);
      return null;
    }
  };

  const sendSignupOTP = async (data: SignupData) => {
    console.log('Sending signup OTP for:', data.email);
    
    // Use signUp with emailConfirm: false to create user without auto-confirmation
    // This will send OTP automatically but won't create the account until verified
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: undefined,
        data: {
          name: data.name,
          gender: data.gender,
          campus: data.campus,
          hostel: data.hostel,
        },
      },
    });

    if (signUpError) {
      console.error('Sign up error:', signUpError);
      throw signUpError;
    }

    console.log('OTP sent successfully, user will be created after verification');
    return authData;
  };

  const verifyAndCreateAccount = async (email: string, code: string, signupData: SignupData) => {
    console.log('Verifying OTP for email:', email);
    
    // Verify the OTP - this will create the account if it doesn't exist
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    });

    if (verifyError) {
      console.error('OTP verification failed:', verifyError);
      throw verifyError;
    }

    if (data.user) {
      console.log('OTP verified, account created:', data.user.id);
      
      // Create the user profile in our database
      const universityId = await getUniversityId(signupData.campus || '');
      console.log('University ID:', universityId);

      const userProfile = {
        id: data.user.id,
        email: signupData.email,
        name: signupData.name,
        gender: signupData.gender,
        university_id: universityId,
        campus_short: signupData.campus || '',
        hostel: signupData.hostel,
        verified: true, // Email is verified via OTP
        trust_score: 0,
        rides_completed: 0,
        rides_posted: 0,
        rides_joined: 0,
      };
      
      console.log('Creating user profile:', userProfile);

      const { error: profileError } = await supabase
        .from('users')
        .insert(userProfile);

      if (profileError) {
        console.error('Failed to create user profile:', profileError);
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      console.log('User profile created successfully');

      // Fetch the user profile to set in state
      const userData = await fetchUserProfile(data.user.id);
      if (!userData) {
        console.error('Failed to fetch newly created user profile');
        throw new Error('Profile created but could not be retrieved');
      }
      
      setUserState(userData);
      setIsAuthenticated(true);
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    if (data.user) {
      const userData = await fetchUserProfile(data.user.id);
      if (!userData) {
        console.error('User profile not found for logged in user:', data.user.id);
        throw new Error('User profile not found. Please contact support.');
      }
      setUserState(userData);
      setIsAuthenticated(true);
    }
  };

  const signup = async (data: SignupData) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) throw authError;

    if (authData.user) {
      const universityId = await getUniversityId(data.campus || '');

      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          name: data.name,
          gender: data.gender,
          university_id: universityId,
          campus_short: data.campus || '',
          hostel: data.hostel,
          verified: false,
          trust_score: 0,
          rides_completed: 0,
          rides_posted: 0,
          rides_joined: 0,
        });

      if (profileError) throw profileError;

      const userData = await fetchUserProfile(authData.user.id);
      setUserState(userData);
      setIsAuthenticated(true);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    setUserState(null);
    setSession(null);
    setIsAuthenticated(false);
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setIsFirstTime(false);
  };

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
  };

  const handleSetResettingPassword = (v: boolean) => {
    resettingRef.current = v;
    setResettingPassword(v);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;

    const dbUpdate: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.name) dbUpdate.name = data.name;
    if (data.gender) dbUpdate.gender = data.gender;
    if (data.hostel) dbUpdate.hostel = data.hostel;
    if (data.campusShort) dbUpdate.campus_short = data.campusShort;
    if (data.avatarUrl !== undefined) dbUpdate.avatar_url = data.avatarUrl;
    if (data.trust !== undefined) dbUpdate.trust_score = data.trust;
    if (data.ridesCompleted !== undefined) dbUpdate.rides_completed = data.ridesCompleted;
    if (data.ridesPosted !== undefined) dbUpdate.rides_posted = data.ridesPosted;
    if (data.ridesJoined !== undefined) dbUpdate.rides_joined = data.ridesJoined;

    const { error } = await supabase
      .from('users')
      .update(dbUpdate)
      .eq('id', user.id);

    if (error) throw error;

    const updatedUser = { ...user, ...data };
    setUserState(updatedUser);
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isFirstTime,
        isLoading,
        user,
        session,
        sendSignupOTP,
        verifyAndCreateAccount,
        login,
        signup,
        logout,
        completeOnboarding,
        setUser,
        updateUser,
        updatePassword,
        isResettingPassword,
        setResettingPassword: handleSetResettingPassword,
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

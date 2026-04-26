import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  bg: {
    page: string;
    phone: string;
    card: string;
    'card-alt': string;
    input: string;
  };
  border: {
    DEFAULT: string;
    light: string;
  };
  text: {
    DEFAULT: string;
    sec: string;
    muted: string;
    dim: string;
  };
  accent: {
    DEFAULT: string;
    dim: string;
    glow: string;
  };
  amber: {
    DEFAULT: string;
  };
  red: {
    DEFAULT: string;
    dim: string;
  };
  icon: {
    DEFAULT: string;
    muted: string;
  };
}

const lightColors: ThemeColors = {
  bg: {
    page: '#FFFFFF',
    phone: '#F5F5F5',
    card: '#FFFFFF',
    'card-alt': '#FAFAFA',
    input: '#FFFFFF',
  },
  border: {
    DEFAULT: '#E5E5E5',
    light: '#F0F0F0',
  },
  text: {
    DEFAULT: '#1A1A1A',
    sec: '#666666',
    muted: '#999999',
    dim: '#CCCCCC',
  },
  accent: {
    DEFAULT: '#00C853',
    dim: '#00A844',
    glow: 'rgba(0, 200, 83, 0.12)',
  },
  amber: {
    DEFAULT: '#FF9800',
  },
  red: {
    DEFAULT: '#D32F2F',
    dim: 'rgba(211, 47, 47, 0.12)',
  },
  icon: {
    DEFAULT: '#1A1A1A',
    muted: '#666666',
  },
};

const darkColors: ThemeColors = {
  bg: {
    page: '#080808',
    phone: '#0F0F0F',
    card: '#181818',
    'card-alt': '#1E1E1E',
    input: '#161616',
  },
  border: {
    DEFAULT: '#272727',
    light: '#333333',
  },
  text: {
    DEFAULT: '#FFFFFF',
    sec: '#A0A0A0',
    muted: '#5A5A5A',
    dim: '#3A3A3A',
  },
  accent: {
    DEFAULT: '#00E676',
    dim: '#00C853',
    glow: 'rgba(0, 230, 118, 0.12)',
  },
  amber: {
    DEFAULT: '#FFB300',
  },
  red: {
    DEFAULT: '#FF1744',
    dim: 'rgba(255, 23, 68, 0.12)',
  },
  icon: {
    DEFAULT: '#FFFFFF',
    muted: '#A0A0A0',
  },
};

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  resolvedTheme: 'light' | 'dark';
  isDark: boolean;
  isLoading: boolean;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@rideshare_theme_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    if (!isLoading && themeMode !== 'system') {
      setColorScheme(themeMode);
    }
  }, [themeMode, isLoading, setColorScheme]);

  const loadTheme = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        setThemeModeState(savedMode as ThemeMode);
        if (savedMode !== 'system') {
          setColorScheme(savedMode as 'light' | 'dark');
        }
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const getResolvedTheme = (): 'light' | 'dark' => {
    if (themeMode === 'system') {
      return colorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode;
  };

  const resolvedTheme = getResolvedTheme();
  const isDark = resolvedTheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        resolvedTheme,
        isDark,
        isLoading,
        colors,
      }}
    >
      <View className={isDark ? 'dark' : ''} style={{ flex: 1 }}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { lightColors, darkColors };

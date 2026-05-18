import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

type ThemeMode = 'light' | 'dark' | 'system';

const themeOptions: { mode: ThemeMode; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { mode: 'light', icon: 'sunny', label: 'Light' },
  { mode: 'system', icon: 'phone-portrait', label: 'System' },
  { mode: 'dark', icon: 'moon', label: 'Dark' },
];

export function ThemeToggle() {
  const { themeMode, setThemeMode, isDark } = useTheme();

  return (
    <View className="flex-row gap-2 p-1 rounded-xl bg-bg-card-alt">
      {themeOptions.map((option) => {
        const isSelected = themeMode === option.mode;
        return (
          <TouchableOpacity
            key={option.mode}
            onPress={() => setThemeMode(option.mode)}
            className={`flex-row items-center gap-1.5 px-3 py-2 rounded-lg ${
              isSelected
                ? 'bg-accent'
                : 'bg-transparent'
            }`}
            activeOpacity={0.7}
          >
            <Ionicons
              name={option.icon}
              size={16}
              color={isSelected ? '#000000' : isDark ? '#A0A0A0' : '#666666'}
              className={isSelected ? '' : isDark ? 'text-icon-muted' : 'text-icon-muted'}
            />
            <Text
              className={`text-sm font-medium ${
                isSelected
                  ? 'text-black'
                  : isDark
                    ? 'text-text-sec'
                    : 'text-text-sec'
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

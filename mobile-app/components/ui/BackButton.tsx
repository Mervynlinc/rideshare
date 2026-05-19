import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';

interface BackButtonProps {
  onPress?: () => void;
  className?: string;
}

export function BackButton({ onPress, className }: BackButtonProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigation.canGoBack()) {
      router.back();
    }
  };

  if (!onPress && !navigation.canGoBack()) {
    return null;
  }

  return (
    <Pressable
      onPress={handlePress}
      className={`w-9 h-9 items-center justify-center rounded-lg border border-border bg-bg-card ${className || ''}`}
    >
      <Ionicons name="arrow-back" size={16} color={colors.icon.DEFAULT} />
    </Pressable>
  );
}

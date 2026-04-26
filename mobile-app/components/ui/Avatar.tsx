import { View, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface AvatarProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  verified?: boolean;
  caution?: boolean;
  style?: ViewStyle;
}

const sizeMap = {
  sm: { width: 32, height: 32, fontSize: 12, badgeSize: 16, badgeIcon: 8 },
  md: { width: 40, height: 40, fontSize: 14, badgeSize: 16, badgeIcon: 8 },
  lg: { width: 56, height: 56, fontSize: 20, badgeSize: 16, badgeIcon: 8 },
  xl: { width: 80, height: 80, fontSize: 28, badgeSize: 18, badgeIcon: 9 },
};

export function Avatar({ initials, size = 'md', color, verified, caution, style }: AvatarProps) {
  const { colors } = useTheme();
  const avatarColor = color || colors.accent.DEFAULT;
  const s = sizeMap[size];

  return (
    <View style={[{ width: s.width, height: s.height }, style]}>
      <View
        className="items-center justify-center"
        style={{
          width: s.width,
          height: s.height,
          borderRadius: s.width / 2,
          backgroundColor: `${avatarColor}20`,
        }}
      >
        <Text
          className="font-display font-semibold"
          style={{ fontSize: s.fontSize, color: avatarColor }}
        >
          {initials}
        </Text>
      </View>
      {verified && (
        <View
          className="absolute -bottom-0.5 -right-0.5 items-center justify-center bg-accent border-2 border-bg-card"
          style={{
            width: s.badgeSize,
            height: s.badgeSize,
            borderRadius: s.badgeSize / 2,
          }}
        >
          <Ionicons name="checkmark" size={s.badgeIcon} color={colors.icon.DEFAULT} />
        </View>
      )}
      {caution && (
        <View
          className="absolute -bottom-0.5 -right-0.5 items-center justify-center bg-amber border-2 border-bg-card"
          style={{
            width: s.badgeSize,
            height: s.badgeSize,
            borderRadius: s.badgeSize / 2,
          }}
        >
          <Ionicons name="warning" size={s.badgeIcon} color={colors.icon.DEFAULT} />
        </View>
      )}
    </View>
  );
}

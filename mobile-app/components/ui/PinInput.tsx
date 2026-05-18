import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface PinInputProps {
  value: string;
  length: number;
  active?: boolean;
}

export function PinInput({ value, length, active }: PinInputProps) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center' }}>
      {Array.from({ length }).map((_, i) => (
        <View
          key={i}
          style={{
            width: 48,
            height: 64,
            borderRadius: 12,
            borderWidth: 2,
            alignItems: 'center',
            justifyContent: 'center',
            borderColor: i < value.length ? colors.accent.DEFAULT : colors.border.DEFAULT,
            backgroundColor: i < value.length ? colors.accent.glow : colors.bg.input,
          }}
        >
          <Text
            style={{
              fontFamily: 'Space Grotesk',
              fontSize: 24,
              fontWeight: 'bold',
              color: i < value.length ? colors.accent.DEFAULT : colors.text.dim,
            }}
          >
            {i < value.length ? value[i] : ''}
          </Text>
        </View>
      ))}
    </View>
  );
}

interface StarRatingProps {
  rating: number;
  size?: number;
  onRate?: (rating: number) => void;
}

export function StarRating({ rating, size = 24, onRate }: StarRatingProps) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onRate?.(star)} disabled={!onRate}>
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={colors.amber.DEFAULT}
          />
        </Pressable>
      ))}
    </View>
  );
}

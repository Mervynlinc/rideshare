import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TrustBadgeProps {
  score: number;
  size?: 'sm' | 'md';
}

export function TrustBadge({ score, size = 'sm' }: TrustBadgeProps) {
  const getColorClasses = () => {
    if (score >= 4.5) return { bg: 'bg-accent-glow', text: 'text-accent' };
    if (score >= 3.5) return { bg: 'bg-amber/10', text: 'text-amber' };
    return { bg: 'bg-red-dim', text: 'text-red' };
  };

  const colorClasses = getColorClasses();
  const paddingClass = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5';
  const fontSize = size === 'sm' ? 12 : 14;
  const iconSize = size === 'sm' ? 9 : 11;

  return (
    <View className={`flex-row items-center gap-1 rounded-lg ${paddingClass} ${colorClasses.bg}`}>
      <Ionicons name="star" size={iconSize} className={colorClasses.text} />
      <Text className={`font-semibold ${colorClasses.text}`} style={{ fontSize }}>
        {score.toFixed(1)}
      </Text>
    </View>
  );
}

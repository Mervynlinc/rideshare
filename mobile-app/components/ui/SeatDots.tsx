import { View } from 'react-native';

interface SeatDotsProps {
  taken: number;
  total: number;
}

export function SeatDots({ taken, total }: SeatDotsProps) {
  return (
    <View className="flex-row gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={`w-2 h-2 rounded-full border ${i < taken ? 'bg-accent border-accent' : 'bg-transparent border-text-muted'}`}
        />
      ))}
    </View>
  );
}

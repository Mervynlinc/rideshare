import { Pressable, Text } from 'react-native';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-2 rounded-full border ${selected ? 'bg-accent-glow border-accent' : 'bg-transparent border-border'}`}
    >
      <Text className={`text-xs font-medium ${selected ? 'text-accent' : 'text-text-sec'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

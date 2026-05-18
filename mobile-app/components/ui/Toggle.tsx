import { Pressable, Text, View } from 'react-native';

interface ToggleProps {
  options: { label: string; icon?: React.ReactNode }[];
  selected: number;
  onSelect: (index: number) => void;
}

export function Toggle({ options, selected, onSelect }: ToggleProps) {
  return (
    <View className="flex-row p-1 rounded-xl border border-border bg-bg-input">
      {options.map((option, index) => (
        <Pressable
          key={index}
          onPress={() => onSelect(index)}
          className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-lg ${selected === index ? 'bg-accent' : ''}`}
        >
          {option.icon}
          <Text className={`text-sm font-semibold ${selected === index ? 'text-black' : 'text-text-muted'}`}>
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

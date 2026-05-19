import { TextInput, View, TextInputProps, ViewStyle } from 'react-native';

interface InputProps extends TextInputProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}: InputProps) {
  return (
    <View
      className="flex-row items-center rounded-xl px-4 bg-bg-input border border-border"
      style={containerStyle}
    >
      {leftIcon}
      <TextInput
        className="flex-1 py-4 px-2 text-sm text-text"
        placeholderTextColor="rgb(156 163 175)"
        {...props}
      />
      {rightIcon}
    </View>
  );
}

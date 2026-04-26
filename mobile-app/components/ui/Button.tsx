import { Pressable, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
  className,
}: ButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-accent';
      case 'secondary':
        return 'bg-bg-card-alt border border-border';
      case 'danger':
        return 'bg-red-dim';
      case 'ghost':
        return 'bg-transparent';
      default:
        return 'bg-accent';
    }
  };

  const getTextColorClass = () => {
    switch (variant) {
      case 'primary':
        return 'text-black';
      case 'danger':
        return 'text-red';
      case 'ghost':
        return 'text-text-sec';
      default:
        return 'text-text';
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center gap-2 rounded-2xl px-6 py-4 ${getVariantClasses()} ${disabled ? 'opacity-50' : ''} ${className || ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#000' : variant === 'danger' ? '#FF1744' : '#A0A0A0'} />
      ) : (
        <>
          {icon}
          <Text className={`text-base font-semibold ${getTextColorClass()}`}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

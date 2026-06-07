import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

interface ToastProps {
  visible: boolean;
  type: ToastType;
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onDismiss: () => void;
  onPress?: () => void;
}

const ICON_MAP: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  info: 'information-circle',
  warning: 'warning',
  error: 'alert-circle',
};

export function Toast({ visible, type, title, description, icon, onDismiss, onPress }: ToastProps) {
  const { colors, isDark } = useTheme();
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 9,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -120,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const bgColorMap: Record<ToastType, string> = {
    success: '#00C853',
    info: '#2196F3',
    warning: '#FF9800',
    error: '#D32F2F',
  };

  const bgColor = bgColorMap[type];

  const displayIcon = icon || ICON_MAP[type];

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          onDismiss();
          onPress?.();
        }}
        style={{
          marginHorizontal: 12,
          marginTop: 8,
          borderRadius: 14,
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderLeftWidth: 4,
          borderLeftColor: bgColor,
          shadowColor: bgColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
          flexDirection: 'row',
          alignItems: 'center',
          padding: 14,
          gap: 12,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: bgColor + '20',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={displayIcon} size={20} color={bgColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: 'Space Grotesk',
              fontSize: 14,
              fontWeight: '700',
              color: colors.text.DEFAULT,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {description ? (
            <Text
              style={{
                fontSize: 12,
                color: colors.text.sec,
                marginTop: 2,
              }}
              numberOfLines={2}
            >
              {description}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={18} color={colors.text.muted} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

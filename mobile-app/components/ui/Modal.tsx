import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Modal as RNModal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface ModalProps {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  description: string;
  buttonText?: string;
  onClose: () => void;
}

export function Modal({ visible, type, title, description, buttonText = 'OK', onClose }: ModalProps) {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.85);
      slideAnim.setValue(30);
    }
  }, [visible]);

  const isSuccess = type === 'success';

  return (
    <RNModal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View
        className="flex-1 items-center justify-center px-8"
        style={{ backgroundColor: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)'] }) }}
      >
        <Animated.View
          className="w-full rounded-3xl p-6 items-center"
          style={{
            backgroundColor: colors.bg.card,
            borderWidth: 1,
            borderColor: colors.border.DEFAULT,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          }}
        >
          <View
            className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
            style={{ backgroundColor: isSuccess ? 'rgba(0, 200, 83, 0.12)' : 'rgba(211, 47, 47, 0.12)' }}
          >
            <Ionicons
              name={isSuccess ? 'checkmark-circle' : 'alert-circle'}
              size={36}
              color={isSuccess ? colors.accent.DEFAULT : colors.red.DEFAULT}
            />
          </View>

          <Text
            className="text-xl font-bold text-center mb-2"
            style={{ fontFamily: 'Space Grotesk', color: colors.text.DEFAULT }}
          >
            {title}
          </Text>

          <Text
            className="text-sm text-center leading-5 mb-6"
            style={{ color: colors.text.sec }}
          >
            {description}
          </Text>

          <TouchableOpacity
            className="w-full py-4 rounded-2xl items-center"
            style={{ backgroundColor: isSuccess ? colors.accent.DEFAULT : colors.red.DEFAULT }}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text className="text-base font-semibold" style={{ color: isSuccess ? '#000' : '#FFF' }}>
              {buttonText}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
}

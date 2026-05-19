import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { OnboardingCard } from './OnboardingCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingData {
  id: string;
  title: string;
  description: string;
  image: any;
}

const onboardingData: OnboardingData[] = [
  {
    id: '1',
    title: 'Share Rides, Cut Costs',
    description: 'Find ride buddies heading your way and split the fare. No more paying for empty seats on boda-bodas.',
    image: require('../assets/images/onboarding1.png'),
  },
  {
    id: '2',
    title: 'Students Only',
    description: 'Sign up with your university email to join the community. Connect with fellow students for safer rides.',
    image: require('../assets/images/onboarding2.png'),
  },
  {
    id: '3',
    title: 'Your Safety, Our Priority',
    description: "Every ride uses a Safety PIN to verify you're meeting the right person before you start.",
    image: require('../assets/images/onboarding3.png'),
  },
];

interface OnboardingModalProps {
  onComplete: () => void;
  onLogin?: () => void;
}

export function OnboardingModal({ onComplete, onLogin }: OnboardingModalProps) {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  // Animation for safe exit
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: true,
    }
  );

  const handleNext = useCallback(() => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      handleSafeExit(onComplete);
    }
  }, [currentIndex, onComplete, handleSafeExit]);

  const handleSkip = useCallback(() => {
    handleSafeExit(onComplete);
  }, [onComplete, handleSafeExit]);

  const handleSafeExit = useCallback(
    (callback: () => void) => {
      // Animate out before transitioning
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -SCREEN_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        callback();
      });
    },
    [fadeAnim, slideAnim]
  );

  const isLastSlide = currentIndex === onboardingData.length - 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.phone }]}>
      <StatusBar style="light" />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Skip Button */}
        {!isLastSlide && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={[styles.skipText, { color: colors.text.sec }]}>Skip</Text>
          </TouchableOpacity>
        )}

        {/* Scrollable Cards */}
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setCurrentIndex(index);
          }}
        >
          {onboardingData.map((item, index) => (
            <View key={item.id} style={[styles.cardWrapper, { width: SCREEN_WIDTH }]}>
              <OnboardingCard
                title={item.title}
                description={item.description}
                image={item.image}
                isActive={index === currentIndex}
                colors={colors}
              />
            </View>
          ))}
        </Animated.ScrollView>

        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {onboardingData.map((_, index) => {
            const dotScale = scrollX.interpolate({
              inputRange: [
                (index - 1) * SCREEN_WIDTH,
                index * SCREEN_WIDTH,
                (index + 1) * SCREEN_WIDTH,
              ],
              outputRange: [1, 3, 1],
              extrapolate: 'clamp',
            });

            const dotOpacity = scrollX.interpolate({
              inputRange: [
                (index - 1) * SCREEN_WIDTH,
                index * SCREEN_WIDTH,
                (index + 1) * SCREEN_WIDTH,
              ],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    transform: [{ scaleX: dotScale }],
                    opacity: dotOpacity,
                    backgroundColor: index === currentIndex ? colors.accent.DEFAULT : colors.border.light,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.accent.DEFAULT }]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {isLastSlide ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>

          {isLastSlide && onLogin && (
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.text.muted }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => handleSafeExit(onLogin)} activeOpacity={0.7}>
                <Text style={[styles.loginLink, { color: colors.accent.DEFAULT }]}>
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 24,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 32,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 16,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
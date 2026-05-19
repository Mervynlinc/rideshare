import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  Animated,
  TouchableOpacity,
  ViewToken,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    title: 'Share Rides, Cut Costs',
    description: 'Find ride buddies heading your way and split the fare. No more paying for empty seats on boda-bodas.',
    image: 'https://placehold.co/300x300/00E676/000000?text=Ride',
  },
  {
    id: '2',
    title: 'Students Only',
    description: 'Sign up with your university email to join the community. Connect with fellow students for safer rides.',
    image: 'https://placehold.co/300x300/FFB300/000000?text=Verify',
  },
  {
    id: '3',
    title: 'Your Safety, Our Priority',
    description: "Every ride uses a Safety PIN to verify you're meeting the right person before you start.",
    image: 'https://placehold.co/300x300/00E676/000000?text=Safe',
  },
];

interface OnboardingItemProps {
  item: OnboardingItem;
  colors: ReturnType<typeof useTheme>['colors'];
}

function OnboardingItemComponent({ item, colors }: OnboardingItemProps) {
  return (
    <View className="flex-1 justify-center items-center px-9" style={{ width }}>
      <View className="flex-[0.7] justify-center items-center w-full">
        <View
          className="w-[120px] h-[120px] rounded-8 border-2 justify-center items-center"
          style={{ backgroundColor: colors.accent.glow, borderColor: 'rgba(0,230,118,0.15)' }}
        >
          <Ionicons name="bicycle" size={80} color={colors.accent.DEFAULT} />
        </View>
      </View>
      <View className="flex-[0.3] items-center pt-10">
        <Text className="text-[26px] font-bold text-center mb-3.5 font-display tracking-tight text-text">
          {item.title}
        </Text>
        <Text className="text-[15px] text-center leading-6 text-text-sec">
          {item.description}
        </Text>
      </View>
    </View>
  );
}

interface PaginatorProps {
  data: OnboardingItem[];
  scrollX: Animated.Value;
  colors: ReturnType<typeof useTheme>['colors'];
}

function Paginator({ data, scrollX, colors }: PaginatorProps) {
  return (
    <View className="flex-row justify-center items-center mb-8">
      {data.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        const backgroundColor = scrollX.interpolate({
          inputRange,
          outputRange: [colors.border.light, colors.accent.DEFAULT, colors.border.light],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={i.toString()}
            className="h-2 rounded-full mx-1"
            style={{
              width: dotWidth,
              opacity,
              backgroundColor,
            }}
          />
        );
      })}
    </View>
  );
}

interface OnboardingCarouselProps {
  onComplete: () => void;
  onLogin?: () => void;
}

export default function OnboardingCarousel({ onComplete, onLogin }: OnboardingCarouselProps) {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const isLastSlide = currentIndex === onboardingData.length - 1;

  return (
    <View className="flex-1 bg-bg-phone">
      {!isLastSlide && (
        <TouchableOpacity className="absolute top-[60px] right-6 z-10 px-4 py-2" onPress={onComplete}>
          <Text className="text-sm font-semibold text-text-sec">Skip</Text>
        </TouchableOpacity>
      )}

      <View className="flex-[3]">
        <FlatList
          ref={flatListRef}
          data={onboardingData}
          renderItem={({ item }) => <OnboardingItemComponent item={item} colors={colors} />}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: false,
            }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          scrollEventThrottle={32}
        />
      </View>

      <View className="flex-1 px-9 pb-10 justify-end">
        <Paginator data={onboardingData} scrollX={scrollX} colors={colors} />

        <TouchableOpacity
          className="rounded-[14px] py-4 items-center justify-center bg-accent"
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text className="text-black text-base font-semibold">
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>

        {isLastSlide && (
          <View className="flex-row justify-center mt-4">
            <Text className="text-sm text-text-muted">Already have an account? </Text>
            <TouchableOpacity onPress={onLogin}>
              <Text className="text-sm font-semibold text-accent">Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

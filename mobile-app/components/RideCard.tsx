import { useEffect, useRef } from 'react';
import { TouchableOpacity, View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ride } from '../types';
import { Avatar, TrustBadge, SeatDots, StatusBadge } from './ui';
import { getTimeAgo } from '../data/mockData';
import { useState } from 'react';

interface RideCardProps {
  ride: Ride;
  onPress: () => void;
  removing?: boolean;
}

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining('Expired');
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (m >= 60) {
        const h = Math.floor(m / 60);
        setRemaining(`${h}h ${m % 60}m`);
      } else {
        setRemaining(`${m}:${s.toString().padStart(2, '0')}`);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!remaining || remaining === 'Expired') return null;

  return (
    <View className="flex-row items-center gap-1">
      <Ionicons name="timer-outline" size={11} className="text-amber" />
      <Text className="text-xs text-amber">{remaining}</Text>
    </View>
  );
}

export function RideCard({ ride, onPress, removing }: RideCardProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (removing) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [removing]);

  const getDepartureLabel = () => {
    if (ride.departureType === 'immediate') {
      return (
        <View className="flex-row items-center gap-1">
          <Ionicons name="flash" size={11} className="text-accent" />
          <Text className="text-xs text-text-sec">Leaving now</Text>
        </View>
      );
    }
    return (
      <View className="flex-row items-center gap-1">
        <Ionicons name="time-outline" size={11} className="text-amber" />
        <Text className="text-xs text-text-sec">Scheduled</Text>
      </View>
    );
  };

  return (
    <Animated.View
      style={{ transform: [{ translateX: slideAnim }], opacity: opacityAnim }}
    >
      <TouchableOpacity
        onPress={onPress}
        className="rounded-2xl p-4 bg-bg-card border border-border"
        activeOpacity={0.8}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-sm font-semibold mb-1 text-text">{ride.from}</Text>
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <View className="w-0.5 h-4 bg-border-light" />
              <Ionicons name="bicycle" size={10} className="text-accent" />
            </View>
            <Text className="text-sm font-semibold text-accent">{ride.to}</Text>
          </View>
          <SeatDots taken={ride.seatsTaken} total={ride.seatsTotal} />
        </View>

        <View className="flex-row items-center gap-3.5 mb-3">
          {getDepartureLabel()}
          {ride.departureType === 'immediate' && ride.expiresAt && mounted && ride.seatsTaken === 0 && (
            <Countdown expiresAt={ride.expiresAt} />
          )}
          {ride.departureType === 'scheduled' && ride.scheduledDate && ride.scheduledTime && (
            <Text className="text-xs text-amber">
              {ride.scheduledDate} {ride.scheduledTime} · closes in {ride.closesIn}
            </Text>
          )}
          {ride.genderPreference === 'same' && (
            <Text className="text-xs text-text-muted">
              <Ionicons name="female" size={12} /> Same gender
            </Text>
          )}
        </View>

        <View className="flex-row items-center justify-between pt-3 border-t border-border">
          <View className="flex-row items-center gap-2">
            <Avatar
              initials={ride.poster.initials}
              size="sm"
              color={ride.poster.color}
            />
            <Text className="text-sm font-medium text-text">{ride.poster.name}</Text>
            <TrustBadge score={ride.poster.trust} />
          </View>
          <Text className="text-xs text-text-muted">{getTimeAgo(ride.postedAt)}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

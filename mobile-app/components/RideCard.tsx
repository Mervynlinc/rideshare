import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ride } from '../types';
import { Avatar, TrustBadge, SeatDots, StatusBadge } from './ui';
import { getTimeAgo } from '../data/mockData';

interface RideCardProps {
  ride: Ride;
  onPress: () => void;
}

export function RideCard({ ride, onPress }: RideCardProps) {
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
  );
}

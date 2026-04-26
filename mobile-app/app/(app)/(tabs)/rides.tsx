import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { RideCard } from '../../../components';
import { Toggle } from '../../../components/ui';
import { mockRides } from '../../../data/mockData';

const postedRides = mockRides.slice(0, 2).map((ride) => ({
  ...ride,
  status: (ride.seatsTaken === ride.seatsTotal ? 'full' : 'active') as 'full' | 'active',
}));

const requestedRides = [
  {
    id: 'r1',
    from: 'Main Campus Gate',
    to: 'Mbarara Town Centre',
    poster: 'Fatima Hassan',
    status: 'accepted',
    postedAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: 'r2',
    from: 'Engineering Block',
    to: 'Kakyeka Stage',
    poster: 'Brian Kiprop',
    status: 'cancelled',
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

export default function MyRidesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <SafeAreaView className="flex-1 bg-bg-phone">
      <ScrollView className="flex-1 px-5 pt-16 pb-24 bg-bg-phone">
        <Text className="font-display text-xl font-bold mb-4 text-text">
          My Rides
        </Text>

        <Toggle
          options={[
            { label: `Posted (${postedRides.length})` },
            { label: `Requested (${requestedRides.length})` },
          ]}
          selected={activeTab}
          onSelect={setActiveTab}
        />

        <View className="mt-5 gap-3">
          {activeTab === 0 ? (
            <>
              {postedRides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  onPress={() => router.push(`/(app)/requests/${ride.id}`)}
                />
              ))}
            </>
          ) : (
            <>
              {requestedRides.map((ride) => (
                <TouchableOpacity
                  key={ride.id}
                  className="rounded-2xl p-4 bg-bg-card border border-border"
                  onPress={() => router.push(`/(app)/chat/${ride.id}`)}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold mb-1 text-text">{ride.from}</Text>
                      <Text className="text-sm font-semibold text-accent">{ride.to}</Text>
                    </View>
                    <View className={`px-2.5 py-1 rounded-lg ${ride.status === 'accepted' ? 'bg-accent-glow' : 'bg-red-dim'}`}>
                      <Text className={`text-xs font-semibold ${ride.status === 'accepted' ? 'text-accent' : 'text-red'}`}>
                        {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between items-center mt-2.5 pt-2.5 border-t border-border">
                    <Text className="text-xs text-text-muted">Poster: {ride.poster}</Text>
                    <Text className="text-xs text-text-muted">
                      {Math.floor((Date.now() - ride.postedAt.getTime()) / 60000)} min ago
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

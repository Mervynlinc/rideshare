import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RideCard } from '../../../components';
import { Toggle } from '../../../components/ui';
import { useRides } from '../../../hooks/useRides';

export default function MyRidesScreen() {
  const router = useRouter();
  const { rides, loading, removingIds } = useRides();
  const [activeTab, setActiveTab] = useState(0);

  const postedRides = rides;
  const requestedRides: any[] = [];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bg-phone">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

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
            postedRides.length > 0 ? (
              postedRides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  removing={removingIds.includes(ride.id)}
                  onPress={() => router.push(`/(app)/requests/${ride.id}`)}
                />
              ))
            ) : (
              <View className="py-12 items-center">
                <Ionicons name="bicycle" size={48} className="text-icon-muted mb-3" />
                <Text className="text-sm text-text-muted text-center">No rides posted yet</Text>
                <TouchableOpacity className="mt-3" onPress={() => router.push('/(app)/(tabs)/post')}>
                  <Text className="text-sm text-accent font-semibold">Post your first ride</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <View className="py-12 items-center">
              <Ionicons name="hand-left" size={48} className="text-icon-muted mb-3" />
              <Text className="text-sm text-text-muted text-center">No requested rides yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

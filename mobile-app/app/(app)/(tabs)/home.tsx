import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RideCard } from '../../../components';
import { mockUser, getGreeting, mockRides } from '../../../data/mockData';
import { Chip } from '../../../components/ui';
import { useState, useMemo } from 'react';
import { useTheme } from '../../../hooks/useTheme';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const filters = ['Same Gender', '< 5 min', 'Scheduled'];

  const filteredRides = useMemo(() => {
    return mockRides.filter((ride) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesDestination =
          ride.to.toLowerCase().includes(query) ||
          ride.from.toLowerCase().includes(query);
        if (!matchesDestination) return false;
      }

      if (selectedFilters.includes('Same Gender') && ride.genderPreference !== 'same') {
        return false;
      }

      if (selectedFilters.includes('< 5 min')) {
        const minutesAgo = (Date.now() - ride.postedAt.getTime()) / 60000;
        if (minutesAgo > 5) return false;
      }

      if (selectedFilters.includes('Scheduled') && ride.departureType !== 'scheduled') {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedFilters]);

  return (
    <SafeAreaView className="flex-1 bg-bg-phone">
      <ScrollView className="flex-1 px-5 bg-bg-phone">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-text-muted">{getGreeting()}</Text>
            <Text className="text-xl font-bold font-display text-text">
              {mockUser.name.split(' ')[0]}
            </Text>
          </View>
          <TouchableOpacity
            className="w-10 h-10 rounded-xl items-center justify-center relative bg-bg-card border border-border"
            onPress={() => router.push('/(app)/notifications')}
          >
            <Ionicons name="notifications-outline" size={18} className="text-icon-muted" />
            <View className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red border-2 border-bg-phone" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-1.5 pb-4">
          <Ionicons name="location" size={12} className="text-accent" />
          <Text className="text-xs text-text-muted">
            {mockUser.campusShort} — Mbarara
          </Text>
          <Text className="text-xs text-text-dim">·</Text>
          <Text className="text-xs text-text-muted">Showing rides near you</Text>
        </View>

         <View className="flex-row items-center gap-2 rounded-xl px-4  mb-4 bg-bg-card border border-border">
           <Ionicons name="search" size={16} className="text-icon-muted" />
          <TextInput
            className="flex-1 text-sm text-text"
            placeholder="Search destinations..."
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={() => router.push('/(app)/filters')}>
            <Ionicons name="options" size={18} className="text-icon-muted" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="pb-4"
        >
          <View className="flex-row gap-2">
            {filters.map((filter) => (
              <Chip
                key={filter}
                label={filter}
                selected={selectedFilters.includes(filter)}
                onPress={() => toggleFilter(filter)}
              />
            ))}
          </View>
        </ScrollView>

        {filteredRides.length > 0 ? (
          <View className="gap-3">
            {filteredRides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                onPress={() => router.push(`/(app)/ride/${ride.id}`)}
              />
            ))}
          </View>
        ) : (
          <View className="py-12 items-center">
            <Ionicons name="search" size={48} className="text-icon-muted mb-3" />
            <Text className="text-sm text-text-muted text-center">
              No rides match your search
            </Text>
            {searchQuery && (
              <TouchableOpacity
                className="mt-3"
                onPress={() => setSearchQuery('')}
              >
                <Text className="text-sm text-accent font-semibold">
                  Clear search
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <Text className="text-xs text-center py-6 text-text-dim">
          Showing {filteredRides.length} of {mockRides.length} rides
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

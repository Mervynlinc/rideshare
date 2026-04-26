import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackButton, Chip, Toggle, Button } from '../../components/ui';
import { mockUser, mockRides } from '../../data/mockData';

const savedFilters = [
  { id: '1', name: 'Female Only' },
  { id: '2', name: 'Leaving Now' },
];

export default function FiltersScreen() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    genderPreference: 1,
    departureTime: ['Any Time'],
    mode: 0,
    minSeats: 'Any',
    minTrustScore: 'Any',
  });
  const [filterName, setFilterName] = useState('');

  const toggleDepartureTime = (time: string) => {
    setFilters((prev) => ({
      ...prev,
      departureTime: prev.departureTime.includes(time)
        ? prev.departureTime.filter((t) => t !== time)
        : [time],
    }));
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-phone">
      <ScrollView className="flex-1 px-5 pt-6 pb-6 bg-bg-phone">
        <View className="flex-row items-center gap-3 pb-2">
          <BackButton onPress={() => router.back()} />
          <Text className="font-display text-xl font-bold text-text">
            Filters
          </Text>
        </View>

        <View className="rounded-xl p-2.5 mb-5 flex-row gap-2 items-center bg-accent-glow border border-accent/15">
          <Ionicons name="location" size={12} className="text-accent" />
          <Text className="text-xs text-accent">
            Auto-filtered to your campus: <Text className="font-semibold">{mockUser.campusShort}</Text>
          </Text>
        </View>

        <Text className="text-xs uppercase tracking-widest font-semibold mb-2.5 text-text-muted">
          Saved Filters
        </Text>
        <View className="mb-6">
          {savedFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              className="flex-row items-center gap-2.5 rounded-xl p-3 mb-2 bg-bg-card-alt border border-border"
            >
              <Ionicons name="bookmark" size={14} className="text-accent" />
              <Text className="text-sm font-medium flex-1 text-text">{filter.name}</Text>
              <Ionicons name="chevron-forward" size={12} className="text-text-dim" />
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-xs uppercase tracking-widest font-semibold mb-3.5 text-text-muted">
          Filter Options
        </Text>

        <View className="gap-5">
          <View>
            <Text className="text-sm font-semibold mb-2 text-text">Gender Preference</Text>
            <Toggle
              options={[{ label: 'Any Gender' }, { label: 'Same Gender' }]}
              selected={filters.genderPreference}
              onSelect={(i: number) => setFilters({ ...filters, genderPreference: i })}
            />
          </View>

          <View>
            <Text className="text-sm font-semibold mb-2 text-text">Departure Time</Text>
            <View className="flex-row flex-wrap gap-2">
              {['Any Time', '< 5 min', '< 15 min', 'Scheduled'].map((time) => (
                <Chip
                  key={time}
                  label={time}
                  selected={filters.departureTime.includes(time)}
                  onPress={() => toggleDepartureTime(time)}
                />
              ))}
            </View>
          </View>

          <View>
            <Text className="text-sm font-semibold mb-2 text-text">Ride Mode</Text>
            <Toggle
              options={[
                { label: 'Boda', icon: <Ionicons name="bicycle" size={14} /> },
                { label: 'All Modes' },
              ]}
              selected={filters.mode}
              onSelect={(i: number) => setFilters({ ...filters, mode: i })}
            />
          </View>

          <View>
            <Text className="text-sm font-semibold mb-2 text-text">Minimum Seats Available</Text>
            <View className="flex-row gap-2.5">
              {['Any', '1+', '2+'].map((seats) => (
                <TouchableOpacity
                  key={seats}
                  className={`flex-1 py-2.5 rounded-xl items-center border ${filters.minSeats === seats ? 'bg-accent-glow border-accent' : 'bg-transparent border-border'}`}
                  onPress={() => setFilters({ ...filters, minSeats: seats })}
                >
                  <Text className={`text-sm font-medium ${filters.minSeats === seats ? 'text-accent' : 'text-text-muted'}`}>
                    {seats}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-sm font-semibold mb-2 text-text">Minimum Trust Score</Text>
            <View className="flex-row gap-2.5">
              {['Any', '3.5+', '4.5+'].map((score) => (
                <TouchableOpacity
                  key={score}
                  className={`flex-1 py-2.5 rounded-xl items-center border ${filters.minTrustScore === score ? 'bg-accent-glow border-accent' : 'bg-transparent border-border'}`}
                  onPress={() => setFilters({ ...filters, minTrustScore: score })}
                >
                  <Text className={`text-sm font-medium ${filters.minTrustScore === score ? 'text-accent' : 'text-text-muted'}`}>
                    {score}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View className="mt-6 gap-2.5">
          <View className="flex-row gap-2.5">
            <TextInput
              className="flex-1 rounded-xl px-4 py-3 text-sm bg-bg-input border border-border text-text"
              placeholder="Filter name..."
              placeholderTextColor="rgb(156 163 175)"
              value={filterName}
              onChangeText={setFilterName}
            />
            <TouchableOpacity className="rounded-xl px-4 py-3 flex-row items-center gap-1.5 bg-bg-card-alt border border-border">
              <Ionicons name="bookmark-outline" size={14} className="text-icon-muted" />
              <Text className="text-sm font-medium text-text">Save</Text>
            </TouchableOpacity>
          </View>

          <Button
            title={`Apply Filters (${mockRides.length} results)`}
            onPress={() => router.back()}
          />

          <TouchableOpacity className="py-3 items-center">
            <Text className="text-sm text-text-muted">Reset All Filters</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

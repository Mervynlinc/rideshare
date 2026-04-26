import { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Toggle } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';

export default function PostRideScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    from: 'Main Campus Gate',
    to: 'Mbarara Town Centre',
    mode: 0,
    departureType: 0,
    scheduledDay: new Date(),
    scheduledTime: '10:00',
    seats: 2,
    genderPreference: 1,
  });

  const weekDays = useMemo(() => {
    const days: { label: string; date: number; month: string }[] = [];
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        label: i === 0 ? 'Today' : dayNames[date.getDay()],
        date: date.getDate(),
        month: monthNames[date.getMonth()],
      });
    }
    return days;
  }, []);

  const [selectedDay, setSelectedDay] = useState(0);

  return (
    <SafeAreaView className="flex-1 bg-bg-phone">
      <ScrollView className="flex-1 px-5 pt-6 pb-28 bg-bg-phone">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="font-display text-xl font-bold text-text">
            Post a Ride
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-sm text-text-muted">Cancel</Text>
          </TouchableOpacity>
        </View>

        <View className="gap-5 flex-1">
          <View className="rounded-2xl p-1 relative bg-bg-card border border-border">
            <View className="absolute left-7 top-1/2 items-center z-10" style={{ transform: [{ translateY: -20 }] }}>
              <View className="w-2 h-2 rounded-full bg-accent" />
              <View className="w-0.5 h-6 bg-border-light" />
              <View className="w-2 h-2 rounded-full bg-red" />
            </View>
            <TextInput
              className="bg-transparent px-12 py-3.5 text-sm border-b border-border text-text"
              placeholder="From"
              placeholderTextColor="rgb(156 163 175)"
              value={formData.from}
              onChangeText={(text) => setFormData({ ...formData, from: text })}
            />
            <TextInput
              className="bg-transparent px-12 py-3.5 text-sm text-text"
              placeholder="To"
              placeholderTextColor="rgb(156 163 175)"
              value={formData.to}
              onChangeText={(text) => setFormData({ ...formData, to: text })}
            />
          </View>

          <View>
            <Text className="text-xs font-semibold uppercase tracking-wider mb-2 text-text-muted">
              Mode
            </Text>
            <Toggle
              options={[
                { label: 'Boda-boda', icon: <Ionicons name="bicycle" size={14} /> },
                { label: 'Cab (Soon)', icon: <Ionicons name="car" size={14} /> },
              ]}
              selected={formData.mode}
              onSelect={(i) => setFormData({ ...formData, mode: i })}
            />
          </View>

          <View>
            <Text className="text-xs font-semibold uppercase tracking-wider mb-2 text-text-muted">
              Departure
            </Text>
            <Toggle
              options={[
                { label: 'Immediate', icon: <Ionicons name="flash" size={14} /> },
                { label: 'Scheduled', icon: <Ionicons name="time-outline" size={14} /> },
              ]}
              selected={formData.departureType}
              onSelect={(i) => setFormData({ ...formData, departureType: i })}
            />
          </View>

          {formData.departureType === 1 && (
            <>
              <View>
                <Text className="text-xs font-semibold uppercase tracking-wider mb-2.5 text-text-muted">
                  Select Day
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {weekDays.map((day, i) => (
                      <TouchableOpacity
                        key={i}
                        className={`items-center gap-1 px-3 py-3 rounded-2xl border w-[72px] ${selectedDay === i ? 'bg-accent-glow border-accent' : 'bg-bg-card border-border'}`}
                        onPress={() => setSelectedDay(i)}
                      >
                        <Text className={`text-xs font-semibold ${selectedDay === i ? 'text-accent' : 'text-text-muted'}`}>
                          {day.label}
                        </Text>
                        <Text className={`font-display text-lg font-bold ${selectedDay === i ? 'text-accent' : 'text-text'}`}>
                          {day.date}
                        </Text>
                        <Text className={`text-xs ${selectedDay === i ? 'text-accent' : 'text-text-dim'}`}>
                          {day.month}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                <View className="flex-row items-center gap-1.5 mt-2.5">
                  <Ionicons name="information-circle" size={12} className="text-text-dim" />
                  <Text className="text-xs text-text-dim">
                    Ride posts automatically expire after 7 days
                  </Text>
                </View>
              </View>

              <View>
                <Text className="text-xs font-semibold uppercase tracking-wider mb-2 text-text-muted">
                  Departure Time
                </Text>
                <TextInput
                  className="rounded-xl px-4 py-3.5 text-sm bg-bg-input border border-border text-text"
                  placeholder="10:00"
                  placeholderTextColor="rgb(156 163 175)"
                  value={formData.scheduledTime}
                  onChangeText={(text) => setFormData({ ...formData, scheduledTime: text })}
                />
              </View>
            </>
          )}

          <View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Seats Available
              </Text>
              <Text className="font-display text-lg font-bold text-accent">
                {formData.seats}
              </Text>
            </View>
            <View className="flex-row gap-3">
              {[1, 2, 3, 4].map((seat) => (
                <TouchableOpacity
                  key={seat}
                  className={`flex-1 h-11 rounded-xl items-center justify-center border ${formData.seats === seat ? 'bg-accent-glow border-accent' : 'bg-transparent border-border'}`}
                  onPress={() => setFormData({ ...formData, seats: seat })}
                >
                  <Text className={`text-sm font-semibold ${formData.seats === seat ? 'text-accent' : 'text-text-muted'}`}>
                    {seat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-xs font-semibold uppercase tracking-wider mb-2 text-text-muted">
              Gender Preference
            </Text>
            <Toggle
              options={[{ label: 'Any Gender' }, { label: 'Same Gender' }]}
              selected={formData.genderPreference}
              onSelect={(i) => setFormData({ ...formData, genderPreference: i })}
            />
          </View>
        </View>

        <TouchableOpacity
          className="rounded-2xl py-4 items-center flex-row justify-center gap-2 mt-4 bg-accent"
          onPress={() => router.push('/(app)/(tabs)/rides')}
        >
          <Ionicons name="send" size={16} color={colors.icon.DEFAULT} />
          <Text className="text-black font-semibold text-base">Post Ride</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

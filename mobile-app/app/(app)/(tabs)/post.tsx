import { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Toggle, Modal } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { useRides } from '../../../hooks/useRides';
import { PostRideData } from '../../../types';

const TIMER_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 hr', value: 60 },
  { label: '2 hr', value: 120 },
  { label: '4 hr', value: 240 },
  { label: 'No expiry', value: 0 },
];

export default function PostRideScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { postRide } = useRides();
  const [posting, setPosting] = useState(false);
  const [modal, setModal] = useState<{ visible: boolean; type: 'success' | 'error'; title: string; description: string }>({
    visible: false,
    type: 'success',
    title: '',
    description: '',
  });
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departureType: 0,
    expiresIn: 30,
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

  const handlePost = async () => {
    if (!formData.from.trim() || !formData.to.trim()) {
      setModal({
        visible: true,
        type: 'error',
        title: 'Missing Fields',
        description: 'Please enter both pickup and drop-off locations.',
      });
      return;
    }

    setPosting(true);

    const scheduledDate = formData.departureType === 1
      ? new Date(Date.now() + selectedDay * 86400000)
      : undefined;

    const rideData: PostRideData = {
      from: formData.from.trim(),
      to: formData.to.trim(),
      mode: 'boda',
      departureType: formData.departureType === 0 ? 'immediate' : 'scheduled',
      scheduledDate,
      scheduledTime: formData.departureType === 1 ? formData.scheduledTime : undefined,
      seats: formData.seats,
      genderPreference: formData.genderPreference === 0 ? 'any' : 'same',
      expiresInMinutes: formData.departureType === 0 && formData.expiresIn > 0 ? formData.expiresIn : undefined,
    };

    const ride = await postRide(rideData);
    setPosting(false);

    if (ride) {
      setModal({
        visible: true,
        type: 'success',
        title: 'Ride Posted!',
        description: 'Your ride is now visible to your university.',
      });
    } else {
      setModal({
        visible: true,
        type: 'error',
        title: 'Something went wrong',
        description: 'Failed to post ride. Please try again.',
      });
    }
  };

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
              placeholder="From (e.g. Main Campus Gate)"
              placeholderTextColor="rgb(156 163 175)"
              value={formData.from}
              onChangeText={(text) => setFormData({ ...formData, from: text })}
            />
            <TextInput
              className="bg-transparent px-12 py-3.5 text-sm text-text"
              placeholder="To (e.g. Mbarara Town Centre)"
              placeholderTextColor="rgb(156 163 175)"
              value={formData.to}
              onChangeText={(text) => setFormData({ ...formData, to: text })}
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

          {formData.departureType === 0 ? (
            <View>
              <Text className="text-xs font-semibold uppercase tracking-wider mb-2.5 text-text-muted">
                Ride Expires In
              </Text>
              <View className="flex-row gap-2 flex-wrap">
                {TIMER_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    className={`px-4 py-2.5 rounded-xl border ${formData.expiresIn === opt.value ? 'bg-accent-glow border-accent' : 'bg-bg-card border-border'}`}
                    onPress={() => setFormData({ ...formData, expiresIn: opt.value })}
                  >
                    <Text className={`text-sm font-semibold ${formData.expiresIn === opt.value ? 'text-accent' : 'text-text-muted'}`}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View className="flex-row items-center gap-1.5 mt-2.5">
                <Ionicons name="information-circle" size={12} className="text-text-dim" />
                <Text className="text-xs text-text-dim">
                  {formData.expiresIn === 0 ? 'Ride will not auto-cancel' : 'Ride auto-cancels after the timer runs out'}
                </Text>
              </View>
            </View>
          ) : (
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
              {[1, 2].map((seat) => (
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
          className={`rounded-2xl py-4 items-center flex-row justify-center gap-2 mt-4 ${posting ? 'bg-accent-dim' : 'bg-accent'}`}
          onPress={handlePost}
          disabled={posting}
        >
          {posting ? (
            <ActivityIndicator size="small" color={colors.icon.DEFAULT} />
          ) : (
            <Ionicons name="send" size={16} color={colors.icon.DEFAULT} />
          )}
          <Text className="text-black font-semibold text-base">
            {posting ? 'Posting...' : 'Post Ride'}
          </Text>
        </TouchableOpacity>

        <Modal
          visible={modal.visible}
          type={modal.type}
          title={modal.title}
          description={modal.description}
          buttonText={modal.type === 'success' ? 'View My Rides' : 'Try Again'}
          onClose={() => {
            setModal((prev) => ({ ...prev, visible: false }));
            if (modal.type === 'success') {
              router.push('/(app)/(tabs)/rides');
            }
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

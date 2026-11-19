import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui';
import { useAuth, useNotifications } from '../../context';
import { useRides } from '../../hooks/useRides';
import { supabase } from '../../lib/supabase';

export default function RideCompleteScreen() {
  const router = useRouter();
  const { rideId, buddyName, buddyId } = useLocalSearchParams<{ rideId: string; buddyName: string; buddyId: string }>();
  const { user } = useAuth();
  const { removeRideNotifications } = useNotifications();
  const { completeRide } = useRides();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rideInfo, setRideInfo] = useState<{ from_location: string; to_location: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (rideId) {
      fetchRideInfo();
    } else {
      setLoading(false);
    }
  }, [rideId]);

  const fetchRideInfo = async () => {
    try {
      const { data } = await supabase
        .from('rides')
        .select('from_location, to_location')
        .eq('id', rideId)
        .single();
      setRideInfo(data);
    } catch (err) {
      console.error('Error fetching ride info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (submitting || rating === 0) return;
    setSubmitting(true);

    try {
      if (rideId && user) {
        const ratedUserId = buddyId || user.id;
        await supabase.from('ratings').insert({
          ride_id: rideId,
          rater_id: user.id,
          rated_user_id: ratedUserId,
          rating,
          comment: comment || null,
        });

        // Send push notification to the rated user
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
        fetch(`${supabaseUrl}/functions/v1/send-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: ratedUserId,
            title: 'New Rating Received',
            body: `${user.name} rated you ${rating}/5 stars`,
            category: 'ratings',
            data: { rideId, type: 'rating' },
          }),
        }).catch((err) => console.warn('Failed to send rating push notification:', err));

        // Fallback: attempt to complete the ride if both users have verified
        await completeRide(rideId).catch((err) => {
          console.warn('Ride may already be completed, or not all participants verified:', err);
        });
        removeRideNotifications(rideId);
      }

      setSubmitted(true);

      setTimeout(() => {
        router.replace('/(app)/(tabs)/home');
      }, 1500);
    } catch (err) {
      console.error('Error submitting rating:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bg-phone">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (submitted) {
    return (
      <SafeAreaView className="flex-1 bg-bg-phone">
        <View className="flex-1 items-center justify-center px-5">
          <View className="w-20 h-20 rounded-full items-center justify-center mb-5 bg-accent-glow border-2 border-accent/20">
            <Ionicons name="checkmark-circle" size={40} className="text-accent" />
          </View>
          <Text className="font-display text-2xl font-bold text-center mb-2 text-text">
            Rating Submitted!
          </Text>
          <Text className="text-text-muted text-sm text-center">
            Thanks for your feedback.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-phone">
      <ScrollView className="flex-1 bg-bg-phone px-5" contentContainerStyle={{ alignItems: 'center', paddingTop: 24 }}>
        <View className="w-20 h-20 rounded-full items-center justify-center mb-5 bg-accent-glow border-2 border-accent/20">
          <Ionicons name="flag" size={32} className="text-accent" />
        </View>

        <Text className="font-display text-2xl font-bold text-center mb-1.5 text-text">
          Ride Complete
        </Text>
        <Text className="text-text-muted text-sm mb-7">
          {rideInfo ? `${rideInfo.from_location} → ${rideInfo.to_location}` : 'Ride completed'}
        </Text>

        <View className="bg-bg-card border border-border rounded-2xl p-5 w-full mb-7">
          <View className="flex-row justify-between mb-3.5 pb-3.5 border-b border-border">
            <Text className="text-text-muted text-sm">Ride Buddy</Text>
            <Text className="text-text text-sm font-medium">{buddyName || 'Ride Buddy'}</Text>
          </View>
          <View className="flex-row justify-between mb-3.5 pb-3.5 border-b border-border">
            <Text className="text-text-muted text-sm">Mode</Text>
            <View className="flex-row items-center gap-1">
              <Ionicons name="bicycle" size={11} className="text-accent" />
              <Text className="text-text text-sm font-medium">Boda-boda</Text>
            </View>
          </View>
        </View>

        <View className="w-full">
          <Text className="text-text text-sm font-semibold mb-1">Rate your Ride Buddy</Text>
          <Text className="text-text-muted text-xs mb-4">
            How was your experience with {buddyName || 'your buddy'}?
          </Text>

          <View className="flex-row gap-1.5 justify-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={28}
                  className="text-amber"
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            className="bg-bg-input border border-border rounded-xl px-4 py-3 text-text text-sm mt-4 mb-6"
            placeholder="Leave a comment (optional)..."
            placeholderTextColor="rgb(156 163 175)"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <Button
          title={rating === 0 ? 'Select a rating' : 'Submit Rating'}
          onPress={handleSubmit}
          disabled={rating === 0 || submitting}
          loading={submitting}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

import { useState } from 'react';
import { View, Text, TextInput, ScrollView,TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui';
import { mockPerson } from '../../data/mockData';

export default function RideCompleteScreen() {
  const router = useRouter();
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState('');

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
          Main Campus Gate → Mbarara Town Centre
        </Text>

        <View className="bg-bg-card border border-border rounded-2xl p-5 w-full mb-7">
          <View className="flex-row justify-between mb-3.5 pb-3.5 border-b border-border">
            <Text className="text-text-muted text-sm">Ride Buddy</Text>
            <Text className="text-text text-sm font-medium">{mockPerson.name}</Text>
          </View>
          <View className="flex-row justify-between mb-3.5 pb-3.5 border-b border-border">
            <Text className="text-text-muted text-sm">Mode</Text>
            <View className="flex-row items-center gap-1">
              <Ionicons name="bicycle" size={11} className="text-accent" />
              <Text className="text-text text-sm font-medium">Boda-boda</Text>
            </View>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-text-muted text-sm">Duration</Text>
            <Text className="text-text text-sm font-medium">18 min</Text>
          </View>
        </View>

        <View className="w-full">
          <Text className="text-text text-sm font-semibold mb-1">Rate your Ride Buddy</Text>
          <Text className="text-text-muted text-xs mb-4">
            How was your experience with {mockPerson.name}?
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
          title="Submit Rating"
          onPress={() => router.replace('/(app)/(tabs)/home')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

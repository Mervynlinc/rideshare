import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../components/ui';

export default function HistoryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-bg-phone">
      <ScrollView className="flex-1 px-5 pt-6 pb-24 bg-bg-phone">
        <View className="flex-row items-center gap-3 pb-5">
          <BackButton onPress={() => router.back()} />
          <Text className="font-display text-xl font-bold text-text">
            Ride History
          </Text>
        </View>

        <View className="py-12 items-center">
          <Ionicons name="time-outline" size={48} className="text-icon-muted mb-3" />
          <Text className="text-sm text-text-muted text-center">
            No rides completed yet
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

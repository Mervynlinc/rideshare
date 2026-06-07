import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';

export default function AboutRideShareScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const features = [
    {
      icon: 'shield-checkmark',
      title: 'Safety First',
      description: 'Built-in safety features including PIN verification and trust scores',
    },
    {
      icon: 'school',
      title: 'Students Only',
      description: 'Verified university students only for a trusted community',
    },
    {
      icon: 'cash',
      title: 'Cost Effective',
      description: 'Split ride costs with fellow students heading the same way',
    },
    {
      icon: 'leaf',
      title: 'Eco Friendly',
      description: 'Reduce carbon footprint by sharing rides',
    },
  ];

  const stats = [
    { label: 'Active Users', value: '10K+' },
    { label: 'Rides Shared', value: '50K+' },
    { label: 'Universities', value: '25+' },
    { label: 'Savings', value: '$1M+' },
  ];

  const team = [
    { name: 'RideShare Team', role: 'Developers', icon: 'code' },
    { name: 'University Partners', role: 'Collaborators', icon: 'school' },
    { name: 'Safety Experts', role: 'Advisors', icon: 'shield-halved' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-bg-phone">
      <ScrollView
        className="flex-1 px-5 pt-6 bg-bg-phone"
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <View className="flex-row items-center gap-3 pb-5">
          <BackButton onPress={() => router.back()} />
          <Text className="font-display text-xl font-bold text-text">
            About RideShare
          </Text>
        </View>

        <View className="rounded-2xl p-6 mb-6 bg-bg-card border border-border items-center">
          <View
            className="w-20 h-20 rounded-2xl items-center justify-center mb-4"
            style={{ backgroundColor: colors.accent.glow }}
          >
            <Ionicons name="bicycle" size={40} color={colors.accent.DEFAULT} />
          </View>
          <Text className="font-display text-2xl font-bold text-text mb-2 text-center">
            RideShare
          </Text>
          <Text className="text-sm text-text-sec text-center leading-5">
            Connecting university students for safer, more affordable transportation
          </Text>
          <Text className="text-xs text-text-muted mt-3">
            Version 1.0.0
          </Text>
        </View>

        <Text className="text-xs uppercase tracking-widest font-semibold mb-3 text-text-muted">
          Our Mission
        </Text>
        <View className="rounded-2xl p-4 mb-6 bg-bg-card border border-border">
          <Text className="text-sm text-text-sec leading-6">
            RideShare was created to help university students travel safely and affordably. By connecting students heading the same direction, we reduce costs while building a trusted community of verified users.
          </Text>
        </View>

        <Text className="text-xs uppercase tracking-widest font-semibold mb-3 text-text-muted">
          Key Features
        </Text>
        <View className="rounded-2xl overflow-hidden mb-6 bg-bg-card border border-border">
          {features.map((feature, index) => (
            <View
              key={index}
              className={`flex-row items-center gap-4 py-4 px-4 ${index !== features.length - 1 ? 'border-b border-border' : ''}`}
            >
              <View
                className="w-12 h-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: colors.accent.glow }}
              >
                <Ionicons name={feature.icon as any} size={24} color={colors.accent.DEFAULT} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-text mb-1">{feature.title}</Text>
                <Text className="text-xs text-text-muted">{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="rounded-xl p-4 bg-bg-card-alt border border-border">
          <Text className="text-xs text-text-muted mb-2">
            Contact Us
          </Text>
          <View className="space-y-2">
            <View className="flex-row items-center gap-2">
              <Ionicons name="mail" size={16} color={colors.icon.muted} />
              <Text className="text-xs text-text-sec">rideshare2026.io@gmail.com</Text>
            </View>
            <TouchableOpacity className="flex-row items-center gap-2" onPress={() => Linking.openURL('https://x.com/ride___share')}>
              <Ionicons name="logo-twitter" size={16} color={colors.icon.muted} />
              <Text className="text-xs text-text-sec">@ride___share</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center gap-2" onPress={() => Linking.openURL('https://www.instagram.com/ride__share/')}>
              <Ionicons name="logo-instagram" size={16} color={colors.icon.muted} />
              <Text className="text-xs text-text-sec">@ride__share</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center gap-2" onPress={() => Linking.openURL('https://www.tiktok.com/@ride__share')}>
              <Ionicons name="logo-tiktok" size={16} color={colors.icon.muted} />
              <Text className="text-xs text-text-sec">@ride__share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

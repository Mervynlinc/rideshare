import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';

export default function PrivacySafetyScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const sections = [
    {
      title: 'Your Privacy',
      icon: 'shield-checkmark',
      items: [
        'We only collect information necessary to provide our services',
        'Your personal information is encrypted and securely stored',
        'You can delete your account and all associated data at any time',
        'We never sell your personal data to third parties',
      ],
    },
    {
      title: 'Safety Features',
      icon: 'shield-halved',
      items: [
        'Safety PIN verification for every ride',
        'University email verification for all users',
        'Trust score system based on ride history',
        'Report and block functionality for inappropriate behavior',
      ],
    },
    {
      title: 'Data Protection',
      icon: 'lock-closed',
      items: [
        'End-to-end encryption for all messages',
        'Secure storage using industry-standard encryption',
        'Regular security audits and updates',
        'Compliance with data protection regulations',
      ],
    },
    {
      title: 'Your Rights',
      icon: 'document-text',
      items: [
        'Access to your personal data',
        'Right to correct inaccurate information',
        'Right to data portability',
        'Right to lodge a complaint with authorities',
      ],
    },
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
            Privacy & Safety
          </Text>
        </View>

        <View className="rounded-2xl p-5 mb-6 bg-bg-card border border-border">
          <View className="flex-row items-start gap-3 mb-3">
            <Ionicons name="information-circle" size={24} color={colors.accent.DEFAULT} />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-text mb-2">
                Your safety is our priority
              </Text>
              <Text className="text-xs text-text-sec leading-5">
                We have built RideShare with multiple layers of protection to ensure your personal information and physical safety are always secure.
              </Text>
            </View>
          </View>
        </View>

        {sections.map((section, index) => (
          <View key={index} className="rounded-2xl p-4 mb-4 bg-bg-card border border-border">
            <View className="flex-row items-center gap-3 mb-4">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: colors.accent.glow }}
              >
                <Ionicons name={section.icon as any} size={20} color={colors.accent.DEFAULT} />
              </View>
              <Text className="text-base font-semibold text-text">{section.title}</Text>
            </View>
            <View className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex} className="flex-row items-start gap-3">
                  <View className="w-1.5 h-1.5 rounded-full mt-2 bg-accent" />
                  <Text className="text-sm text-text-sec flex-1 leading-5">{item}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View className="rounded-xl p-4 bg-bg-card-alt border border-border">
          <Text className="text-xs text-text-muted mb-2">
            Last updated: January 2024
          </Text>
          <Text className="text-xs text-text-muted">
            For questions about your privacy or safety, contact us at rideshare2026.io@gmail.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

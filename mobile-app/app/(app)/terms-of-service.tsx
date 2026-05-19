import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const sections = [
    {
      title: 'Acceptance of Terms',
      content: 'By using RideShare, you agree to these Terms of Service. If you do not agree to these terms, please do not use our service.',
    },
    {
      title: 'Service Description',
      content: 'RideShare is a platform that connects university students for shared transportation. We facilitate connections between users but do not provide transportation services ourselves.',
    },
    {
      title: 'User Responsibilities',
      items: [
        'Provide accurate and truthful information',
        'Verify your identity using your university email',
        'Respect other users and follow community guidelines',
        'Use the Safety PIN feature for every ride',
        'Report any suspicious or inappropriate behavior',
      ],
    },
    {
      title: 'Prohibited Activities',
      items: [
        'Creating fake accounts or misrepresenting yourself',
        'Harassment, discrimination, or hate speech',
        'Sharing inappropriate content or messages',
        'Using the platform for illegal activities',
        'Attempting to circumvent safety features',
      ],
    },
    {
      title: 'Liability Disclaimer',
      content: 'RideShare is not a transportation provider. We do not guarantee the safety, reliability, or quality of any rides arranged through our platform. Users assume all risks associated with using our service.',
    },
    {
      title: 'Account Termination',
      content: 'We reserve the right to suspend or terminate accounts that violate these terms or engage in harmful behavior. Users may also delete their accounts at any time.',
    },
    {
      title: 'Modifications',
      content: 'We may modify these terms at any time. Continued use of the service after modifications constitutes acceptance of the updated terms.',
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
            Terms of Service
          </Text>
        </View>

        <View className="rounded-2xl p-5 mb-6 bg-bg-card border border-border">
          <View className="flex-row items-start gap-3">
            <Ionicons name="document-text" size={24} color={colors.accent.DEFAULT} />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-text mb-2">
                Please read carefully
              </Text>
              <Text className="text-xs text-text-sec leading-5">
                These terms govern your use of RideShare. By using our service, you agree to be bound by these terms and our privacy policy.
              </Text>
            </View>
          </View>
        </View>

        {sections.map((section, index) => (
          <View key={index} className="rounded-2xl p-4 mb-4 bg-bg-card border border-border">
            <Text className="text-base font-semibold text-text mb-3">{section.title}</Text>
            {section.content && (
              <Text className="text-sm text-text-sec leading-5">{section.content}</Text>
            )}
            {section.items && (
              <View className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <View key={itemIndex} className="flex-row items-start gap-3">
                    <View className="w-1.5 h-1.5 rounded-full mt-2 bg-accent" />
                    <Text className="text-sm text-text-sec flex-1 leading-5">{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <View className="rounded-xl p-4 bg-bg-card-alt border border-border">
          <Text className="text-xs text-text-muted mb-2">
            Last updated: January 2024
          </Text>
          <Text className="text-xs text-text-muted">
            By using RideShare, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

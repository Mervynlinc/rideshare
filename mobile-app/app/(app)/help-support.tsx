import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BackButton } from "../../components/ui";
import { useTheme } from "../../hooks/useTheme";

const faqs = [
  {
    question: "How do I post a ride?",
    answer:
      'Tap the "+" button on the home screen, fill in your ride details including destination, departure time, and number of seats available. Your ride will be visible to other students heading the same way.',
  },
  {
    question: "How does the Safety PIN work?",
    answer:
      "Each ride has a unique Safety PIN. When you meet your ride buddy, exchange PINs to verify you are meeting the right person. Only verify when you have met in person.",
  },
  {
    question: "What is the trust score?",
    answer:
      "Your trust score is based on ratings from other users. Higher scores indicate more reliable and trustworthy riders. Maintain good behavior to improve your score.",
  },
  {
    question: "How do I join a ride?",
    answer:
      'Browse available rides on the home screen, tap on a ride to view details, and tap "Request to Join". The poster will review your request and accept or decline.',
  },
  {
    question: "Can I cancel a ride?",
    answer:
      "Yes, you can cancel a ride before it starts. However, frequent cancellations may affect your trust score. Be considerate of other users time.",
  },
  {
    question: "Is RideShare safe?",
    answer:
      "RideShare includes multiple safety features: university email verification, Safety PIN verification, trust scores, and the ability to report/block users. Always meet in public places and trust your instincts.",
  },
  {
    question: "How do I report a user?",
    answer:
      "If you experience inappropriate behavior, you can report the user through their profile or during a ride. Our team will review the report and take appropriate action.",
  },
  {
    question: "What happens if my ride buddy does not show up?",
    answer:
      "Wait for a reasonable time (10-15 minutes) and try to contact them through the in-app chat. If they do not respond or show up, you can cancel the ride and report the issue.",
  },
];

const guideSteps = [
  {
    step: 1,
    title: "Create Your Account",
    description:
      "Sign up with your university email to verify your student status and join the trusted community.",
    icon: "person-add",
  },
  {
    step: 2,
    title: "Complete Your Profile",
    description:
      "Add your name, gender, campus, and hostel to help others find compatible rides.",
    icon: "create",
  },
  {
    step: 3,
    title: "Find or Post Rides",
    description:
      "Search for rides heading your destination or post your own ride to share costs.",
    icon: "search",
  },
  {
    step: 4,
    title: "Connect & Verify",
    description:
      "Chat with your ride buddy and exchange Safety PINs when you meet.",
    icon: "chatbubble",
  },
  {
    step: 5,
    title: "Share the Ride",
    description:
      "Enjoy your shared ride and rate your experience to help build trust.",
    icon: "star",
  },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-phone">
      <ScrollView
        className="flex-1 px-5 pt-6 bg-bg-phone"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="flex-row items-center gap-3 pb-5">
          <BackButton onPress={() => router.back()} />
          <Text className="font-display text-xl font-bold text-text">
            Help & Support
          </Text>
        </View>

        <View className="rounded-2xl p-5 mb-6 bg-bg-card border border-border">
          <View className="flex-row items-start gap-3">
            <Ionicons
              name="help-circle"
              size={24}
              color={colors.accent.DEFAULT}
            />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-text mb-2">
                How can we help?
              </Text>
              <Text className="text-xs text-text-sec leading-5">
                Find answers to common questions, learn how to use the app, or
                contact our support team for assistance.
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-xs uppercase tracking-widest font-semibold mb-3 text-text-muted">
          How to Use RideShare
        </Text>
        <View className="rounded-2xl p-4 mb-6 bg-bg-card border border-border">
          {guideSteps.map((step, index) => (
            <View key={index} className="flex-row gap-4 mb-4">
              <View className="items-center">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.accent.glow }}
                >
                  <Text className="font-display text-sm font-bold text-accent">
                    {step.step}
                  </Text>
                </View>
                {index !== guideSteps.length - 1 && (
                  <View className="w-0.5 h-8 bg-border-light mt-2" />
                )}
              </View>
              <View className="flex-1 pb-4">
                <View className="flex-row items-center gap-2 mb-1">
                  <Ionicons
                    name={step.icon as any}
                    size={16}
                    color={colors.accent.DEFAULT}
                  />
                  <Text className="text-sm font-semibold text-text">
                    {step.title}
                  </Text>
                </View>
                <Text className="text-xs text-text-muted leading-5">
                  {step.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text className="text-xs uppercase tracking-widest font-semibold mb-3 text-text-muted">
          Frequently Asked Questions
        </Text>
        <View className="rounded-2xl overflow-hidden mb-6 bg-bg-card border border-border">
          {faqs.map((faq, index) => (
            <View key={index}>
              <TouchableOpacity
                className="flex-row items-center justify-between py-4 px-4"
                onPress={() => toggleFaq(index)}
                activeOpacity={0.7}
              >
                <View className="flex-1 pr-4">
                  <Text className="text-sm font-medium text-text">
                    {faq.question}
                  </Text>
                </View>
                <Ionicons
                  name={expandedFaq === index ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={colors.icon.muted}
                />
              </TouchableOpacity>
              {expandedFaq === index && (
                <View className="px-4 pb-4 pt-0">
                  <Text className="text-sm text-text-sec leading-5">
                    {faq.answer}
                  </Text>
                </View>
              )}
              {index !== faqs.length - 1 && (
                <View className="h-px bg-border mx-4" />
              )}
            </View>
          ))}
        </View>

        <Text className="text-xs uppercase tracking-widest font-semibold mb-3 text-text-muted">
          Contact Support
        </Text>
        <View className="rounded-2xl p-4 mb-6 bg-bg-card border border-border">
          <View className="flex-row items-start gap-3 mb-4">
            <View
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: colors.accent.glow }}
            >
              <Ionicons name="mail" size={20} color={colors.accent.DEFAULT} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-text mb-1">
                Email Support
              </Text>
              <Text className="text-xs text-text-muted mb-2">
                For issues, questions, or feedback, reach out to our support
                team.
              </Text>
              <TouchableOpacity
                className="bg-bg-input rounded-lg px-3 py-2"
                onPress={() => {}}
              >
                <Text
                  className="text-xs font-medium text-accent"
                  onPress={async () => {
                    const { Linking } = require("react-native");
                    const gmailUrl =
                      "googlegmail://co?to=rideshare2026.io@gmail.com&subject=Support";
                    const mailtoUrl =
                      "mailto:rideshare2026.io@gmail.com?subject=Support";
                    try {
                      const canOpen = await Linking.canOpenURL(gmailUrl);
                      if (canOpen) {
                        await Linking.openURL(gmailUrl);
                      } else {
                        await Linking.openURL(mailtoUrl);
                      }
                    } catch (e) {
                      await Linking.openURL(mailtoUrl);
                    }
                  }}
                >
                  rideshare2026.io@gmail.com
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row items-start gap-3">
            <View
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: colors.accent.glow }}
            >
              <Ionicons name="time" size={20} color={colors.accent.DEFAULT} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-text mb-1">
                Response Time
              </Text>
              <Text className="text-xs text-text-muted">
                We typically respond within 24-48 hours. For urgent safety
                concerns, please contact campus security.
              </Text>
            </View>
          </View>
        </View>

        <View className="rounded-xl p-4 bg-bg-card-alt border border-border">
          <Text className="text-xs text-text-muted mb-2">Safety Resources</Text>
          <View className="space-y-2">
            <View className="flex-row items-center gap-2">
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={colors.icon.muted}
              />
              <Text className="text-xs text-text-sec">
                Always meet in public, well-lit areas
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Ionicons name="people" size={16} color={colors.icon.muted} />
              <Text className="text-xs text-text-sec">
                Share your ride details with friends
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Ionicons name="call" size={16} color={colors.icon.muted} />
              <Text className="text-xs text-text-sec">
                Keep emergency contacts accessible
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

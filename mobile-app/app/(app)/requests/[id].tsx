import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, TrustBadge, BackButton, Button } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { JoinRequest } from '../../../types';

export default function RequestsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [requests, setRequests] = useState<JoinRequest[]>([]);

  const handleAccept = (index: number) => {
    const newRequests = [...requests];
    newRequests[index] = { ...newRequests[index], status: 'accepted' };
    setRequests(newRequests);
  };

  const handleDecline = (index: number) => {
    const newRequests = [...requests];
    newRequests[index] = { ...newRequests[index], status: 'declined' };
    setRequests(newRequests);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.phone }}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg.phone, paddingHorizontal: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 8 }}>
        <BackButton onPress={() => router.back()} />
        <View>
          <Text style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 'bold', color: colors.text.DEFAULT }}>
            Join Requests
          </Text>
          <Text style={{ color: colors.text.muted, fontSize: 12 }}>
            Hostel A → Mbarara Market · 2 seats open
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, marginBottom: 16 }}>
        <Ionicons name="people" size={16} color={colors.accent.DEFAULT} />
        <Text style={{ color: colors.text.sec, fontSize: 14 }}>
          <Text style={{ color: colors.text.DEFAULT, fontWeight: '600' }}>{requests.filter(r => r.status === 'pending').length}</Text> pending requests
        </Text>
      </View>

      <View style={{ gap: 10, paddingBottom: 24 }}>
        {requests.map((request, index) => (
          <View
            key={request.id}
            style={{
              backgroundColor: colors.bg.card,
              borderWidth: 1,
              borderColor: request.status === 'accepted' ? colors.accent.DEFAULT : request.status === 'declined' ? colors.red.DEFAULT : colors.border.DEFAULT,
              borderRadius: 16,
              padding: 16,
              opacity: request.status === 'declined' ? 0.4 : 1,
            }}
          >
<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
  <Avatar
    initials={request.requester.initials}
    size="md"
    color={request.requester.color}
  />
  <View style={{ flex: 1 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text style={{ color: colors.text.DEFAULT, fontSize: 14, fontWeight: '600' }}>{request.requester.name}</Text>
      <TrustBadge score={request.requester.trust} />
    </View>
    <Text style={{ color: colors.text.muted, fontSize: 12, marginTop: 2 }}>
      {request.requester.gender} · {Math.floor((Date.now() - request.requestedAt.getTime()) / 60000)} min ago
    </Text>
  </View>
</View>

            {request.status === 'pending' ? (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button
                  title="Accept"
                  onPress={() => handleAccept(index)}
                  variant="primary"
                  style={{ flex: 1, paddingVertical: 11 }}
                />
                <Button
                  title="Decline"
                  onPress={() => handleDecline(index)}
                  variant="danger"
                  style={{ flex: 1, paddingVertical: 11 }}
                />
              </View>
            ) : (
              <View
                style={{
                  borderRadius: 8,
                  paddingVertical: 10,
                  alignItems: 'center',
                  backgroundColor: request.status === 'accepted' ? colors.accent.DEFAULT : colors.red.dim,
                }}
              >
                <Text
                  style={{ fontWeight: '600', fontSize: 14, color: request.status === 'accepted' ? '#000' : colors.red.DEFAULT }}
                >
                  {request.status === 'accepted' ? 'Accepted' : 'Declined'}
                </Text>
              </View>
            )}
        </View>
      ))}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

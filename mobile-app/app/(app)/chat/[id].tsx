import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, BackButton } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { useMessages } from '../../../hooks/useMessages';
import { useAuth } from '../../../context/AuthProvider';
import { supabase } from '../../../lib/supabase';
import { getParticipantColor, getInitials } from '../../../utils/chatColors';
import type { ChatParticipant } from '../../../hooks/useChats';

export default function ChatScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [chatInfo, setChatInfo] = useState<any>(null);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [loadingChatInfo, setLoadingChatInfo] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const { messages, loading, sending, sendMessage, error } = useMessages({
    chatId: id || '',
  });

  useEffect(() => {
    if (id) {
      fetchChatInfo();
    }
  }, [id]);

  const fetchChatInfo = async () => {
    try {
      setLoadingChatInfo(true);

      // Get chat details
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', id)
        .single();

      if (chatError) throw chatError;

      if (!chat) {
        setChatInfo(null);
        return;
      }

      // Get participants for this ride
      const { data: participantRows } = await supabase
        .from('ride_participants')
        .select('user_id, status')
        .eq('ride_id', chat.ride_id)
        .in('status', ['accepted', 'pending']);

      const participantUserIds = participantRows?.map((p) => p.user_id) || [];
      const allUserIds = [...new Set([chat.poster_id, ...participantUserIds])];

      // Fetch user details for all participants
      const { data: usersData } = await supabase
        .from('users')
        .select('id, name, avatar_url, trust_score, verified, gender')
        .in('id', allUserIds);

      const participantList: ChatParticipant[] = allUserIds.map((uid) => {
        const userData = usersData?.find((u) => u.id === uid);
        return {
          id: uid,
          name: userData?.name || 'Unknown',
          avatar_url: userData?.avatar_url,
          trust_score: userData?.trust_score || 0,
          verified: userData?.verified || false,
          gender: userData?.gender || 'Other',
          is_poster: uid === chat.poster_id,
        };
      });

      setParticipants(participantList);
      setChatInfo({
        ...chat,
        participants: participantList,
      });
    } catch (err) {
      console.error('Error fetching chat info:', err);
    } finally {
      setLoadingChatInfo(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || sending) return;

    try {
      await sendMessage(inputText.trim());
      setInputText('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSenderColor = (senderId: string): string => {
    return getParticipantColor(
      senderId,
      chatInfo?.poster_id || '',
      participants.map((p) => p.id)
    );
  };

  const getSenderName = (senderId: string): string => {
    const participant = participants.find((p) => p.id === senderId);
    return participant?.name || 'Unknown';
  };

  const isGroupChat = participants.length > 2;

  if (!id) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.phone }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.text.muted }}>No chat selected</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.phone }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: colors.bg.phone }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border.DEFAULT }}>
          <BackButton onPress={() => router.back()} />
          {loadingChatInfo ? (
            <ActivityIndicator size="small" color={colors.text.muted} />
          ) : (
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {/* Participant avatars */}
              {isGroupChat ? (
                <View style={{ flexDirection: 'row', marginRight: -4 }}>
                  {participants.slice(0, 3).map((p, idx) => (
                    <View key={p.id} style={{ marginLeft: idx > 0 ? -8 : 0, zIndex: 3 - idx }}>
                      <Avatar
                        initials={getInitials(p.name)}
                        size="sm"
                        color={getParticipantColor(p.id, chatInfo?.poster_id || '', participants.map((pp) => pp.id))}
                        imageUrl={p.avatar_url}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                participants.length > 0 && (
                  <Avatar
                    initials={getInitials(participants.find((p) => p.id !== user?.id)?.name || participants[0]?.name || '')}
                    size="sm"
                    color={getParticipantColor(
                      participants.find((p) => p.id !== user?.id)?.id || participants[0]?.id || '',
                      chatInfo?.poster_id || '',
                      participants.map((p) => p.id)
                    )}
                    imageUrl={participants.find((p) => p.id !== user?.id)?.avatar_url || participants[0]?.avatar_url}
                  />
                )
              )}

              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text.DEFAULT, fontSize: 14, fontWeight: '600' }} numberOfLines={1}>
                  {isGroupChat
                    ? participants.map((p) => p.name).join(', ')
                    : participants.find((p) => p.id !== user?.id)?.name || 'Chat'}
                </Text>
                <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                  {isGroupChat ? `${participants.length} riders` : 'Tap shield to verify when you meet'}
                </Text>
              </View>
            </View>
          )}
          {!loadingChatInfo && (
            <TouchableOpacity
              style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: colors.bg.card, borderWidth: 1, borderColor: colors.border.DEFAULT, alignItems: 'center', justifyContent: 'center' }}
              onPress={() => router.push(`/safety-pin/${id}`)}
            >
              <Ionicons name="shield-checkmark" size={14} color={colors.amber.DEFAULT} />
            </TouchableOpacity>
          )}
        </View>

        {/* Ride Info Banner */}
        <View style={{ backgroundColor: colors.bg.card, paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: colors.border.DEFAULT }}>
          <Ionicons name="navigate" size={14} color={colors.accent.DEFAULT} />
          <Text style={{ color: colors.text.sec, fontSize: 12 }}>
            {chatInfo?.ride_from || 'From'} → {chatInfo?.ride_to || 'To'}
          </Text>
        </View>

        {/* Messages */}
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.accent.DEFAULT} />
          </View>
        ) : error ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.red.DEFAULT }}>{error}</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.text.muted }}>No messages yet</Text>
            <Text style={{ color: colors.text.dim, fontSize: 12, marginTop: 4 }}>
              Start the conversation!
            </Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 16 }}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((message) => {
              const senderColor = getSenderColor(message.sender_id);
              const senderName = message.sender_name || getSenderName(message.sender_id);

              return (
                <View
                  key={message.id}
                  style={{ marginBottom: 12, alignItems: message.is_mine ? 'flex-end' : 'flex-start' }}
                >
                  {/* Sender name (only show for messages from others in group chats) */}
                  {isGroupChat && !message.is_mine && (
                    <Text style={{ color: senderColor, fontSize: 11, fontWeight: '600', marginBottom: 2, marginLeft: 4 }}>
                      {senderName}
                    </Text>
                  )}

                  {/* Message bubble */}
                  <View
                    style={{
                      maxWidth: '78%',
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 16,
                      backgroundColor: message.is_mine ? colors.accent.DEFAULT : senderColor,
                      borderBottomRightRadius: message.is_mine ? 4 : 16,
                      borderBottomLeftRadius: message.is_mine ? 16 : 4,
                    }}
                  >
                    <Text
                      style={{ fontSize: 14, lineHeight: 20, color: '#000' }}
                    >
                      {message.text}
                    </Text>
                  </View>

                  {/* Timestamp (and sender name for non-group chats) */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2, marginHorizontal: 4 }}>
                    {!isGroupChat && !message.is_mine && (
                      <Text style={{ color: senderColor, fontSize: 11, fontWeight: '600' }}>
                        {senderName}
                      </Text>
                    )}
                    <Text style={{ color: colors.text.dim, fontSize: 11 }}>
                      {formatTime(message.timestamp)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Input */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 12, paddingBottom: 32, borderTopWidth: 1, borderTopColor: colors.border.DEFAULT }}>
          <TextInput
            style={{ flex: 1, backgroundColor: colors.bg.input, borderWidth: 1, borderColor: colors.border.DEFAULT, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, color: colors.text.DEFAULT, fontSize: 14 }}
            placeholder="Type a message..."
            placeholderTextColor={colors.text.muted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
            editable={!sending}
          />
          <TouchableOpacity
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent.DEFAULT, alignItems: 'center', justifyContent: 'center' }}
            onPress={handleSendMessage}
            disabled={sending || !inputText.trim()}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Ionicons name="send" size={16} color={colors.icon.DEFAULT} style={{ transform: [{ rotate: '-30deg' }] }} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

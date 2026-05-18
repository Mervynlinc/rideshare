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

export default function ChatScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [chatInfo, setChatInfo] = useState<any>(null);
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

      // Get the other user's info
      const otherUserId = chat.requester_id === user?.id ? chat.poster_id : chat.requester_id;
      let otherUser = null;
      
      const { data: userData } = await supabase
        .from('users')
        .select('id, name, avatar_url, trust_score, verified, gender')
        .eq('id', otherUserId)
        .maybeSingle();

      if (userData) {
        otherUser = userData;
      } else {
        // Fallback to auth.users
        const { data: authUser } = await supabase.auth.admin.listUsers();
        const foundAuthUser = authUser?.users.find((u: any) => u.id === otherUserId);
        if (foundAuthUser) {
          otherUser = {
            id: foundAuthUser.id,
            name: foundAuthUser.user_metadata?.name || 'User',
            gender: foundAuthUser.user_metadata?.gender,
            verified: !!foundAuthUser.email_confirmed_at
          };
        }
      }

      setChatInfo({
        ...chat,
        other_user: otherUser,
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (gender: string) => {
    switch (gender?.toLowerCase()) {
      case 'male':
        return '#3B82F6';
      case 'female':
        return '#EC4899';
      default:
        return '#6B7280';
    }
  };

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
          ) : chatInfo?.other_user ? (
            <>
              <Avatar
                initials={getInitials(chatInfo.other_user.name)}
                size="sm"
                color={getAvatarColor(chatInfo.other_user.gender)}
                imageUrl={chatInfo.other_user.avatar_url}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text.DEFAULT, fontSize: 14, fontWeight: '600' }}>
                  {chatInfo.other_user.name}
                </Text>
                <Text style={{ color: colors.text.muted, fontSize: 12 }}>
                  Tap shield to verify when you meet
                </Text>
              </View>
              <TouchableOpacity
                style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: colors.bg.card, borderWidth: 1, borderColor: colors.border.DEFAULT, alignItems: 'center', justifyContent: 'center' }}
                onPress={() => router.push(`/safety-pin/${id}`)}
              >
                <Ionicons name="shield-checkmark" size={14} color={colors.amber.DEFAULT} />
              </TouchableOpacity>
            </>
          ) : (
            <Text style={{ color: colors.text.muted }}>Loading...</Text>
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
            <Text style={{ color: colors.text.error }}>{error}</Text>
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
            {messages.map((message) => (
              <View
                key={message.id}
                style={{ marginBottom: 8, alignItems: message.is_mine ? 'flex-end' : 'flex-start' }}
              >
                {!message.is_mine && message.sender_name && (
                  <Text style={{ color: colors.text.muted, fontSize: 12, marginLeft: 4, marginBottom: 2 }}>
                    {message.sender_name}
                  </Text>
                )}
                <View
                  style={{
                    maxWidth: '78%',
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 16,
                    backgroundColor: message.is_mine ? colors.accent.DEFAULT : colors.bg['card-alt'],
                    borderBottomRightRadius: message.is_mine ? 4 : 16,
                    borderBottomLeftRadius: message.is_mine ? 16 : 4,
                  }}
                >
                  <Text
                    style={{ fontSize: 14, lineHeight: 20, color: message.is_mine ? '#000' : colors.text.DEFAULT }}
                  >
                    {message.text}
                  </Text>
                </View>
                <Text style={{ color: colors.text.dim, fontSize: 12, marginTop: 2, marginRight: 4 }}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            ))}
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
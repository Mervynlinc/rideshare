import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, BackButton } from '../../../components/ui';
import { mockMessages, mockPerson, formatTime } from '../../../data/mockData';
import { useTheme } from '../../../hooks/useTheme';

export default function ChatScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState(mockMessages);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      senderId: '1',
      text: inputText.trim(),
      timestamp: new Date(),
      isMine: true,
    };

    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.phone }}>
      <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.bg.phone }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border.DEFAULT }}>
        <BackButton onPress={() => router.back()} />
        <Avatar initials={mockPerson.initials} size="sm" color={mockPerson.color} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text.DEFAULT, fontSize: 14, fontWeight: '600' }}>{mockPerson.name}</Text>
          <Text style={{ color: colors.text.muted, fontSize: 12 }}>
            Tap shield to verify when you meet
          </Text>
        </View>
        <TouchableOpacity
          style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: colors.bg.card, borderWidth: 1, borderColor: colors.border.DEFAULT, alignItems: 'center', justifyContent: 'center' }}
                onPress={() => router.push(`/(app)/safety-pin/${id}`)}
        >
          <Ionicons name="shield-checkmark" size={14} color={colors.amber.DEFAULT} />
        </TouchableOpacity>
      </View>

      <View style={{ backgroundColor: colors.bg.card, paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: colors.border.DEFAULT }}>
        <Ionicons name="navigate" size={14} color={colors.accent.DEFAULT} />
        <Text style={{ color: colors.text.sec, fontSize: 12 }}>
          Main Campus Gate → Mbarara Town Centre
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 16 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={{ marginBottom: 8, alignItems: message.isMine ? 'flex-end' : 'flex-start' }}
          >
            {!message.isMine && message.senderName && (
              <Text style={{ color: colors.text.muted, fontSize: 12, marginLeft: 4, marginBottom: 2 }}>{message.senderName}</Text>
            )}
            <View
              style={{
                maxWidth: '78%',
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 16,
                backgroundColor: message.isMine ? colors.accent.DEFAULT : colors.bg['card-alt'],
                borderBottomRightRadius: message.isMine ? 4 : 16,
                borderBottomLeftRadius: message.isMine ? 16 : 4,
              }}
            >
              <Text
                style={{ fontSize: 14, lineHeight: 20, color: message.isMine ? '#000' : colors.text.DEFAULT }}
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

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 12, paddingBottom: 32, borderTopWidth: 1, borderTopColor: colors.border.DEFAULT }}>
        <TextInput
          style={{ flex: 1, backgroundColor: colors.bg.input, borderWidth: 1, borderColor: colors.border.DEFAULT, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, color: colors.text.DEFAULT, fontSize: 14 }}
          placeholder="Type a message..."
          placeholderTextColor={colors.text.muted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent.DEFAULT, alignItems: 'center', justifyContent: 'center' }}
          onPress={sendMessage}
        >
        <Ionicons name="send" size={16} color={colors.icon.DEFAULT} style={{ transform: [{ rotate: '-30deg' }] }} />
      </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

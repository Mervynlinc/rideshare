import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthProvider';

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  text: string;
  timestamp: string;
  read_at: string | null;
  is_mine: boolean;
  sender_name?: string;
}

interface UseMessagesParams {
  chatId: string;
}

export function useMessages({ chatId }: UseMessagesParams) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!user || !chatId) return;

    try {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(name)
        `)
        .eq('chat_id', chatId)
        .is('deleted_at', null)
        .order('timestamp', { ascending: true });

      if (fetchError) throw fetchError;

      const messagesWithSender = (data || []).map((msg) => ({
        ...msg,
        is_mine: msg.sender_id === user.id,
        sender_name: msg.sender?.name,
      }));

      setMessages(messagesWithSender);

      // Mark messages as read
      await markMessagesAsRead();
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, chatId]);

  const markMessagesAsRead = async () => {
    if (!user || !chatId) return;

    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('chat_id', chatId)
        .neq('sender_id', user.id)
        .is('read_at', null);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  useEffect(() => {
    if (!chatId) return;

    fetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel(`messages_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          // Fetch the full message with sender info
          const { data: newMessage } = await supabase
            .from('messages')
            .select(`
              *,
              sender:sender_id(name)
            `)
            .eq('id', payload.new.id)
            .single();

          if (newMessage) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMessage.id)) return prev;
              return [
                ...prev,
                {
                  ...newMessage,
                  is_mine: newMessage.sender_id === user?.id,
                  sender_name: newMessage.sender?.name,
                },
              ];
            });

            // If the message is not from me, mark it as read
            if (newMessage.sender_id !== user?.id) {
              await supabase
                .from('messages')
                .update({ read_at: new Date().toISOString() })
                .eq('id', newMessage.id);
            }

            // Update last_message_at in chats
            await supabase
              .from('chats')
              .update({ last_message_at: new Date().toISOString() })
              .eq('id', chatId);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id
                ? { ...msg, ...payload.new, is_mine: msg.is_mine }
                : msg
            )
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [chatId, user?.id]);

  const sendMessage = async (text: string) => {
    if (!user || !chatId || !text.trim()) return;

    try {
      setSending(true);

      const { data, error: sendError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          text: text.trim(),
        })
        .select(`
          *,
          sender:sender_id(name)
        `)
        .single();

      if (sendError) throw sendError;

      // Update last_message_at in chats
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', chatId);

      return data;
    } catch (err: any) {
      console.error('Error sending message:', err);
      throw new Error(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;

      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (err: any) {
      console.error('Error deleting message:', err);
      throw new Error(err.message || 'Failed to delete message');
    }
  };

  const getUnreadCount = async () => {
    if (!user || !chatId) return 0;

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('chat_id', chatId)
      .neq('sender_id', user.id)
      .is('read_at', null);

    return count || 0;
  };

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    deleteMessage,
    getUnreadCount,
    refresh: fetchMessages,
  };
}
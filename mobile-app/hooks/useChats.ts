import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthProvider';

export interface Chat {
  id: string;
  ride_id: string;
  ride_from: string;
  ride_to: string;
  requester_id: string;
  poster_id: string;
  created_at: string;
  last_message_at: string | null;
  expires_at: string | null;
  other_user?: {
    id: string;
    name: string;
    avatar_url?: string;
    trust_score: number;
    verified: boolean;
    gender: string;
  };
  last_message?: {
    id: string;
    text: string;
    timestamp: string;
    sender_id: string;
    is_mine: boolean;
  };
  unread_count?: number;
}

export function useChats() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch chats where user is either requester or poster
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .or(`requester_id.eq.${user.id},poster_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (chatError) throw chatError;

      if (!chatData || chatData.length === 0) {
        setChats([]);
        return;
      }

      // For each chat, get the other user's info and last message
      const chatsWithDetails = await Promise.all(
        chatData.map(async (chat) => {
          const otherUserId = chat.requester_id === user.id ? chat.poster_id : chat.requester_id;

          // Get other user details
          const { data: userData } = await supabase
            .from('users')
            .select('id, name, avatar_url, trust_score, verified, gender')
            .eq('id', otherUserId)
            .single();

          // Get last message
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('id, text, timestamp, sender_id')
            .eq('chat_id', chat.id)
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();

          // Get unread count (messages not from current user that are unread)
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chat.id)
            .neq('sender_id', user.id)
            .is('read_at', null);

          return {
            ...chat,
            other_user: userData || null,
            last_message: lastMsg
              ? {
                  ...lastMsg,
                  is_mine: lastMsg.sender_id === user.id,
                }
              : null,
            unread_count: unreadCount || 0,
          };
        })
      );

      setChats(chatsWithDetails);
    } catch (err: any) {
      console.error('Error fetching chats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChats();

    // Subscribe to new chats
    const channel = supabase
      .channel('chats_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
          filter: `requester_id=eq.${user?.id}`,
        },
        () => fetchChats()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
          filter: `poster_id=eq.${user?.id}`,
        },
        () => fetchChats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchChats, user?.id]);

  const getChatByRideId = async (rideId: string) => {
    if (!user) return null;

    const { data } = await supabase
      .from('chats')
      .select('*')
      .eq('ride_id', rideId)
      .or(`requester_id.eq.${user.id},poster_id.eq.${user.id}`)
      .maybeSingle();

    return data;
  };

  const getOrCreateChatForRide = async (rideId: string): Promise<Chat | null> => {
    if (!user) return null;

    // Check if chat exists
    const existingChat = await getChatByRideId(rideId);
    if (existingChat) return existingChat;

    // Get ride details
    const { data: ride } = await supabase
      .from('rides')
      .select('poster_id, from_location, to_location')
      .eq('id', rideId)
      .single();

    if (!ride) return null;

    // Create chat - but this should normally be done via join request trigger
    // This is a fallback in case chat wasn't created
    const { data: newChat, error } = await supabase
      .from('chats')
      .insert({
        ride_id: rideId,
        ride_from: ride.from_location,
        ride_to: ride.to_location,
        requester_id: user.id,
        poster_id: ride.poster_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat:', error);
      return null;
    }

    return newChat;
  };

  return {
    chats,
    loading,
    error,
    getChatByRideId,
    getOrCreateChatForRide,
    refresh: fetchChats,
  };
}
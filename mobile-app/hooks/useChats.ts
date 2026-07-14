import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthProvider';

export interface ChatParticipant {
  id: string;
  name: string;
  avatar_url?: string;
  trust_score: number;
  verified: boolean;
  gender: string;
  is_poster: boolean;
}

export interface Chat {
  id: string;
  ride_id: string;
  ride_from: string;
  ride_to: string;
  poster_id: string;
  created_at: string;
  last_message_at: string | null;
  expires_at: string | null;
  participants?: ChatParticipant[];
  last_message?: {
    id: string;
    text: string;
    timestamp: string;
    sender_id: string;
    sender_name?: string;
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

      // Find ride IDs where user is a participant
      const { data: participantRides } = await supabase
        .from('ride_participants')
        .select('ride_id')
        .eq('user_id', user.id)
        .in('status', ['accepted', 'pending']);

      const participantRideIds = participantRides?.map((r) => r.ride_id) || [];

      // Find ride IDs where user is the poster
      const { data: posterRides } = await supabase
        .from('rides')
        .select('id')
        .eq('poster_id', user.id);

      const posterRideIds = posterRides?.map((r) => r.id) || [];

      // Combine all ride IDs
      const allRideIds = [...new Set([...participantRideIds, ...posterRideIds])];

      if (allRideIds.length === 0) {
        setChats([]);
        return;
      }

      // Fetch chats for those rides
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .in('ride_id', allRideIds)
        .order('last_message_at', { ascending: false });

      if (chatError) throw chatError;

      if (!chatData || chatData.length === 0) {
        setChats([]);
        return;
      }

      // For each chat, get participants, last message, and unread count
      const chatsWithDetails = await Promise.all(
        chatData.map(async (chat) => {
          // Get participants for this ride
          const { data: participantRows } = await supabase
            .from('ride_participants')
            .select('user_id, status')
            .eq('ride_id', chat.ride_id)
            .in('status', ['accepted', 'pending']);

          const participantUserIds = participantRows?.map((p) => p.user_id) || [];

          // Always include the poster
          const allUserIds = [...new Set([chat.poster_id, ...participantUserIds])];

          // Fetch user details for all participants
          const { data: usersData } = await supabase
            .from('users')
            .select('id, name, avatar_url, trust_score, verified, gender')
            .in('id', allUserIds);

          const participants: ChatParticipant[] = allUserIds.map((uid) => {
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

          // Get last message
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('id, text, timestamp, sender_id')
            .eq('chat_id', chat.id)
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();

          // Get sender name for last message
          let lastMessageSenderName: string | undefined;
          if (lastMsg) {
            const { data: senderData } = await supabase
              .from('users')
              .select('name')
              .eq('id', lastMsg.sender_id)
              .single();
            lastMessageSenderName = senderData?.name;
          }

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chat.id)
            .neq('sender_id', user.id)
            .is('read_at', null);

          return {
            ...chat,
            participants,
            last_message: lastMsg
              ? {
                  ...lastMsg,
                  sender_name: lastMessageSenderName,
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

    // Subscribe to new chats — listen for inserts on chats table
    // RLS will filter to only chats the user can see
    const channel = supabase
      .channel('chats_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
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

    // Upsert group chat for this ride
    const { data: newChat, error } = await supabase
      .from('chats')
      .upsert({
        ride_id: rideId,
        ride_from: ride.from_location,
        ride_to: ride.to_location,
        poster_id: ride.poster_id,
      }, { onConflict: 'ride_id' })
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

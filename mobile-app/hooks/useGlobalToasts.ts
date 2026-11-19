import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthProvider';
import { useToast } from '../context/ToastContext';
import { useNotifications as useAppNotifications } from '../context/NotificationContext';
import { sendLocalNotification } from '../utils/notificationManager';

export function useGlobalToasts() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { addNotification } = useAppNotifications();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const channels: ReturnType<typeof supabase.channel>[] = [];

    // 1. New ride posted in the user's university (by someone else)
    const rideChannel = supabase
      .channel('global_new_rides')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rides',
          filter: `university_id=eq.${user.universityId}`,
        },
        async (payload) => {
          const ride = payload.new as any;
          if (ride.poster_id === user.id) return;

          const { data: poster } = await supabase
            .from('users')
            .select('name')
            .eq('id', ride.poster_id)
            .single();

          const title = 'New Ride Available';
          const description = poster
            ? `${poster.name} is going ${ride.from_location} → ${ride.to_location}`
            : `New ride to ${ride.to_location}`;

          showToast({
            type: 'info',
            title,
            description,
            icon: 'bicycle',
            onPress: () => router.push(`/ride/${ride.id}`),
          });

          addNotification({
            type: 'info',
            icon: 'bicycle',
            title,
            description,
            data: { rideId: ride.id },
          });
        }
      )
      .subscribe();

    channels.push(rideChannel);

    // 2. New message sent to the current user
    const messageChannel = supabase
      .channel('global_new_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const msg = payload.new as any;
          if (msg.sender_id === user.id) return;

          const { data: chat } = await supabase
            .from('chats')
            .select('requester_id, poster_id')
            .eq('id', msg.chat_id)
            .single();

          if (!chat) return;
          if (chat.requester_id !== user.id && chat.poster_id !== user.id) return;

          const { data: sender } = await supabase
            .from('users')
            .select('name')
            .eq('id', msg.sender_id)
            .single();

          const senderName = sender?.name || 'Someone';

          showToast({
            type: 'success',
            title: `Message from ${senderName}`,
            description: msg.text,
            icon: 'chatbubble',
            onPress: () => router.push(`/chat/${msg.chat_id}`),
          });

          addNotification({
            type: 'success',
            icon: 'chatbubble',
            title: `Message from ${senderName}`,
            description: msg.text,
            data: { chatId: msg.chat_id },
          });

          sendLocalNotification({
            title: `Message from ${senderName}`,
            body: msg.text,
            data: { chatId: msg.chat_id, screen: 'chat' },
          });
        }
      )
      .subscribe();

    channels.push(messageChannel);

    // 3. Rating updated (someone rated the current user)
    const ratingChannel = supabase
      .channel('global_new_ratings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ratings',
          filter: `rated_user_id=eq.${user.id}`,
        },
        async (payload) => {
          const rating = payload.new as any;

          const { data: rater } = await supabase
            .from('users')
            .select('name')
            .eq('id', rating.rater_id)
            .single();

          const raterName = rater?.name || 'Someone';

          const { data: ratedUser } = await supabase
            .from('users')
            .select('trust_score')
            .eq('id', user.id)
            .single();

          const trustScore = ratedUser?.trust_score?.toFixed(1) ?? '0.0';

          showToast({
            type: 'success',
            title: `Rated by ${raterName}`,
            description: `${rating.rating}/5 stars · Trust score: ${trustScore}`,
            icon: 'star',
            onPress: () => router.push('/(app)/(tabs)/profile'),
          });

          addNotification({
            type: 'success',
            icon: 'star',
            title: `Rated by ${raterName}`,
            description: `${rating.rating}/5 stars · Trust score: ${trustScore}`,
            data: { screen: 'profile' },
          });

          sendLocalNotification({
            title: 'New Rating',
            body: `${raterName} rated you ${rating.rating}/5 · Trust score: ${trustScore}`,
            data: { screen: 'profile' },
          });
        }
      )
      .subscribe();

    channels.push(ratingChannel);

    // 4. Rating given by the current user (they rated someone else)
    const ratingGivenChannel = supabase
      .channel('global_ratings_given')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ratings',
          filter: `rater_id=eq.${user.id}`,
        },
        async (payload) => {
          const rating = payload.new as any;

          const { data: currentUser } = await supabase
            .from('users')
            .select('name, trust_score')
            .eq('id', user.id)
            .single();

          const trustScore = currentUser?.trust_score?.toFixed(1) ?? '0.0';

          showToast({
            type: 'success',
            title: 'Rating Submitted',
            description: `Your trust score is ${trustScore}`,
            icon: 'star',
            onPress: () => router.push('/(app)/(tabs)/profile'),
          });

          addNotification({
            type: 'success',
            icon: 'star',
            title: 'Rating Submitted',
            description: `Your trust score is ${trustScore}`,
            data: { screen: 'profile' },
          });

          sendLocalNotification({
            title: 'Rating Submitted',
            body: `Your trust score is ${trustScore}`,
            data: { screen: 'profile' },
          });
        }
      )
      .subscribe();

    channels.push(ratingGivenChannel);

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [user?.id]);
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthProvider';

interface JoinRequest {
  id: string;
  ride_id: string;
  requester_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  requested_at: string;
  responded_at: string | null;
  response_message: string | null;
  requester?: {
    id: string;
    name: string;
    avatar_url?: string;
    trust_score: number;
    verified: boolean;
  };
  ride?: {
    id: string;
    from_location: string;
    to_location: string;
    poster_id: string;
  };
}

interface CreateJoinRequestParams {
  rideId: string;
}

export function useJoinRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get user's rides first
      const { data: userRides } = await supabase
        .from('rides')
        .select('id')
        .eq('poster_id', user.id);

      const userRideIds = userRides?.map(r => r.id) || [];
      
      // Fetch requests where user is the requester
      const { data: myRequests, error: myError } = await supabase
        .from('join_requests')
        .select('*')
        .eq('requester_id', user.id)
        .order('requested_at', { ascending: false });

      // Fetch requests for user's rides
      const { data: rideRequests, error: rideError } = userRideIds.length > 0
        ? await supabase
            .from('join_requests')
            .select('*')
            .in('ride_id', userRideIds)
            .order('requested_at', { ascending: false })
        : { data: [], error: null };

      if (myError) throw myError;

      // Get all unique requester IDs
      const allRequestsData = [...(myRequests || []), ...(rideRequests || [])];
      const uniqueRequests = allRequestsData.filter((req, idx, arr) => 
        arr.findIndex(r => r.id === req.id) === idx
      );

      const requesterIds = [...new Set(uniqueRequests.map(r => r.requester_id))];
      const rideIds = [...new Set(uniqueRequests.map(r => r.ride_id))];

      // Fetch users and rides separately
      let userMap: Record<string, any> = {};
      let rideMap: Record<string, any> = {};

      if (requesterIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, name, avatar_url, trust_score, verified')
          .in('id', requesterIds);
        
        usersData?.forEach(u => { userMap[u.id] = u; });
      }

      if (rideIds.length > 0) {
        const { data: ridesData } = await supabase
          .from('rides')
          .select('id, from_location, to_location, poster_id')
          .in('id', rideIds);
        
        ridesData?.forEach(r => { rideMap[r.id] = r; });
      }

      // Map requester and ride data to requests
      const mappedRequests = uniqueRequests.map(req => ({
        ...req,
        requester: userMap[req.requester_id] || null,
        ride: rideMap[req.ride_id] || null,
      }));

      setRequests(mappedRequests);
    } catch (err: any) {
      console.error('Error fetching join requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRequests();

    // Use a unique channel name to avoid conflicts when multiple screens use this hook
    const channelName = `join_requests_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'join_requests',
          filter: `requester_id=eq.${user?.id}`,
        },
        () => fetchRequests()
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [fetchRequests, user?.id]);

  const createRequest = async ({ rideId }: CreateJoinRequestParams) => {
    if (!user) throw new Error('Must be logged in to request to join a ride');

    try {
      const { data, error } = await supabase
        .from('join_requests')
        .insert({
          ride_id: rideId,
          requester_id: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Send push notification to ride poster
      await sendJoinRequestNotification(rideId, user.name);

      return data;
    } catch (err: any) {
      console.error('Error creating join request:', err);
      throw new Error(err.message || 'Failed to send join request');
    }
  };

  const sendJoinRequestNotification = async (rideId: string, requesterName: string) => {
    try {
      // Get ride details to find poster
      const { data: ride } = await supabase
        .from('rides')
        .select('poster_id, to_location')
        .eq('id', rideId)
        .single();

      if (!ride) return;

      // Call the send-notification edge function
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: ride.poster_id,
          title: 'New Join Request',
          body: `${requesterName} wants to join your ride to ${ride.to_location}`,
          category: 'ride_requests',
          data: { rideId, type: 'join_request' },
        }),
      });

      if (!response.ok) {
        console.error('Failed to send push notification:', await response.text());
      }
    } catch (err) {
      console.error('Error sending push notification:', err);
    }
  };

  const sendRequestAcceptedNotification = async (requestId: string, rideId: string) => {
    try {
      const [rideResult, requestResult] = await Promise.all([
        supabase.from('rides').select('poster_id, to_location').eq('id', rideId).single(),
        supabase.from('join_requests').select('requester_id').eq('id', requestId).single(),
      ]);

      if (!rideResult.data || !requestResult.data) return;

      const ride = rideResult.data;
      const request = requestResult.data;

      const { data: poster } = await supabase
        .from('users')
        .select('name')
        .eq('id', ride.poster_id)
        .single();

      if (!poster) return;

      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: request.requester_id,
          title: 'Request Accepted',
          body: `${poster.name} accepted your request to join their ride to ${ride.to_location}`,
          category: 'ride_requests',
          data: { rideId, type: 'request_accepted' },
        }),
      });
    } catch (err) {
      console.error('Error sending accept notification:', err);
    }
  };

  const respondToRequest = async (requestId: string, response: 'accepted' | 'declined', message?: string) => {
    try {
      const { data: requestData, error: fetchError } = await supabase
        .from('join_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError || !requestData) throw new Error('Request not found');

      // Fetch ride info for poster_id and location
      const { data: ride } = await supabase
        .from('rides')
        .select('poster_id, from_location, to_location, seats_taken')
        .eq('id', requestData.ride_id)
        .single();

      if (!ride) throw new Error('Ride not found');

      const updates: any = {
        status: response,
        responded_at: new Date().toISOString(),
      };

      if (message) {
        updates.response_message = message;
      }

      const { error } = await supabase
        .from('join_requests')
        .update(updates)
        .eq('id', requestId);

      if (error) throw error;

      // If accepted, add to ride participants and create chat
      if (response === 'accepted') {
        // Create ride_participants record for requester
        await supabase.from('ride_participants').insert({
          ride_id: requestData.ride_id,
          user_id: requestData.requester_id,
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        });

        // Create ride_participants record for poster (upsert in case they already have one)
        await supabase.from('ride_participants').upsert({
          ride_id: requestData.ride_id,
          user_id: ride.poster_id,
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        }, { onConflict: 'ride_id,user_id' });

        // Increment seats_taken on the ride
        await supabase
          .from('rides')
          .update({ seats_taken: (ride.seats_taken || 0) + 1 })
          .eq('id', requestData.ride_id);

        // Create chat if it doesn't exist
        const { data: existingChat } = await supabase
          .from('chats')
          .select('id')
          .eq('ride_id', requestData.ride_id)
          .maybeSingle();

        if (!existingChat) {
          await supabase.from('chats').insert({
            ride_id: requestData.ride_id,
            ride_from: ride.from_location,
            ride_to: ride.to_location,
            requester_id: requestData.requester_id,
            poster_id: ride.poster_id,
          });
        }

        // Send push notification to requester
        await sendRequestAcceptedNotification(requestId, requestData.ride_id);
      }

      await fetchRequests();
    } catch (err: any) {
      console.error('Error responding to request:', err);
      throw new Error(err.message || 'Failed to respond to request');
    }
  };

  const cancelRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('join_requests')
        .update({ status: 'cancelled', responded_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;
      await fetchRequests();
    } catch (err: any) {
      console.error('Error cancelling request:', err);
      throw new Error(err.message || 'Failed to cancel request');
    }
  };

  const getMyRequestsForRide = async (rideId: string) => {
    if (!user) return [];

    const { data } = await supabase
      .from('join_requests')
      .select('*')
      .eq('ride_id', rideId)
      .eq('requester_id', user.id)
      .maybeSingle();

    return data;
  };

  const getRequestsForMyRide = async (rideId: string) => {
    const { data: requests, error } = await supabase
      .from('join_requests')
      .select('*')
      .eq('ride_id', rideId)
      .eq('status', 'pending')
      .order('requested_at', { ascending: true });

    if (error || !requests) return [];

    const requesterIds = requests.map(r => r.requester_id);
    let userMap: Record<string, any> = {};

    if (requesterIds.length > 0) {
      const { data: usersData } = await supabase
        .from('users')
        .select('id, name, avatar_url, trust_score, verified, gender')
        .in('id', requesterIds);
      
      usersData?.forEach(u => { userMap[u.id] = u; });
    }

    return requests.map(req => ({
      ...req,
      requester: userMap[req.requester_id] || null,
    }));
  };

  return {
    requests,
    loading,
    error,
    createRequest,
    respondToRequest,
    cancelRequest,
    getMyRequestsForRide,
    getRequestsForMyRide,
    refresh: fetchRequests,
  };
}
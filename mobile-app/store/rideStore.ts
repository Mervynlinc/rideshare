import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Ride, PostRideData } from '../types';

const POSTER_COLORS = ['#E91E63', '#2196F3', '#9C27B0', '#FF5722', '#00BCD4', '#4CAF50', '#FF9800', '#795348'];

function posterColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return POSTER_COLORS[Math.abs(hash) % POSTER_COLORS.length];
}

function toRide(db: any, poster: any): Ride {
  const name = poster?.name ?? 'Unknown';
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return {
    id: db.id,
    posterId: db.poster_id,
    campus: poster?.campus_short ?? poster?.campusShort ?? '',
    poster: {
      name,
      initials,
      trust: poster?.trust_score ?? poster?.trust ?? 0,
      verified: poster?.verified || false,
      gender: poster?.gender ?? '',
      color: posterColor(poster?.id ?? ''),
      avatar_url: poster?.avatar_url ?? poster?.avatarUrl ?? null,
    },
    from: db.from_location,
    to: db.to_location,
    departureType: db.departure_type,
    scheduledDate: db.scheduled_date,
    scheduledTime: db.scheduled_time,
    expiresAt: db.expires_at,
    seatsTotal: db.seats_total,
    seatsTaken: db.seats_taken,
    genderPreference: db.gender_preference,
    mode: db.mode,
    postedAt: new Date(db.posted_at),
    status: db.status,
  };
}

interface RideState {
  rides: Ride[];
  loading: boolean;
  removingIds: string[];
  universityId: string | null;
  setUniversityId: (id: string | null) => void;
  fetchRides: () => Promise<void>;
  fetchRideById: (rideId: string) => Promise<Ride | null>;
  postRide: (data: PostRideData, posterUser: any) => Promise<Ride | null>;
  completeRide: (rideId: string) => Promise<void>;
  cancelRide: (rideId: string) => Promise<void>;
}

export const useRideStore = create<RideState>((set, get) => ({
  rides: [],
  loading: true,
  removingIds: [],
  universityId: null,

  setUniversityId: (id) => set({ universityId: id }),

  fetchRides: async () => {
    const { universityId } = get();
    if (!universityId) {
      set({ loading: false });
      return;
    }

    try {
      const { data: ridesData, error: ridesError } = await supabase
        .from('rides')
        .select(`
          *,
          poster:poster_id (
            id,
            name,
            gender,
            trust_score,
            avatar_url
          )
        `)
        .eq('university_id', universityId)
        .eq('status', 'active')
        .order('posted_at', { ascending: false });

      if (ridesError) throw ridesError;

      const now = new Date().toISOString();
      const validRides = (ridesData || []).filter((r: any) => !r.expires_at || r.expires_at > now);

      const mapped = validRides.map((r: any) => toRide(r, r.poster));

      set({ rides: mapped });
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchRideById: async (rideId) => {
    try {
      const { data: rideData, error: rideError } = await supabase
        .from('rides')
        .select(`
          *,
          poster:poster_id (
            id,
            name,
            gender,
            trust_score,
            avatar_url
          )
        `)
        .eq('id', rideId)
        .single();

      if (rideError) throw rideError;

      const now = new Date().toISOString();
      if (rideData.expires_at && rideData.expires_at <= now && rideData.status === 'active') {
        await supabase
          .from('rides')
          .update({ status: 'cancelled', cancelled_at: now })
          .eq('id', rideId);
        return null;
      }

      return toRide(rideData, rideData.poster);
    } catch (error) {
      console.error('Error fetching ride:', error);
      return null;
    }
  },

  postRide: async (data, posterUser) => {
    if (!posterUser) return null;

    const scheduledDate = data.departureType === 'scheduled' && data.scheduledDate
      ? data.scheduledDate.toISOString().split('T')[0]
      : null;

    const scheduledTime = data.departureType === 'scheduled' && data.scheduledTime
      ? data.scheduledTime
      : null;

    const insertData: any = {
      poster_id: posterUser.id,
      university_id: posterUser.universityId,
      from_location: data.from,
      to_location: data.to,
      departure_type: data.departureType,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      seats_total: data.seats,
      seats_taken: 0,
      gender_preference: data.genderPreference,
      mode: data.mode,
    };

    if (data.departureType === 'immediate') {
      const minutes = data.expiresInMinutes || 480;
      const expiresAt = new Date(Date.now() + minutes * 60000).toISOString();
      insertData.expires_at = expiresAt;
    }

    const { data: newRide, error } = await supabase
      .from('rides')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error posting ride:', error);
      return null;
    }

    const ride = toRide(newRide, posterUser);
    set((state) => ({ rides: [ride, ...state.rides] }));

    supabase.functions.invoke('notify-new-ride', {
      body: {
        posterId: posterUser.id,
        universityId: posterUser.universityId,
        posterName: posterUser.name,
        from: data.from,
        to: data.to,
        rideId: newRide.id,
      },
    }).catch((err) => console.warn('Failed to notify university:', err));

    return ride;
  },

  completeRide: async (rideId) => {
    const { error } = await supabase.rpc('complete_ride', { p_ride_id: rideId });

    if (error) {
      console.error('Error completing ride via RPC:', error);
      throw error;
    }

    set((state) => ({ removingIds: [...state.removingIds, rideId] }));

    setTimeout(() => {
      set((state) => ({
        rides: state.rides.filter((r) => r.id !== rideId),
        removingIds: state.removingIds.filter((id) => id !== rideId),
      }));
    }, 300);
  },

  cancelRide: async (rideId) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUser = sessionData?.session?.user;
    const authUid = sessionUser?.id;

    if (!authUid) {
      console.error('Cancel ride failed: no authenticated session');
      throw new Error('You must be logged in to cancel a ride.');
    }

    const { data, error } = await supabase.rpc('cancel_ride', {
      p_ride_id: rideId,
    });

    if (error) {
      console.error('Error cancelling ride via RPC:', error);
      throw error;
    }

    if (!data) {
      console.error('Cancel ride failed: RPC returned false.', {
        authUid,
        rideId,
      });
      throw new Error('Failed to cancel ride. You may not have permission.');
    }

    set((state) => ({ removingIds: [...state.removingIds, rideId] }));

    setTimeout(() => {
      set((state) => ({
        rides: state.rides.filter((r) => r.id !== rideId),
        removingIds: state.removingIds.filter((id) => id !== rideId),
      }));
    }, 300);
  },
}));

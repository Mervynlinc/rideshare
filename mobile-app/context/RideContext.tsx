import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Ride, PostRideData } from '../types';
import { useRideStore } from '../store/rideStore';

interface RideContextType {
  rides: Ride[];
  loading: boolean;
  removingIds: string[];
  fetchRides: () => Promise<void>;
  fetchRideById: (rideId: string) => Promise<Ride | null>;
  postRide: (data: PostRideData) => Promise<Ride | null>;
  cancelRide: (rideId: string) => Promise<void>;
  completeRide: (rideId: string) => Promise<void>;
}

const RideContext = createContext<RideContextType | null>(null);

export function RideProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const rides = useRideStore((s) => s.rides);
  const loading = useRideStore((s) => s.loading);
  const removingIds = useRideStore((s) => s.removingIds);
  const setUniversityId = useRideStore((s) => s.setUniversityId);
  const fetchRides = useRideStore((s) => s.fetchRides);
  const fetchRideById = useRideStore((s) => s.fetchRideById);
  const postRideStore = useRideStore((s) => s.postRide);
  const cancelRideStore = useRideStore((s) => s.cancelRide);
  const completeRideStore = useRideStore((s) => s.completeRide);

  const universityId = useRideStore((s) => s.universityId);

  useEffect(() => {
    setUniversityId(user?.universityId || null);
  }, [user?.universityId, setUniversityId]);

  useEffect(() => {
    if (universityId) {
      fetchRides();
    }
  }, [universityId, fetchRides]);

  const postRide = async (data: PostRideData): Promise<Ride | null> => {
    return postRideStore(data, user);
  };

  const cancelRide = async (rideId: string) => {
    return cancelRideStore(rideId);
  };

  const completeRide = async (rideId: string) => {
    return completeRideStore(rideId);
  };

  return (
    <RideContext.Provider value={{ rides, loading, removingIds, fetchRides, fetchRideById, postRide, cancelRide, completeRide }}>
      {children}
    </RideContext.Provider>
  );
}

export function useRideContext() {
  const context = useContext(RideContext);
  if (!context) {
    throw new Error('useRideContext must be used within a RideProvider');
  }
  return context;
}

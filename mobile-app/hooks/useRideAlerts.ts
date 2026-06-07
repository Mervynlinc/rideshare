import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthProvider';
import { RideAlert } from '../types';

export function useRideAlerts() {
  const [alerts, setAlerts] = useState<RideAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAlerts = useCallback(async () => {
    if (!user) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ride_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ride alerts:', error);
        return;
      }

      setAlerts((data || []).map((a: any) => ({
        id: a.id,
        userId: a.user_id,
        universityId: a.university_id,
        fromLocation: a.from_location,
        toLocation: a.to_location,
        active: a.active,
        createdAt: a.created_at,
      })));
    } catch (error) {
      console.error('Error fetching ride alerts:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const addAlert = async (fromLocation: string | null, toLocation: string | null) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('ride_alerts')
      .insert({
        user_id: user.id,
        university_id: user.universityId,
        from_location: fromLocation || null,
        to_location: toLocation || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating ride alert:', error);
      return null;
    }

    const newAlert: RideAlert = {
      id: data.id,
      userId: data.user_id,
      universityId: data.university_id,
      fromLocation: data.from_location,
      toLocation: data.to_location,
      active: data.active,
      createdAt: data.created_at,
    };

    setAlerts((prev) => [newAlert, ...prev]);
    return newAlert;
  };

  const toggleAlert = async (id: string, active: boolean) => {
    const { error } = await supabase
      .from('ride_alerts')
      .update({ active })
      .eq('id', id);

    if (error) {
      console.error('Error toggling ride alert:', error);
      return;
    }

    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active } : a))
    );
  };

  const deleteAlert = async (id: string) => {
    const { error } = await supabase
      .from('ride_alerts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting ride alert:', error);
      return;
    }

    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return {
    alerts,
    loading,
    addAlert,
    toggleAlert,
    deleteAlert,
    refresh: fetchAlerts,
  };
}
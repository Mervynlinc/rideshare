import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

interface NotifyNewRideRequest {
  posterId: string;
  universityId: string;
  posterName: string;
  from: string;
  to: string;
  rideId: string;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { posterId, universityId, posterName, from, to, rideId }: NotifyNewRideRequest = await req.json();

    if (!posterId || !universityId || !posterName || !from || !to || !rideId) {
      return new Response('Missing required fields', { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('university_id', universityId)
      .neq('id', posterId);

    if (usersError) {
      console.error('Error fetching university users:', usersError);
      return new Response('Error fetching users', { status: 500 });
    }

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userIds = users.map((u: any) => u.id);

    const { data: preferences, error: prefError } = await supabase
      .from('notification_preferences')
      .select('user_id, push_enabled, ride_updates')
      .in('user_id', userIds);

    if (prefError) {
      console.error('Error fetching preferences:', prefError);
      return new Response('Error fetching preferences', { status: 500 });
    }

    const eligibleUserIds = (preferences || [])
      .filter((p: any) => p.push_enabled !== false && p.ride_updates !== false)
      .map((p: any) => p.user_id);

    if (eligibleUserIds.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: 'No eligible users' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('token')
      .in('user_id', eligibleUserIds);

    if (tokensError) {
      console.error('Error fetching push tokens:', tokensError);
      return new Response('Error fetching tokens', { status: 500 });
    }

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: 'No tokens found' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const messages = tokens.map((t: any) => ({
      to: t.token,
      sound: 'default',
      title: 'New Ride Available',
      body: `${posterName} is going from ${from} to ${to}`,
      data: {
        type: 'info',
        icon: 'bicycle',
        title: 'New Ride Available',
        description: `${posterName} is going from ${from} to ${to}`,
        category: 'ride_updates',
        rideId,
      },
    }));

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });

    const result = await response.json();

    return new Response(JSON.stringify({ sent: messages.length, result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in notify-new-ride function:', error);
    return new Response('Internal server error', { status: 500 });
  }
});

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Fetch ride_alerts matching this ride's route
    const fromLower = from.toLowerCase();
    const toLower = to.toLowerCase();

    const { data: alerts, error: alertsError } = await supabase
      .from('ride_alerts')
      .select('user_id')
      .eq('university_id', universityId)
      .eq('active', true)
      .in('user_id', userIds);

    if (alertsError) {
      console.error('Error fetching ride alerts:', alertsError);
    }

    // Match alerts where from/to locations match (case-insensitive, NULL = match any)
    const alertUserIds = new Set<string>();
    for (const alert of (alerts || [])) {
      const matchFrom = !alert.from_location || alert.from_location.toLowerCase() === fromLower;
      const matchTo = !alert.to_location || alert.to_location.toLowerCase() === toLower;
      if (matchFrom && matchTo) {
        alertUserIds.add(alert.user_id);
      }
    }

    // Fetch notification preferences for all users
    const { data: preferences, error: prefError } = await supabase
      .from('notification_preferences')
      .select('user_id, push_enabled, ride_updates')
      .in('user_id', userIds);

    if (prefError) {
      console.error('Error fetching preferences:', prefError);
      return new Response('Error fetching preferences', { status: 500 });
    }

    const prefsByUser = new Map((preferences || []).map((p: any) => [p.user_id, p]));

    // A user is eligible if they have push notifications enabled
    const isEligible = (uid: string) => {
      const p = prefsByUser.get(uid);
      return p && p.push_enabled !== false && p.ride_updates !== false;
    };

    const eligibleAlertUsers = [...alertUserIds].filter(isEligible);
    const eligibleBroadcastUsers = userIds.filter(
      (id: string) => !alertUserIds.has(id) && isEligible(id)
    );

    const { data: allTokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('token, user_id')
      .in('user_id', [...eligibleAlertUsers, ...eligibleBroadcastUsers]);

    if (tokensError) {
      console.error('Error fetching push tokens:', tokensError);
      return new Response('Error fetching tokens', { status: 500 });
    }

    if (!allTokens || allTokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: 'No tokens found' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const alertTokenSet = new Set(eligibleAlertUsers);
    const alertTokens = allTokens.filter((t: any) => alertTokenSet.has(t.user_id));
    const broadcastTokens = allTokens.filter((t: any) => !alertTokenSet.has(t.user_id));

    const messages: any[] = [];

    for (const t of alertTokens) {
      messages.push({
        to: t.token,
        sound: 'default',
        title: 'Ride Alert Match',
        body: `${posterName} is going from ${from} to ${to}`,
        data: {
          type: 'success',
          icon: 'bicycle',
          title: 'Ride Alert Match',
          description: `${posterName} is going from ${from} to ${to}`,
          category: 'ride_updates',
          rideId,
          matched: true,
        },
      });
    }

    for (const t of broadcastTokens) {
      messages.push({
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
      });
    }

    if (messages.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: 'No messages to send' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });

    const result = await response.json();

    return new Response(JSON.stringify({
      sent: messages.length,
      alertMatches: alertTokens.length,
      broadcast: broadcastTokens.length,
      result,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in notify-new-ride function:', error);
    return new Response('Internal server error', { status: 500 });
  }
});

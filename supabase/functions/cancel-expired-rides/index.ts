import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req: Request) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: expiredRides, error: fetchError } = await supabase
      .from('rides')
      .select('id, poster_id, from_location, to_location')
      .eq('status', 'active')
      .lt('expires_at', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching expired rides:', fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
    }

    if (!expiredRides || expiredRides.length === 0) {
      return new Response(JSON.stringify({ cancelled: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const rideIds = expiredRides.map((r) => r.id);

    const { error: updateError } = await supabase
      .from('rides')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: 'expired',
      })
      .in('id', rideIds);

    if (updateError) {
      console.error('Error cancelling expired rides:', updateError);
      return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
    }

    const posterIds = [...new Set(expiredRides.map((r) => r.poster_id))];

    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('token, user_id')
      .in('user_id', posterIds);

    if (tokensError) {
      console.error('Error fetching push tokens:', tokensError);
      return new Response(JSON.stringify({ error: tokensError.message }), { status: 500 });
    }

    const rideByPoster = new Map<string, typeof expiredRides[0]>();
    for (const ride of expiredRides) {
      if (!rideByPoster.has(ride.poster_id)) {
        rideByPoster.set(ride.poster_id, ride);
      }
    }

    const messages = (tokens || []).map((t) => {
      const ride = rideByPoster.get(t.user_id);
      return {
        to: t.token,
        sound: 'default',
        title: 'Ride Expired',
        body: ride
          ? `Your ride from ${ride.from_location} to ${ride.to_location} has been auto-cancelled.`
          : 'One of your rides has been auto-cancelled.',
        data: {
          type: 'warning',
          icon: 'time-outline',
          title: 'Ride Expired',
          description: ride
            ? `Your ride from ${ride.from_location} to ${ride.to_location} has been auto-cancelled.`
            : 'One of your rides has been auto-cancelled.',
          category: 'ride_updates',
          rideId: ride?.id,
        },
      };
    });

    if (messages.length > 0) {
      const pushResponse = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messages),
      });

      const pushResult = await pushResponse.json();
      console.log('Push sent:', messages.length, 'notifications, result:', JSON.stringify(pushResult));
    }

    return new Response(
      JSON.stringify({ cancelled: rideIds.length, notified: messages.length }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in cancel-expired-rides function:', error);
    return new Response('Internal server error', { status: 500 });
  }
});

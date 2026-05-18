import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

interface SendNotificationRequest {
  userId: string;
  title: string;
  body: string;
  data?: any;
  category: string;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { userId, title, body, data, category }: SendNotificationRequest = await req.json();

    if (!userId || !title || !body || !category) {
      return new Response('Missing required fields', { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: preferences, error: preferencesError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (preferencesError) {
      console.error('Error fetching notification preferences:', preferencesError);
      return new Response('Error fetching preferences', { status: 500 });
    }

    if (!preferences) {
      console.log('No notification preferences found for user:', userId);
      return new Response(JSON.stringify({ skipped: true, reason: 'No preferences found' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!preferences.push_enabled) {
      console.log('Push notifications disabled for user:', userId);
      return new Response(JSON.stringify({ skipped: true, reason: 'Push notifications disabled' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const categoryKey = category.toLowerCase().replace(/ /g, '_');
    const categoryEnabled = preferences[categoryKey as keyof typeof preferences];

    if (categoryEnabled === false) {
      console.log(`Category ${category} disabled for user:`, userId);
      return new Response(JSON.stringify({ skipped: true, reason: 'Category disabled' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', userId);

    if (tokensError) {
      console.error('Error fetching push tokens:', tokensError);
      return new Response('Error fetching tokens', { status: 500 });
    }

    if (!tokens || tokens.length === 0) {
      console.log('No push tokens found for user:', userId);
      return new Response(JSON.stringify({ skipped: true, reason: 'No tokens found' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const messages = tokens.map((tokenObj) => ({
      to: tokenObj.token,
      sound: 'default',
      title,
      body,
      data: data || {},
    }));

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-notification function:', error);
    return new Response('Internal server error', { status: 500 });
  }
});

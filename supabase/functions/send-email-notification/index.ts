import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const resendApiKey = Deno.env.get('RESEND_API_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const payload = await req.json();
    const notification = payload.record; // The new notification from DB Webhook

    if (!notification || !notification.user_id) {
        return new Response('No notification record provided', { status: 400 });
    }

    // 1. Fetch User Preferences and Email
    const { data: user } = await supabase.from('users').select('email').eq('id', notification.user_id).single();
    const { data: prefs } = await supabase.from('user_preferences').select('email_enabled').eq('user_id', notification.user_id).single();

    if (!user || prefs?.email_enabled === false) {
      return new Response("Email disabled for this user", { status: 200, headers: corsHeaders });
    }

    // 2. Send Email via Resend
    if (!resendApiKey) {
        console.warn('RESEND_API_KEY is not set, skipping email sending.');
        return new Response("Email skipped, no API key", { status: 200, headers: corsHeaders });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Suraj Sewing <notifications@surajsewing.com>',
        to: user.email,
        subject: notification.title,
        html: `<p>${notification.message}</p>`
      })
    });

    if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Failed to send email: ${errorBody}`);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (error: any) {
    console.error('Email sending error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});

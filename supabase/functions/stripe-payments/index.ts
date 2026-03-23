import Stripe from "npm:stripe@12.12.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET') ?? '';
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const stripe = new Stripe(STRIPE_SECRET, { apiVersion: '2022-11-15' });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('stripe-payments function initialized');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok');

  const signature = req.headers.get('stripe-signature') || '';
  const body = await req.arrayBuffer();
  let event;
  try {
    event = stripe.webhooks.constructEvent(new Uint8Array(body), signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed', err.message);
    return new Response('Invalid signature', { status: 400 });
  }

  try {
    // Basic handling for common events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await supabase.from('stripe_events').insert([{ id: event.id, type: event.type, data: session }]);
      
      if (session.client_reference_id) {
        await supabase
          .from('orders')
          .update({ is_paid: true, status: 'processing' })
          .eq('id', session.client_reference_id);
      }
    } else if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      await supabase.from('stripe_events').insert([{ id: event.id, type: event.type, data: pi }]);
    } else if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      await supabase.from('stripe_events').insert([{ id: event.id, type: event.type, data: invoice }]);
    } else {
      // store other events for auditing
      await supabase.from('stripe_events').insert([{ id: event.id, type: event.type, data: event.data.object }]);
    }
  } catch (err) {
    console.error('Error processing event', err.message);
    return new Response('Processing error', { status: 500 });
  }

  return new Response('Received', { status: 200 });
});

import Stripe from "npm:stripe@12.12.0";
import { corsHeaders } from '../_shared/cors.ts';

const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET') ?? '';
// Note: apiVersion should ideally match the version of the Stripe Node package.
const stripe = new Stripe(STRIPE_SECRET, { apiVersion: '2022-11-15' });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { items, orderId, returnUrl } = await req.json();

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.name || item.title || 'Product',
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects amount in the smallest currency unit (paise for INR)
      },
      quantity: item.qty || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${returnUrl}?success=true&order=${orderId}`,
      cancel_url: `${returnUrl}?canceled=true`,
      client_reference_id: orderId,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

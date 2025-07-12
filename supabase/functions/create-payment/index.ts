import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import Stripe from 'npm:stripe@14.14.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planId, paymentMethod } = await req.json();

    // Create payment intent based on plan
    const paymentIntent = await stripe.paymentIntents.create({
      amount: getPlanAmount(planId),
      currency: 'eur',
      payment_method_types: ['card'],
      metadata: {
        planId,
      },
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { 
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});

function getPlanAmount(planId: string): number {
  const prices = {
    basic: 2999,    // 29.99€
    pro: 4999,      // 49.99€
    enterprise: 9999 // 99.99€
  };
  return prices[planId as keyof typeof prices] || 4999;
}
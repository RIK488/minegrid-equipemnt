import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

interface PaymentRequest {
  planType: 'premium' | 'pro' | 'enterprise';
  customerEmail: string;
  customerName?: string;
}

interface PaymentResponse {
  clientSecret: string | null;
  paymentIntentId: string;
}

interface ErrorResponse {
  error: string;
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { planType, customerEmail, customerName }: PaymentRequest = await req.json()

    // Validation des données
    if (!planType || !customerEmail) {
      throw new Error('Plan type and customer email are required')
    }

    // Définir le montant selon le plan
    let amount: number
    let description: string
    switch (planType) {
      case 'premium':
        amount = 4900 // 49€ en centimes
        description = 'Abonnement Premium - Minegrid Équipement'
        break
      case 'pro':
        amount = 14900 // 149€ en centimes
        description = 'Abonnement Pro - Minegrid Équipement'
        break
      case 'enterprise':
        amount = 49900 // 499€ en centimes
        description = 'Abonnement Enterprise - Minegrid Équipement'
        break
      default:
        throw new Error('Invalid plan type')
    }

    // Créer le Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      description,
      metadata: {
        planType,
        customerEmail,
        customerName: customerName || 'Unknown'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    const response: PaymentResponse = {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error creating payment intent:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const errorResponse: ErrorResponse = { error: errorMessage }
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { organizationId } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get organization's subscription with Stripe customer ID
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('organization_id', organizationId)
      .single()

    if (subError || !subscription?.stripe_customer_id) {
      throw new Error('No active subscription found for this organization')
    }

    const stripe = new (await import('https://esm.sh/stripe@13.10.0')).default(
      Deno.env.get('STRIPE_SECRET_KEY') ?? '',
      { apiVersion: '2023-10-16' }
    )

    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${req.headers.get('origin')}/manage/organization/${organizationId}?tab=subscription`,
    })

    return new Response(
      JSON.stringify({ portal_url: portalSession.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error creating customer portal session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
}) 
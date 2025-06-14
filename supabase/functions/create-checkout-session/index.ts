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
    const { tier, organizationId } = await req.json()
    
    console.log('Create checkout session request:', { tier, organizationId })
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get tier details
    console.log('Fetching tier details for:', tier)
    const { data: tierData, error: tierError } = await supabaseClient
      .from('subscription_tiers')
      .select('*')
      .eq('name', tier)
      .single()

    console.log('Tier query result:', { tierData, tierError })

    if (tierError || !tierData) {
      console.error('Tier error:', tierError)
      throw new Error(`Invalid subscription tier: ${tier}. Available tiers should be: basic, standard, premium`)
    }

    // Skip Stripe for basic tier (free)
    if (tier === 'basic') {
      console.log('Processing basic tier activation for organization:', organizationId)
      
      // Update organization to basic tier
      const { error: updateError } = await supabaseClient
        .from('organizations')
        .update({ 
          current_tier: 'basic',
          subscription_status: 'active'
        })
        .eq('id', organizationId)

      if (updateError) {
        console.error('Error updating organization:', updateError)
        throw updateError
      }

      console.log('Basic tier activated successfully')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Basic tier activated',
          redirect_url: '/dashboard'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log('Processing paid tier:', tier)

    const stripe = new (await import('https://esm.sh/stripe@13.10.0')).default(
      Deno.env.get('STRIPE_SECRET_KEY') ?? '',
      { apiVersion: '2023-10-16' }
    )

    // Create checkout session
    console.log('Creating Stripe checkout session')
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tierData.display_name,
              description: tierData.description,
            },
            unit_amount: tierData.price_monthly,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/dashboard?success=true`,
      cancel_url: `${req.headers.get('origin')}/dashboard?canceled=true`,
      metadata: {
        organization_id: organizationId,
        tier: tier,
      },
    })

    console.log('Stripe session created successfully:', session.id)

    return new Response(
      JSON.stringify({ checkout_url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString(),
        stack: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

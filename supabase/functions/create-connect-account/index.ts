
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get organization details
    const { data: org, error: orgError } = await supabaseClient
      .from('organizations')
      .select('name, id')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      throw new Error('Organization not found')
    }

    const stripe = new (await import('https://esm.sh/stripe@13.10.0')).default(
      Deno.env.get('STRIPE_SECRET_KEY') ?? '',
      { apiVersion: '2023-10-16' }
    )

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'standard',
      country: 'US',
      email: req.headers.get('user-email') || undefined,
      business_profile: {
        name: org.name,
      },
    })

    // Save account to database
    const { error: insertError } = await supabaseClient
      .from('stripe_integrations')
      .insert({
        organization_id: organizationId,
        stripe_account_id: account.id,
      })

    if (insertError) throw insertError

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${req.headers.get('origin')}/donations/setup?refresh=true`,
      return_url: `${req.headers.get('origin')}/donations/setup?success=true`,
      type: 'account_onboarding',
    })

    return new Response(
      JSON.stringify({ 
        account_id: account.id,
        account_link: accountLink.url 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error creating Connect account:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

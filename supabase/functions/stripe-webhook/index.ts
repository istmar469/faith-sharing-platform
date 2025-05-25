
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new (await import('https://esm.sh/stripe@13.10.0')).default(
  Deno.env.get('STRIPE_SECRET_KEY') ?? '',
  { apiVersion: '2023-10-16' }
)

const cryptoProvider = Deno.createHttpClient()
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()
  let receivedEvent

  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
      undefined,
      cryptoProvider
    )
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message)
    return new Response(err.message, { status: 400 })
  }

  console.log(`Received event: ${receivedEvent.type}`)

  try {
    switch (receivedEvent.type) {
      case 'checkout.session.completed':
        const session = receivedEvent.data.object
        await handleSuccessfulPayment(session)
        break
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = receivedEvent.data.object
        await handleSubscriptionChange(subscription)
        break
      
      default:
        console.log(`Unhandled event type: ${receivedEvent.type}`)
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook handler failed' }),
      { status: 400 }
    )
  }
})

async function handleSuccessfulPayment(session: any) {
  const organizationId = session.metadata.organization_id
  const tier = session.metadata.tier

  if (!organizationId || !tier) {
    console.error('Missing metadata in session:', session.metadata)
    return
  }

  // Update organization with new tier
  const { error } = await supabaseClient
    .from('organizations')
    .update({ 
      current_tier: tier,
      subscription_status: 'active'
    })
    .eq('id', organizationId)

  if (error) {
    console.error('Error updating organization tier:', error)
    throw error
  }

  console.log(`Organization ${organizationId} upgraded to ${tier}`)
}

async function handleSubscriptionChange(subscription: any) {
  // Find organization by customer ID
  const { data: organizations, error } = await supabaseClient
    .from('subscriptions')
    .select('organization_id')
    .eq('stripe_customer_id', subscription.customer)

  if (error || !organizations?.length) {
    console.error('Could not find organization for customer:', subscription.customer)
    return
  }

  const organizationId = organizations[0].organization_id
  let newTier = 'basic'
  let status = 'active'

  // Determine tier and status based on subscription
  if (subscription.status === 'active') {
    // Get tier from subscription metadata or price
    const priceId = subscription.items.data[0]?.price?.id
    
    // Map price IDs to tiers (you'll need to set these up in Stripe)
    if (priceId) {
      const { data: tierData } = await supabaseClient
        .from('subscription_tiers')
        .select('name')
        .or(`price_monthly.eq.${subscription.items.data[0].price.unit_amount},price_yearly.eq.${subscription.items.data[0].price.unit_amount}`)
        .single()
      
      if (tierData) {
        newTier = tierData.name
      }
    }
  } else {
    status = subscription.status
    newTier = 'basic' // Downgrade to basic on inactive subscription
  }

  // Update organization
  const { error: updateError } = await supabaseClient
    .from('organizations')
    .update({ 
      current_tier: newTier,
      subscription_status: status
    })
    .eq('id', organizationId)

  if (updateError) {
    console.error('Error updating organization subscription:', updateError)
    throw updateError
  }

  console.log(`Organization ${organizationId} subscription updated: ${newTier} (${status})`)
}


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

  console.log(`Received event: ${receivedEvent.type}, Account: ${receivedEvent.account || 'Platform'}`)

  try {
    if (receivedEvent.account) {
      // Event is from a Connected Account (Tenant Donation)
      console.log(`Processing event for connected account: ${receivedEvent.account}`);
      await handleTenantDonation(receivedEvent, receivedEvent.account);
    } else {
      // Event is for the Platform
      console.log(`Processing event for platform account.`);
      switch (receivedEvent.type) {
        case 'checkout.session.completed':
          // This is for platform subscriptions/payments
          const platformSession = receivedEvent.data.object as any; // Cast to any or Stripe.Checkout.Session
          await handleSuccessfulPayment(platformSession);
          break;
        
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const platformSubscription = receivedEvent.data.object as any; // Cast to any or Stripe.Subscription
          await handleSubscriptionChange(platformSubscription);
          break;
        
        default:
          console.log(`Unhandled platform event type: ${receivedEvent.type}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error.message, error.stack);
    return new Response(
      JSON.stringify({ error: 'Webhook handler failed' }),
      { status: 400 }
    )
  }
})

async function handleSuccessfulPayment(session: any) {
  const organizationId = session.metadata?.organization_id; // Added optional chaining
  const tier = session.metadata?.tier;

  if (!organizationId || !tier) {
    console.error('Platform Event: Missing metadata in session for platform subscription:', session.id, session.metadata);
    // Do not throw error for metadata issues here, as it might be a donation checkout session
    // This function should only process platform subscription checkouts.
    // If session.metadata.organization_id is present, it's likely a platform subscription.
    // If not, it might be a donation or other event type not intended for this handler.
    if (!session.metadata?.organization_id) {
        console.log("Platform Event: checkout.session.completed does not seem to be for a platform subscription. organization_id missing in metadata. Skipping.");
        return;
    }
    // If it has organization_id, but not tier, then it's an error.
    if (!tier) {
        console.error('Platform Event: Tier information missing in session metadata for platform subscription:', session.id);
        // Potentially throw an error or handle as a failed subscription update
        return; 
    }
  }
  
  console.log(`Platform Event: Processing successful payment for organization ${organizationId}, tier ${tier}`);

  // Update organization with new tier
  const { error } = await supabaseClient
    .from('organizations')
    .update({ 
      current_tier: tier,
      subscription_status: 'active' // Assuming checkout.session.completed means active
    })
    .eq('id', organizationId);

  if (error) {
    console.error('Platform Event: Error updating organization tier:', error);
    throw error; // Propagate error to be caught by main handler
  }

  console.log(`Platform Event: Organization ${organizationId} tier updated to ${tier}`);
}

async function handleSubscriptionChange(subscription: any) { // Stripe.Subscription
  console.log(`Platform Event: Processing subscription change for customer ${subscription.customer}, status ${subscription.status}`);

  // Find organization by stripe_customer_id (ensure this field exists and is populated in your 'subscriptions' or 'organizations' table)
  // Assuming 'subscriptions' table links stripe_customer_id to your internal organization_id
  const { data: subscriptionRecord, error: subRecordError } = await supabaseClient
    .from('subscriptions') // This table should store your platform subscription records
    .select('organization_id, stripe_subscription_id')
    .eq('stripe_subscription_id', subscription.id) // More reliable to match on subscription ID
    .single();

  if (subRecordError || !subscriptionRecord) {
    console.error(`Platform Event: Could not find active subscription record for Stripe subscription ID: ${subscription.id}. Error: ${subRecordError?.message}`);
    // It's possible the subscription was created directly in Stripe or not yet synced.
    // Or, if using stripe_customer_id:
    // const { data: orgData, error: orgError } = await supabaseClient.from('organizations').select('id').eq('stripe_customer_id', subscription.customer).single();
    // if (orgError || !orgData) { console.error(...); return; }
    // const organizationId = orgData.id;
    return; // Exit if no corresponding record, as we cannot link it to an organization
  }

  const organizationId = subscriptionRecord.organization_id;
  let newTierName = 'basic'; // Default to basic/free tier
  let newStatus = subscription.status; // e.g., 'active', 'past_due', 'canceled', 'unpaid'

  if (subscription.status === 'active' || subscription.status === 'trialing') {
    const primaryPriceId = subscription.items?.data[0]?.price?.id;
    if (primaryPriceId) {
      // Fetch tier name associated with this price ID from your 'subscription_tiers' table
      const { data: tierData, error: tierError } = await supabaseClient
        .from('subscription_tiers')
        .select('name')
        .eq('stripe_price_id', primaryPriceId) // Assuming you store stripe_price_id in your tiers table
        .single();
      
      if (tierError) {
        console.error(`Platform Event: Error fetching tier for price ID ${primaryPriceId}:`, tierError);
      } else if (tierData) {
        newTierName = tierData.name;
      } else {
        console.warn(`Platform Event: No tier found for price ID ${primaryPriceId}. Defaulting to basic.`);
      }
    } else {
      console.warn(`Platform Event: Active subscription ${subscription.id} has no price ID. Defaulting to basic.`);
    }
  } else {
    // For non-active statuses (canceled, unpaid, etc.), typically revert to a basic/free tier.
    newTierName = 'basic';
    // If status is 'ended' (Stripe for V2, older versions might use 'canceled' then check cancel_at_period_end)
    // `subscription.cancel_at_period_end` is a boolean. If true and status is active, it will cancel at period end.
    // If status is 'canceled', it's already canceled.
  }
  
  console.log(`Platform Event: Updating organization ${organizationId} to tier ${newTierName}, status ${newStatus}`);

  const { error: updateError } = await supabaseClient
    .from('organizations')
    .update({ 
      current_tier: newTierName,
      subscription_status: newStatus 
    })
    .eq('id', organizationId);

  if (updateError) {
    console.error(`Platform Event: Error updating organization ${organizationId} subscription details:`, updateError);
    throw updateError; // Propagate error
  }

  console.log(`Platform Event: Organization ${organizationId} subscription updated successfully to tier ${newTierName} (${newStatus})`);
}


// --- New Handler for Tenant Donations ---
async function handleTenantDonation(event: any, tenantStripeAccountId: string) { // Stripe.Event, string
  console.log(`Connected Account Event: Processing ${event.type} for account ${tenantStripeAccountId}`);

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  // 1. Find organization_id from tenantStripeAccountId
  const { data: integrationData, error: integrationError } = await supabaseAdmin
    .from('stripe_integrations')
    .select('organization_id')
    .eq('stripe_account_id', tenantStripeAccountId)
    .single();

  if (integrationError || !integrationData) {
    console.error(`Connected Account Event: Stripe integration not found for account ${tenantStripeAccountId}. Error: ${integrationError?.message}`);
    // If we don't find the integration, we can't process the donation.
    // Acknowledge the event to Stripe to prevent retries for this specific issue.
    return new Response(`Stripe integration not found for account ${tenantStripeAccountId}`, { status: 200 });
  }
  const organizationId = integrationData.organization_id;
  console.log(`Connected Account Event: Found organization ${organizationId} for Stripe account ${tenantStripeAccountId}`);

  // 2. Handle 'checkout.session.completed' for donations
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any; // Stripe.Checkout.Session

    // Ensure this is a donation, not something else (e.g. if tenants could use checkout for other things)
    // This can be done via metadata set during checkout creation or by checking line items.
    // For now, we assume any checkout.session.completed on a connected account is a donation.

    const amountTotal = session.amount_total; // Amount in cents
    const currency = session.currency.toLowerCase();
    const paymentIntentId = session.payment_intent; // String or Stripe.PaymentIntent
    const stripeCustomerId = session.customer; // String or Stripe.Customer
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name;
    const donationStatus = session.payment_status === 'paid' ? 'succeeded' : 'pending'; // Or other statuses

    // Extract metadata if you set it during checkout session creation
    const metadata = session.metadata || {};
    // const internalDonationId = metadata.donation_id; // If you created one
    // const clientOrganizationId = metadata.organization_id; // Should match the looked up one

    // Verify that the organization_id from metadata (if present) matches the one we looked up
    if (metadata.organization_id && metadata.organization_id !== organizationId) {
        console.error(`Connected Account Event: Metadata organization_id (${metadata.organization_id}) does not match looked up organization_id (${organizationId}) for account ${tenantStripeAccountId}.`);
        // This could be a security concern or misconfiguration.
        // Decide whether to proceed or return an error/ack. For now, log and proceed with looked-up ID.
    }
    
    console.log(`Connected Account Event: Recording donation for organization ${organizationId}: ${amountTotal} ${currency}`);

    const { error: donationInsertError } = await supabaseAdmin
      .from('donations')
      .insert({
        organization_id: organizationId,
        amount: amountTotal, // Ensure this column type can handle cents or convert to dollars
        currency: currency,
        status: donationStatus,
        stripe_payment_intent_id: typeof paymentIntentId === 'string' ? paymentIntentId : paymentIntentId?.id,
        stripe_customer_id: typeof stripeCustomerId === 'string' ? stripeCustomerId : stripeCustomerId?.id,
        donor_email: customerEmail,
        donor_name: customerName,
        // metadata: metadata, // If your donations table has a JSONB column for metadata
        donation_date: new Date(session.created * 1000), // Convert Stripe timestamp to JS Date
      });

    if (donationInsertError) {
      console.error(`Connected Account Event: Error inserting donation for organization ${organizationId}:`, donationInsertError);
      // Throw error to signal Stripe to retry, or handle specific errors differently.
      throw new Error(`Failed to insert donation: ${donationInsertError.message}`);
    }

    console.log(`Connected Account Event: Donation successfully recorded for organization ${organizationId}, Payment Intent: ${paymentIntentId}`);
  } else if (event.type === 'payment_intent.succeeded') {
    // This is an alternative or supplementary event to checkout.session.completed
    // It's useful if you need to handle direct payment intents or want more granular payment status.
    // Ensure idempotency if you handle both checkout.session.completed and payment_intent.succeeded
    // for the same transaction. Usually, handling one (checkout.session.completed) is sufficient for simple donations.
    const paymentIntent = event.data.object as any; // Stripe.PaymentIntent
    console.log(`Connected Account Event: Received payment_intent.succeeded: ${paymentIntent.id} for account ${tenantStripeAccountId}. Consider if specific handling is needed here or if checkout.session.completed is sufficient.`);
    // You might update the donation status here if it was initially pending.
  }
  // Add more event type handlers for connected accounts if needed (e.g., refunds 'charge.refunded')

  // Acknowledge other relevant events from connected accounts if necessary
}

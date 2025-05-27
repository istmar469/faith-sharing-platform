import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@11.16.0'; // Use a specific version

// --- CORS Headers ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Adjust for specific origins in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // OPTIONS for preflight
};

// --- Types ---
interface RequestBody {
  organizationId: string;
  amount: number; // in cents
  currency: string;
  successUrl: string;
  cancelUrl: string;
  donorEmail?: string; // Optional
  // Add other metadata fields if needed, e.g., donationId
}

interface StripeIntegration {
  id: string;
  organization_id: string;
  stripe_account_id: string;
  is_verified: boolean;
  created_at: string;
}

// --- Main Function Logic ---
serve(async (req: Request) => {
  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- Environment Variables ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey || !stripeSecretKey) {
      console.error('Missing environment variables');
      return new Response(JSON.stringify({ error: 'Internal server configuration error.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Initialize Supabase Admin Client ---
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // --- Initialize Stripe Client ---
    // Stripe Deno runtime compatibility often requires specific configurations.
    // The 'stripe' library might need a specific HTTP client or other polyfills for Deno.
    // For this example, we assume the 'stripe' library works in Deno as is or with minimal adjustments.
    // The library might default to Node's HTTP client. If issues arise, a Deno-compatible fetch client
    // might need to be passed to the Stripe constructor.
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16', // Use a fixed API version
      // httpClient: Stripe.createFetchHttpClient(fetch), // Example if a Deno fetch polyfill is needed
      typescript: true,
    });

    // --- Parse Request Body ---
    const {
      organizationId,
      amount,
      currency,
      successUrl,
      cancelUrl,
      donorEmail,
    }: RequestBody = await req.json();

    if (!organizationId || !amount || !currency || !successUrl || !cancelUrl) {
      return new Response(JSON.stringify({ error: 'Missing required fields.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (amount < 50) { // Minimum amount for many payment processors (e.g., 50 cents)
        return new Response(JSON.stringify({ error: 'Amount must be at least 50 cents.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }


    // --- Fetch Tenant's Stripe Account ID ---
    const { data: integrationData, error: fetchError } = await supabaseAdmin
      .from('stripe_integrations')
      .select('*')
      .eq('organization_id', organizationId)
      .single(); // Assuming one active integration per organization

    if (fetchError || !integrationData) {
      console.error('Error fetching Stripe integration or not found:', fetchError?.message);
      return new Response(JSON.stringify({ error: 'Stripe integration not found or error fetching it.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stripeIntegration = integrationData as StripeIntegration;

    if (!stripeIntegration.stripe_account_id) {
        return new Response(JSON.stringify({ error: 'Stripe account ID not configured for this organization.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    if (!stripeIntegration.is_verified) {
      return new Response(JSON.stringify({ error: 'Stripe account for this organization is not verified.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tenantStripeAccountId = stripeIntegration.stripe_account_id;

    // --- Create Stripe Checkout Session ---
    const lineItems = [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: 'Donation',
            // description: `Donation to Organization ID: ${organizationId}`, // Optional description
          },
          unit_amount: amount, // Amount in cents
        },
        quantity: 1,
      },
    ];
    
    const metadata = {
        organization_id: organizationId,
        // If you create a preliminary donation record in your DB before calling this function:
        // donation_id: preGeneratedDonationId, 
    };

    const sessionCreateParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata,
    };

    if (donorEmail) {
        sessionCreateParams.customer_email = donorEmail;
    }
    
    // Create the Checkout Session on the connected account
    const session = await stripe.checkout.sessions.create(
        sessionCreateParams,
        {
          stripeAccount: tenantStripeAccountId, // This is crucial for Stripe Connect
        }
    );

    if (!session.url) {
        console.error('Stripe session URL not found after creation.');
        return new Response(JSON.stringify({ error: 'Could not create checkout session.' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // --- Return Response ---
    return new Response(JSON.stringify({ sessionId: session.id, checkoutUrl: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in create-donation-checkout-session:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

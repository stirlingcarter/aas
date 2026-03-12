// Supabase Edge Function: create-checkout
// Creates a Stripe Checkout Session for a commitment payment
//
// Deploy: supabase functions deploy create-checkout
// Secret: supabase secrets set STRIPE_SECRET_KEY=sk_test_...

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function stripeRequest(endpoint: string, body: Record<string, string>) {
  const res = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body).toString(),
  })
  return res.json()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Verify user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { commitment_id, amount_cents, goal_description } = await req.json()

    // Verify commitment belongs to user
    const { data: commitment, error: cErr } = await supabase
      .from('commitments')
      .select('*')
      .eq('id', commitment_id)
      .eq('user_id', user.id)
      .single()

    if (cErr || !commitment) {
      return new Response(JSON.stringify({ error: 'Commitment not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get or create Stripe customer
    let { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripeRequest('/customers', {
        email: user.email || '',
        'metadata[supabase_user_id]': user.id,
      })
      customerId = customer.id

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Determine success/cancel URLs
    const origin = req.headers.get('origin') || 'https://stirlingcarter.github.io/aas'
    const successUrl = `${origin}/aas/payment-success?commitment_id=${commitment_id}`
    const cancelUrl = `${origin}/aas/commitment/${commitment_id}`

    // Create Checkout Session
    const session = await stripeRequest('/checkout/sessions', {
      customer: customerId!,
      mode: 'payment',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][unit_amount]': String(amount_cents),
      'line_items[0][price_data][product_data][name]': 'Accountability Commitment',
      'line_items[0][price_data][product_data][description]': goal_description.slice(0, 200),
      success_url: successUrl,
      cancel_url: cancelUrl,
      'metadata[commitment_id]': commitment_id,
      'metadata[user_id]': user.id,
    })

    // Save session ID to commitment
    await supabase
      .from('commitments')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', commitment_id)

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

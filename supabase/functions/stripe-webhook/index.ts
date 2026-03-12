// Supabase Edge Function: stripe-webhook
// Handles Stripe webhook events to activate commitments after payment
//
// Deploy: supabase functions deploy stripe-webhook
// Secret: supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
//
// Configure in Stripe Dashboard:
//   Webhook URL: https://<project-ref>.supabase.co/functions/v1/stripe-webhook
//   Events: checkout.session.completed

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Simple HMAC-SHA256 for Stripe signature verification
async function verifyStripeSignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  const elements = sigHeader.split(',')
  const timestamp = elements.find(e => e.startsWith('t='))?.split('=')[1]
  const signature = elements.find(e => e.startsWith('v1='))?.split('=')[1]

  if (!timestamp || !signature) return false

  const signedPayload = `${timestamp}.${payload}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload))
  const expectedSig = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return expectedSig === signature
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const body = await req.text()
    const sigHeader = req.headers.get('stripe-signature') || ''

    // Verify webhook signature
    if (STRIPE_WEBHOOK_SECRET) {
      const valid = await verifyStripeSignature(body, sigHeader, STRIPE_WEBHOOK_SECRET)
      if (!valid) {
        return new Response('Invalid signature', { status: 400 })
      }
    }

    const event = JSON.parse(body)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const commitmentId = session.metadata?.commitment_id

      if (commitmentId) {
        // Activate the commitment
        await supabase
          .from('commitments')
          .update({
            status: 'active',
            stripe_payment_intent_id: session.payment_intent,
          })
          .eq('id', commitmentId)
          .eq('status', 'pending_payment')
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

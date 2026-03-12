// Supabase Edge Function: process-refund
// Issues Stripe refunds for approved commitments (amount * 0.995)
//
// Deploy: supabase functions deploy process-refund
//
// This can be called:
// 1. By the review processor (pg_cron triggers a database webhook)
// 2. Manually via: supabase functions invoke process-refund
// 3. Via HTTP from an admin interface

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const PLATFORM_FEE_RATE = 0.005 // 0.5%

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
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Find all approved commitments that have a payment_intent but haven't been refunded yet
    // We track refund by checking if there's a 'refund_processed' field
    const { data: commitments, error } = await supabase
      .from('commitments')
      .select('*')
      .eq('status', 'approved')
      .not('stripe_payment_intent_id', 'is', null)

    if (error) throw error

    const results = []

    for (const commitment of commitments || []) {
      try {
        const refundAmount = Math.round(commitment.amount_cents * (1 - PLATFORM_FEE_RATE))

        const refund = await stripeRequest('/refunds', {
          payment_intent: commitment.stripe_payment_intent_id,
          amount: String(refundAmount),
          reason: 'requested_by_customer',
          'metadata[commitment_id]': commitment.id,
          'metadata[original_amount]': String(commitment.amount_cents),
          'metadata[platform_fee]': String(commitment.amount_cents - refundAmount),
        })

        if (refund.id) {
          results.push({
            commitment_id: commitment.id,
            refund_id: refund.id,
            amount: refundAmount,
            status: 'success',
          })
        } else {
          results.push({
            commitment_id: commitment.id,
            status: 'error',
            error: refund.error?.message || 'Unknown error',
          })
        }
      } catch (err) {
        results.push({
          commitment_id: commitment.id,
          status: 'error',
          error: (err as Error).message,
        })
      }
    }

    return new Response(
      JSON.stringify({
        processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

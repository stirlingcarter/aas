# AAS — Accountability as a Service

> Put your money where your mouth is. Literally.

Stake real money on your goals. Get it back when you follow through. If it works, is it dumb?

## How It Works

1. **Set a goal** — Describe what you're committing to, with specifics
2. **Stake real money** — $25 to $500, enough to sting if you lose it
3. **Do the thing** — No AI coach, no push notifications, just stakes
4. **Self-report** — Honor system verification (like levels.fyi for goals)
5. **Get your money back** — Minus 0.5% for our trouble

If you fail, the money is forfeited. Claims go through an extremely rigorous and completely opaque review process.

## Tech Stack

| Layer | Tech | Cost |
|-------|------|------|
| Frontend | React 18 + Vite + Tailwind CSS 3 | Free |
| Hosting | GitHub Pages | Free |
| Auth + DB | Supabase (PostgreSQL + Auth) | Free tier |
| Serverless | Supabase Edge Functions (Deno) | Free tier |
| Payments | Stripe Checkout + Refunds API | 2.9% + $0.30/txn |

## Setup

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) account (free)
- A [Stripe](https://stripe.com) account (free, test mode works)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`npm i -g supabase`)

### 1. Clone and Install

```bash
git clone https://github.com/stirlingcarter/aas.git
cd aas
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** and run the migration:

```bash
# Copy the contents of supabase/migrations/001_initial_schema.sql
# and paste into the SQL Editor, then click "Run"
```

3. Enable the `pg_cron` extension:
   - Go to **Database > Extensions**
   - Search for `pg_cron` and enable it
   - Run in SQL Editor:
   ```sql
   select cron.schedule('process-reviews', '*/15 * * * *', 'select public.process_reviews()');
   ```

4. Get your project URL and anon key from **Settings > API**

### 3. Stripe Setup

1. Get your API keys from [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Note the **Publishable key** (`pk_test_...`) and **Secret key** (`sk_test_...`)

### 4. Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 5. Deploy Edge Functions

```bash
supabase login
supabase link --project-ref your-project-ref

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

# Deploy functions
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy process-refund
```

### 6. Stripe Webhook

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Add endpoint: `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`
3. Select event: `checkout.session.completed`
4. Copy the webhook signing secret and update your Supabase secret:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 7. Run Locally

```bash
npm run dev
```

Visit [http://localhost:5173/aas/](http://localhost:5173/aas/)

### 8. Deploy to GitHub Pages

Push to `main` — GitHub Actions will build and deploy automatically.

Or manually:
```bash
npm run build
# The dist/ folder is your static site
```

## Project Structure

```
aas/
├── src/
│   ├── components/     UI components (Button, Card, Input, Modal, etc.)
│   ├── pages/          Route pages (Landing, Auth, Dashboard, etc.)
│   ├── lib/            Supabase client, Stripe helpers, constants
│   ├── hooks/          React hooks (useAuth, useCommitments, useCountdown)
│   ├── types/          TypeScript interfaces
│   ├── App.tsx         Router setup
│   └── main.tsx        Entry point
├── supabase/
│   ├── functions/      Edge functions (create-checkout, stripe-webhook, process-refund)
│   └── migrations/     Database schema SQL
├── .github/workflows/  GitHub Actions deploy pipeline
└── public/             Static assets
```

## The Review Process

After submitting a verification claim:

1. Status changes to "Under Review"
2. A random 24-72 hour delay is assigned
3. The UI shows a progress bar with status messages like "Assigned to accountability specialist" and "Cross-referencing commitment parameters"
4. There are no accountability specialists
5. After the delay, claims with ≥50% achievement are auto-approved; below 50% are denied
6. Denied claims can be appealed
7. Appeals are always approved (the friction is the point)

## Fee Structure

| Scenario | Cost to User |
|----------|-------------|
| Success ($100 stake) | $0.50 platform fee + ~$3.20 Stripe fee = ~$3.70 |
| Failure ($100 stake) | $100.00 (forfeited) |

- **Platform fee**: 0.5% always deducted from refund
- **Stripe processing**: ~2.9% + $0.30 on initial charge (non-refundable)

## License

MIT — do whatever you want, just don't blame us when you lose your money (that's the point).

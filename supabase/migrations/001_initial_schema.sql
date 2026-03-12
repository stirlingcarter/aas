-- AAS: Accountability as a Service — Database Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard)

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  stripe_customer_id text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- COMMITMENTS
-- ============================================================
create type public.commitment_status as enum (
  'draft',
  'pending_payment',
  'active',
  'pending_verification',
  'under_review',
  'approved',
  'denied',
  'expired',
  'failed'
);

create table public.commitments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  goal_description text not null,
  amount_cents integer not null check (amount_cents >= 500 and amount_cents <= 100000),
  deadline timestamptz not null,
  status public.commitment_status default 'draft' not null,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz default now() not null,
  verified_at timestamptz,
  review_completed_at timestamptz
);

alter table public.commitments enable row level security;

create policy "Users can view own commitments"
  on public.commitments for select using (auth.uid() = user_id);

create policy "Users can insert own commitments"
  on public.commitments for insert with check (auth.uid() = user_id);

create policy "Users can update own commitments"
  on public.commitments for update using (auth.uid() = user_id);

create index idx_commitments_user_id on public.commitments(user_id);
create index idx_commitments_status on public.commitments(status);
create index idx_commitments_deadline on public.commitments(deadline);

-- ============================================================
-- VERIFICATIONS
-- ============================================================
create table public.verifications (
  id uuid default gen_random_uuid() primary key,
  commitment_id uuid references public.commitments(id) on delete cascade not null unique,
  achievement_pct integer not null check (achievement_pct >= 0 and achievement_pct <= 100),
  description text not null,
  submitted_at timestamptz default now() not null
);

alter table public.verifications enable row level security;

create policy "Users can view own verifications"
  on public.verifications for select
  using (
    exists (
      select 1 from public.commitments
      where commitments.id = verifications.commitment_id
      and commitments.user_id = auth.uid()
    )
  );

create policy "Users can insert own verifications"
  on public.verifications for insert
  with check (
    exists (
      select 1 from public.commitments
      where commitments.id = verifications.commitment_id
      and commitments.user_id = auth.uid()
    )
  );

-- ============================================================
-- APPEALS
-- ============================================================
create table public.appeals (
  id uuid default gen_random_uuid() primary key,
  commitment_id uuid references public.commitments(id) on delete cascade not null unique,
  reason text not null,
  status text default 'pending' not null check (status in ('pending', 'approved')),
  submitted_at timestamptz default now() not null,
  resolved_at timestamptz
);

alter table public.appeals enable row level security;

create policy "Users can view own appeals"
  on public.appeals for select
  using (
    exists (
      select 1 from public.commitments
      where commitments.id = appeals.commitment_id
      and commitments.user_id = auth.uid()
    )
  );

create policy "Users can insert own appeals"
  on public.appeals for insert
  with check (
    exists (
      select 1 from public.commitments
      where commitments.id = appeals.commitment_id
      and commitments.user_id = auth.uid()
    )
  );

-- ============================================================
-- SCHEDULED REVIEW PROCESSOR (pg_cron)
-- ============================================================
-- This function processes reviews that have passed their review_completed_at time.
-- It auto-approves if achievement_pct >= 50, otherwise denies.
-- It also auto-approves pending appeals past their resolved_at time.
-- It also expires active commitments past their deadline + 7 day grace period.

create or replace function public.process_reviews()
returns void as $$
begin
  -- Auto-approve reviews that have completed their delay and have >= 50% achievement
  update public.commitments c
  set status = 'approved'
  where c.status = 'under_review'
    and c.review_completed_at <= now()
    and exists (
      select 1 from public.verifications v
      where v.commitment_id = c.id
      and v.achievement_pct >= 50
    );

  -- Auto-deny reviews that have completed their delay and have < 50% achievement
  update public.commitments c
  set status = 'denied'
  where c.status = 'under_review'
    and c.review_completed_at <= now()
    and exists (
      select 1 from public.verifications v
      where v.commitment_id = c.id
      and v.achievement_pct < 50
    );

  -- Auto-approve pending appeals past their resolved_at time
  update public.appeals a
  set status = 'approved'
  where a.status = 'pending'
    and a.resolved_at <= now();

  -- Update commitment status when appeal is approved
  update public.commitments c
  set status = 'approved'
  where c.status = 'denied'
    and exists (
      select 1 from public.appeals a
      where a.commitment_id = c.id
      and a.status = 'approved'
    );

  -- Expire active commitments 7 days past deadline with no verification
  update public.commitments c
  set status = 'expired'
  where c.status = 'active'
    and c.deadline + interval '7 days' < now()
    and not exists (
      select 1 from public.verifications v
      where v.commitment_id = c.id
    );
end;
$$ language plpgsql security definer;

-- Schedule: run every 15 minutes
-- NOTE: pg_cron must be enabled in Supabase dashboard (Database > Extensions)
-- Then run in SQL editor:
-- select cron.schedule('process-reviews', '*/15 * * * *', 'select public.process_reviews()');

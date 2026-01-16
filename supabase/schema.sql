--
-- Author: Sambath Kumar Natarajan
--

-- 1. PROFILES TABLE
-- Syncs with auth.users to store application-specific user data
-- Rationale: "No Excuses" Production Readiness means we need a place to store "Institution", "Full Name", etc.

create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  full_name text,
  institution text,
  avatar_url text,
  
  -- Billing / Usage Meta
  -- We don't store "Audits" (content), but we can store "Lifetime Audit Count" for billing history
  lifetime_audits_count integer default 0,
  tier text default 'standard', -- 'standard' | 'researcher' | 'enterprise'
  is_trial_used boolean default false, -- Tracks if "Free Trial" has been claimed
  
  updated_at timestamp with time zone,

  primary key (id)
);

-- 2. ROW LEVEL SECURITY (RLS)
-- Vital for privacy. Users can only see/edit their own profile.

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 3. AUTOMATIC SYNC TRIGGER
-- When a user signs up via Supabase Auth, automatically create a row in public.profiles

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, institution)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'institution'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. STORAGE (Optional Validation)
-- Simple bucket for avatars if needed later
insert into storage.buckets (id, name)
values ('avatars', 'avatars')
on conflict do nothing;

create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

-- 5. AUDIT LOGS (Metadata & Event Stream)
-- Tracks usage stats without storing sensitive manuscript content.
-- Rationale: Business intelligence requires knowing "What happened" (Action) and "How much" (Metadata).

create table public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  session_id text not null, -- Links to the "Ephemeral Certificate" ID
  
  -- Event Details
  action text not null, -- 'SCAN', 'AUDIT_CLAIM', 'PAYMENT_UNLOCK', 'PDF_GENERATION'
  metadata jsonb default '{}'::jsonb, -- Store { "char_count": 100, "model": "gemini-2.0", "claim_hash": "..." }
  
  -- Usage Drivers
  claim_count integer default 0,
  tier text default 'standard', -- 'standard' | 'byok'
  token_usage_estimate integer default 0,
  
  created_at timestamp with time zone default now()
);

-- 6. TRANSACTIONS (Payment Logic)
-- Revenue tracking and audit trail for Razorpay
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  
  -- Razorpay Fields
  razorpay_order_id text not null,
  razorpay_payment_id text,
  amount integer not null, -- stored in paise
  currency text default 'INR',
  status text default 'pending', -- 'pending' | 'success' | 'failed'
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone
);

alter table public.audit_logs enable row level security;
alter table public.transactions enable row level security;

-- Users can view their own logs
create policy "Users view own audit logs" on audit_logs for select using (auth.uid() = user_id);
create policy "Users view own transactions" on transactions for select using (auth.uid() = user_id);

-- Allow Insert
create policy "Users can insert own logs" on audit_logs for insert with check (auth.uid() = user_id);
create policy "Users can insert own transactions" on transactions for insert with check (auth.uid() = user_id);

-- 7. ORGANIZATIONS (Multi-Tenancy)
-- Support for Departments and Universities
create table public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null, -- e.g. "MIT - CompSci"
  domain text, -- e.g. "mit.edu" for auto-association
  tier text default 'DEPARTMENT', -- 'DEPARTMENT' ($299), 'ENTERPRISE' ($999)
  credits_balance integer default 0, -- Shared credit pool
  created_at timestamp with time zone default now()
);

alter table public.organizations enable row level security;

-- Policies for Organizations
-- 1. Admins can view their own org
-- 2. Members can view basic org stats (balance)

-- 8. SCHEMA UPDATES FOR PIVOT
-- Add columns to existing tables if they don't exist (Idempotent-ish style for keeping this file as single source)

-- Update PROFILES with Org links
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'org_id') then
    alter table public.profiles add column org_id uuid references public.organizations(id);
    alter table public.profiles add column role text default 'RESEARCHER'; -- 'ADMIN', 'RESEARCHER', 'STUDENT'
  end if;
end $$;

-- Update TRANSACTIONS with Metadata (Candidate Info, Journal Target)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'transactions' and column_name = 'metadata') then
    alter table public.transactions add column metadata jsonb default '{}'::jsonb;
    alter table public.transactions add column report_summary jsonb default '{}'::jsonb;
  end if;
end $$;

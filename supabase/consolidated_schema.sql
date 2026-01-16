--
-- Author: Sambath Kumar Natarajan
--
-- CONSOLIDATED ARGUS SCHEMA (V2.2 - Explicit Reset)
-- Includes: Profiles, Audit Logs, Transactions, Organizations, Sessions, Storage
-- WARNING: THIS WILL WIPE DATA TO ENSURE CONSISTENCY.

-- 0. HARD RESET (Consistency Enforcement)
drop table if exists public.sessions cascade;
drop table if exists public.audit_logs cascade;
drop table if exists public.transactions cascade;
drop table if exists public.profiles cascade;
drop table if exists public.organizations cascade;

-- 1. ENABLE EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. CORE TABLES

-- PROFILES
create table public.profiles (
  id uuid not null references auth.users on delete cascade primary key,
  email text,
  full_name text,
  institution text,
  avatar_url text,
  lifetime_audits_count integer default 0,
  tier text default 'standard',
  is_trial_used boolean default false,
  org_id uuid, -- Link to Organizations
  role text default 'RESEARCHER',
  updated_at timestamp with time zone
);

-- ORGANIZATIONS
create table public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  domain text,
  tier text default 'DEPARTMENT',
  credits_balance integer default 0,
  credits_total integer default 0, 
  subscription_status text default 'ACTIVE',
  renewal_date timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- AUDIT LOGS
create table public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  session_id text not null, 
  action text not null,
  metadata jsonb default '{}'::jsonb,
  claim_count integer default 0,
  tier text default 'standard',
  token_usage_estimate integer default 0,
  org_id uuid references public.organizations(id), -- Org Tracking
  created_at timestamp with time zone default now()
);

-- TRANSACTIONS
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  razorpay_order_id text not null,
  razorpay_payment_id text,
  amount integer not null,
  currency text default 'USD',
  status text default 'pending',
  metadata jsonb default '{}'::jsonb,
  report_summary jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone
);

-- SESSIONS (Persistence)
create table public.sessions (
  id text primary key, -- The ARGUS session ID
  user_id uuid references auth.users not null,
  org_id uuid references public.organizations(id),
  data jsonb not null, -- The full state
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


-- 3. STORAGE & BUCKETS
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('audits', 'audits', false)
on conflict (id) do nothing;


-- 4. ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.audit_logs enable row level security;
alter table public.transactions enable row level security;
alter table public.organizations enable row level security;
alter table public.sessions enable row level security;

-- DROP OLD POLICIES (Cleanup)
drop policy if exists "Users manage own profile" on profiles;
drop policy if exists "Public view profiles" on profiles;
drop policy if exists "Manage own logs" on audit_logs;
drop policy if exists "Manage own transactions" on transactions;
drop policy if exists "Members view org" on organizations;
drop policy if exists "Users manage own sessions" on sessions;
drop policy if exists "Org members view sessions" on sessions;

-- CREATE NEW POLICIES

-- Profiles
create policy "Users manage own profile" on profiles for all using ( auth.uid() = id ) with check ( auth.uid() = id );
create policy "Public view profiles" on profiles for select using ( true );

-- Logs/Tx
create policy "Manage own logs" on audit_logs for all using ( auth.uid() = user_id ) with check ( auth.uid() = user_id );
create policy "Manage own transactions" on transactions for all using ( auth.uid() = user_id ) with check ( auth.uid() = user_id );

-- Orgs
create policy "Members view org" on organizations for select using ( exists (select 1 from profiles where profiles.org_id = organizations.id and profiles.id = auth.uid()) );

-- Sessions (The Persistence Fix)
create policy "Users manage own sessions" on sessions for all using ( auth.uid() = user_id ) with check ( auth.uid() = user_id );
create policy "Org members view sessions" on sessions for select using ( org_id is not null and exists (select 1 from profiles where profiles.org_id = sessions.org_id and profiles.id = auth.uid()) );

-- Storage Policies
drop policy if exists "Users upload own audits" on storage.objects;
drop policy if exists "Users view own audits" on storage.objects;

create policy "Users upload own audits" on storage.objects for insert with check ( bucket_id = 'audits' AND auth.uid() = owner );
create policy "Users view own audits" on storage.objects for select using ( bucket_id = 'audits' AND auth.uid() = owner );


-- 5. FUNCTIONS & TRIGGERS

-- Handle New User
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, institution) values (new.id, new.email, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'institution')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Consume Credit (RPC)
create or replace function public.consume_credit(p_org_id uuid) returns boolean language plpgsql security definer as $$
declare v_balance integer;
begin
  select credits_balance into v_balance from public.organizations where id = p_org_id for update;
  if v_balance > 0 then
    update public.organizations set credits_balance = credits_balance - 1 where id = p_org_id;
    return true;
  else
    return false;
  end if;
end;
$$;
-- Metadata Logging Table (Data Asset - No PII)
-- This table stores aggregated research failure trends without storing actual paper content
-- Purpose: Build "Pulse of Science" dataset for potential acquisition value

create table public.metadata_logs (
  id uuid default gen_random_uuid() primary key,
  field text not null, -- "Biology", "Computer Science", "Physics", etc.
  failure_mode text, -- "Sample Size", "Methodology", "Statistical Power", etc.
  score integer check (score >= 0 and score <= 100), -- Readiness score
  verdict text check (verdict in ('PUBLISHABLE', 'REVISE_MAJOR', 'REJECT')),
  org_id uuid references public.organizations(id), -- Track org usage (optional)
  created_at timestamp with time zone default now()
);

-- Index for analytics queries
create index metadata_logs_field_idx on public.metadata_logs(field);
create index metadata_logs_created_at_idx on public.metadata_logs(created_at);
create index metadata_logs_org_id_idx on public.metadata_logs(org_id);

-- RLS Policies (Admin only for export)
alter table public.metadata_logs enable row level security;

-- Only service role can read (for admin export)
create policy "Service role can read metadata_logs"
  on public.metadata_logs
  for select
  using (auth.role() = 'service_role');

-- Authenticated users can insert (system logging)
create policy "Authenticated users can insert metadata_logs"
  on public.metadata_logs
  for insert
  with check (auth.role() = 'authenticated');

-- Add comment for documentation
comment on table public.metadata_logs is 'Aggregated research quality metrics (NO PII) for trend analysis and data asset building';
-- API Keys Table (Enterprise Integration)
create table public.api_keys (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  org_id uuid references public.organizations(id) on delete cascade,
  name text, -- "Production Key", "Staging Key", etc.
  active boolean default true,
  created_at timestamp with time zone default now(),
  last_used_at timestamp with time zone
);

-- API Audits Table (Webhook Tracking)
create table public.api_audits (
  id text primary key, -- ARGUS-API-{timestamp}-{random}
  org_id uuid references public.organizations(id),
  callback_url text,
  metadata jsonb default '{}'::jsonb,
  status text check (status in ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED')),
  result jsonb, -- Full audit result when complete
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- Indexes
create index api_keys_org_id_idx on public.api_keys(org_id);
create index api_audits_org_id_idx on public.api_audits(org_id);
create index api_audits_status_idx on public.api_audits(status);

-- RLS Policies
alter table public.api_keys enable row level security;
alter table public.api_audits enable row level security;

-- Service role only (admin management)
create policy "Service role can manage api_keys"
  on public.api_keys
  using (auth.role() = 'service_role');

create policy "Service role can manage api_audits"
  on public.api_audits
  using (auth.role() = 'service_role');

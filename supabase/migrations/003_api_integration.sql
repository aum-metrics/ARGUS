--
-- Author: Sambath Kumar Natarajan
--
-- API Integration Migration
-- Creates tables for API keys and webhooks (api_keys, api_audits) for enterprise features.
--
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

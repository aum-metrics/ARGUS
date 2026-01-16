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

--
-- Author: Sambath Kumar Natarajan
--
-- MIGRATION: 001_sessions_and_storage.sql
-- Goal: Enable real-time persistence and file storage

-- 1. SESSIONS TABLE (The "Save Game" State)
create table if not exists public.sessions (
  id text primary key, -- The ARGUS session ID (ARGUS-S-...)
  user_id uuid references auth.users not null,
  org_id uuid references public.organizations(id), -- Nullable for individuals
  data jsonb not null, -- The full state (claims, context, report)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.sessions enable row level security;

create policy "Users manage own sessions"
  on sessions for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

create policy "Org members view sessions"
  on sessions for select
  using ( 
    org_id is not null and 
    exists (select 1 from profiles where profiles.org_id = sessions.org_id and profiles.id = auth.uid()) 
  );

-- 2. STORAGE BUCKET (For Audits)
insert into storage.buckets (id, name, public)
values ('audits', 'audits', false) -- Private, only authorized users
on conflict (id) do nothing;

create policy "Users upload own audits"
  on storage.objects for insert
  with check ( bucket_id = 'audits' AND auth.uid() = owner );

create policy "Users view own audits"
  on storage.objects for select
  using ( bucket_id = 'audits' AND auth.uid() = owner );

-- Allow Org Access to files (Complex, might need RPC for signed URLs, but basic policy for now)
-- Keep it simple: Owners only for now to stop the bleeding. Org sharing can be V2.

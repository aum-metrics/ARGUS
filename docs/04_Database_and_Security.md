# ARGUS: Database & Security Model

**Target Audience:** Security Engineers, DevOps Interns, Backend Developers
**Prerequisites:** Understanding of PostgreSQL, JWTs, and Supabase RLS.
**Last Updated:** March 2026

---

## 1. The PostgreSQL Philosophy (Supabase)

ARGUS runs on Supabase, which provides a managed PostgreSQL database. Unlike NoSQL (Firestore), PostgreSQL is heavily relational and schema-driven. 

### Database Schema Structure

1. **`auth.users` (System)**
   Managed entirely by Supabase internally. Never map business logic directly to `auth.users`, as the schema could change during Supabase upgrades.
2. **`public.profiles` (Business Logic)**
   This table holds `id` (foreign key to `auth.users`), `email`, `role`, `tier`, `lifetime_audits_count`, `institution`, and `full_name`. 
   **Trigger Architecture:** We have a PostgreSQL event trigger `on_auth_user_created` that automatically generates a row here whenever a user signs up.
3. **`public.audit_logs`**
   Our analytics tracking mechanism for compliance and usage counting. It does not contain PII or manuscript IP. Contains `session_id`, `action`, `claim_count`, and an estimated `token_usage_estimate`.
4. **`public.transactions`**
   E-Commerce tracking table storing the Razorpay Payload IDs.
5. **`public.job_queue`**
   The queue state engine used by the edge functions. Used to acquire mutex locks and manage the "Swarm" parallel audit state. Contains `status`, `payload`, `type`, `user_id`, and `id`.

---

## 2. Row Level Security (RLS): The Vault Door

Supabase RLS uses PostgreSQL constraints directly attached to the database schema. If the backend NodeJS code is severely compromised or completely bypassed, RLS guarantees isolation.

**Example: Audit Logs Isolation**
```sql
alter table public.audit_logs enable row level security;

create policy "Users view own audit logs" on audit_logs 
for select using (auth.uid() = user_id);

create policy "Users can insert own logs" on audit_logs 
for insert with check (auth.uid() = user_id);
```
With these policies, an API request executing `supabase.from('audit_logs').select('*')` will only ever receive the logs associated with their own `uid()`. 

**The Golden Rule of Security Interns:** 
Never bypass RLS unless specifically using the backend-only `SUPABASE_SERVICE_ROLE_KEY`. If you are in a Next.js `route.ts`, pass the user's Auth Bearer Token when initializing the Supabase client so RLS is preserved. Do not misuse the Role Key on the client UI.

---

## 3. The Zero-Retention Security Posture

Academic literature submitted to ARGUS is considered highly confidential intellectual property (IP). 
If our database is breached or a developer steals an API key, we ensure they cannot steal papers.

*   **No File Upload DBs:** The PDF parsing algorithm runs strictly in volatile RAM. 
*   **No Prompt Saving:** Extracted texts and system prompts are never persisted in Supabase long-term.
*   **Ephemerality:** Results and analysis are displayed and cached on the client strictly. Once the browser session closes, the context vanishes (unless the user downloads an explicit PDF export report).

---

## 4. Double-Gating Development Features

During development, engineers can bypass full Google Auth via Mock sessions. 
In production, Mock URLs, mock token IDs, and internal developer shortcuts are strictly verified. All production deployments must restrict bypassing `getSession` to strictly `process.env.NODE_ENV === "development"`.

# ARGUS: Environment Strategy

**Target Audience:** DevOps, SRE, Tech Leads
**Last Updated:** March 2026

---

## 1. Environment Stages

ARGUS uses an industry-standard dual progression structure. It explicitly avoids a dedicated `staging` to match Vercel’s dynamic preview environments.

### `development` (Local / Preview)
- **Where it lives:** Developer's Macbook (`npm run dev`) or Vercel Preview Deployments.
- **Data Source:** Connects to the primary Supabase cluster but developers should test using distinct mock accounts.
- **Mock Auth:** Engineers can strictly bypass standard Supabase UI by creating mock Dev JWTs, assuming `NODE_ENV === "development"`.

### `production` (Live)
- **Where it lives:** Vercel Production Environment (mapped to custom domains).
- **Data Source:** Primary database instance.
- **Restrictions:** Mock authentications are explicitly crashed out with security trace alarms if `NODE_ENV` resolves to `"production"`.

## 2. CI/CD Progression

The branching strategy operates as follows:
1. `feature/ticket-name` branching.
2. PR created targeting `main` branch.
3. Vercel automatically produces an isolated Preview URL for the PR to visually verify the frontend logic behavior and UI flow.
4. QA validates on the Preview URL.
5. Merge `main`. Vercel automatically deploys the code logic safely.

## 3. Database Migrations

Because Supabase scales natively with Postgres:
- Local development is tied directly to the production Postgres instances heavily via connection strings rather than local dockers unless explicit schemas are being redesigned. Schema testing should employ `supabase db diff` where appropriate to ensure migration compatibility before applying it to the public schema using `supabase db push`.

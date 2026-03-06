# ARGUS: Administrator & Operations Runbook

**Target Audience:** Ops Teams, Admins, SRE
**Last Updated:** March 2026

---

## 1. System Overviews

The ARGUS environment consists of three heavily-coupled systems:
- **Vercel** (Hosting next.js server and static files)
- **Supabase** (Database + Postgres + Auth)
- **Google GenAI / OpenAI** (Intelligence Layer)

## 2. Viewing Operations Telemetry

Because the application is serverless, you cannot simply `ssh` into a machine to view logs.

1. **Vercel Logs (Application Logic):**
   - Log into the Vercel Dashboard -> Projects -> ARGUS -> Logs tab.
   - Filter by error logs or search specific session `uid` traces to track crashes in `/api/parse-pdf` or `/api/gemini`.
2. **Supabase Logs (DB / Auth):**
   - Use the Supabase dashboard -> Logs -> API Editor / Auth to view anomalous Auth attempts or PostgreSQL slow queries. 

## 3. Resolving Token Exhaustion

If the platform encounters `429 Too Many Requests` heavily:
- Google GenAI might be rate-limiting the `gemini-2.5-flash` API endpoint based on our project tiering limits.
- **Action Required:** Open GCP console in the associated project -> Quotas -> Request higher limits or temporarily switch `useGovernance.ts` over to `gpt-4o-mini` if there is a severe outage.

## 4. Refund Operations

When a user requests a refund or runs into an anomaly where their quota didn't bump (billing atomic race condition):
1. **Locate transaction in Razorpay Dashboard:** Correlate user email to the transaction ID. Issue the refund from Razorpay.
2. **Update Postgres:** Connect to Supabase UI -> SQL Editor -> Manually reset the `transactions` state to `REFUNDED` or deduct tier from `public.profiles`.

## 5. Deployment Commands

Standard deployment is handled via GitHub tracking the `main` branch. 
To manually trigger a production deployment using Vercel CLI:
```bash
npm install -g vercel
vercel build --prod
vercel deploy --prebuilt --prod
```

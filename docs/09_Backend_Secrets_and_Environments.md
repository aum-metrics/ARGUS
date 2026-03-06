# ARGUS: Backend Secrets & Environments

**Target Audience:** DevOps, Backend Engineers
**Last Updated:** March 2026

---

## 1. Secrets Overview

ARGUS relies on strict Vercel Environment Variables. Avoid checking these into source control. Always refer to the `.env.local` prototype (e.g. `env.example`) to construct your `.env`.

### Critical Variables

| Key | Purpose | Criticality |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Route for Supabase edge API. | Public / Required |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Restricted access key that safely passes database queries respecting RLS via JWT. | Public / Required |
| `SUPABASE_SERVICE_ROLE_KEY` | Full admin privileges. Only used server-side in API routes. | **CRITICAL SECRET** |
| `GEMINI_API_KEY` | Orchestrates context parsing and Adversarial evaluation in endpoints. | **CRITICAL SECRET** |
| `RAZORPAY_KEY_ID` | E-Commerce checkout linkage | Required |
| `RAZORPAY_KEY_SECRET` | Used on API webhooks to compute hash digests ensuring payment isn't spoofed. | **CRITICAL SECRET** |

## 2. Managing Vercel Secrets

Vercel securely isolates secrets across Preview and Production environments to prevent data bleeding.

- If you rotate the Razorpay Secret or Gemini Secret, you must go to Vercel -> ARGUS -> Settings -> Environment Variables. 
- You must manually update the `Production` value and verify the checkmarks.
- Once saved, to distribute the new configuration down into the Vercel Edge compute clusters, you **MUST** run a redeployment of the project. Secrets do not dynamically hot reload in serverless routes currently active.

## 3. Development `.env` Hygiene

1. **Commit Rules:** Ensure `.env` and `.env.local` are explicitly blocked in `.gitignore`.
2. **Local Overrides:** Developers run `npm run dev --port 3000` pulling secrets locally. If a new service integration is added (e.g., Perplexity AI logic), the internal team documentation should declare `PERPLEXITY_API_KEY` into `env.example` as a placeholder to unblock colleagues pulling the latest `main`.

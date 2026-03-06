# ARGUS: Troubleshooting & Incident Response

**Target Audience:** On-Call Engineers, Developer Interns
**Last Updated:** March 2026

---

Below is a master matrix of known issues, symptoms, and exact mitigation steps for the ARGUS platform.

## Alert 1: "User uploaded a PDF but it says '0 Claims Extracted'"
*   **What it means:** The `parse-pdf` endpoint or `THESIS_CONSTRUCTOR` failed to extract textual details.
*   **Root Cause A:** The PDF is an image-based scan (no OCR text).
    *   **Fix:** Ask the user to submit an OCR-enabled PDF or manually run an OCR extraction tool locally before submitting to ARGUS. 
*   **Root Cause B:** The `gemini-2.5-flash` endpoint returned malformed JSON instead of the strict schema output. The repair regex sequence in `useGovernance.ts` was unable to save it.
    *   **Fix:** The frontend hooks will log the raw text. Wait and try again—temperature constraints are largely static, but occasional anomalies in generation occur.

## Alert 2: "Claims are being constantly Rejected for missing Methodology"
*   **What it means:** The platform is hallucinating an omission (a "false negative").
*   **Root Cause:** The `METHODOLOGY_PROSECUTOR` isn't seeing the whole text. 
    *   **Fix:** This was resolved in the March 2026 patch. The `useGovernance.ts` file now passes the `FULL CONTEXT` without the `.substring(0, 5000)` limitation. If it happens again, ensure the `prompts.ts` strictly enforces the *Anti-Hallucination Protocol*.

## Alert 3: "Rate limit exceeded. System busy."
*   **What it means:** Vercel edge/api routes or Supabase hit a rate limit wall.
*   **Root Cause Systemic:** This happens when we run deep swarms of concurrent multi-agent executions exceeding limits faster than the backoff logic supports.
    *   **Fix:** `useGovernance.ts` has a queue reservation logic via `/api/queue` and local sequential batching. Do not attempt to ramp thread concurrence back up above 3 without scaling enterprise quotas on API keys.

## Alert 4: "PostgreSQL Database Down / Cannot insert row"
*   **What it means:** Supabase project was paused due to inactivity, or the schema triggers are breaking.
*   **Root Cause:** The project must be awakened in the Supabase Dashboard, or a recent trigger like `on_auth_user_created` is crashing preventing signups.
    *   **Fix:** Manually run database schema rebuilds on Supabase UI or inspect trigger validity.

## P0 Outage Checklist
If ARGUS is completely inaccessible (`502` / `503` over entire root):
1. **Check Vercel Status** page.
2. **Check Supabase Status** page.
3. Login to Vercel and check deployment logs for environment secret misconfiguration. Ensure `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` exist and are strictly populated.

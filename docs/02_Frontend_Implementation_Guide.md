# ARGUS: Frontend Implementation Guide

**Target Audience:** Frontend React Engineers, UI/UX Designers
**Prerequisites:** Next.js 15 (App Router), Tailwind CSS, React Hooks
**Last Updated:** March 2026

---

## 1. The Multi-Agent Orchestration UI

ARGUS is heavily reliant on complex state management in the frontend to orchestrate multi-agent interactions.

### The Brain: `useGovernance.ts`
Located in `argus/hooks/useGovernance.ts`, this hook is the engine of the frontend.
- **Queue Management:** It asks `app/api/queue` for a lock before doing heavy compute.
- **Cost Simulation:** Maintains local `tokenUsage` maps so users know how much compute they've consumed.
- **Parallel Dispatch:** It uses `Promise.allSettled` to ping the API for the `THESIS_DESTROYER`, `METHODOLOGY_PROSECUTOR`, `LITERATURE_ADVERSARY`, and `FORMALISM_AUDITOR` concurrently.
- **Sequential Backoff:** For batched claim evaluations, it iterates sequentially with a simulated delay `await delay(1000)` to prevent HTTP 429 Rate Limit errors from Google APIs.

---

## 2. Server vs. Client Components

Because we use the Next.js App Router, you must explicitly define interaction boundaries.

1. **Client Components (`"use client"`):**
   - Any file in `argus/hooks/`.
   - Any dynamic UI with `onClick`, `useState`, or `useEffect` (e.g., the Scanning Dashboard interface).
2. **Server Components (Default):**
   - General layout shells, SEO metadata elements, and static marketing pages (`app/pricing/page.tsx`, `app/about/page.tsx`).

---

## 3. The Prompts System (`argus/prompts.ts`)

Instead of storing system prompts on the backend, ARGUS stores them in the frontend within `argus/prompts.ts` to allow rapid iteration without backend deployments.
- **Roles:** Exported definitions for every agent.
- **Anti-Hallucination Constraints:** It is strictly required that the AI reads the `FULL CONTEXT` (passed from the hook) and quotes verbatim before stating that a methodology piece is missing. This prevents the LLM from falsely rejecting valid papers.

### Adding a New Advisory Role
1. Define the string in the `ROLE_PROMPTS` record in `prompts.ts`.
2. Add the orchestrator call inside `_auditClaimCore` in `useGovernance.ts`.
3. Add a visual component block to render the new `[ROLE]` payload.

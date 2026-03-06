# ARGUS: Backend API & Logic Reference

**Target Audience:** Fullstack Engineers, API Integrators
**Prerequisites:** Next.js API Routes, Node.js, AI SDKs
**Last Updated:** March 2026

---

## 1. Next.js Serverless API Architecture

Unlike monolithic Python or Go servers, ARGUS's backend is entirely serverless, living in the `app/api/` directory. Each folder with a `route.ts` file acts as an independent endpoint scaled by Vercel.

### Core Endpoints

*   `app/api/gemini/route.ts`: Evaluates adversarial claims using Google's generative models (`gemini-2.5-flash`). It receives a `role`, `prompt`, and array of images.
*   `app/api/chatgpt/route.ts` & `app/api/perplexity/route.ts`: Alternative AI model integrations.
*   `app/api/parse-pdf/route.ts`: Handles the ingestion of academic literature. Extracts text safely for injection into the evaluation prompt.
*   `app/api/queue/route.ts`: Rate limiting and queue reservation system. Checks `job_queue` in Supabase to limit concurrent executions and protect API quota ceilings.
*   `app/api/create-razorpay-order/route.ts`: E-commerce layer. Coordinates with Razorpay to build checkout session IDs.
*   `app/api/verify-payment/route.ts`: Ingests webhooks from Razorpay, validates the HMAC digest hash, and credits the corresponding user in Supabase.

---

## 2. API Security

1. **API Keys are Server-Only:**
   Client APIs (`useGovernance.ts`) never hold the `GEMINI_API_KEY`. They post generic JSON requests to `/api/gemini`, and the server injects the secure `.env` key.
2. **Rate Limiting:**
   Heavy endpoints will return a `429 Too Many Requests` or `queuePosition` status. Frontend hooks must be designed to respect this and automatically back off.
3. **Zero Retention Policy:**
   When PDFs are parsed in `/api/parse-pdf`, the text memory buffer is destroyed immediately after returning to the client payload. We do not store a researcher's raw IP to disk or Supabase.

---

## 3. Developing New Endpoints

To drop a new endpoint into the system:

1. Create a directory `app/api/my-feature/`.
2. Create `route.ts`.
3. Export an async function `POST(request: Request)` or `GET()`.
4. Validate user session via Supabase SSR Auth Client (`lib/supabase/server.ts`).
5. Process the data and return `NextResponse.json({ ... })`.

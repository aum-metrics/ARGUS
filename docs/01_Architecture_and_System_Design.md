# ARGUS: Master Architecture & System Design Guide

**Target Audience:** New Developers, Interns, and Solutions Architects
**Prerequisites:** Basic knowledge of React, Next.js API Routes, and Supabase (PostgreSQL).
**Last Updated:** March 2026

---

## 1. Executive Summary & The "Why"

Welcome to **ARGUS**. 

Academic peer review is slow, subjective, and prone to human bias, missing critical methodology flaws or failing to apply rigorous adversarial scrutiny to research claims. 

**ARGUS solves this** by acting as an **Adversarial AI Audit Platform** for academic research and claims. It ingests research papers (PDFs) and deploys a multi-agent system ("Adversaries" like the Methodology Prosecutor, Thesis Destroyer, etc.) to interrogate and score the claims. It provides a reproducible, rigorous, and automated alternative or enhancement to traditional peer review.

---

## 2. High-Level System Architecture

ARGUS is built on a modern, serverless **SaaS Architecture**. It is designed to be highly secure, extremely fast, and horizontally scalable.

### 2.1 The Tech Stack

| Layer | Technology | Why we chose it (The "Rationale") |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 15 (App Router) + React 19 | SSR for SEO, robust routing, edge deployment on Vercel. |
| **Frontend Styling** | Tailwind CSS + Framer Motion | Rapid utility-first styling. Framer Motion handles dynamic UI animations. |
| **Backend API Server** | Next.js API Routes (Serverless) | Fast iteration, unified codebase. API routes (`app/api/`) handle interactions with external LLMs and databases. |
| **Database** | Supabase (PostgreSQL) | A powerful relational database. Real-time data syncing, built-in Authentication, and strong Row Level Security (RLS). |
| **Identity & Auth** | Supabase Auth | For user sessions. Automatically syncs with our `public.profiles` table via PostgreSQL triggers. |
| **AI Integration** | Google Gemini (Primary), OpenAI, Perplexity | `gemini-2.5-flash` is used for massive context window evaluations. We orchestrate distinct specialized prompts via the `@google/generative-ai` SDK. |
| **Payments** | Razorpay | Server-to-server webhook integrations. |
| **CI/CD** | GitHub Actions + Vercel | Vercel auto-deploys frontend and serverless API endpoints. |

---

## 3. The Core Developer Workflow (How Data Moves)

If you are an intern trying to fix a bug or add a feature, you must understand the "Flow of State":

### Step 1: Client Request (Frontend)
A user uploads a paper and initiates a scan. 
*   **Where to find it:** `argus/hooks/useGovernance.ts`.
*   **What happens:** The frontend reads the file, parses the text (via `app/api/parse-pdf`), and asks the queue for a computing slot (`app/api/queue`).

### Step 2: The Multi-Agent Execution
The frontend orchestrates calls to the API to evaluate generated claims.
*   **Where to find it:** `app/api/gemini/route.ts`.
*   **What happens:** The frontend issues concurrent `POST` requests to the Gemini endpoint, asking one agent to act as the `METHODOLOGY_PROSECUTOR` and another to act as the `THESIS_DESTROYER`. *The entire paper context is passed to prevent hallucinated omissions.*

### Step 3: Synthesis & Verdict
The AI results are aggregated into a final readiness score.
*   **Where to find it:** `JOURNAL_REVIEWER_SIMULATOR` agent in `argus/prompts.ts`.

### Step 4: Database Logging
The system logs the usage and audits.
*   **Where to find it:** Supabase `audit_logs` table.

---

## 4. Understanding How We Store Data (Supabase Schema)

Supabase operates on classic PostgreSQL.

1.  **`profiles` Table**
    *   **Purpose:** Application-specific user data. Automatically matches `auth.users` via triggers.
    *   **Fields:** `id`, `email`, `full_name`, `institution`, `lifetime_audits_count`, `tier`.

2.  **`audit_logs` Table**
    *   **Purpose:** Tracks usage stats without storing sensitive manuscript content (Zero-Retention Policy).
    *   **Fields:** `session_id`, `action`, `metadata` (JSON), `token_usage_estimate`.

3.  **`job_queue` Table**
    *   **Purpose:** Background processing states and queue reservations. Limits concurrency to protect API rate limits.
    *   **Fields:** `type`, `payload`, `status` (PENDING, PROCESSING).

---

## 5. Security Fundamentals

### Fail-Closed Design
If an API request is missing parameters or rate limits are exceeded (e.g., `429 Too Many Requests` in `useGovernance.ts`), the system will halt and prompt the user, preventing anomalous billing or runaway LLM loops.

### Row Level Security (RLS)
Supabase enforces access at the database level.
```sql
create policy "Users view own audit logs" on audit_logs for select using (auth.uid() = user_id);
```
Even if the backend explicitly requests all logs, the database will mathematically only return the logs matching the currently authenticated JWT token.

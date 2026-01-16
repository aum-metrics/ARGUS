# ARGUS | Adversarial Research Governance System (V2.0)

> **Pre-flight validator for high-impact research papers.**  
> *Calibrated for researchers at top universities.*

![Argus Banner](./public/logo.jpg)

## System Overview

**ARGUS** is not a chatbot. It is a **deterministic adversarial compiler** for academic manuscripts. It treats a research paper as code, compiling it against strict logical axioms and novelty requirements before it reaches a human peer reviewer.

By simulating the scrutiny of 6 distinct adversarial agents (The Critic, The Statistician, The Reviewer, etc.), Argus helps researchers:
1.  **Reduce Desk Rejections** by identifying fatal logical flaws early.
2.  **Standardize Output** across large labs or departments.
3.  **Certify Rigor** with a timestamped "Audit Artifact".

---

## 🏗 System Architecture (V2.0)

The system operates on a **"Hybrid Protocol"** designed for privacy and depth:

1.  **Ephemeral Memory (RAM-Only)**: Manuscripts are parsed in-memory and cryptographically zeroed after the session. No data is trained on.
2.  **The 6-Agent Swarm**:
    *   **Thesis Constructor**: Extracts the AST (Abstract Syntax Tree) of claims.
    *   **Thesis Critic**: Attacks weak premises.
    *   **Methodology Analyst**: Checks for p-hacking and sampling bias.
    *   **Literature Reviewer**: Scans for similarity (Novelty checks).
    *   **Formalism Auditor**: Enforces mathematical/definition rigor.
    *   **The Synthesizer**: Aggregates a final "Publication Readiness Score".
3.  **Institutional Payment Gate**: Supports both "BYOK" (Bring Your Own Key) for individuals and "Managed Compute" for departments.

---

## 🛠 Tech Stack

*   **Frontend**: Next.js 16 (React 19), Tailwind CSS v4, Lucide React.
*   **Backend**: Next.js API Routes (Edge/Serverless).
*   **Database**: Supabase (PostgreSQL) + Row Level Security (RLS).
*   **AI Engine**: Google Gemini 2.0 Flash (Experimental) / Pro.
*   **Payments**: Razorpay / Stripe Compatible.
*   **Infrastructure**: Docker (Standalone) / Vercel.

---

## 🚀 Getting Started

### Option A: Docker (Recommended for Enterprise)

```bash
docker build -t argus-v2 .
docker run -p 3000:3000 argus-v2
```

### Option B: Local Dev

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-org/argus.git
    cd argus
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Copy the example env file and fill in your keys:
    ```bash
    cp env.example .env.local
    ```

4.  **Database Migration**
    Run the SQL scripts located in `supabase/consolidated_schema.sql` in your Supabase SQL Editor.

5.  **Run Locally**
    ```bash
    npm run dev
    ```
    Access the system at `http://localhost:3000`.

---

## 🔐 Security & Compliance

*   **Zero-Retention Policy**: We expressly do NOT store user manuscripts.
*   **GDPR/CCPA**: Users own their profile data and can request full deletion via the "Data Self-Destruct" feature in the dashboard.
*   **Audit Trails**: All payments and session initiations are logged in an immutable `audit_logs` ledger for compliance.

---

## 📄 License

Proprietary / Enterprise License.
Copyright © 2026 ARGUS Governance. All Rights Reserved.

# ARGUS-Thesis User Guide

## 1. Introduction
Welcome to **ARGUS-Thesis**, the Adversarial Research Governance System. This platform serves as a "pre-flight check" for your academic manuscripts, using a swarm of 6 adversarial AI agents to stress-test your claims, logic, and methodology before you submit to a journal.

---

## 2. Getting Started

### 2.1. Account Creation
*   **Individual**: Sign up directly using your email (university email recommended). No invite needed.
*   **Verification**: Ensure you confirm your email address to unlock full features.

### 2.2. Organization Setup (New!)
ARGUS-Thesis now supports **Self-Service Organizations**. If you are a Lab Director or Principal Investigator:
1.  Go to **Settings** > **Organization**.
2.  Click **"Create Organization"**.
3.  Enter your Lab/Dept Name (e.g., "Stanford AI Lab").
4.  You automatically become the **Admin**.
5.  **Invite Members**: Enter the email of your students/postdocs (they must already have an individual account) to add them to your team.
6.  **Shared Credits**: All members draw from the Organization's credit pool, which you manage.

---

## 3. The Audit Workflow
The core of ARGUS-Thesis is the "Adversarial Audit." Here is the granular step-by-step process:

### Step 1: Claim Extraction (The Compiler)
*   **Input**: Paste your Abstract or full Manuscript text into the Dashboard.
*   **Action**: Click **"Extract Claims"**.
*   **What Happens**: The system acts like a compiler (Lexer/Parser). It breaks your text into atomic logical assertions (e.g., "We achieve SOTA accuracy of 99%").
*   **Output**: A list of "Claims" appears on the right panel.

### Step 2: Selecting Adversaries
You don't need to run every agent on every claim. Be strategic to save credits.
*   **Reviewer #2**: General hostility. Good for catching "lazy" logic.
*   **Methodologist**: Checks statistical rigor and study design.
*   **Prior Work**: Checks novelty against implied baselines.
*   **Privacy**: Checks for data leaks.
*   **Action**: Select a Claim, then click an Agent (e.g., "Run Methodologist").

### Step 3: The Verdict
*   **ACCEPTED**: The claim stands up to scrutiny.
*   **REJECTED**: The agent found a flaw. It will provide a specific reason (e.g., "P-value hacking detected," "Circular reasoning").
*   **Action**: Read the critique. Modify your manuscript. Re-run.

### Step 4: Generating Reports
Once you are satisfied:
*   **Download PDF Report**: A clean summary of the audit trail to attach to your submission.
*   **Download Certificate**: A cryptographic proof that your paper passed ARGUS Governance.

---

## 4. Credits & Billing
*   **Credit = 1 Audit Cycle**: One credit allows you to extract claims and run a standard suite of agents on a manuscript.
*   **Pricing**: $15 (approx ₹1,249) per Credit.
*   **Purchasing**: Click the "Top Up" button in the Dashboard. Secure payment via Razorpay.
*   **Refunds**: Failed technical executions are refunded automatically. "Low quality" papers are not grounds for refunds—the tool's job is to critique.

---

## 5. Troubleshooting

### Chatbot Support
The **Argus Support Assistant** (bottom right bubble) can answer questions about pricing, privacy, and workflows.
*   *Note: The Chatbot cannot edit your paper or fix bugs.*

### Common Issues & Fixes
| Issue | Solution |
| :--- | :--- |
| **"Favicon not showing"** | Force refresh (Cmd+Shift+R). We use aggressive caching for performance. |
| **"Vercel Build Error"** | This is usually transient. If persistent, check your `claim.status` field (we deprecated `verdict`). |
| **"Credits not updating"** | Refresh the page. Payment webhooks can take up to 10 seconds to sync. |
| **"PDF Generation fails"** | Ensure you have allowed pop-ups or are using a modern browser (Chrome/Edge/Arc). |

---

## 6. Privacy & Security
*   **Ephemeral RAM**: Your data is not stored in a persistent database validation text column. It exists in RAM during the session and is wiped when you close the tab.
*   **No Training**: We do not use your manuscripts to train our models.
*   **Zero-Knowledge**: Once the session ends, we verify *that* an audit happened (metadata), but we forget *what* was audited.

---

**Support Contact**: `contact@argus-thesis.com`

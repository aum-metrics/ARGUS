# ARGUS-Thesis User Guide

## Welcome to ARGUS-Thesis
ARGUS-Thesis is the "spell-checker for logic." It helps researchers, students, and professors validate their papers before submission. This guide explains how to get started, run audits, and manage your account.

---

## 1. Account Types & Sign Up

### Individual Researcher
Best for: PhD Students, Independent Researchers, Post-docs.
*   **How to Sign Up**: 
    1. Go to the [Login Page](/login).
    2. Click the "Sign Up" tab.
    3. Enter your email and password.
    4. You will receive a verification email. Click the link to activate.
*   **Billing**: Pay-as-you-go. Buy "Audits" individually (~$15/paper).

### Organization / Lab (Enterprise)
Best for: University Departments, Research Labs, Journals.
*   **How to Sign Up**: 
    *   Currently, Organization accounts are **provisioned by our Sales Team**.
    *   If your University has a license, ask your Department Admin for an invite link.
    *   If you want to set up an Organization for your team, please contact us via the [Enterprise Page](/enterprise).
*   **Benefits**: Shared credit pool, Centralized billing, Admin dashboard.

---

## 2. Using the Dashboard

Once logged in, you will land on the **Dashboard**.

### The "New Validation" Flow
1.  **Input**:
    *   **Method A (Upload)**: Drag & Drop your research PDF. ARGUS will extract the text.
    *   **Method B (Paste)**: Copy-paste your Abstract or Introduction directly into the text area.
2.  **Configure**:
    *   Select "Standard Audit" (Balance of speed/rigor) or "Deep Scan" (Maximum rigor).
3.  **Run**:
    *   Click **"Start Validation"**.
    *   The system will instantiate the 6-Adversary Swarm.
    *   Please wait 30-60 seconds for the agents to debate and converge.

### Understanding the Report
The final report gives you three key outputs:
1.  **Argus Score (0-100)**: A confidence metric. >80 is "Journal Ready". <50 indicates "Major Flaws".
2.  **Claim Analysis**: A breakdown of every claim found in your text, with specific "Attack Vectors" (criticisms) and a verdict (Pass/Fail).
3.  **Novelty Tier**:
    *   *Type I*: Novel Contribution.
    *   *Type II*: Incremental.
    *   *Type III*: Duplicate/Derivative.

---

## 3. Credits & billing

*   **1 Credit = 1 Audit** (up to 5,000 words).
*   **Free Trial**: New Individual accounts get **3 Free Credits**.
*   **Purchase**: Go to **Settings > Billing** to buy more credit packs securely via Razorpay.

---

## 4. Security & Privacy
*   **Ephemeral Mode**: By default, ARGUS runs in "Ephemeral Mode".
*   **What this means**: Your PDF and its text are processed in RAM. Once you close the tab, the data is wiped using a cryptographically secure method. We cannot see your research.
*   **Deletion Certificate**: You can download a "Certificate of Deletion" after every session for your records.

---

## 5. Troubleshooting

*   **"Auth session missing"**: Accessing the dashboard requires a login. Please sign in.
*   **PDF Parsing Error**: Ensure your PDF is text-selectable (not scanned images).
*   **Credit Balance not updating**: Refresh the page. If issues persist, contact support.

---

**Need Help?**
Contact `support@argus-thesis.com`

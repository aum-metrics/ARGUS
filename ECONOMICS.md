# ARGUS Unit Economics Analysis
**Scenario**: "The Monster Paper" (30-Page IEEE Transaction, Dense Layout).

## 1. The Inputs
*   **Length**: 30 Pages (Double Column, 9pt font).
*   **Word Count**: ~25,000 words.
*   **Token Count**: ~33,000 tokens (Input).
*   **Protocol**: 6-Agent Adversarial Swarm.

## 2. The Architecture Costs (Worst Case)
We estimate costs based on **Google Gemini 1.5 Pro** (High Intelligence) and **Gemini 1.5 Flash** (High Efficiency).

### Option A: The "Intelligence" heavy Mix (1 Pro + 5 Flash)
*   **Orchestrator (Gemini 1.5 Pro)**: Reads full paper, plans attack.
    *   Input: 33k tokens * $3.50/1M = **$0.115**
    *   Output: 2k tokens * $10.50/1M = **$0.021**
*   **The Swarm (5 x Gemini 1.5 Flash)**: Agents execute specific checks.
    *   Input: 5 * 33k * $0.075/1M = **$0.012** (Flash is incredibly cheap)
    *   Output: 5 * 2k * $0.30/1M = **$0.003**
*   **Total Compute Cost**: **$0.151** (15 Cents)

### Option B: The "Rolls Royce" Mix (All 6 Agents are Pro)
*   **Input**: 6 * 33k * $3.50/1M = **$0.69**
*   **Output**: 6 * 2k * $10.50/1M = **$0.12**
*   **Total Compute Cost**: **$0.81** (81 Cents)

## 3. The "Vision Risk" (Images & Charts)
The user can upload images (e.g., Figures, Charts). Code audit reveals `app/api/gemini/route.ts` switches to Vision models.
*   **Gemini Vision Cost**: ~258 tokens per image (Fixed size).
*   **Scenario**: Paper has **20 Complex Charts**.
*   **Token Load**: 20 * 258 = 5,160 tokens.
*   **Cost (Gemini 1.5 Pro)**: 5,160 * $3.50/1M = **$0.018** (1.8 Cents).

**Vision Impact**: Negligible. You can process 1,000 images for $3.50.

---

## 4. Profitability Per Tier

### A. Single Audit ($24.99)
*   **Revenue**: $24.49 (minus payment processing fees)
*   **Cost (Option A + 20 Images)**: $0.15 + $0.02 = **$0.17**
*   **Cost (Option B + 20 Images)**: $0.81 + $0.02 = **$0.83**
*   **Net Profit**: **$23.66 - $24.32**
*   **Margin**: **~96%**

### B. Enterprise Dept ($299.99 / 15 Audits)
*   **Revenue per Unit**: ~$20.00
*   **Cost per Unit (Option B)**: $0.83
*   **Net Profit per Unit**: **$19.17**
*   **Total Monthly Profit**: **$287.55** (from one department)

### C. University ($999.99 / 60 Audits)
*   **Revenue per Unit**: ~$16.66
*   **Cost per Unit (Option B)**: $0.83
*   **Net Profit per Unit**: **$15.83**
*   **Total Monthly Profit**: **$949.80**

## 5. Verdict
**You are safe.**
The token costs of 2026 are so low that even a "brutal" multi-agent architecture on a massive paper consumes less than $1 of compute.
Your margins are software margins (>90%), not service margins.
Removing BYOK is the correct move—it simplifies the product without risking your bottom line.

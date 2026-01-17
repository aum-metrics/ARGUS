# Contributing to Argus

> **Standard Operating Procedures (SOP 101)**

## Code Style
*   **Framework**: Next.js 16+ (App Router).
*   **Language**: TypeScript (Strict Mode).
*   **Styling**: Tailwind CSS (pixel-perfect).
*   **Linting**: Run `npm run lint` before commit.

## Axioms of Development (The "Constitution")
1.  **Zero Retention**: Never add a code path that saves manuscript text to a database.
2.  **Adversarial First**: Agents must disagree. Do not tune them to be "nice".
3.  **Deterministic**: Payment logic must be auditable (`create-order` -> `verify-payment`).

## Branching
*   `main`: Production (Vercel).
*   `dev`: Staging.
*   `feature/*`: New Agents.

## Testing
Run the system health check before PR:
```bash
npm run health-check
```

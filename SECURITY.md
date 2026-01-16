# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.5.x   | :x:                |

## Reporting a Vulnerability

Argus takes data sovereignty seriously. If you discover a vulnerability, especially regarding the **Ephemeral RAM** persistence:

1.  **Do NOT** file a public GitHub issue.
2.  Email `security@argus.ac` immediately.
3.  We will acknowledge receipt within 24 hours.

### Critical Scope
*   **Leakage**: Any persistence of User Manuscript text to disk/DB.
*   **Injection**: Prompt injection bypassing the "Adversarial" axioms.
*   **Payment**: Bypass of the `verify-payment` HMAC signature.

We offer a bug bounty for Critical Scope findings.

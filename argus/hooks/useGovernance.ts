"use client"

import { useState } from 'react';
import { ArgusSession } from '../session';

import { getRolePrompt } from '../prompts';

// Cost Constants (Approximate Token Usage)
// NOTE: These are client-side estimates for UI transparency only.
// Real billing/enforcement should eventually be handled server-side.
export const TOKEN_COSTS = {
    SCAN: 50,
    AUDIT_SINGLE: 150
};

const MAX_BUDGET = 3000; // Hard cap for V1 Safety

export function useGovernance() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState<string>('IDLE');
    const [tokenUsage, setTokenUsage] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, message]);
    };

    // Helper to get keys
    const getKeys = () => {
        if (typeof window === 'undefined') return {};
        return JSON.parse(localStorage.getItem("model_keys") || "{}");
    };

    // Helper: Compute SHA-256 Hash
    const computeHash = async (text: string) => {
        const msgBuffer = new TextEncoder().encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    // Helper: Retry Wrapper for API Resilience
    const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, backoff = 1000): Promise<any> => {
        try {
            const res = await fetch(url, options);

            // Handle 429 specifically
            if (res.status === 429) {
                if (retries > 0) {
                    addLog(`[SYSTEM] Rate limit hit. Cooling down for ${backoff / 1000}s...`);
                    await new Promise(r => setTimeout(r, backoff));
                    return fetchWithRetry(url, options, retries - 1, backoff * 2);
                }
                throw new Error("Rate limit exceeded. System busy.");
            }

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || `HTTP ${res.status}`);
            }

            return res.json();
        } catch (err: any) {
            if (retries > 0 && err.message !== "Rate limit exceeded. System busy.") {
                // Retry on network errors too
                await new Promise(r => setTimeout(r, backoff));
                return fetchWithRetry(url, options, retries - 1, backoff * 2);
            }
            throw err;
        }
    };

    // Step 1: Scanner (Extracts Claims)
    // This is the "Compiler" parsing phase.
    const extractClaims = async (originalText: string, images: string[], currentSession: ArgusSession, onUpdate: (data: any) => void) => {
        setIsProcessing(true);
        setCurrentStep('SCANNING');
        addLog(`[ARGUS_EYE] Scanning document structure (${originalText.length} chars, ${images.length} images)...`);

        try {
            // 0. Compute Hash & Check Cache (Composite Hash)
            const combinedContent = originalText + images.join('');
            const newHash = await computeHash(combinedContent);

            if (currentSession.data.textHash === newHash && currentSession.data.claims.length > 0) {
                addLog(`[ARGUS_EYE] No changes detected. Using cached audit headers.`);
                setIsProcessing(false);
                setCurrentStep('IDLE');
                return;
            }

            // Simulate cost (Higher for images)
            setTokenUsage(prev => prev + TOKEN_COSTS.SCAN + (images.length * 50));

            // Fetch formatting
            const data = await fetchWithRetry('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keys: getKeys(), // Pass BYOK Keys
                    role: 'THESIS_CONSTRUCTOR',
                    sessionId: currentSession.id,
                    images: images, // Pass Images Arary
                    prompt: getRolePrompt('THESIS_CONSTRUCTOR', `
                        TASK: Synthesize the core *arguments* and *hypotheses* from the text below.
                        
                        IMPORTANT RULES:
                        1. Do NOT just extract sentences. Merge related points into strong, standalone assertions.
                        2. If images are present (charts/graphs), incorporate their implications into the relevant textual claim.
                        3. Focus on *causal* claims ("X leads to Y") and *normative* claims ("We should do X").
                        4. Aim for 5-8 high-quality, distinct theses rather than 20+ granular sentences.
                        
                        OUTPUT: JSON array of objects { "id": "C1", "statement": "..." }
                        
                        TEXT CONTENT:
                        ${originalText}
                    `)
                })
            });

            // Parse response (naive regex for JSON extraction if model wraps it)
            // Parse response (Handle Code Blocks and Plain JSON)
            let text = data.content;

            // Cleanup Markdown Code Blocks
            if (text.includes("```json")) {
                text = text.replace(/```json/g, "").replace(/```/g, "");
            } else if (text.includes("```")) {
                text = text.replace(/```/g, "");
            }

            const jsonMatch = text.match(/\[[\s\S]*\]/);
            const claims = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

            if (claims.length === 0) {
                addLog(`[DEBUG] Raw Model Output: ${text.substring(0, 500)}`);
            }

            addLog(`[ARGUS_EYE] Extracted ${claims.length} claims (Text + Visuals).`);

            // Update Session Data with Hash
            const claimsWithHashes = await Promise.all(claims.map(async (c: any) => ({
                ...c,
                claimHash: await computeHash(c.statement),
                status: 'PENDING',
                noveltyClassification: [],
                governanceLog: []
            })));

            const newData = {
                ...currentSession.data,
                originalText,
                textHash: newHash,
                claims: claimsWithHashes
            };
            onUpdate(newData);

        } catch (error: any) {
            addLog(`[ERROR] Scan failed: ${error.message}`);
        } finally {
            setIsProcessing(false);
            setCurrentStep('IDLE');
        }
    };

    // Step 2: Audit Single Claim
    // This is the "Unit Test" phase.
    const runAdversaryOnClaim = async (claimId: string, currentSession: ArgusSession, onUpdate: (data: any) => void) => {
        setIsProcessing(true);
        setCurrentStep(`AUDITING_${claimId}`);
        addLog(`[ORCHESTRATOR] Instantiating adversary for ${claimId}...`);

        try {
            if (tokenUsage + TOKEN_COSTS.AUDIT_SINGLE > MAX_BUDGET) {
                addLog(`[SYSTEM] Governance budget exhausted (${MAX_BUDGET} T). Upgrade required.`);
                setIsProcessing(false);
                setCurrentStep('IDLE');
                return;
            }

            setTokenUsage(prev => prev + TOKEN_COSTS.AUDIT_SINGLE);

            const claim = currentSession.data.claims.find((c: any) => c.id === claimId);
            if (!claim) throw new Error("Claim not found");

            // 0. Compute Claim Hash & Check Cache
            const claimHash = await computeHash(claim.statement);

            // Check if already audited and unchanged
            // Optimization: Frozen `ACCEPTED` claims should not be re-audited unless text changes
            if (claim.claimHash === claimHash && claim.status !== 'PENDING') {
                addLog(`[ORCHESTRATOR] Claim unchanged. Using cached audit for ${claimId}.`);
                setIsProcessing(false);
                setCurrentStep('IDLE');
                return;
            }

            // 1. The Thesis Destroyer Attacks
            // We use the actual sophisticated prompt from the system's "Brain"
            addLog(`[THESIS_DESTROYER] Initiating adversarial attack sequence...`);
            const attackPrompt = getRolePrompt('THESIS_DESTROYER', `CLAIM: "${claim.statement}"`);

            const attackData = await fetchWithRetry('/api/gemini', {
                method: 'POST',
                body: JSON.stringify({
                    keys: getKeys(),
                    role: 'THESIS_DESTROYER',
                    sessionId: currentSession.id,
                    prompt: attackPrompt
                })
            });

            const attackText = attackData.content || "Attack generation failed.";

            // 2. The Reviewer Simulator Judges
            // We feed the attack *back* into the Reviewer agent for a structured verdict.
            addLog(`[REVIEWER_SIMULATOR] Analyzing attack impact...`);
            const verdictPrompt = getRolePrompt('JOURNAL_REVIEWER_SIMULATOR', `
                CLAIM: "${claim.statement}"
                
                ADVERSARIAL_FINDINGS:
                ${attackText}
                
                TASK: Render a final verdict based on the adversary's findings.
                FORMAT: Strict JSON Object
                {
                    "verdict": "ACCEPTED" | "REVISE" | "REJECT",
                    "fatal": boolean,
                    "noveltyClassification": ["Tag1", "Tag2"],
                    "reasons": ["Reason 1", "Reason 2"]
                }
            `);

            const verdictData = await fetchWithRetry('/api/gemini', {
                method: 'POST',
                body: JSON.stringify({
                    keys: getKeys(),
                    role: 'JOURNAL_REVIEWER_SIMULATOR',
                    sessionId: currentSession.id,
                    prompt: verdictPrompt
                })
            });

            const verdictRaw = verdictData.content || "{}";

            // Robust JSON Parsing
            let verdictJson: any = {};
            try {
                const jsonMatch = verdictRaw.match(/\{[\s\S]*\}/);
                verdictJson = jsonMatch ? JSON.parse(jsonMatch[0]) : { verdict: "REJECT", fatal: true, reasons: ["JSON Parse Failure"] };
            } catch (e) {
                console.error("Verdict Parse Error", e);
                verdictJson = { verdict: "REJECT", fatal: true, reasons: ["JSON Parse Failure"] };
            }

            // Strict Enum Guard (Prevent Hallucinations)
            const ALLOWED_STATUSES = ["ACCEPTED", "REVISE", "REJECTED"]; // Normalized
            let rawVerdict = (verdictJson.verdict || "REJECTED").toUpperCase();

            // Map "REJECT" -> "REJECTED" for consistency
            if (rawVerdict === "REJECT") rawVerdict = "REJECTED";
            if (rawVerdict === "ACCEPT") rawVerdict = "ACCEPTED";

            const status = ALLOWED_STATUSES.includes(rawVerdict) ? rawVerdict : "REJECTED"; // Default safe fallback

            addLog(`[JUDGE] Final disposition for ${claimId}: ${status}`);

            // Update specific claim in session
            const updatedClaims = currentSession.data.claims.map((c: any) => {
                if (c.id === claimId) {
                    return {
                        ...c,
                        status,
                        claimHash, // Store hash for future caching
                        governanceLog: [
                            ...c.governanceLog,
                            { role: 'THESIS_DESTROYER', content: attackText },
                            { role: 'JOURNAL_REVIEWER_SIMULATOR', content: verdictRaw } // Store strict JSON output
                        ],
                        noveltyClassification: verdictJson.noveltyClassification || [], // Dynamic Tags
                        governanceMeta: {
                            auditedAt: new Date().toISOString(),
                            modelUsed: 'gemini-2.0-flash-exp', // Or dynamic if we track it
                            tokenEstimate: TOKEN_COSTS.AUDIT_SINGLE
                        }
                    };
                }
                return c;
            });

            onUpdate({ ...currentSession.data, claims: updatedClaims });

        } catch (error: any) {
            addLog(`[ERROR] Audit failed: ${error.message}`);
        } finally {
            setIsProcessing(false);
            setCurrentStep('IDLE');
        }
    };

    return {
        logs,
        isProcessing,
        currentStep,
        tokenUsage,
        extractClaims,
        runAdversaryOnClaim
    };
}

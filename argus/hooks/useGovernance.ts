/**
 * Author: Sambath Kumar Natarajan
 */
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
        setCurrentStep('QUEUING'); // Status Update for UI
        addLog(`[SYSTEM] Requesting compute slot...`);

        let ticketId: string | null = null;

        try {
            // ------------------------------------------
            // 0. QUEUE SYSTEM (The "Bouncer")
            // ------------------------------------------
            const queueRes = await fetch('/api/queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'RESERVE', userId: currentSession.id })
            });

            if (queueRes.status === 429) {
                const busyData = await queueRes.json();
                addLog(`[SYSTEM] ⚠️ High Traffic. Queue Position: ${busyData.queuePosition}`);
                alert("System is currently at max capacity. Please try again in 30 seconds.");
                setIsProcessing(false);
                setCurrentStep('IDLE');
                return;
            }

            const ticketData = await queueRes.json();
            ticketId = ticketData.ticketId;
            addLog(`[SYSTEM] Slot Secured. Ticket: ${ticketId?.substring(0, 6)}...`);
            // ------------------------------------------

            setCurrentStep('SCANNING');
            addLog(`[ARGUS_EYE] Scanning document structure (${originalText.length} chars, ${images.length} images)...`);

            // 0. Compute Hash & Check Cache (Composite Hash)
            const combinedContent = originalText + images.join('');
            const newHash = await computeHash(combinedContent);

            if (currentSession.data.textHash === newHash && currentSession.data.claims.length > 0) {
                addLog(`[ARGUS_EYE] No changes detected. Using cached audit headers.`);
                setIsProcessing(false);
                setCurrentStep('IDLE');
                // Release ticket immediately if cached
                fetch('/api/queue', {
                    method: 'POST',
                    body: JSON.stringify({ action: 'RELEASE', ticketId })
                });
                return;
            }

            // Simulate cost (Higher for images)
            setTokenUsage(prev => prev + TOKEN_COSTS.SCAN + (images.length * 50));

            // Fetch formatting
            const data = await fetchWithRetry('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keys: undefined, // Managed Compute (Server-Side Key)
                    role: 'THESIS_CONSTRUCTOR',
                    sessionId: currentSession.id,
                    filename: currentSession.data.context.originalFilename, // [NEW] Pass Filename for Audit Log
                    images: images, // Pass Images Arary
                    prompt: getRolePrompt('THESIS_CONSTRUCTOR', `
                        TASK: Synthesize the core *arguments* and *hypotheses* from the provided content.
                        
                        Attempt to extract claims from ANY text provided below OR from the visual inputs (charts/graphs/tables) attached to this request.
                        
                        CRITICAL INSTRUCTION FOR IMAGES:
                        If an image contains a chart, graph, or data table, you MUST extract the claim it is making (e.g., "Figure 1 demonstrates a linear relationship between X and Y"). Treat these visual claims as first-class citizens.
                        
                        IMAGE INDEX REFERENCE:
                        The images attached are indexed from 0 to ${images.length - 1}.
                        
                        IMPORTANT RULES:
                        1. Do NOT just extract sentences. Merge related points into strong, standalone assertions.
                        2. If images are present (charts/graphs/tables), incorporate their implications into the relevant textual claim.
                        3. For each claim, if it is supported by one or more of the attached images, include the indices of those images in a "evidenceIndices" array.
                        4. Focus on *causal* claims ("X leads to Y") and *normative* claims ("We should do X").
                        5. Aim for 5-8 high-quality, distinct theses rather than 20+ granular sentences.
                        
                        OUTPUT: JSON array of objects { "id": "C1", "statement": "...", "evidenceIndices": [number, ...] }
                        
                        TEXT CONTENT:
                        ${originalText || "[NO TEXT INPUT - ANALYZE ATTACHED IMAGES]"}
                    `)
                })
            });

            // Parse response (Advanced Repair Logic)
            let text = data.content;
            let claims = [];

            try {
                // 1. Tidy Markdown
                if (text.includes("```json")) {
                    text = text.replace(/```json/g, "").replace(/```/g, "");
                } else if (text.includes("```")) {
                    text = text.replace(/```/g, "");
                }

                // 2. Extract Array
                const jsonMatch = text.match(/\[[\s\S]*\]/);
                const jsonString = jsonMatch ? jsonMatch[0] : text;

                claims = JSON.parse(jsonString);

            } catch (jsonErr) {
                console.error("JSON PARSE ERROR:", jsonErr);
                console.error("RAW TEXT:", text);
                addLog(`[SYSTEM_ERROR] Failed to parse AI response. Raw output logged to console.`);
                // Attempt soft fail if possible or just return empty
            }

            if (!Array.isArray(claims) || claims.length === 0) {
                addLog(`[ARGUS_EYE] ⚠️ No claims extracted. The model might have refused the content or failed.`);
                addLog(`[DEBUG] Raw Model Output: ${text.substring(0, 100)}...`);
                setIsProcessing(false);
                setCurrentStep('IDLE');
                alert("Extraction yielded no results. Please ensure the text contains academic claims.");
                return;
            }

            addLog(`[ARGUS_EYE] Extracted ${claims.length} claims (Text + Visuals).`);

            // Update Session Data with Hash
            const claimsWithHashes = await Promise.all(claims.map(async (c: any) => ({
                ...c,
                claimHash: await computeHash(c.statement),
                status: 'PENDING',
                noveltyClassification: [],
                governanceLog: [],
                visualEvidence: (c.evidenceIndices || []).map((idx: number) => images[idx]).filter(Boolean)
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
            // RELEASE TICKET (Queue Cleanup)
            if (ticketId) {
                fetch('/api/queue', {
                    method: 'POST',
                    body: JSON.stringify({ action: 'RELEASE', ticketId })
                }).catch(e => console.error("Failed to release lock", e));
            }

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

            // 1. The Prosecution Phase (Parallel Execution of Layers 2, 3, 4, 5)
            // We launch the full adversarial stack against the claim.
            addLog(`[ORCHESTRATOR] Launching 6-Layer Adversarial Swarm...`);

            const attackPrompt = getRolePrompt('THESIS_DESTROYER', `CLAIM: "${claim.statement}"`);
            const methodPrompt = getRolePrompt('METHODOLOGY_PROSECUTOR', `CLAIM: "${claim.statement}"
FULL CONTEXT: ${currentSession.data.originalText.substring(0, 5000)}...`); // Give more context
            const litPrompt = getRolePrompt('LITERATURE_ADVERSARY', `CLAIM: "${claim.statement}"`);
            const formPrompt = getRolePrompt('FORMALISM_AUDITOR', `CLAIM: "${claim.statement}"`);

            // Execute Swarm (Modified for V1.1 Async Chaining)
            // 1. Fire fast agents AND the Draft Step of the slow agent in parallel
            // This ensures we don't waste time waiting for the draft before starting others.

            addLog(`[SWARM] Phase 1: Parallel Drafting & Fast Agents...`);

            const results = await Promise.allSettled([
                // A. Thesis Destroyer - STEP 1 (DRAFT)
                fetchWithRetry('/api/gemini', {
                    method: 'POST',
                    body: JSON.stringify({
                        role: 'THESIS_DESTROYER',
                        sessionId: currentSession.id,
                        prompt: attackPrompt,
                        images: claim.visualEvidence || [],
                        step: 'DRAFT' // [NEW] Explicit Step
                    })
                }),
                // B. Methodology (Fast)
                fetchWithRetry('/api/gemini', {
                    method: 'POST',
                    body: JSON.stringify({
                        role: 'METHODOLOGY_PROSECUTOR',
                        sessionId: currentSession.id,
                        prompt: methodPrompt,
                        images: claim.visualEvidence || []
                    })
                }),
                // C. Literature (Fast)
                fetchWithRetry('/api/gemini', {
                    method: 'POST',
                    body: JSON.stringify({
                        role: 'LITERATURE_ADVERSARY',
                        sessionId: currentSession.id,
                        prompt: litPrompt,
                        images: claim.visualEvidence || []
                    })
                }),
                // D. Formalism (Fast)
                fetchWithRetry('/api/gemini', {
                    method: 'POST',
                    body: JSON.stringify({
                        role: 'FORMALISM_AUDITOR',
                        sessionId: currentSession.id,
                        prompt: formPrompt,
                        images: claim.visualEvidence || []
                    })
                })
            ]);

            // Unpack Results (Robustly)
            const attackDraftRes = results[0].status === 'fulfilled' ? results[0].value : { content: "Logic audit unavailable (Network Error).", nextStep: null };
            const methodRes = results[1].status === 'fulfilled' ? results[1].value : { content: "Methodology audit bypassed (Timeout)." };
            const litRes = results[2].status === 'fulfilled' ? results[2].value : { content: "Literature check bypassed (Timeout)." };
            const formRes = results[3].status === 'fulfilled' ? results[3].value : { content: "Formalism check bypassed (Timeout)." };

            // Log Failures if any
            results.forEach((r, i) => {
                if (r.status === 'rejected') {
                    console.warn(`[PARTIAL FAILURE] Agent ${i} failed:`, r.reason);
                    addLog(`[WARNING] Agent ${i} dropped out. Continuing audit...`);
                }
            });

            // 2. Fire Refine Step (Sequential)
            // We now take the draft and refine it. This breaks the 60s timeout into two ~20s chunks.
            addLog(`[SWARM] Phase 2: Refining Logic (Deep Reflect)...`);
            setCurrentStep(`AUDITING_${claimId}_REFINE`); // UI Hint

            let attackText = attackDraftRes.content || "Logic attack failed.";

            // Only refine if we got a valid draft and the API says so
            if (attackDraftRes.nextStep === 'REFINE') {
                const refineRes = await fetchWithRetry('/api/gemini', {
                    method: 'POST',
                    body: JSON.stringify({
                        role: 'THESIS_DESTROYER',
                        sessionId: currentSession.id,
                        prompt: attackPrompt, // Standard prompt
                        context: attackDraftRes.content, // Pass DRAFT as context
                        images: claim.visualEvidence || [],
                        step: 'REFINE' // [NEW] Explicit Step
                    })
                });
                attackText = refineRes.content || attackText; // Upgrade content
                addLog(`[SWARM] Refinement Complete.`);
            }

            const methodText = methodRes.content || "Methodology audit inactive.";
            const litText = litRes.content || "Literature check inactive.";
            const formText = formRes.content || "Formalism check inactive.";

            addLog(`[SWARM] Agents returned data. Synthesizing verdict...`);

            // 2. The Reviewer Simulator Judges (Layer 6 - ENHANCED)
            // We feed the FULL aggregated prosecution dossier to the Judge.
            const verdictPrompt = getRolePrompt('JOURNAL_REVIEWER_SIMULATOR', `
                CLAIM: "${claim.statement}"
                
                *** PROSECUTION DOSSIER ***
                
                [LAYER 2: LOGIC & EPISTEMOLOGY]
                ${attackText}
                
                [LAYER 3: METHODOLOGY & STATISTICS]
                ${methodText}
                
                [LAYER 4: NOVELTY & PRIOR ART]
                ${litText}
                
                [LAYER 5: FORMALISM & RIGOR]
                ${formText}

                *** INSTITUTIONAL CONTEXT ***
                Candidate: ${currentSession.data.context.candidateName || "Anonymous"}
                Degree: ${currentSession.data.context.degree || "N/A"}
                Target Journal: ${currentSession.data.context.targetJournal || "General Academic"}
                
                ***************************
                
                TASK: Act as the Editor-in-Chief. Render a final verdict and a publication readiness score.
                
                OUTPUT FORMAT: Strict JSON Object
                {
                    "readinessScore": number, // 0-100 (where >85 is Publishable)
                    "trinityScore": {
                        "coherence": number, // 0-100 (Logical flow)
                        "empirical": number, // 0-100 (Data density)
                        "novelty": number    // 0-100 (Originality)
                    },
                    "verdict": "PUBLISHABLE" | "REVISE_MAJOR" | "REJECT",
                    "executiveSummary": "Short 2-sentence summary for the Department Head.",
                    "actionItems": [
                        { "priority": "HIGH" | "MED", "layer": "Methodology", "suggestion": "Specific fix required..." }
                    ],
                    "fatal": boolean,
                    "noveltyClassification": ["Tag1", "Tag2"],
                    "reasons": ["Reason 1", "Reason 2"]
                }
            `);

            const verdictData = await fetchWithRetry('/api/gemini', {
                method: 'POST',
                body: JSON.stringify({
                    // keys: REMOVED,
                    role: 'JOURNAL_REVIEWER_SIMULATOR',
                    sessionId: currentSession.id,
                    prompt: verdictPrompt
                })
            });

            const verdictRaw = verdictData.content || "{}";

            // Robust JSON Parsing
            let verdictJson: any = {};
            try {
                // Sanitize Markdown
                let cleanJson = verdictRaw;
                if (cleanJson.includes("```json")) {
                    cleanJson = cleanJson.replace(/```json/g, "").replace(/```/g, "");
                } else if (cleanJson.includes("```")) {
                    cleanJson = cleanJson.replace(/```/g, "");
                }

                const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
                verdictJson = jsonMatch ? JSON.parse(jsonMatch[0]) : { verdict: "REJECT", fatal: true, reasons: ["JSON Parse Failure"] };

            } catch (e) {
                console.error("Verdict Parse Error", e);
                verdictJson = { verdict: "REJECT", fatal: true, reasons: ["System Error"] };
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
                            { role: 'METHODOLOGY_PROSECUTOR', content: methodText },
                            { role: 'LITERATURE_ADVERSARY', content: litText },
                            { role: 'FORMALISM_AUDITOR', content: formText },
                            { role: 'JOURNAL_REVIEWER_SIMULATOR', content: verdictRaw } // Store strict JSON output
                        ],
                        noveltyClassification: verdictJson.noveltyClassification || [], // Dynamic Tags
                        governanceMeta: {
                            auditedAt: new Date().toISOString(),
                            modelUsed: 'gemini-2.0-flash-exp', // Or dynamic if we track it
                            tokenEstimate: TOKEN_COSTS.AUDIT_SINGLE * 4 // Updated Estimate
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
        setIsProcessing, // Expose for external control (PDF parsing)
        currentStep,
        setCurrentStep, // Expose for external control
        tokenUsage,
        extractClaims,
        runAdversaryOnClaim
    };
}

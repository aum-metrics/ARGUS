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
                body: JSON.stringify({
                    type: 'QUEUE_RESERVATION',
                    payload: { action: 'RESERVE', userId: currentSession.id }
                })
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
            ticketId = ticketData.jobId;
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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'QUEUE_RESERVATION',
                        payload: { action: 'RELEASE', ticketId }
                    })
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
                        4. Extract specific claims across ALL categories: Problem, Contribution, Comparative, Performance, and Causal.
                        5. Aim for the **Top 10-15 atomic, falsifiable claims**. Do not feel forced to find 15 if there are fewer. Prioritize the most "load-bearing" and critical assertions. Quality over quantity.
                        
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
                let cleanText = text;
                const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/i;
                const match = text.match(codeBlockRegex);
                if (match) {
                    cleanText = match[1];
                }

                // 2. Smart JSON Extraction (Bracket Aware)
                let startIndex = cleanText.indexOf('[');
                if (startIndex !== -1) {
                    let cursor = startIndex;
                    let attempts = 0;

                    while (cursor !== -1 && attempts < 5 && claims.length === 0) {
                        let balance = 0;
                        let endIndex = -1;
                        let insideString = false;
                        let escape = false;

                        for (let i = cursor; i < cleanText.length; i++) {
                            const char = cleanText[i];

                            if (escape) {
                                escape = false;
                                continue;
                            }
                            if (char === '\\') {
                                escape = true;
                                continue;
                            }
                            if (char === '"') {
                                insideString = !insideString;
                                continue;
                            }

                            if (!insideString) {
                                if (char === '[') balance++;
                                if (char === ']') {
                                    balance--;
                                    if (balance === 0) {
                                        endIndex = i;
                                        break;
                                    }
                                }
                            }
                        }

                        if (endIndex !== -1) {
                            const candidate = cleanText.substring(cursor, endIndex + 1);
                            try {
                                const parsed = JSON.parse(candidate);
                                if (Array.isArray(parsed) && parsed.length > 0) {
                                    claims = parsed;
                                }
                            } catch (e) {
                                // Retry with newline fix
                                try {
                                    const fixed = candidate.replace(/\n/g, "\\n");
                                    const parsedFixed = JSON.parse(fixed);
                                    if (Array.isArray(parsedFixed) && parsedFixed.length > 0) {
                                        claims = parsedFixed;
                                    }
                                } catch (e2) { }
                            }
                        }

                        // Move to next '[' if failed or not array
                        if (claims.length === 0) {
                            cursor = cleanText.indexOf('[', cursor + 1);
                            attempts++;
                        }
                    }
                }

                // Fallback to original regex if smart parse failed (for simple cases)
                if (claims.length === 0) {
                    const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
                    if (jsonMatch) {
                        claims = JSON.parse(jsonMatch[0]);
                    }
                }
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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'QUEUE_RESERVATION',
                        payload: { action: 'RELEASE', ticketId }
                    })
                }).catch(e => console.error("Failed to release lock", e));
            }

            setIsProcessing(false);
            setCurrentStep('IDLE');
        }
    };

    // ------------------------------------------------------------------
    // CORE: Single Claim Audit Logic (Pure Function)
    // ------------------------------------------------------------------
    const _auditClaimCore = async (claim: any, contextText: string, sessionId: string) => {
        // 1. Prosecution Phase
        const attackPrompt = getRolePrompt('THESIS_DESTROYER', `CLAIM: "${claim.statement}"`);
        const methodPrompt = getRolePrompt('METHODOLOGY_PROSECUTOR', `CLAIM: "${claim.statement}"\nFULL CONTEXT: ${contextText.substring(0, 5000)}...`);
        const litPrompt = getRolePrompt('LITERATURE_ADVERSARY', `CLAIM: "${claim.statement}"`);
        const formPrompt = getRolePrompt('FORMALISM_AUDITOR', `CLAIM: "${claim.statement}"`);

        // Parallel Execution of Layers
        const results = await Promise.allSettled([
            fetchWithRetry('/api/gemini', {
                method: 'POST',
                body: JSON.stringify({ role: 'THESIS_DESTROYER', sessionId, prompt: attackPrompt, images: claim.visualEvidence || [], step: 'DRAFT' })
            }),
            fetchWithRetry('/api/gemini', {
                method: 'POST',
                body: JSON.stringify({ role: 'METHODOLOGY_PROSECUTOR', sessionId, prompt: methodPrompt, images: claim.visualEvidence || [] })
            }),
            fetchWithRetry('/api/gemini', {
                method: 'POST',
                body: JSON.stringify({ role: 'LITERATURE_ADVERSARY', sessionId, prompt: litPrompt, images: claim.visualEvidence || [] })
            }),
            fetchWithRetry('/api/gemini', {
                method: 'POST',
                body: JSON.stringify({ role: 'FORMALISM_AUDITOR', sessionId, prompt: formPrompt, images: claim.visualEvidence || [] })
            })
        ]);

        const attackDraftRes = results[0].status === 'fulfilled' ? results[0].value : { content: "Logic audit unavailable.", nextStep: null };
        const methodRes = results[1].status === 'fulfilled' ? results[1].value : { content: "Methodology audit bypassed." };
        const litRes = results[2].status === 'fulfilled' ? results[2].value : { content: "Literature check bypassed." };
        const formRes = results[3].status === 'fulfilled' ? results[3].value : { content: "Formalism check bypassed." };

        // Optimization: Step 2 Refine (Sequential to Step 1A)
        let attackText = attackDraftRes.content || "Logic attack failed.";
        if (attackDraftRes.nextStep === 'REFINE') {
            try {
                const refineRes = await fetchWithRetry('/api/gemini', {
                    method: 'POST',
                    body: JSON.stringify({
                        role: 'THESIS_DESTROYER',
                        sessionId,
                        prompt: attackPrompt,
                        context: attackDraftRes.content,
                        images: claim.visualEvidence || [],
                        step: 'REFINE'
                    })
                });
                attackText = refineRes.content || attackText;
            } catch (e) {
                console.warn("Refine failed", e);
            }
        }

        const methodText = methodRes.content || "Methodology audit inactive.";
        const litText = litRes.content || "Literature check inactive.";
        const formText = formRes.content || "Formalism check inactive.";

        // 2. The Judge (Layer 6)
        const verdictPrompt = getRolePrompt('JOURNAL_REVIEWER_SIMULATOR', `
            CLAIM: "${claim.statement}"
            
            *** PROSECUTION DOSSIER ***
            [LAYER 2: LOGIC] ${attackText}
            [LAYER 3: METHODOLOGY] ${methodText}
            [LAYER 4: NOVELTY] ${litText}
            [LAYER 5: FORMALISM] ${formText}

            *** INSTITUTIONAL CONTEXT ***
            Candidate: Anonymous
            Target Journal: General Academic
            
            TASK: Act as the Editor-in-Chief. Render a final verdict.
            OUTPUT FORMAT: Strict JSON Object { "readinessScore": number, "sixAdversaryScore": { ... }, "verdict": "PUBLISHABLE" | "REVISE_MAJOR" | "REJECT", "executiveSummary": "...", "truthStatement": "...", "actionItems": [], "fatal": boolean, "noveltyClassification": [], "reasons": [] }
        `);

        const verdictData = await fetchWithRetry('/api/gemini', {
            method: 'POST',
            body: JSON.stringify({ role: 'JOURNAL_REVIEWER_SIMULATOR', sessionId, prompt: verdictPrompt })
        });

        const verdictRaw = verdictData.content || "{}";
        let verdictJson: any = {};
        try {
            let cleanJson = verdictRaw.replace(/```json/g, "").replace(/```/g, "");
            const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
            verdictJson = jsonMatch ? JSON.parse(jsonMatch[0]) : { verdict: "REJECT", fatal: true };
        } catch (e) { }

        // Strict Enum Guard
        const ALLOWED_STATUSES = ["ACCEPTED", "REVISE", "REJECTED"];
        let rawVerdict = (verdictJson.verdict || "REJECTED").toUpperCase();
        if (rawVerdict === "REJECT") rawVerdict = "REJECTED";
        if (rawVerdict === "ACCEPT") rawVerdict = "ACCEPTED";
        const status = ALLOWED_STATUSES.includes(rawVerdict) ? rawVerdict : "REJECTED";

        return {
            ...claim,
            status,
            governanceLog: [
                ...claim.governanceLog,
                { role: 'THESIS_DESTROYER', content: attackText },
                { role: 'METHODOLOGY_PROSECUTOR', content: methodText },
                { role: 'LITERATURE_ADVERSARY', content: litText },
                { role: 'FORMALISM_AUDITOR', content: formText },
                { role: 'JOURNAL_REVIEWER_SIMULATOR', content: verdictRaw }
            ],
            noveltyClassification: verdictJson.noveltyClassification || [],
            governanceMeta: {
                auditedAt: new Date().toISOString(),
                tokenEstimate: TOKEN_COSTS.AUDIT_SINGLE * 4
            },
            score: verdictJson.readinessScore || 0
        };
    };

    // Helper: Recalculate Session Score & Status
    const _calculateSessionStats = (claims: any[]) => {
        const completedClaims = claims.filter((c: any) => c.status !== 'PENDING');

        // Default Stats
        const stats = {
            score: 0,
            status: 'PENDING',
            report: {
                readinessScore: 0,
                sixAdversaryScore: {
                    thesisClarity: 0,
                    argumentRobustness: 0,
                    methodologyRigor: 0,
                    noveltyPositioning: 0,
                    formalismPrecision: 0,
                    overall: 0
                }
            }
        };

        if (completedClaims.length === 0) return stats;

        // Calculate Averages
        let totalReadiness = 0;
        let totalSix = { thesisClarity: 0, argumentRobustness: 0, methodologyRigor: 0, noveltyPositioning: 0, formalismPrecision: 0, overall: 0 };

        // We need to parse per-claim logs again or rely on claim.score
        // For 'sixAdversaryScore', we need to look into governanceLog
        completedClaims.forEach((c: any) => {
            totalReadiness += (c.score || 0);

            // Try to extract detailed scores if available
            const reviewerLog = c.governanceLog.find((l: any) => l.role === 'JOURNAL_REVIEWER_SIMULATOR');
            if (reviewerLog) {
                try {
                    const json = JSON.parse(reviewerLog.content.replace(/```json/g, "").replace(/```/g, "").match(/\{[\s\S]*\}/)?.[0] || "{}");
                    if (json.sixAdversaryScore) {
                        totalSix.thesisClarity += json.sixAdversaryScore.thesisClarity || 0;
                        totalSix.argumentRobustness += json.sixAdversaryScore.argumentRobustness || 0;
                        totalSix.methodologyRigor += json.sixAdversaryScore.methodologyRigor || 0;
                        totalSix.noveltyPositioning += json.sixAdversaryScore.noveltyPositioning || 0;
                        totalSix.formalismPrecision += json.sixAdversaryScore.formalismPrecision || 0;
                        totalSix.overall += json.sixAdversaryScore.overall || 0;
                    }
                } catch (e) { }
            }
        });

        stats.score = Math.round(totalReadiness / completedClaims.length);
        stats.report.readinessScore = stats.score;
        stats.report.sixAdversaryScore = {
            thesisClarity: Math.round(totalSix.thesisClarity / completedClaims.length),
            argumentRobustness: Math.round(totalSix.argumentRobustness / completedClaims.length),
            methodologyRigor: Math.round(totalSix.methodologyRigor / completedClaims.length),
            noveltyPositioning: Math.round(totalSix.noveltyPositioning / completedClaims.length),
            formalismPrecision: Math.round(totalSix.formalismPrecision / completedClaims.length),
            overall: Math.round(totalSix.overall / completedClaims.length)
        };

        const allComplete = claims.every((c: any) => c.status !== 'PENDING');
        stats.status = allComplete ? 'COMPLETED' : 'AUDITING';

        return stats;
    };

    // Step 2: Audit Single Claim
    const runAdversaryOnClaim = async (claimId: string, currentSession: ArgusSession, onUpdate: (data: any) => void) => {
        setIsProcessing(true);
        setCurrentStep(`AUDITING_${claimId}`);
        addLog(`[ORCHESTRATOR] Instantiating adversary for ${claimId}...`);

        try {
            if (tokenUsage + TOKEN_COSTS.AUDIT_SINGLE > MAX_BUDGET) {
                addLog(`[SYSTEM] Governance budget exhausted.`);
                setIsProcessing(false);
                return;
            }
            setTokenUsage(prev => prev + TOKEN_COSTS.AUDIT_SINGLE);
            const claim = currentSession.data.claims.find((c: any) => c.id === claimId);
            if (!claim) throw new Error("Claim not found");

            const updatedClaim = await _auditClaimCore(claim, currentSession.data.originalText, currentSession.id);
            addLog(`[JUDGE] Final disposition for ${claimId}: ${updatedClaim.status}`);

            const updatedClaims = currentSession.data.claims.map((c: any) => c.id === claimId ? updatedClaim : c);
            const stats = _calculateSessionStats(updatedClaims);

            onUpdate({
                ...currentSession.data,
                claims: updatedClaims,
                score: stats.score,
                report: { ...currentSession.data.report, ...stats.report }
            });

        } catch (error: any) {
            addLog(`[ERROR] Audit failed: ${error.message}`);
        } finally {
            setIsProcessing(false);
            setCurrentStep('IDLE');
        }
    };

    // [NEW] Parallel Batch Audit
    const runAdversariesOnAll = async (currentSession: ArgusSession, onUpdate: (data: any) => void) => {
        setIsProcessing(true);
        setCurrentStep('AUDITING_ALL');
        const pendingClaims = currentSession.data.claims.filter((c: any) => c.status === 'PENDING');

        addLog(`[ORCHESTRATOR] Launching Parallel Swarm on ${pendingClaims.length} claims...`);
        addLog(`[SYSTEM] Concurrency Limit: 3 threads active.`);

        if (pendingClaims.length === 0) {
            setIsProcessing(false);
            setCurrentStep('IDLE');
            return;
        }

        try {
            // Simple Chunking/Queue Simulation (Concurrency = 3)
            let processedClaims = [...currentSession.data.claims];
            const batchSize = 3;

            for (let i = 0; i < pendingClaims.length; i += batchSize) {
                const batch = pendingClaims.slice(i, i + batchSize);
                addLog(`[SWARM] Processing Batch ${Math.ceil((i + 1) / batchSize)}/${Math.ceil(pendingClaims.length / batchSize)}...`);

                const batchResults = await Promise.all(batch.map(async (claim: any) => {
                    try {
                        return await _auditClaimCore(claim, currentSession.data.originalText, currentSession.id);
                    } catch (e: any) {
                        console.error(`Claim ${claim.id} failed`, e);
                        addLog(`[ERROR] Claim ${claim.id} failed: ${e.message}`);
                        return claim; // Return original on fail
                    }
                }));

                // Update Local State Map (Merge)
                processedClaims = processedClaims.map((c: any) => {
                    const match = batchResults.find((res: any) => res.id === c.id);
                    return match || c;
                });

                // Calculate incremental score
                const stats = _calculateSessionStats(processedClaims);

                // Incremental UI Update
                onUpdate({
                    ...currentSession.data,
                    claims: processedClaims,
                    score: stats.score,
                    report: { ...currentSession.data.report, ...stats.report }
                });
                setTokenUsage(prev => prev + (batch.length * TOKEN_COSTS.AUDIT_SINGLE));
            }

            addLog(`[ORCHESTRATOR] All audits complete.`);

        } catch (e: any) {
            addLog(`[CRITICAL] Batch audit failed: ${e.message}`);
        } finally {
            setIsProcessing(false);
            setCurrentStep('IDLE');
        }
    };

    // [NEW] Step 3: Synthesize Final Verdict
    const generateFinalReport = async (currentSession: ArgusSession, onUpdate: (data: any) => void) => {
        setIsProcessing(true);
        setCurrentStep('SYNTHESIZING_VERDICT');
        addLog(`[ORCHESTRATOR] Initiating Final Verdict Synthesis...`);

        try {
            // 0. Guard Clause: Validation Required
            const completedClaims = currentSession.data.claims.filter((c: any) => c.status !== 'PENDING');
            if (completedClaims.length === 0) {
                alert("Cannot synthesize verdict: No claims have been audited yet. Please run adversaries on at least one claim.");
                setIsProcessing(false);
                setCurrentStep('IDLE');
                return;
            }

            // 1. Compile all audit logs (Only Completed)
            const auditSummary = completedClaims.map((c: any, i: number) => `
                CLAIM ${i + 1}: "${c.statement}"
                STATUS: ${c.status}
                SCORE: ${c.score}
                KEY CRITIQUE: ${c.governanceLog.find((l: any) => l.role === 'THESIS_DESTROYER')?.content.substring(0, 200)}...
            `).join('\n');

            // 2. Prompt for Executive Summary
            const synthesisPrompt = `
                ROLE: Editor-in-Chief of a Top-Tier Scientific Journal.
                TASK: Write the final Rejection/Acceptance Decision Letter and Executive Summary for this manuscript.
                
                DATA:
                ${auditSummary}

                OUTPUT FORMAT: JSON
                {
                    "executiveSummary": "2-3 paragraphs. Brutally honest assessment of why the paper failed or succeeded. Focus on the pattern of failures.",
                    "truthStatement": "1 sentence. The unvarnished truth about this paper.",
                    "actionItems": [
                        { "layer": "METHODOLOGY", "suggestion": "..." },
                        { "layer": "VALIDATION", "suggestion": "..." }
                    ],
                    "finalVerdict": "REJECT" | "REVISE" | "ACCEPT"
                }
            `;

            addLog(`[EDITOR] Drafting final decision letter...`);

            const decisionData = await fetchWithRetry('/api/gemini', {
                method: 'POST',
                body: JSON.stringify({ role: 'JOURNAL_REVIEWER_SIMULATOR', sessionId: currentSession.id, prompt: synthesisPrompt })
            });

            let decisionJson: any = {};
            try {
                const cleanJson = (decisionData.content || "{}").replace(/```json/g, "").replace(/```/g, "");
                decisionJson = JSON.parse(cleanJson.match(/\{[\s\S]*\}/)?.[0] || "{}");
            } catch (e) {
                console.error("Failed to parse verdict", e);
            }

            // 3. Update Session
            const updatedReport = {
                ...currentSession.data.report,
                executiveSummary: decisionJson.executiveSummary || "Failed to generate summary.",
                truthStatement: decisionJson.truthStatement || "Analysis inconclusive.",
                actionItems: decisionJson.actionItems || [],
                finalVerdict: decisionJson.finalVerdict || "REJECT"
            };

            addLog(`[EDITOR] Verdict Rendered: ${updatedReport.finalVerdict}`);

            onUpdate({
                ...currentSession.data,
                report: updatedReport
            });

        } catch (error: any) {
            addLog(`[ERROR] Synthesis failed: ${error.message}`);
        } finally {
            setIsProcessing(false);
            setCurrentStep('IDLE');
        }
    };

    return {
        logs,
        isProcessing,
        setIsProcessing,
        currentStep,
        setCurrentStep,
        tokenUsage,
        extractClaims,
        runAdversaryOnClaim,
        runAdversariesOnAll,
        generateFinalReport // Exported
    };
}

/**
 * Author: Sambath Kumar Natarajan
 */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import fs from 'fs';
import path from 'path';

// --- CONFIG ---
const API_KEY = process.env.GEMINI_API_KEY || "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const debugLog = (msg: string) => {
    try {
        const p = path.join(process.cwd(), 'debug_quota.txt');
        fs.appendFileSync(p, `[${new Date().toISOString()}] ${msg}\n`);
    } catch (e) { console.error("Log failed", e); }
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { prompt, keys, role = 'UNKNOWN', images = [] } = body;

        // Server-Side Key Management (Priority: BYOK > Env)
        const apiKey = (keys && keys.gemini) ? keys.gemini : process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({
                error: 'Configuration Error: No valid API Key found. Provide a BYOK key or set GEMINI_API_KEY.'
            }, { status: 500 });
        }


        // -----------------------------------------------------
        // 0. SECURITY & QUOTA GATE (Server-Side Enforcement)
        // -----------------------------------------------------
        // -----------------------------------------------------
        // 0. SECURITY & QUOTA GATE (Server-Side Enforcement)
        // -----------------------------------------------------
        const { createClient: createServerClient } = await import("@/lib/supabase/server");
        const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");

        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Admin/Service Client for sensitive RPC/DB checks logic
        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        if (user && role === 'THESIS_CONSTRUCTOR') {
            // Only "Charge" on the initial extraction (The heavy lift). 
            // Follow-up questions (Destroyer/Assistant) are usually free/included in the session cost.

            // 1. Check Profile for Organization
            const { data: profile } = await supabaseAdmin.from('profiles').select('org_id, is_trial_used').eq('id', user.id).single();

            let authorized = false;

            let quotaConsumed = false;

            // 1. Try Enterprise Credit First (If Org exists)
            if (profile?.org_id && !quotaConsumed) {
                debugLog(`[QUOTA] Enterprise Check for Org: ${profile.org_id}`);
                // [FIX] Explicitly pass p_amount to resolve PGRST203 Ambiguity
                const { data: success, error: rpcError } = await supabaseAdmin.rpc('consume_credit', { p_org_id: profile.org_id, p_amount: 1 });
                if (success) {
                    quotaConsumed = true;
                    authorized = true;
                    debugLog(`[QUOTA] Enterprise Credit Consumed.`);
                } else {
                    debugLog(`[QUOTA] Enterprise Limit Reached or Error: ${JSON.stringify(rpcError)}`);
                    // Fall through to Individual Check
                }
            }

            // 2. Fallback to Individual Credit Logic (Ledger)
            if (!quotaConsumed) {
                // [DEBUG] Log User ID to verify match with Dashboard
                debugLog(`[QUOTA] Checking Individual for User: ${user.id}`);

                // [FIX] Use 'supabase' (User Context) instead of 'supabaseAdmin' to ensure consistent RLS visibility with Dashboard
                const { count: credits } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'success');
                const { count: rawCredits } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('user_id', user.id);

                const { count: usage } = await supabase.from('audit_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('action', 'THESIS_CONSTRUCTOR');

                // [PRODUCTION] Strict Quota - No Virtual Credits
                const VIRTUAL_CREDITS = 0;
                const creditVal = (credits || 0) + VIRTUAL_CREDITS;
                const rawVal = rawCredits || 0;
                const usageVal = usage || 0;

                debugLog(`[QUOTA] Individual Check: Credits=${creditVal} (Real=${credits}, Virtual=${VIRTUAL_CREDITS}), Usage=${usageVal}, Authorized=${creditVal > usageVal}`);

                if (creditVal > usageVal) {
                    authorized = true;
                    // Note: We don't have an atomic "consume" RPC for individual yet, 
                    // relying on the next audit_log insertion to increase 'usage' count.
                } else {
                    debugLog(`[QUOTA_FAIL] Individual Denied. ${creditVal} <= ${usageVal}`);
                }
            }

            if (!authorized) {
                console.warn(`[QUOTA_FAIL] User ${user.id} denied.`);
                return NextResponse.json({
                    error: "Quota Exceeded. Please top up your credits or contact your administrator."
                }, { status: 402 });
            }
        }

        // -----------------------------------------------------

        const genAI = new GoogleGenerativeAI(apiKey);

        // -----------------------------------------------------
        // LOGGING (Deferred to end, but updated to include org)
        // -----------------------------------------------------
        // Use `supabaseAdmin` for logging in the finally block if needed.


        // -----------------------------------------------------
        // MODEL ROUTING STRATEGY (V1.4: HYBRID TIER)
        // -----------------------------------------------------
        // We use a mix of 1.5 Pro (Deep Reasoning) and 2.0 Flash (Speed/Vision).

        const MODELS = {
            VISION: 'gemini-2.5-flash',         // Best for Multimodal (2.5 is Vision Native)
            REASONING: 'gemini-2.5-pro',        // Best for "Reflector Loop" (Deep Logic)
            FAST: 'gemini-2.5-flash'            // Best for Chat/Summaries
        };

        let selectedModel = MODELS.FAST;

        // 1. Content-Based Switching (The "Intelligence")
        const hasImages = Array.isArray(images) && images.length > 0;

        if (hasImages) {
            // console.debug(`[ROUTER] Images detected. Forcing Vision Model: ${MODELS.VISION}`);
            selectedModel = MODELS.VISION;
        } else {
            // 2. Role-Based Switching (Text Only)
            const ROLE_TO_MODEL: Record<string, string> = {
                'THESIS_CONSTRUCTOR': MODELS.VISION,    // Needs Vision cap if images exist, else strong text
                'THESIS_DESTROYER': MODELS.REASONING,   // CRITICAL: Needs 1.5 Pro for proper logic attacks
                'JOURNAL_REVIEWER_SIMULATOR': MODELS.REASONING,
                'SUPPORT_AGENT': MODELS.FAST,           // Chatbot stays fast
                'DEFAULT': MODELS.FAST
            };
            selectedModel = ROLE_TO_MODEL[role] || MODELS.FAST;
            // console.debug(`[ROUTER] Text-only request. Selected Model: ${selectedModel} for Role: ${role}`);
        }

        // [NEW] Context Injection for Support Agent
        let finalPrompt = prompt;
        if (role === 'SUPPORT_AGENT') {
            // We inject a condensed version of the User Guide to save tokens/latency vs reading full file
            // Or we could read the file. Let's start with a high-quality condensed context.
            const SUPPORT_CONTEXT = `
             SYSTEM_ROLE: You are the ARGUS-Thesis Assistant.
             CONTEXT:
             - Argus is an Adversarial Governance Engine for academic research.
             - "Privacy by Physics": Data is processed in ephemeral RAM only, never stored.
             - Agents: "Thesis Constructor" (Structure), "Thesis Destroyer" (Logic), "Methodology Analyst" (Stats).
             - Statuses: 
               - GREEN/Supported: Matches literature.
               - RED/Contradicted: AI found counter-evidence.
               - YELLOW/Unverified: Novel claim (Good!).
             - Billing: $14.99/audit (Personal) or Enterprise Pool.
             - Refunds: Only for technical failures, not because the AI disagreed with the paper.
             - Troubleshooting: "Extraction Failed" -> Check PDF text layer. "Quota Exceeded" -> Top up.
             
             INSTRUCTION: Answer the user's question based ONLY on this context. Be helpful, concise, and professional. 
             Convert response to JSON { "answer": "..." }.
             `;
            finalPrompt = `${SUPPORT_CONTEXT}\n\nUSER QUESTION: ${prompt}`;
        }

        const model = genAI.getGenerativeModel({
            model: selectedModel,
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                }
            ],
            generationConfig: {
                // Enforce STRICT JSON output. This fixes the "0 claims" plain text issue.
                // Supported on Gemini 1.5 Pro/Flash and 2.0 Flash/Pro models.
                responseMimeType: "application/json",
                maxOutputTokens: 8192 // Ensure full JSON generation for deep reports
            }
        });

        // Construct Parts (Text + Images)
        const parts: any[] = [{ text: finalPrompt }];

        if (Array.isArray(images) && images.length > 0) {
            images.forEach((base64Image: string) => {
                // Determine mime type (assume mostly png/jpeg from frontend)
                // Frontend should ideally pass type, but base64 usually contains headers.
                // If the string is pure base64 without header, we default to image/png.
                let data = base64Image;
                let mimeType = "image/png"; // Default fallback

                // Extract valid mime type from base64 header (e.g. data:image/jpeg;base64,...)
                const matches = base64Image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);

                if (matches && matches.length > 1) {
                    mimeType = matches[1];
                    // Remove the header to get raw data
                    data = base64Image.replace(matches[0], "");
                }

                parts.push({
                    inlineData: {
                        mimeType,
                        data
                    }
                });
            });
        }

        // Safety Fallback (Client-side retry handles 429)
        let text = "";

        // -----------------------------------------------------
        // INTELLIGENCE V2.0: REFLECTOR LOOP (Atomic Steps)
        // -----------------------------------------------------
        const { step = 'FULL', context = '' } = body;

        // STEP 1: DRAFT (Fast, Aggressive)
        if (role === 'THESIS_DESTROYER' && selectedModel === MODELS.REASONING && step === 'DRAFT') {
            try {
                const draftResult = await model.generateContent(parts);
                const draftResponse = await draftResult.response;
                text = draftResponse.text();
            } catch (e: any) {
                console.warn("Gemini Safety Block (Draft):", e.message);
                text = JSON.stringify({ content: "Critique bloqué par les filtres de sécurité." }); // French/English fallback
            }

            // Add metadata for frontend to know this is a partial result
            return NextResponse.json({
                content: text,
                nextStep: 'REFINE',
                meta: 'DRAFT_COMPLETE'
            });
        }

        // STEP 2: REFINE (Critique & Polish)
        else if (role === 'THESIS_DESTROYER' && selectedModel === MODELS.REASONING && step === 'REFINE') {

            // We need the previous draft to critique
            const draftText = context || prompt; // Fallback to prompt if no context (should not happen)

            const reflectionPrompt = `
             CRITIC_ROLE: You are the Senior Editor of specific scientific journal.
             TASK: Review the following "Attack Critique" drafted by a junior reviewer.
             
             DRAFT ATTACK:
             ${draftText}
             
             CRITERIA:
             1. Are the attacks logical? Remove any ad-hominem or tone issues.
             2. Are the counter-claims specific? Ensure no generic "this is vague" complaints without proof.
             3. Is the JSON format valid?
             
             ACTION: rewriting the critique to be sharper, kinder, and more rigorous. Output ONLY the final JSON.
             `;

            try {
                const refineResult = await model.generateContent(reflectionPrompt);
                const refineResponse = await refineResult.response;
                text = refineResponse.text();
            } catch (e: any) {
                console.warn("Gemini Safety Block (Refine):", e.message);
                text = draftText; // Fallback to draft if refinement is blocked
            }
        }

        // DEFAULT: STANDARD ONE-SHOT
        else {
            try {
                const result = await model.generateContent(parts);
                const response = await result.response;
                text = response.text();
            } catch (e: any) {
                console.warn("Gemini Safety Block (Standard):", e.message);
                text = JSON.stringify({ error: "Response blocked by AI Safety Filters." });
            }
        }

        // -----------------------------------------------------
        // PRODUCTION LOGGING (No Content Storage)
        // -----------------------------------------------------
        try {
            const { createClient } = await import("@/lib/supabase/server");
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Extract clean role from request (already parsed in body)
                const { sessionId = "UNKNOWN" } = body;

                // Get user profile for org_id
                const { data: profile } = await supabaseAdmin.from('profiles').select('org_id').eq('id', user.id).single();

                // Compute metadata
                const { filename } = body; // [NEW] Capture Filename

                const inputSize = prompt.length;
                const outputSize = text.length;
                const modelName = selectedModel; // Dynamically routed model

                await supabase.from("audit_logs").insert({
                    user_id: user.id,
                    org_id: profile?.org_id || null, // [FIX] Include org_id for org-wide tracking
                    session_id: sessionId,
                    action: role, // 'THESIS_CONSTRUCTOR', 'THESIS_DESTROYER', etc.
                    metadata: {
                        input_chars: inputSize,
                        output_chars: outputSize,
                        model: modelName,
                        filename: filename || "Unknown" // [NEW] Audit requirement
                    },
                    // We don't increment claim_count here, that's business logic for the client or other triggers
                    // But we log the EVENT.
                });

                // [NEW] Metadata Logging (Data Asset - NO PII)
                // Only log on final audit completion (FORMALISM_AUDITOR)
                if (role === 'FORMALISM_AUDITOR' && body.finalScore !== undefined) {
                    const { logMetadata, inferField, extractFailureMode } = await import('@/lib/metadata-logger');

                    await logMetadata({
                        field: inferField(body.context || {}),
                        failure_mode: extractFailureMode(body.actionItems || []),
                        score: body.finalScore,
                        verdict: body.finalScore >= 85 ? 'PUBLISHABLE' : body.finalScore >= 60 ? 'REVISE_MAJOR' : 'REJECT',
                        org_id: profile?.org_id
                    });
                }
            }
        } catch (logError) {
            console.error(">>> LOGGING FAILURE:", logError);
            // Non-blocking
        }

        return NextResponse.json({
            content: text,
        });
    } catch (error: any) {
        console.error(">>> GEMINI API ERROR:", error); // Log full error to terminal
        return NextResponse.json({ error: error.message || "Gemini API Error" }, { status: 500 });
    }
}

/**
 * Author: Sambath Kumar Natarajan
 */
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

            if (profile?.org_id) {
                // ENTERPRISE PATH: Atomic Decrement
                const { data: success, error: rpcError } = await supabaseAdmin.rpc('consume_credit', { p_org_id: profile.org_id });
                if (success) {
                    authorized = true;
                    // console.debug(`[QUOTA] Enterprise Credit Consumed for Org ${profile.org_id}`);
                } else {
                    console.error(`[QUOTA] Enterprise Limit Reached for Org ${profile.org_id}`);
                }
            } else {
                // INDIVIDUAL PATH: Atomic Decrement (Using same RPC, assuming user has a personal_org or we adapt the logic)
                // For V1.0, we will assume individual users ALSO track balance in 'organizations' or 'profiles'.
                // If the current system uses 'transactions' table for balance, we need a Ledger approach.
                // Reverting to calculating balance but enforcing a stricter check.

                // Real Product Fix: All users should have a shadow org_id.
                // Project Fix: We will stick to the Ledger count but add a "Pending" transaction to lock it?
                // No, standard transactions insert is safer.

                // We'll trust the Ledger for now but block if < 1.
                const { count: credits } = await supabaseAdmin.from('transactions').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'success');
                const { count: usage } = await supabaseAdmin.from('audit_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('action', 'THESIS_CONSTRUCTOR');

                if ((credits || 0) > (usage || 0)) {
                    authorized = true;
                }
            }

            if (!authorized) {
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
        // MODEL ROUTING STRATEGY
        // -----------------------------------------------------

        /* 
         * PRODUCTION CONFIGURATION (Paid Tier / Vertex AI)
         * When moving to production with a paid API Key or Vertex AI, 
         * use these stable, high-quota models. You will NOT need to "hop" between experimental models.
         *
         * const MODELS = {
         *    VISION: 'gemini-1.5-flash',     // Standard, high-throughput, multimodal
         *    REASONING: 'gemini-1.5-pro',    // Best-in-class reasoning for the "Critic"
         *    FAST: 'gemini-1.5-flash'        // Speed for UI interactions
         * };
         */

        // DEVELOPMENT CONFIGURATION (Free Tier Workarounds)
        // We use "Experimental" (-exp) and "Legacy" models to find open Free Tier buckets.
        // This fragility is specific to the Free Tier and does not exist in Production.
        // Fixed Model IDs based on actual API availability (Script Validated)
        // ALL Production tiers are exhausted (429).
        // Switching to 'gemini-2.0-flash-exp' (Experimental Lab Quota).
        // This is the last line of defense for free tier today.
        const MODELS = {
            VISION: 'gemini-2.0-flash-exp',
            REASONING: 'gemini-2.0-flash-exp',
            FAST: 'gemini-2.0-flash-exp'
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
                'THESIS_CONSTRUCTOR': MODELS.FAST,      // Speed for extraction
                'THESIS_DESTROYER': MODELS.REASONING,   // Intelligence for attack
                'JOURNAL_REVIEWER_SIMULATOR': MODELS.REASONING,
                'SUPPORT_AGENT': MODELS.FAST,           // [NEW] Chatbot
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
             SYSTEM_ROLE: You are the Argus Support Assistant.
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
        // INTELLIGENCE V2.0: REFLECTOR LOOP (System 2 Thinking)
        // Only for "Thesis Destroyer" which requires high-reasoning.
        // -----------------------------------------------------
        if (role === 'THESIS_DESTROYER' && selectedModel === MODELS.REASONING) {
            // console.debug("[AGENT] Entering Reflector Loop for Thesis Destroyer");

            // STEP 1: DRAFT (Fast, Aggressive)
            // We temporarily use a faster model or the same model with lower temp if needed.
            // For now, staying with selectedModel.
            const draftResult = await model.generateContent(parts);
            const draftResponse = await draftResult.response;
            const draftText = draftResponse.text();

            // STEP 2: REFLECT (Critique & Refine)
            // We feed the draft back into the model to fix "strawman" arguments or hallucinations.
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

            const refineResult = await model.generateContent(reflectionPrompt);
            const refineResponse = await refineResult.response;
            text = refineResponse.text();
            // console.debug("[AGENT] Reflector Loop Complete. Refined Output Length:", text.length);

        } else {
            // STANDARD ONE-SHOT (Speed)
            const result = await model.generateContent(parts);
            const response = await result.response;
            text = response.text();
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

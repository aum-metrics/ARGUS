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

        const genAI = new GoogleGenerativeAI(apiKey);

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
            console.log(`[ROUTER] Images detected. Forcing Vision Model: ${MODELS.VISION}`);
            selectedModel = MODELS.VISION;
        } else {
            // 2. Role-Based Switching (Text Only)
            const ROLE_TO_MODEL: Record<string, string> = {
                'THESIS_CONSTRUCTOR': MODELS.FAST,      // Speed for extraction
                'THESIS_DESTROYER': MODELS.REASONING,   // Intelligence for attack
                'JOURNAL_REVIEWER_SIMULATOR': MODELS.REASONING,
                'DEFAULT': MODELS.FAST
            };
            selectedModel = ROLE_TO_MODEL[role] || MODELS.FAST;
            console.log(`[ROUTER] Text-only request. Selected Model: ${selectedModel} for Role: ${role}`);
        }

        const model = genAI.getGenerativeModel({
            model: selectedModel,
            generationConfig: {
                // Enforce STRICT JSON output. This fixes the "0 claims" plain text issue.
                // Supported on Gemini 1.5 Pro/Flash and 2.0 Flash/Pro models.
                responseMimeType: "application/json"
            }
        });

        // Construct Parts (Text + Images)
        const parts: any[] = [{ text: prompt }];

        if (Array.isArray(images) && images.length > 0) {
            images.forEach((base64Image: string) => {
                // Determine mime type (assume mostly png/jpeg from frontend)
                // Frontend should ideally pass type, but base64 usually contains headers.
                // If the string is pure base64 without header, we default to image/png.
                let data = base64Image;
                let mimeType = "image/png";

                if (base64Image.includes("data:image/jpeg;base64,")) {
                    mimeType = "image/jpeg";
                    data = base64Image.replace("data:image/jpeg;base64,", "");
                } else if (base64Image.includes("data:image/png;base64,")) {
                    mimeType = "image/png";
                    data = base64Image.replace("data:image/png;base64,", "");
                } else if (base64Image.includes("data:image/webp;base64,")) {
                    mimeType = "image/webp";
                    data = base64Image.replace("data:image/webp;base64,", "");
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
        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();

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

                // Compute metadata
                const inputSize = prompt.length;
                const outputSize = text.length;
                const modelName = selectedModel; // Dynamically routed model

                await supabase.from("audit_logs").insert({
                    user_id: user.id,
                    session_id: sessionId,
                    action: role, // 'THESIS_CONSTRUCTOR', 'THESIS_DESTROYER', etc.
                    metadata: {
                        input_chars: inputSize,
                        output_chars: outputSize,
                        model: modelName
                    },
                    // We don't increment claim_count here, that's business logic for the client or other triggers
                    // But we log the EVENT.
                });
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
